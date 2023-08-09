FROM dbeaver/cloudbeaver:23.1.1

WORKDIR /opt/cloudbeaver/

ADD cloudbeaver.conf /opt/cloudbeaver/conf/

ADD entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
