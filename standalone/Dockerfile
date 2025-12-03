# Use the base Node Alpine image
FROM node:20-alpine

# Create directories and set ownership to existing node user
RUN mkdir -p /usr/src/node-red /data \
    && chown -R node:node /data \
    && chown -R node:node /usr/src/node-red

# Set working directory
WORKDIR /usr/src/node-red

# Copy Node-RED package manifest to install dependencies
COPY package.json /usr/src/node-red/package.json

# Install dependencies declared in package.json
RUN apk add --no-cache --virtual .build-dependencies \
    build-base \
    linux-headers \
    python3 \
    && npm install \
        --no-audit \
        --no-fund \
        --no-update-notifier \
        --omit=dev \
        --unsafe-perm \
    && npm rebuild --build-from-source @serialport/bindings-cpp \
    && npm cache clear --force \
    \
    && apk del --no-cache --purge .build-dependencies \
    && rm -fr \
        /root/.cache \
        /root/.npm \
        /root/.nrpmrc \
        /tmp/* \
    \
    && chown -R node:node /usr/src/node-red

# Create entrypoint.sh to call envoptions.js and run node-red main process
COPY standalone/entrypoint.sh /usr/src/node-red/entrypoint.sh
RUN chmod +x /usr/src/node-red/entrypoint.sh

# Switch to node user
USER node

# Script for generating of /data/options.json based on the schema in config.yaml and Docker environment variables
COPY standalone/envoptions.js \
     config.yaml \
     /usr/src/node-red/

# Copy the core Node-RED implementation of the JKBMS addon
COPY rootfs/etc/node-red/config.js \
     rootfs/etc/node-red/flows.json \
     rootfs/etc/node-red/settings.js \
     /data/

# Env variables
ENV NODE_PATH=/usr/src/node-red/node_modules:/data/node_modules \
    PATH=/usr/src/node-red/node_modules/.bin:${PATH} \
    FLOWS=flows.json

# Expose the listening port of node-red
EXPOSE 1880

# Set entry point for the container
ENTRYPOINT ["./entrypoint.sh"]

# Labels
LABEL \
    org.opencontainers.image.title="jkbms-rs485-standalone" \
    org.opencontainers.image.description="Standalone Docker image for running the JK-BMS RS485 and CAN bus integration with Home Assistant Docker."
