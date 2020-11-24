
#!/bin/bash -e

DSS_INSTALLDIR="/home/dataiku/dataiku-dss-$DSS_VERSION"

if [ ! -f "$DSS_DATADIR"/bin/env-default.sh ]; then
	# Initialize new data directory
	"$DSS_INSTALLDIR"/installer.sh -d "$DSS_DATADIR" -p "$DSS_PORT"
	"$DSS_DATADIR"/bin/dssadmin install-R-integration
	echo "dku.registration.channel=docker-image" >>"$DSS_DATADIR"/config/dip.properties

elif [ $(bash -c 'source "$DSS_DATADIR"/bin/env-default.sh && echo "$DKUINSTALLDIR"') != "$DSS_INSTALLDIR" ]; then
	# Upgrade existing data directory
	"$DSS_INSTALLDIR"/installer.sh -d "$DSS_DATADIR" -u -y
	"$DSS_DATADIR"/bin/dssadmin install-R-integration

fi

#ls -al "$DSS_DATADIR"
#cat "$DSS_DATADIR"/bin/dss
mv /home/dataiku/dss/install-support/nginx.conf /home/dataiku/nginx-orig.conf
cp /home/dataiku/nginx-test.conf /home/dataiku/dss/install-support/nginx.conf
sed -i 's:location ^~ /:location ^~ SAAGIE_BASE_PATH/:g' /home/dataiku/dss/install-support/nginx.conf
#sed -i 's:location /:location SAAGIE_BASE_PATH/:g' /home/dataiku/dss/install-support/nginx.conf
sed -i 's:location ^~ SAAGIE_BASE_PATH/local/static/:location ^~ /local/static/:g' /home/dataiku/dss/install-support/nginx.conf
sed -i 's:SAAGIE_BASE_PATH:'"$SAAGIE_BASE_PATH"':g' /home/dataiku/dss/install-support/nginx.conf
cat /home/dataiku/dss/install-support/nginx.conf

tail -f /home/dataiku/dss/run/nginx/*.log

exec "$DSS_DATADIR"/bin/dss run
