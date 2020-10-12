#!/bin/bash

# Overwrite all the tc-params values set in the environment
# For example, if we want to set a value for API_BASEROUTE in the tc-params.js
# we run the docker by setting API_BASEROUTE=... in the environment
# and then replace in the tc-params the value "__API_BASEROUTE_PLACEHOLDER__" by the set value
# Since awk does not have "inplace" option with our version, we use a temporary file
_replaceByEnvVars() {
  for x in `env | cut -d '=' -f1`
  do
    awk -v ENV_VAR_PLACEHOLDER="__${x}_PLACEHOLDER__" -v ENV_VALUE="$(eval echo \$$x)" '{ \
      gsub(ENV_VAR_PLACEHOLDER, ENV_VALUE); \
      print \
    }' "$1" > "$1.tmp" &&\
    mv "$1.tmp" "$1";
  done
}

### ENTRYPOINT ###
_replaceByEnvVars $1
