#!/bin/bash
set -e

echo '> Generate config file from env vars TOUCAN_*'
toucan-ctl make_config /app/config.yml

echo '> Disable services if needed'
toucan-ctl toggle_service nginx

echo '> Install connectors if needed'
toucan-ctl install_connectors

echo '> Launch supervisor with all services'
exec supervisord -n -c /etc/supervisord.conf
