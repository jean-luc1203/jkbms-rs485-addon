#!/bin/sh
set -e

# Generating /data/options.json based on the schema in config.yaml and docker environment variables
node /usr/src/node-red/envoptions.js

# Chain to the original Node-RED entrypoint logic
exec /usr/src/node-red/entrypoint-base.sh "$@"
