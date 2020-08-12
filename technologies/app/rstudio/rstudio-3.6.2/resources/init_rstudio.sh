#!/bin/bash

# Grab runtime parameters
TEMP=`getopt -o p: --long port: -- "$@"`
eval set -- "$TEMP"

while true ; do
  case "$1" in
    -p|--port)
      case "$2" in
        "") shift 2 ;;
        *) RSTUDIO_PORT=$2 ; shift 2 ;;
      esac ;;
    --) shift ; break ;;
    *) echo "Internal error!" ; exit 1 ;;
  esac
done

# check if rstudio needs to be run on a custom port
if [ -z $RSTUDIO_PORT ];
then
  echo "INFO: no port given. RStudio will run on default port (8787)."
  export PORT0=8787
  export RSTUDIO_PORT=8787
else
  # If not already set, set a fake PORT0 variable (used in spark-env.sh)
  if [ -z $PORT0 ]
  then
    export PORT0=$(( $RSTUDIO_PORT+1 ))
    echo "WARNING: no PORT0 environment variable provided. $PORT0 will be used..."
  fi
  echo "www-port=$RSTUDIO_PORT" >> /etc/rstudio/rserver.conf
fi

echo "Running RStudio on port $RSTUDIO_PORT"

/init &

# wait a bit for initialization to end before modifying the users...
sleep 5

echo "Init users"

# We need to make rstudio user the owner of his own home directory as it will be owned by root if we mount a docker volume to /home (weird but true...)
mkdir -p /home/rstudio
chown -R rstudio:rstudio /home/rstudio
chmod -R 755 /home/rstudio

# create an admin user who will be able to create new users directly from RStudio IDE
useradd admin --home /home/admin --create-home -p $(openssl passwd -1 rstudioadmin) --groups sudo,shadow,rstudio,staff

# Add backupusers script for admin user
mkdir -p /home/admin
echo "sudo tar cf /home/admin/users_backup.tar /etc/passwd /etc/shadow 2> /dev/null" > /home/admin/backupusers
chown admin:admin /home/admin/backupusers
chmod 700 /home/admin/backupusers

# then restore previous users if necessary
if [ -e /home/admin/users_backup.tar ]
then
    echo "Restoring users..."
    rm -rf /tmp/userrestore
    mkdir -p /tmp/userrestore

    tar xf /home/admin/users_backup.tar -C /tmp/userrestore --strip-components=1

    cat /tmp/userrestore/shadow | while read LINE
    do
      # echo $LINE

      USER=$(echo $LINE | awk -F':' '{print $1}')
      ENCRYPTED_PASSWD=$(echo $LINE | awk -F':' '{print $2}')

      if ! grep -q "^$USER:" /etc/passwd
      then
        echo "- restoring $USER"
        HOME_DIR=$(grep "^$USER:" /tmp/userrestore/passwd | awk -F':' '{print $6}')
        echo "   home dir: $HOME_DIR"
        useradd $USER --home $HOME_DIR --create-home -p $ENCRYPTED_PASSWD
        chown -R $USER:$USER $HOME_DIR
      fi

    done
fi

# propagate environment variables to every user
R_HOME=$(Rscript -e 'Sys.getenv("R_HOME")' | sed -rn 's/^\[[[:digit:]]+\] "(.*)"/\1/p')

env | while read VAR
do
  if ! grep -q "$VAR" /ROOT_ENV_VAR
  then
    echo $VAR >> $R_HOME/etc/Renviron.site
  fi
done

# keep the container running...
tail -f /dev/null
