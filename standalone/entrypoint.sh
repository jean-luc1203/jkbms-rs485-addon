#!/bin/sh
set -e

# Generating /data/options.json based on the schema in config.yaml and docker environment variables
node /usr/src/node-red/envoptions.js

# Setup handler to stop of child process grasefully
trap stop SIGINT SIGTERM
function stop() {
    kill $CHILD_PID
    wait $CHILD_PID
}

# Run Node-RED as in original Node-RED docker image
node $NODE_OPTIONS node_modules/node-red/red.js --userDir /data $FLOWS "${@}" &

# Store PID of child process and wait it's execution
CHILD_PID="$!"
wait "${CHILD_PID}"
