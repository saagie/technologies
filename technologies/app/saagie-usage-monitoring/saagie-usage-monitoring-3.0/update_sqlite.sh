sleep 30
echo "Changing alerts from 'provisionned' to 'standard'"
sqlite3 /opt/grafana/grafana.db "UPDATE provenance_type SET provenance = '' WHERE record_type = 'alertRule'"
