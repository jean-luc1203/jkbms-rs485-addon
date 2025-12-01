# Use the base Node-RED Alpine image
FROM nodered/node-red:latest-minimal

# Set working directory
WORKDIR /usr/src/node-red

# Copy Node-RED package manifest to install dependencies
COPY package.json /usr/src/node-red/package.json

# Next steps require root privileges
USER root

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
        /tmp/*

# Wrap the original entrypoint.sh from the base image to call envoptions.js
RUN mv /usr/src/node-red/entrypoint.sh /usr/src/node-red/entrypoint-base.sh
COPY standalone/entrypoint.sh /usr/src/node-red/entrypoint.sh
RUN chmod +x /usr/src/node-red/entrypoint.sh

# Switch back to the original user of the base image
USER node-red

# Script for generating of /data/options.json based on the schema in config.yaml and Docker environment variables
COPY standalone/envoptions.js \
     config.yaml \
     /usr/src/node-red/

# Copy the core Node-RED implementation of the JKBMS addon
COPY rootfs/etc/node-red/config.js \
     rootfs/etc/node-red/flows.json \
     rootfs/etc/node-red/settings.js \
     /data/

# We keep the base image ENTRYPOINT ["./entrypoint.sh"] which now points to our wrapper.

# Labels
LABEL \
    org.opencontainers.image.title="jkbms-rs485-standalone" \
    org.opencontainers.image.description="Standalone Docker image for running the JK-BMS RS485 and CAN bus integration with Home Assistant Docker."
