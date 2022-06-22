ARG spark_base_img
ARG base_img

FROM ${spark_base_img} AS SPARK_BASE

FROM ${base_img} AS BASE_IMG

COPY --from=SPARK_BASE /opt/spark /opt/spark
COPY --from=SPARK_BASE /usr/local/sbin/tini /usr/local/sbin/tini
COPY --from=SPARK_BASE /sbin/tini /sbin/tini

COPY --from=SPARK_BASE /usr/local/openjdk-11 /usr/local/openjdk-11

ENV JAVA_HOME /usr/local/openjdk-11
ENV LANG C.UTF-8
ENV SPARK_HOME /opt/spark
ENV HADOOP_CONF_DIR=/etc/hadoop/conf

RUN pip --no-cache-dir install --upgrade pip \
    && pip --no-cache-dir install pyspark==3.2.1 \
    && rm -rf /root/.cachex \
    && rm -rf /boot/.cache/pip \
    && rm -rf ~/.cache/pip


COPY entrypoint.sh /opt/
RUN chmod 755 /opt/entrypoint.sh

WORKDIR /opt/spark/work-dir

ENTRYPOINT [ "/opt/entrypoint.sh" ]

ENV REBUILD ME