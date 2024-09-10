import logging
import traceback
from datetime import datetime
import urllib3
import psycopg2
import psycopg2.extras
import boto3
import botocore.exceptions

import os

from saagieapi import SaagieApi

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
logging.getLogger("boto3").setLevel(logging.WARNING)
logging.getLogger("botocore").setLevel(logging.WARNING)

postgresql_host = os.environ["SAAGIE_PG_HOST"]
postgresql_port = os.environ["SAAGIE_PG_PORT"]
postgresql_user = os.environ["SAAGIE_PG_USER"]
postgresql_password = os.environ["SAAGIE_PG_PASSWORD"]
postgresql_db = os.environ["SAAGIE_PG_DATABASE"]

saagie_login = os.environ["SAAGIE_SUPERVISION_LOGIN"]
saagie_password = os.environ["SAAGIE_SUPERVISION_PASSWORD"]
saagie_url = os.environ["SAAGIE_URL"] + "/" if not os.environ["SAAGIE_URL"].endswith("/") else os.environ["SAAGIE_URL"]
saagie_realm = os.environ["SAAGIE_REALM"]
saagie_platform = os.environ["SAAGIE_PLATFORM_ID"]

timeout = int(os.environ["REQUEST_TIMEOUT"])

# Workaround for platforms with too many instances
MAX_INSTANCES_FETCHED = os.environ.get("SMT_MAX_INSTANCES_FETCHED", 1000)


class SaagieUtils(object):

    def __init__(self):
        self.saagie_auth = SaagieApi(url_saagie=saagie_url,
                   id_platform=saagie_platform,
                   user=saagie_login,
                   password=saagie_password,
                   realm=saagie_realm,
                   timeout=timeout)
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, tb):
        if exc_type is not None:
            traceback.print_exception(exc_type, exc_value, tb)

    def get_projects(self):
        """
           Call Saagie graphql API to get the list of projects
           :return: a JSON containing the project names and ids
           """
        projects = self.saagie_auth.projects.list()
        return projects['projects'] if projects else []

    def get_job_instances(self, project_id):
        """
        Call Saagie graphql API to get the jobs of a Saagie project for a given project id
        :param project_id: Saagie Project ID
        :return: a JSON containing a list of jobs
        """
        dict_technology = {}
        result = []
        logging.info(f"Start getting jobs for project {project_id}")
        jobs = self.saagie_auth.jobs.list_for_project(project_id=project_id, 
                                                      instances_limit = MAX_INSTANCES_FETCHED,
                                                      versions_limit = 1,
                                                      versions_only_current = True)
        logging.info(f"End getting jobs for project {project_id}")
        if jobs:
            for job in jobs["jobs"]:
                technology_id = job["technology"]["id"]
                if not dict_technology.get(technology_id):
                    technology_label = self.get_technology_label(technology_id)
                    dict_technology[technology_id] = technology_label
                job["technology"]["label"] = dict_technology.get(technology_id)
                result.append(job)

        return result if result else []

    def get_pipelines(self, project_id):
        """
        Call Saagie graphql API to get the pipelines of a Saagie project for a given project id
        :param project_id: Saagie Project ID
        :return: a JSON containing a list of pipelines
        """
        logging.info(f"Start getting pipelines for project {project_id}")
        pipelines = self.saagie_auth.pipelines.list_for_project(project_id=project_id,
                                                                instances_limit = MAX_INSTANCES_FETCHED,
                                                                versions_limit = 1,
                                                                versions_only_current = True)
        logging.info(f"End getting pipelines for project {project_id}")
        return pipelines["project"]['pipelines'] if pipelines["project"] is not None else []

    def get_apps(self, project_id):
        dict_technology = {}
        result = []
        logging.info(f"Start getting apps for project {project_id}")
        apps = self.saagie_auth.apps.list_for_project(project_id=project_id)["project"]
        if apps:
            for job in apps["apps"]:
                technology_id = job["technology"]["id"]
                if not dict_technology.get(technology_id):
                    technology_label = self.get_technology_label(technology_id)
                    dict_technology[technology_id] = technology_label
                job["technology"]["label"] = dict_technology.get(technology_id)
                result.append(job)
        logging.info(f"End getting apps for project {project_id}")
        return result if result else []

    def get_technology_label(self, technology_id):
        technology_label = self.saagie_auth.get_technology_name_by_id(technology_id)
        return technology_label[1] if technology_label[1] is not None else None


class S3Utils(object):

    def __init__(self):
        s3_endpoint = os.environ['AWS_S3_ENDPOINT']
        s3_region = os.environ['AWS_REGION_NAME']
        self._s3_resource = boto3.resource("s3",
                                           endpoint_url=s3_endpoint,
                                           region_name=s3_region)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, tb):
        if exc_type is not None:
            traceback.print_exception(exc_type, exc_value, tb)

    def get_bucket_size(self, bucket_name, database_utils):
        """
        Save size and # objects for each bucket and each object prefix
        :param bucket_name: name of the bucket
        :param database_utils: utils to save metrics in pg
        :return: a tuple (total bucket size, total number of files) for the bucket
        """
        total_bucket_size = 0
        total_bucket_objects = 0
        prefix_size = {}
        prefix_objects = {}
        try:
            bucket = self._s3_resource.Bucket(bucket_name)
            for bucket_object in bucket.objects.all():
                prefix = self.get_object_prefix(bucket_name, bucket_object.key)
                if prefix:
                    total_bucket_size += bucket_object.size
                    total_bucket_objects += 1
                    prefix_size[prefix] = prefix_size.get(prefix, 0) + bucket_object.size
                    if bucket_object.size > 0:
                        prefix_objects[prefix] = prefix_objects.get(prefix, 0) + 1
            for prefix, size in prefix_size.items():
                database_utils.supervision_s3_to_pg("prefix_size", prefix, bytes_to_gb(size))
            for prefix, number_objects in prefix_objects.items():
                database_utils.supervision_s3_to_pg("prefix_objects", prefix, number_objects)
            database_utils.supervision_s3_to_pg("bucket_size", bucket_name, bytes_to_gb(total_bucket_size))
            database_utils.supervision_s3_to_pg("bucket_objects", bucket_name, bytes_to_gb(total_bucket_objects))
            return total_bucket_size, total_bucket_objects
        except botocore.exceptions.ClientError:
            logging.warning(f"Cannot fetch metrics from bucket {bucket_name}")
            return 0, 0

    def get_all_buckets(self):
        """
        Returns all the buckets
        :return: a list of buckets
        """
        return self._s3_resource.buckets.all()

    @staticmethod
    def get_object_prefix(bucket_name: str, object_key: str):
        """
        Returns the prefix of the object key if it's an object, None if it's a directory
        :param bucket_name: name of the bucket
        :param object_key: the object's key
        :return: a string containning the object prefix
        """
        if object_key.endswith("/") or not object_key:
            return None
        return bucket_name + ("/" + object_key.split("/")[0] if "/" in object_key else "/")


class DatabaseUtils(object):

    def __init__(self):
        self._db_connection = psycopg2.connect(
            f"""host='{postgresql_host}' 
                port='{postgresql_port}' 
                user='{postgresql_user}'
                password='{postgresql_password}'
                dbname='{postgresql_db}'""")
        self._db_connection.autocommit = True
        self._db_cur = self._db_connection.cursor()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_value, tb):
        if exc_type is not None:
            traceback.print_exception(exc_type, exc_value, tb)
        self._db_connection.close()

    def truncate_supervision_saagie_pg(self):
        """
        Truncate the supervision_saagie and supervision_saagie_jobs tables
        """
        try:
            self._db_cur.execute('TRUNCATE TABLE supervision_saagie')
            self._db_cur.execute('TRUNCATE TABLE supervision_saagie_jobs')
            self._db_cur.execute('TRUNCATE TABLE supervision_saagie_apps')
            self._db_cur.execute('TRUNCATE TABLE supervision_saagie_pipelines')
            self._db_cur.execute('TRUNCATE TABLE supervision_saagie_predict')
        except Exception as e:
            logging.error(e)

    def supervision_saagie_to_pg(self, instances):
        """
        Log saagie metrics to PostgresSQL.
        :param instances: List of instances
        :return:
        """
        try:
            psycopg2.extras.execute_batch(self._db_cur, """
                INSERT INTO supervision_saagie (
                    supervision_timestamp, 
                    project_id, 
                    project_name, 
                    orchestration_type, 
                    orchestration_id,
                    orchestration_name, 
                    instance_id, 
                    instance_start_time,
                    instance_end_time,
                    instance_status,
                    instance_duration,
                    instance_saagie_url)
                VALUES (
                    %(supervision_timestamp)s, 
                    %(project_id)s, 
                    %(project_name)s, 
                    %(orchestration_type)s, 
                    %(orchestration_id)s,
                    %(orchestration_name)s, 
                    %(instance_id)s, 
                    %(instance_start_time)s,
                    %(instance_end_time)s,
                    %(instance_status)s,
                    %(instance_duration)s,
                    %(instance_saagie_url)s
                );
                """, instances)

        except Exception as e:
            logging.error(e)

    def supervision_saagie_jobs_to_pg(self, jobs):
        """
        Log saagie jobs metrics to PostgresSQL.
        :param jobs: List of jobs
        :return:
        """

        try:
            psycopg2.extras.execute_batch(self._db_cur, """
                   INSERT INTO supervision_saagie_jobs (
                       project_id, 
                       project_name, 
                       orchestration_type, 
                       orchestration_id, 
                       orchestration_name,
                       orchestration_category, 
                       creation_date, 
                       instance_count,
                       technology,
                       isScheduled,
                       cronScheduling,
                       scheduleTimezone)
                       VALUES (
                       %(project_id)s, 
                       %(project_name)s, 
                       %(orchestration_type)s, 
                       %(orchestration_id)s, 
                       %(orchestration_name)s,
                       %(orchestration_category)s, 
                       %(creation_date)s, 
                       %(instance_count)s,
                       %(technology)s,
                       %(isScheduled)s,
                       %(cronScheduling)s,
                       %(scheduleTimezone)s
                   );
                   """, jobs)
        except Exception as e:
            logging.error(e)

    def supervision_saagie_apps_to_pg(self, apps):
        """
        Log saagie apps metrics to PostgresSQL.
        :param apps: List of Apps
        :return:
        """

        try:
            psycopg2.extras.execute_batch(self._db_cur, """
                   INSERT INTO supervision_saagie_apps (
                       project_id, 
                       project_name, 
                       orchestration_type, 
                       orchestration_id, 
                       orchestration_name,
                       creation_date, 
                       current_status,
                       start_time,
                       stop_time,
                       technology)
                       VALUES (
                       %(project_id)s, 
                       %(project_name)s, 
                       %(orchestration_type)s, 
                       %(orchestration_id)s, 
                       %(orchestration_name)s,
                       %(creation_date)s, 
                       %(current_status)s,
                       %(start_time)s,
                       %(stop_time)s,
                       %(technology)s
                   );
                   """, apps)
        except Exception as e:
            logging.error(e)

    def supervision_saagie_pipelines_to_pg(self, jobs):
        """
        Log saagie pipelines metrics to PostgresSQL.
        :param pipelines: List of pipeline
        :return:
        """

        try:
            psycopg2.extras.execute_batch(self._db_cur, """
                   INSERT INTO supervision_saagie_pipelines (
                       project_id, 
                       project_name, 
                       orchestration_type, 
                       orchestration_id, 
                       orchestration_name,
                       creation_date, 
                       instance_count,
                       isScheduled,
                       cronScheduling,
                       scheduleTimezone)
                       VALUES (
                       %(project_id)s, 
                       %(project_name)s, 
                       %(orchestration_type)s, 
                       %(orchestration_id)s, 
                       %(orchestration_name)s,
                       %(creation_date)s, 
                       %(instance_count)s,
                       %(isScheduled)s,
                       %(cronScheduling)s,
                       %(scheduleTimezone)s
                   );
                   """, jobs)
        except Exception as e:
            logging.error(e)

    def supervision_saagie_predict_to_pg(self, jobs):
        """
        Log saagie pipelines or jobs predicts to PostgresSQL.
        :param pipelines: List of pipelines or jobs
        :return:
        """

        try:
            psycopg2.extras.execute_batch(self._db_cur, """
                   INSERT INTO supervision_saagie_predict (
                       project_id, 
                       project_name, 
                       orchestration_type, 
                       orchestration_name,
                       next_orchestration_id, 
                       next_instance_start,
                       next_instance_end,
                       avg_instance_duration)
                       VALUES (
                       %(project_id)s, 
                       %(project_name)s, 
                       %(orchestration_type)s, 
                       %(orchestration_name)s,
                       %(next_orchestration_id)s, 
                       %(next_instance_start)s,
                       %(next_instance_end)s,
                       %(avg_instance_duration)s
                   );
                   """, jobs)
        except Exception as e:
            logging.error(e)

    def supervision_saagie_jobs_snapshot_to_pg(self, project_job_counts):
        """
        Log saagie job daily snapshot count to PostgresSQL.
        :param project_job_counts: List of projects with job and apps count
        :return:
        """
        today = datetime.today().strftime('%Y-%m-%d')
        try:
            self._db_cur.execute(
                f'''DELETE FROM supervision_saagie_jobs_snapshot
                                    WHERE snapshot_date = \'{today}\'''')
            psycopg2.extras.execute_batch(self._db_cur, """
                    INSERT INTO supervision_saagie_jobs_snapshot (project_id, project_name, snapshot_date, job_count)
                    VALUES( %(project_id)s, 
                            %(project_name)s,
                            %(snapshot_date)s, 
                            %(job_count)s)""", project_job_counts)
        except Exception as e:
            logging.error(e)

    def supervision_saagie_avg_duration(self, orchestration_id, orchestration_type):
        """
        Log saagie job daily snapshot count to PostgresSQL.
        :param orchestration_id: ID of job or pipeline
        :param orchestration_type: type 'pipeline' or 'job'
        :return: average duration in seconds
        """
        
        try:
            query = f"""SELECT cast(round(avg(instance_duration)/1000) as int) as instance_duration 
                                FROM supervision_saagie 
                                WHERE orchestration_id = '{orchestration_id}'
                                AND orchestration_type = '{orchestration_type}'"""
            logging.debug(query)
            cursor = self._db_cur
            cursor.execute(query)
            avg = cursor.fetchall()
            return(avg[0][0])
        except Exception as e:
            logging.error(e)

    def supervision_datalake_to_pg(self, supervision_label, supervision_value):
        """
        Log datalake metrics to PostgresSQL.
        :param supervision_label: Label of the metric (e.g. space_used, total_capacity..)
        :param supervision_value: Value in Gigabytes
        :return:
        """

        today = datetime.today().strftime('%Y-%m-%d')
        try:
            self._db_cur.execute(
                '''INSERT INTO supervision_datalake (supervision_date, supervision_label, supervision_value)
                VALUES(%s,%s,%s)
                ON CONFLICT ON CONSTRAINT supervision_datalake_pkey
                DO
                UPDATE
                SET (supervision_label, supervision_value) = (EXCLUDED.supervision_label, EXCLUDED.supervision_value)''',
                (today, supervision_label, supervision_value))
        except Exception as e:
            logging.error(e)

    def supervision_s3_to_pg(self, supervision_label, supervision_namespace, supervision_value):
        """
        Log datalake metrics to PostgresSQL.
        :param supervision_label: Label of the metric (e.g. space_used, total_capacity..)
        :param supervision_namespace: Namespace of the metric (e.g. bucket name...)
        :param supervision_value: Value in Gigabytes
        :return:
        """

        today = datetime.today().strftime('%Y-%m-%d')
        try:
            self._db_cur.execute(
                '''INSERT INTO supervision_s3 (supervision_date, supervision_label,supervision_namespace, supervision_value)
                VALUES(%s,%s,%s,%s)
                ON CONFLICT ON CONSTRAINT supervision_s3_pkey
                DO
                UPDATE
                SET (supervision_label, supervision_value) = (EXCLUDED.supervision_label, EXCLUDED.supervision_value)''',
                (today, supervision_label, supervision_namespace, supervision_value))
        except Exception as e:
            logging.error(e)


def parse_instance_timestamp(instance_timestamp):
    """
    Parse a timestamp trying 2 different formats
    :param instance_timestamp: Timestamp to parse (string)
    :return: a datetime object
    """
    datetime_format = '%Y-%m-%dT%H:%M:%S.%f%z'
    alternative_datetime_format = '%Y-%m-%dT%H:%M:%S%z'

    if instance_timestamp:
        try:
            return datetime.strptime(instance_timestamp, datetime_format)
        except ValueError:
            return datetime.strptime(instance_timestamp, alternative_datetime_format)
    else:
        return None


def build_saagie_url(project_id, orchestration_type, job_or_pipeline_id, instance_id):
    """
    Build the Saagie URL of a job or pipeline instance
    :param instance_id: id of the Saagie instance
    :param job_or_pipeline_id: if of the job or the pipeline
    :param orchestration_type: job or pipeline
    :param project_id: Saagie Project ID
    :return: the complete URL of this instance
    """
    return f"{saagie_url}projects/platform/{saagie_platform}/project/{project_id}/{orchestration_type}/" \
           f"{job_or_pipeline_id}/instances/{instance_id}"


def bytes_to_gb(size_in_bytes):
    """
    Convert a size in bytes to gigabytes (rounded to 2 decimals)
    :param size_in_bytes: size to convert
    :return: size in gigabytes
    """
    return round(size_in_bytes / 1024 / 1024 / 1024, 2)


def get_hadoop_capacity(hdfs):
    """
    Get Datalake total capacity
    :return: total capacity in GB rounded to 2 decimals
    """
    return bytes_to_gb(hdfs.get_capacity())


def get_hadoop_space_used(hdfs):
    """
    Get Datalake total space used
    :return: total space used in GB rounded to 2 decimals
    """
    return bytes_to_gb(hdfs.get_space_used())


def get_average_file_size(sub):
    """
    Get the average file size of a subdirectory
    """
    return sub["length"] / sub["fileCount"] if sub["length"] != 0 else 0
