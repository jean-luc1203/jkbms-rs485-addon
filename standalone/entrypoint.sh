#!/bin/sh
set -e

# Generating /data/options.json based on the schema in config.yaml and docker environment variables
node /usr/src/node-red/envoptions.js

# Run Node-RED as in original Node-RED docker image
node $NODE_OPTIONS node_modules/node-red/red.js --userDir /data $FLOWS "$@"
