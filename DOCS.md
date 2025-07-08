# Smartphoton JK-BMS-RS485 Add-on Home Assistant
**This code is based on [node red V4](https://nodered.org/)**

**Smartphoton JK-BMS-RS485** [(*JKong company*)](https://jikongbms.com/product-category/smart-bms/smart-lifepo4-bms/) is a BMS management add-on that use an RS485 port (wired)

**BMS Type**

* [x] **PB2A16S20P**
* [x] **PB2A16S15P**
* [x] **PB1A16S15P**
* [x] **PB1A16S10P**

---
## <u>Explanations:</u>
This add-on allows you to connect your Home Assistant machine (physical or virtual) to one or more Jkong BMSs.
To do this, you need to make an RJ45 cable with two wires connected as described below and plug it into the BMS.
The last port from the right is OK. There are two RS485 ports reserved for communications.
The second is used to connect the second BMS, if there is one.
Up to 15 BMSs can be connected to the same bus. These are straight cables.
Data is collected approximately every 10 seconds. This will depend on the number of BMSs present.
All data is available on the MQTT Broker, which allows it to be shared with other software. This is a very interesting point for those who have Jeedom, for example.

[![Buy Me A Coffee on ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y3YHYZP)      [!["Buy Me A Coffee on Paypal"](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/paypal.png)](https://www.paypal.com/donate/?hosted_button_id=864NCUWH4VJ8N)

**1) Master mode**

In this mode, the software interrogates each BMS (addresses from 1 to 15) via the RS485 bus to retrieve static, setup and dynamic values.
Several parameters can be changed from the software.

To activate Master mode, leave the parameter:

	`bms_broadcasting: false`

<u>**Setting address:**</u>
Each BMS **must have a different Modbus address**. Set this to 1 if possible. Addresses are set by the position of the DIP switches on the front of the BMS communication module. There must not be an address set to 0, nor any duplicate addresses.

  * The acquisition part works perfectly and has been tested.
  * The setup part is not yet fully functional. You can use the application for this if necessary. But for the most part, it works. I have not implemented any logic between the various parameters. The Jkong application does this perfectly.
  * The static data part is fully functional.
<br /><br />

## Adds the possibility of using an RS485 <---> ethernet or Wifi gateway

 - *Use the IP address of the gateway and the port defined in the GW to the module
   configuration*

!! Parameters modification via the gateway **has not yet been implemented**. Only via the USB port.

**2) Listening mode**

In this mode, the software listens to the rs485 bus. One of the BMSs has been defined as the master of the rs485 bus. This involves setting all 4 small switches to the down or 0000 position.
This is the BMS that will query the other BMSs if any are connected. This BMS will then broadcast the information it has retrieved cyclically every 5 seconds.
It is not possible to change several parameters from the software in this mode.
Only setup and dynamic information is retrieved.
This mode must be used if your inverter requires one of the BMSs to be the Master Bus!

To activate Listen mode, set the parameter

	`bms_broadcasting: true`

## <u>&ndash;&raquo; Complementary and pre-configured Dashboard: &laquo;&ndash; </u>

You can obtain two pre-configured dashboards that you can import into your Home Assistant home automation system.
This can save you several hours of work in formatting the data by yourself.
Have a look [here](https://ko-fi.com/s/495acc37c7)
---
## <u>Installation:</u>

### Via the add-on shop

Installing this add-on is no different from installing any other Home Assistant add-on.

1. Add this repository in Home Assistant: `https://github.com/jean-luc1203/jkbms-rs485-addon`
2. Install the "Smartphoton_JKBMS RS485 Home Assistant Addon"
3. Configure the parameters according to your installation
4. Start the module

### Manual installation (for development)

1. Clone this repository in the `/addons/` folder of your Home Assistant installation
2. Reload the add-ons
3. Install and configure


<br /><br />


---
## <u>Fields on the configuration tab</u>

|variable                |Explanations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| path       | The path to the USB port where the Serial port RS485 adapter is connected to your machine. <u>For example</u>: */dev/serial/by-id/usb-1a86_USB_Serial-if00-port0* or */dev/ttyUSB0* if the port is unique. You can find the path to use in the Settings-System-Hardware-All Hardware menu, under ttyUSB. see the photo below                                                                                                                                                                                                                                                                     |
|  nb_jkbms  |                                                                                                                                                                                                                                                                                                                            Number of JK BMSs to control (from 1 to 15)                                                                                                                                                                             |
|  use_gateway  |                                                                                                                                                                                                                                                                                                                            Using an IP gateway ?                                                                                                                                                                               |
|  gateway_ip  |                                                                                                                                                                                                                                                                                                                            address of the IP gateway                                                                                                                                                                         |
|  gateway_port  |                                                                                                                                                                                                                                                                                                                            Gateway port number                                                                                                                                                                          |
|  bms_broadcasting  |                                                                                                                                                                                                                                                                                                                            One of the BMSs is configured in master mode (0000)                                                                                                                                                                           |
|  CAN bus usage  |                                                                                                                                                                                                                                                                                                                            Using the CAN bus broadcasting (not yet implemented)                                                                                                                                                                                                                           |
|
 mqttaddress|                                                                                                                                                                                                                                                                                                                                                                      The IP address or DNS name of your MQTT broker.By default, this will be the internal address of HAOS                                                                                                                        |
|  mqttport |                                                                                                                                                                                                                                                                                                                                                                                                                                                                         Port number of the MQTT broker                                                                                           |
|  mqttuser  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      Port number of the MQTT broker                                                              |
|  mqttpass  |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   Password for MQTT authentication. **Put it in quotation marks**|

# <u>Yaml exemple:</u>

>     >     jkbms:
>     >       jkbms_path: /dev/serial/by-id/usb-1a86_USB_Serial-if00-port0
>     >       jkbms_count: 2
>     >       use_gateway: false
>     >       gateway_ip: 192.168.1.238
>     >       gateway_port: 8887
>     >       bms_broadcasting: true
>     >       CAN bus usage: false
>     >     mqtt:
>     >       mqttadresse: core-mosquitto.local.hass.io
>     >       mqttport: 1883
>     >       mqttuser: administrateur
>     >       mqttpass: smartphoton2024
>     >     ssl: false
>     >     certfile: fullchain.pem
>     >     keyfile: privkey.pem

## <u>Use</u>

- BMS appear in MQTT `devices`

![BMS-in-MQTT-devices](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JKBMS-in-MQTT-devices.png)

- Entities created

![JKBMS-entities](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JKBMS-entities.png)

**example**


---
## MQTT (required)
---
You must have an mqtt broker (you can install it via the addon shop. [Addon Mosquitto broker][addon-mqtt])
You will then need to add mqtt integration (see mqtt doc)


---
## Other options
---
### Option: `Log Level`
The `log_level` option controls the level of log output by the addon and can
be changed to be more or less verbose, which might be useful when you are
dealing with an unknown issue. Possible values are:

- `trace`: Show every detail, like all called internal functions.
- `debug`: Shows detailed debug information.
- `info`: Normal (usually) interesting events.
- `warning`: Exceptional occurrences that are not errors.
- `error`: Runtime errors that do not require immediate action.
- `fatal`: Something went terribly wrong. Add-on becomes unusable.

Please note that each level automatically includes log messages from a
more severe level, e.g., `debug` also shows `info` messages. By default,
the `log_level` is set to `info`, which is the recommended setting unless
you are troubleshooting.


## Changelog & Releases
---

`MAJOR.MINOR.PATCH`

- `MAJOR`: Incompatible or major changes.
- `MINOR`: Backwards-compatible new features and enhancements.
- `PATCH`: Backwards-compatible bugfixes and package updates.

![USB Material select](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/USB-choice.png)

## Support
---
- [Github][depot-mqtt]
- [Site][site]
- [Forum][forum]
- [Documentations Github][documentation]


## Authors & contributors
---
Smartphoton JK-BMS-RS485, Jean-luc - 2025

The original setup of this repository is by [Franck Nijhof][frenck].




[addon-badge]: https://my.home-assistant.io/badges/supervisor_addon.svg
[addon-licence]: https://domosimple.eu/licence.php
[addon-config]: http://domosimple.eu/onduleur/
[addon]: https://my.home-assistant.io/redirect/supervisor_addon/?addon=a0d7b954_nodered&repository_url=https%3A%2F%2Fgithub.com%2Fhassio-addons%2Frepository
[addon-mqtt]: https://my.home-assistant.io/redirect/supervisor_addon/?addon=core_mosquitto&repository_url=https%3A%2F%2Fgithub.com%2Fhassio-addons%2Frepository
[depot-mqtt]: https://github.com/jean-luc1203/smartphoton-ha-addon/
[site]: https://smartphoton.fr/
[forum]: http://domosimple.eu/forum/
[documentation]: https://github.com/jean-luc1203/Smartphoton-Documentation
[alpine-packages]: https://pkgs.alpinelinux.org/packages
[contributors]: https://github.com/hassio-addons/addon-node-red/graphs/contributors
[discord-ha]: https://discord.gg/c5DvZ4e
[discord]: https://discord.me/hassioaddons
[forum]: https://community.home-assistant.io/t/home-assistant-community-add-on-node-red/55023?u=frenck
[frenck]: https://github.com/frenck
[issue]: https://github.com/hassio-addons/addon-node-red/issues
[node-red-nodes]: https://flows.nodered.org/?type=node&num_pages=1
[nodered-docs]: https://nodered.org/docs
[nodered]: https://nodered.org
[npm-packages]: https://www.npmjs.com
[reddit]: https://reddit.com/r/homeassistant
[releases]: https://github.com/hassio-addons/addon-node-red/releases
[semver]: http://semver.org/spec/v2.0.0.htm
