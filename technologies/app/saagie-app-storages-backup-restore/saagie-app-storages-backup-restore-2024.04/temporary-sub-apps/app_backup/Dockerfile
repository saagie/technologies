FROM saagie/python:3.11-1.153.0
LABEL authors="Team Service"

RUN apt-get update \
    && apt-get install -y python3-pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


RUN mkdir code
ADD code code
ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN pip install -r code/requirements.txt

ENTRYPOINT ["/entrypoint.sh"]