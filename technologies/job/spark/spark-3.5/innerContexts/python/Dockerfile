ARG spark_base_img
ARG base_img

FROM ${spark_base_img} AS SPARK_BASE

FROM ${base_img} AS BASE_IMG

COPY --from=SPARK_BASE /opt/spark /opt/spark
COPY --from=SPARK_BASE /usr/bin/tini /usr/bin/tini

COPY --from=SPARK_BASE /opt/java/openjdk /opt/java/openjdk

ENV JAVA_HOME /opt/java/openjdk
ENV LANG C.UTF-8
ENV SPARK_HOME /opt/spark

#See https://github.com/apache/spark-docker/blob/master/Dockerfile.template#L19
ARG spark_uid=185

RUN groupadd --system --gid=${spark_uid} spark && \
    useradd --system --uid=${spark_uid} --gid=spark spark

RUN apt update -qq && apt install -yqq --no-install-recommends \
    gosu && \
    rm -rf /var/lib/apt/lists/*s

RUN pip --no-cache-dir install --upgrade pip \
    && pip --no-cache-dir install pyspark==3.5.2 \
    && rm -rf /root/.cachex \
    && rm -rf /boot/.cache/pip \
    && rm -rf ~/.cache/pip

# As long as base image is from saagie, no need to add krb5 or LD_LIBRARY_PATH

# Move scripts and frequently changing directive to the end of the build
COPY entrypoint.sh /opt/
RUN chmod 755 /opt/entrypoint.sh

WORKDIR /opt/spark/work-dir

ENTRYPOINT [ "/opt/entrypoint.sh" ]