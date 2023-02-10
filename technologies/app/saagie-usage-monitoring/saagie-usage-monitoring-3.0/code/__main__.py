import logging
import sys
import os
import pyarrow as pa
from datetime import datetime
from hdfs import InsecureClient
import utils

monitoring_type = os.environ["MONITORING_OPT"]


def get_datalake_metrics():
    """
    Fetch Metrics from Hadoop API about Datalake usage and save it to PostgreSQL in the supervision Database
    :return:
    """
    with utils.DatabaseUtils() as database_utils:
        hdfs = pa.hdfs.connect(os.environ["IP_HDFS"], port=8020, user="hdfs")
        total_capacity = utils.get_hadoop_capacity(hdfs)
        total_space_used = utils.get_hadoop_space_used(hdfs)
        logging.debug(f"total_capacity : {total_capacity}")
        logging.debug(f"total_space_used : {total_space_used}")
        database_utils.supervision_datalake_to_pg("total_capacity", total_capacity)
        database_utils.supervision_datalake_to_pg("total_used", total_space_used)

        # Get count files
        client_hdfs = InsecureClient("http://" + os.environ["IP_HDFS"] + ":50070", user="hdfs")
        content_root = client_hdfs.list("/", status=True)

        get_metrics_for_folder(client_hdfs=client_hdfs,
                               database_utils=database_utils,
                               folder="/")
        for f in content_root:
            if f[1]['type'] == 'DIRECTORY':
                base_folder = "/" + f[0]
                get_metrics_for_folder(client_hdfs=client_hdfs,
                                       database_utils=database_utils,
                                       folder=base_folder)
            content_data = client_hdfs.list(base_folder, status=True)
            for f in content_data:
                if f[1]['type'] == 'DIRECTORY':
                    get_metrics_for_folder(client_hdfs=client_hdfs,
                                           database_utils=database_utils,
                                           folder=base_folder + "/" + f[0])


def get_s3_metrics():
    """
    Fetch Metrics from S3 buckets usage and save it to PostgreSQL in the supervision Database
    :return:
    """
    with utils.S3Utils() as s3_utils, utils.DatabaseUtils() as database_utils:
        buckets = s3_utils.get_all_buckets()
        total_size = 0
        total_objects = 0
        for bucket in buckets:
            bucket_size, number_of_objects = s3_utils.get_bucket_size(bucket.name, database_utils)
            total_size += bucket_size
            total_objects += number_of_objects

        database_utils.supervision_s3_to_pg("bucket_size", 'all_buckets', utils.bytes_to_gb(total_size))
        database_utils.supervision_s3_to_pg("bucket_objects", 'all_buckets', total_objects)


def get_metrics_for_folder(client_hdfs, database_utils, folder):
    sub = client_hdfs.content(folder)
    database_utils.supervision_datalake_to_pg(f"Data size {folder}", sub["length"])
    database_utils.supervision_datalake_to_pg(f"File Count {folder}", sub["fileCount"])
    database_utils.supervision_datalake_to_pg(f"Average size file {folder}", utils.get_average_file_size(sub))


def get_saagie_metrics():
    """
    Truncate existing metrics and fetch Metrics Saagie API about Jobs and instances and save it to PostgreSQL in the
    supervision Database :return:
    """
    with utils.DatabaseUtils() as database_utils:
        logging.debug("truncate_supervision_saagie_pg starting")
        database_utils.truncate_supervision_saagie_pg()
        logging.debug("truncate_supervision_saagie_pg finished")
        get_saagie_jobs_metrics(database_utils)


def get_saagie_jobs_metrics(database_utils):
    """
    Fetch Metrics from Saagie API about Jobs and Pipelines duration and status and save it to PostgreSQL in the
    supervision Database :return:
    """
    database_utils.truncate_supervision_saagie_pg()
    today = datetime.today().strftime('%Y-%m-%d')

    with utils.ApiUtils() as api_utils:
        project_list = api_utils.get_projects()
        all_projects = []
        for project in project_list:
            logging.debug(f"Getting metrics for project {project['name']}")

            job_list = api_utils.get_job_instances(project["id"])
            app_list = api_utils.get_apps(project["id"])
            pipeline_list = api_utils.get_pipelines(project["id"])

            all_jobs = [{
                'project_id': project["id"],
                'project_name': project["name"],
                'orchestration_type': "job",
                'orchestration_id': job["id"],
                'orchestration_name': job["name"],
                'orchestration_category': job["category"],
                'creation_date': job["creationDate"],
                'instance_count': job["countJobInstance"],
                'technology': job["technology"]["label"] if job["technology"] is not None else None
            } for job in job_list]
            database_utils.supervision_saagie_jobs_to_pg(all_jobs)

            all_apps = [{
                'project_id': project["id"],
                'project_name': project["name"],
                'orchestration_type': "app",
                'orchestration_id': app["id"],
                'orchestration_name': app["name"],
                'creation_date': app["creationDate"],
                'current_status': app["history"]["currentStatus"] if app["history"] is not None else None,
                'start_time': app["history"]["startTime"] if app["history"] is not None else None,
                'stop_time': app["history"]["stopTime"] if app["history"] is not None else None,
                'technology': app["technology"]["label"] if app["technology"] is not None else None
            } for app in app_list]
            database_utils.supervision_saagie_apps_to_pg(all_apps)

            for job in job_list:
                log_instance_metrics(database_utils, job["instances"], job, "job", project["id"], project['name'])

            for pipeline in pipeline_list:
                log_instance_metrics(database_utils, pipeline["instances"], pipeline, "pipeline", project["id"],
                                     project['name'])

            all_projects.append({
                'project_id': project["id"],
                'project_name': project["name"],
                'snapshot_date': today,
                'job_count': len(job_list) + len(app_list)})
        database_utils.supervision_saagie_jobs_snapshot_to_pg(all_projects)


def get_instance_duration(start_time, end_time):
    """
    Compute instance duration based on start and end time
    :param start_time:
    :param end_time:
    :return:
    """
    instance_start_time = utils.parse_instance_timestamp(start_time)
    instance_end_time = utils.parse_instance_timestamp(end_time)
    if instance_end_time and instance_end_time:
        return (instance_end_time - instance_start_time).total_seconds() * 1000
    else:
        return 0


def log_instance_metrics(database_utils, instances, job_or_pipeline, orchestration_type, project_id, project_name):
    """
    For each instance of a job or a pipeline, compute its duration and its Saagie URL and save it to PostgreSQL
    in the supervision Database
    :param database_utils: Instance of database utils to connect to PG
    :param instances: instances of the current job
    :param job_or_pipeline: job_or_pipeline object returned from Saagie API
    :param orchestration_type: indicating whether its a job or a pipeline
    :param project_id: Saagie Project ID
    :param project_name: Saagie Project Name
    :return:
    """
    now = datetime.now()
    if instances:
        all_instances = [{
            'supervision_timestamp': now,
            'project_id': project_id,
            'project_name': project_name,
            'orchestration_type': orchestration_type,
            'orchestration_id': job_or_pipeline["id"],
            'orchestration_name': job_or_pipeline["name"],
            'instance_id': instance["id"],
            'instance_start_time': instance["startTime"],
            'instance_end_time': instance["endTime"],
            'instance_status': instance["status"],
            'instance_duration': get_instance_duration(instance["startTime"], instance["endTime"]),
            'instance_saagie_url': utils.build_saagie_url(project_id, orchestration_type, job_or_pipeline["id"],
                                                          instance["id"])
        } for instance in instances]

        database_utils.supervision_saagie_to_pg(all_instances)


def main():
    if monitoring_type == "SAAGIE":
        logging.info("Getting saagie metrics")
        get_saagie_metrics()
    elif monitoring_type == "SAAGIE_AND_DATALAKE":
        logging.info("Getting saagie metrics")
        get_saagie_metrics()
        logging.info("Getting datalake metrics")
        get_datalake_metrics()
    elif monitoring_type == "SAAGIE_AND_S3":
        logging.info("Getting saagie metrics")
        get_saagie_metrics()
        logging.info("Getting S3 metrics")
        get_s3_metrics()
    else:
        logging.error("MONITORING_OPT wrong or missing, correct options are : 'SAAGIE' or 'SAAGIE_AND_DATALAKE'")
        sys.exit(1)
    logging.info("Metrics successfully gathered")


if __name__ == "__main__":
    logging.getLogger("pyarrow").setLevel(logging.ERROR)
    logging.basicConfig(level=logging.INFO,
                        format="%(asctime)s [%(levelname)s] %(message)s",
                        datefmt="%d/%m/%Y %H:%M:%S")
    main()
