FROM ghcr.io/linuxserver/code-server:4.1.0

USER root

ENV PUID=1000
ENV PGID=1000
RUN TZ=Europe/London

RUN apt-get update \
    && apt-get install -y nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/ \
    && rm /etc/nginx/sites-enabled/default
 
COPY resources/nginx.conf /etc/nginx/sites-enabled/nginx.conf
COPY resources/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh \   
    && chmod +x /etc/nginx/sites-enabled/nginx.conf

# Copy a script that we will use to correct permissions after running certain commands
COPY resources/fix-permissions /usr/local/bin/fix-permissions
RUN chmod a+rx /usr/local/bin/fix-permissions

RUN mkdir -p /tmp/settings
COPY resources/settings.json /tmp/settings/

RUN sed -i 's/SUDO_PASSWORD/VSCODE_SUDO_PASSWORD/g' /etc/cont-init.d/30-config \
    && sed -i '2s|^|\
    export PASSWORD=$VSCODE_PASSWORD \n \
    export HASHED_PASSWORD=$VSCODE_HASHED_PASSWORD \n \
    mkdir -p /config/data/User/ \n \ 
    cp -u /tmp/settings/settings.json /config/data/User/ \n \
    fix-permissions /config/ \n \
    |' /etc/services.d/code-server/run

EXPOSE 8443

ENTRYPOINT ["/entrypoint.sh"]