echo "Remove provisionned alerts if already exists"

if [[ -f "/opt/grafana/grafana.db" ]]; then
    echo "Removing /etc/grafana/provisioning/alerting"
    rm -R /etc/grafana/provisioning/alerting
fi


sleep 30
echo "Changing alerts from 'provisionned' to 'standard'"
sqlite3 /opt/grafana/grafana.db "UPDATE provenance_type SET provenance = '' WHERE record_type = 'alertRule'"