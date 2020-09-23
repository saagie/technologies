#!/bin/bash

# Wait a bit for Zeppelin to launch (so that Spark interpreter's config file is generated)
sleep 10

# Configure Spark interpreter to run Per Note in Isolated mode
if [ -f "/zeppelin/conf/interpreter.json" ]
then
  echo "INFO: Configuring Spark interpreter to run per Note in isolated mode."

  # get the JSON block to update
  block=`jq '.interpreterSettings | .. | objects | select(.name == "spark") | select(.group == "spark")' /zeppelin/conf/interpreter.json`
  # grab data from this JSON
  interpreterId=`echo $block | jq -r '.id'`
  dependencies=`echo $block | jq '.dependencies'`
  properties=`echo $block | jq '.properties'`
  option=`echo $block | jq '.option'`
  # set Spark's perNote option to isolated and perUser to ""
  updatedOption=`echo $option | jq '.perNote |= "isolated" | .perUser |= ""'`
  # build the JSON to send to Zeppelin API to update the Spark interpreter config
  json="{\"option\":$updatedOption, \"properties\":$properties, \"dependencies:\":$dependencies}"

  curl -X PUT -H "Content-Type: application/json" -d "$json" "http://localhost:$PORT0/api/interpreter/setting/$interpreterId"
else
  echo "WARNING: no Interpreter config found. Zeppelin interpreters will run with default config."
fi

exit 0
