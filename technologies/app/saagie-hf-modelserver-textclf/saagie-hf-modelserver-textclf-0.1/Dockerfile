FROM python:3.9-slim
ARG PYTHON_VERSION=3.9

ENV PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION=python

USER root

COPY . /
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y --no-install-recommends curl

EXPOSE 8080
WORKDIR /
CMD ["python", "./serve.py"]
