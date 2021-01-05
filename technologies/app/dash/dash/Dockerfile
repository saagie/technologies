FROM python:3.8
WORKDIR /code
RUN apt-get update && apt-get install git
COPY entrypoint.sh entrypoint.sh
RUN chmod +x entrypoint.sh
EXPOSE 8050
ENTRYPOINT [ "./entrypoint.sh" ]
