FROM python:3.9-slim

USER root

COPY . /
RUN pip install -r app/requirements.txt
RUN apt-get update && apt-get install -y --no-install-recommends curl

EXPOSE 8050
WORKDIR /app
CMD ["python", "./app.py"]