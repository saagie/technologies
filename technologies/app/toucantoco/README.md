= Toucantoco image for Saagie

== Official documentation

== Use as standalone image - for test purposes

docker run -d --rm --name toucan 
    -p 8090:8090 
    -p 8080:8080 
    -p 8027:27017 
    -p 8063:6379 
    -e PROXY_PATH=/ 
    -e FRONT_PATH=/front 
    -e BACK_PATH=/back 
    -e TOUCAN_HOST=http://my.host
    -e TOUCAN_FRONT_PORT=:8080 
    -e TOUCAN_BACK_PORT=:8090 
    -e TOUCAN_DB_ENCRYPTION_SECRET="MyTokenSuperSecret" 
    -v $PWD/technologies/app/toucantoco/toucantoco-76.0/tmp/redis:/var/lib/redis 
    -v $PWD/technologies/app/toucantoco/toucantoco-76.0/tmp/mongo:/var/lib/mongodb 
    -v $PWD/technologies/app/toucantoco/toucantoco-76.0/tmp/logs:/var/log/mongod 
    -v$PWD/technologies/app/toucantoco/toucantoco-76.0/tmp/storage:/app/storage 
    <image-name>