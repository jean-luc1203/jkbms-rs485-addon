# JK-BMS Node-RED Manager

#   !!!!!   Please note that this version is not yet functional  !!!!!

Home Assistant add-on module for managing JK-BMS via Node-RED and Modbus RS485.

## Features

- Integrated Node-RED interface for JK-BMS management
- Modbus RS485 communication
- Control panel integrated into Home Assistant
- Multi-BMS support
- MQTT integration

## Configuration

### Available parameters

- Number of BMS**: Number of JK BMS to manage (1-10)
- MQTT broker IP address**: MQTT broker address for communication
- Broker user**: User name for MQTT authentication (optional)
- Broker Password**: Password for MQTT authentication (optional)
- USB serial port**: Serial port for RS485 communication (e.g. /dev/ttyUSB0)

## Installation

### Via the add-on shop

1. Add this repository in Home Assistant: `https://github.com/{username}/jk-bms-nodered-addon`
2. Install the "JK-BMS Node-RED Manager" module
3. Configure the parameters according to your installation
4. Start the module

### Manual installation (for development)

1. Clone this repository in the `/addons/` folder of your Home Assistant installation
2. Reload the add-ons
3. Install and configure

## Use

Once installed and configured, the Node-RED interface can be accessed via :
`http://your-home-assistant-ip:1880`

JK-BMS flows will be automatically loaded and configured according to your settings.

## Node-RED dependencies

This module automatically installs :
- `node-red-contrib-buffer-parser`
- `@flowfuse/node-red-dashboard`

## Authors & contributors

The original setup of this repository is by Jean-Luc Martinelli or JLM.


## Support

To report problems or request features, use GitHub issues.

## License

MIT License

*** Translated with www.DeepL.com/Translator (free version) ***
