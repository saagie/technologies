FROM python:3.9-slim

USER root

ENV APP_BACKUP_VERSION='2024.04-0.1-1.192.0_SDKTECHNO-271'
ENV APP_RESTORE_VERSION='2024.04-0.1-1.192.0_SDKTECHNO-271'

ENV SAAGIE_APP_BACKUP_SUB_APP_PREFIX='saagie-sub-app-backup'
ENV SAAGIE_APP_RESTORE_SUB_APP_PREFIX='saagie-sub-app-restore'

# In order to use dash-mantine-components>=0.14, you have to set up this variable to `18.2.0`
ENV REACT_VERSION=18.2.0

COPY . /
RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y --no-install-recommends curl

EXPOSE 8050
WORKDIR /src
CMD ["python", "./app.py"]