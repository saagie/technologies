ARG base_img

FROM ${base_img} AS BASE_IMG

# Nginx isntall and remove default conf
RUN apt-get update -qq && apt-get install -yqq --no-install-recommends nginx \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/ \
    && rm /etc/nginx/sites-enabled/default
COPY resources/server.conf /etc/nginx/sites-enabled/rstudio.conf

COPY resources/userconf /etc/cont-init.d/userconf
COPY resources/init_rstudio.sh /init_rstudio.sh

# Be sure rstudio user has full access to his home directory
RUN mkdir -p /home/rstudio && \
    chown -R rstudio:rstudio /home/rstudio && \
    chmod -R 755 /home/rstudio && \
    chmod 500 /init_rstudio.sh

EXPOSE 80

COPY resources/entrypoint.sh /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]

CMD ["/bin/sh", "-c", "/init_rstudio.sh"]
