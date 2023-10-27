create TABLE IF NOT EXISTS supervision_saagie
  (
     supervision_timestamp TIMESTAMP,
     project_id            VARCHAR(60),
     project_name          VARCHAR(250),
     orchestration_type    VARCHAR(10),
     orchestration_id      VARCHAR(60),
     orchestration_name    VARCHAR(250),
     instance_id           VARCHAR(60),
     instance_start_time   TIMESTAMP,
     instance_end_time     TIMESTAMP,
     instance_status       VARCHAR(30),
     instance_duration     BIGINT,
     instance_saagie_url   VARCHAR(250),
     PRIMARY KEY (project_id,orchestration_id, instance_id)
  );

create TABLE IF NOT EXISTS supervision_saagie_jobs
  (
     project_id             VARCHAR(60),
     project_name           VARCHAR(250),
     creation_date          TIMESTAMP,
     orchestration_type     VARCHAR(10),
     orchestration_category VARCHAR(60),
     orchestration_id       VARCHAR(60),
     orchestration_name     VARCHAR(250),
     instance_count         INT,
     technology             VARCHAR(60),
     PRIMARY KEY (project_id, orchestration_id)
  );

create TABLE IF NOT EXISTS supervision_saagie_apps
  (
     project_id             VARCHAR(60),
     project_name           VARCHAR(250),
     orchestration_type     VARCHAR(10),
     orchestration_id       VARCHAR(60),
     orchestration_name     VARCHAR(250),
     creation_date          TIMESTAMP,
     current_status         VARCHAR(20),
     start_time             TIMESTAMP,
     stop_time              TIMESTAMP,
     technology             VARCHAR(60),
     PRIMARY KEY (project_id, orchestration_id)
  );

create TABLE IF NOT EXISTS supervision_saagie_jobs_snapshot
  (
     project_id    VARCHAR(60),
     project_name  VARCHAR(250),
     snapshot_date DATE,
     job_count     INT,
     PRIMARY KEY (snapshot_date, project_id)
  );

create TABLE IF NOT EXISTS supervision_datalake
  (
     supervision_date  DATE,
     supervision_label VARCHAR(60),
     supervision_value NUMERIC(20, 2),
     PRIMARY KEY (supervision_date, supervision_label)
  );

 create TABLE IF NOT EXISTS supervision_s3
  (
     supervision_date  DATE,
     supervision_label VARCHAR(120),
     supervision_namespace VARCHAR(120),
     supervision_value NUMERIC(20, 2),
     PRIMARY KEY (supervision_date, supervision_label,supervision_namespace)
  );