FROM nginx:latest

RUN apt-get update && apt-get install -y nginx python3.9 pip

# Python dependencies
ADD code/requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt \
    && rm -rf /root/.cachex \
    && rm -rf /boot/.cache/pip \
    && rm -rf ~/.cache/pip


ADD code /app
ADD ressources/nginx.conf /etc/nginx/conf.d/default.conf
ADD ressources/auth.htpasswd /etc/nginx/auth.htpasswd
ADD ressources/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]