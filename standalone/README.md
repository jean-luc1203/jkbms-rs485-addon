# Standalone Docker image for JK-BMS-RS485 & CAN bus

This image allows you to run the **JK-BMS-RS485 & CAN bus** as standalone container alongside **Home Assistant Docker** installation (without the Supervisor).  
The image embeds the original Node-RED core implementation of the add-on and exposes its configuration via Docker environment variables.

## Build the image

From the root of the repository, run:

```bash
docker build -t jkbms-rs485-standalone -f standalone/Dockerfile .
```

## Example docker-compose configuration

> **Note:** Environment variable names are derived from the original add-on schema declared in `config.yaml`.

```
services:
  jkbms-rs485:
    image: jkbms-rs485-standalone:latest
    container_name: jkbms-rs485

    environment:
      # jkbms_path: str
      - JKBMS_PATH=/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0

      # jkbms_count: int(1,15)?
      - JKBMS_COUNT=1

      # use_gateway: bool
      - USE_GATEWAY=false

      # gateway_ip_port: str?
      # Example: 192.168.1.100:5000
      - GATEWAY_IP_PORT=

      # communication_debug: bool
      - COMMUNICATION_DEBUG=false

      # bms_broadcasting: bool
      - BMS_BROADCASTING=false

      # CAN_bus_usage: bool
      - CAN_BUS_USAGE=false

      # mqttadresse_port: str?  (host:port)
      - MQTTADRESSE_PORT=mosquitto:1883

      # mqttuser: str?
      - MQTTUSER=mosquitto

      # mqttpass: password?
      - MQTTPASS=super_secret_password

    # RS485 USB adapter exposed to container
    devices:
      - "/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0:/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0"

    # Add "dialout" group to allow read/write access to serial ports like RS485 USB device
    # Check group name by command like "ls -l /dev/ttyUSB0"
    group_add:
      - dialout

    # Node-RED web UI (optional, for debuggin)
    ports:
      - "1880:1880"
```
