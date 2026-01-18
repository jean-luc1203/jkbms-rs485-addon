# Smartphoton JK-BMS-RS485 & CAN bus

---
⭐ **If this add-on is useful to you, please star this repository!**  
It helps other Home Assistant users discover this project.

[![GitHub stars](https://img.shields.io/github/stars/jean-luc1203/jkbms-rs485-addon?style=social)](https://github.com/jean-luc1203/jkbms-rs485-addon/stargazers)
[![Active installations](https://img.shields.io/badge/active_installations-1100+-brightgreen)](https://github.com/jean-luc1203/jkbms-rs485-addon)
[![Community Forum](https://img.shields.io/badge/community-forum-blue)](https://github.com/jean-luc1203/jkbms-rs485-addon/discussions)
[![Reddit](https://img.shields.io/badge/reddit-r%2Fhomeassistant-orange)](https://www.reddit.com/r/homeassistant/)
---

**Smartphoton JK-BMS-RS485 & CAN bus** [(*JKong company*)](https://jikongbms.com/product-category/smart-bms/smart-lifepo4-bms/) is a BMS management add-on that uses an RS485 or CAN port (wired)

**BMS Type**

* **PB2A16S20P**
* **PB2A16S15P**
* **PB1A16S15P**
* **PB1A16S10P**
* **New one with the FW:19**

## Why choose this add-on?

**🔌 Wired > Wireless**
- **Stable connection**: No Bluetooth range issues or disconnections
- **Multi-BMS ready**: Manage up to 16 BMS units seamlessly
- **Remote capable**: Use RS485/Ethernet gateways to monitor from anywhere
- **Inverter compatible**: Works with inverters requiring BMS as RS485 master

**vs Bluetooth solutions (ESPHome, Batmon):**
- ✅ No 10m range limitation
- ✅ No signal interference
- ✅ Native multi-BMS support
- ✅ Industrial-grade reliability

**vs Official JK-BMS app:**
- ✅ Full Home Assistant integration
- ✅ Automation ready (MQTT)
- ✅ Alarm management with 21 different triggers
- ✅ Historical data tracking

## 💫 Complementary and pre-configured Dashboard: 💫

You can obtain **two pre-configured dashboards** that you can import into your Home Assistant home automation system.
This can save you several hours of work in formatting the data by yourself.
Have a look here: 

[![here](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/s/495acc37c7)

## Features V3.0.0

* Configuration interface for JK-BMS software settings
* Modbus RS485 <--> USB communication
* Modbus RS485 <--> **IP Gateway** (Ethernet or Wifi) communication
* CAN bus broadcasting (New !! July 2025)
* Control panel integrated into Home Assistant
* Multi-BMS support (up to 16 units)
* MQTT integration (open to other software)
* Multi modes rs485: Master or Listening

## It has 3 operating modes.

**1) Master mode**

In this mode, the software interrogates each BMS (addresses from 1 to 15) via the RS485 bus to retrieve static, setup and dynamic values.
Several parameters can be changed from the software.

To activate Master mode, leave the parameter:

```
bms_broadcasting: false
```

**2) Listening mode**

In this mode, the software listens to the rs485 bus. One of the BMSs has been defined as the master of the rs485 bus. This involves setting all 4 small switches to the down or 0000 position.
This is the BMS that will query the other BMSs if any are connected. This BMS will then broadcast the information it has retrieved cyclically every 5 seconds.
It is not possible to change several parameters from the software in this mode.
Only setup and dynamic information is retrieved.
This mode must be used if your inverter requires one of the BMSs to be the Master Bus!

To activate Listen mode, set the parameter:

```
bms_broadcasting: true
```

**3) CAN broadcasting**

Here is the latest development (July 2025).
**CAN bus support is now fully functional**

This is the second RJ45 connector from the left. The BMS broadcasts information in loop mode.

## Screenshot

[![Logo](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JK-BMS-Screenshot-15-11-2025.gif)](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JK-BMS-Screenshot-15-11-2025.gif)

---

[![USB Material select](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/Fonctionnement-LED-cable-rs485.gif)](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/Fonctionnement-LED-cable-rs485.gif)

⚠️ For the moment only stick with FTDI, CH340, or CP2102 chip that will be recognized as ttyUSBx are compatible.
Those that create an interface of type ttyACM0 are not functional ⚠️

## Configuration

---

## Fields on the configuration tab

| variable | Explanations |
| --- | --- |
| path | The path to the USB port where the Serial port RS485 adapter is connected to your machine. For example: */dev/serial/by-id/usb-1a86\_USB\_Serial-if00-port0* or */dev/ttyUSB0* if the port is unique. You can find the path to use in the Settings-System-Hardware-All Hardware menu, under ttyUSB. see the photo below |
| nb\_jkbms | Number of JK BMSs to control (from 1 to 15) |
| use\_gateway | Using an IP gateway ? |
| gateway\_ip | address of the IP gateway |
| gateway\_port | Gateway port number |
| bms\_broadcasting | "true" if one the BMSs is configured in master mode (0000) |
| CAN bus usage | Using the CAN bus broadcasting (yet implemented in july 2025) |
| mqttaddress | The IP address or DNS name of your MQTT broker. By default, this will be the internal address of HAOS |
| mqttport | Port number of the MQTT broker |
| mqttuser | User name for MQTT authentication broker |
| mqttpass | Password for MQTT authentication. **Put it in quotation marks** |


## 🚨 Alarm management (since 01.11.2025) 🚨

The module can manage 21 alarms identified by the BMS.

It will create 4 HAOS entities telling you that there are alarms in progress,
How many and which ones. It also tells you on which BMS there is an alarm.
There is also an entity designed to trigger an automatic system based on a global binary sensor: `binary_sensor.bms_global_bms_global_alarm`

You can see which alarms are possible on this [*table*](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/Documentation/Alarmes-description.md)

⚠️ for the moment, this is only functional in Master/Slave mode.
The 2 other modes, broadcasting & CANbus will be dealt with as soon as I have time

## 🌐 TCP/IP gateway 

You can connect your JK-BMS to an RS485/Ethernet gateway in transparent mode.
This means you do not need to have your PC next to your BMS(es).

The data will be retransmitted by this gateway over the network and this module will then be able to remotely manage your BMS.
You will need to activate the dedicated switch for this in the configuration.

Here are the gateways that are known to work actually.
You can find them in this [directory](https://github.com/jean-luc1203/jkbms-rs485-addon/tree/main/images/Modbus-Gateway)

This configuration is quite complex and may not work depending on the hardware/settings.

## 💻 Installation

### Via the add-on shop

1. Add this repository in Home Assistant: `https://github.com/jean-luc1203/jkbms-rs485-addon`
2. Install the "Smartphoton\_JKBMS RS485 Home Assistant Addon"
3. Configure the parameters according to your installation
4. Start the module

### Manual installation (for development)

1. Clone this repository in the `/addons/` folder of your Home Assistant installation
2. Reload the add-ons
3. Install and configure

## 🚀 Standalone Docker (new option, december 2025)

Run your JK-BMS RS485 & CAN **independently from HAOS** via Docker!

✅ For Home Assistant in Docker or environments without Supervisor  
✅ Automatic options configuration via `envoptions.js`  
✅ Ready-to-use Dockerfile + complete documentation

**👉 [Docker Installation](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/standalone/README.md)**

*Community contribution - Thanks to the contributor SergeyYmb!*

## Use

* BMS appear in MQTT devices

[![BMS-in-MQTT-devices](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JKBMS-in-MQTT-devices.png)](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/images/JKBMS-in-MQTT-devices.png)

* Entities created

[![JKBMS-entities](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JKBMS-entities.png)](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/images/JKBMS-entities.png)

## Authors & contributors

For the creation of the module under HAOS, I drew inspiration from Nolak's work for smartphoton
as well as assistance from various AI.
The Node Red flows are from me. Jean-Luc Martinelli or JLM.

[![Buy Me A Coffee on ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y3YHYZP) [!["Buy Me A Coffee on Paypal"](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/paypal.png)](https://www.paypal.com/donate/?hosted_button_id=864NCUWH4VJ8N)

## Support

⚠️ Given the success of this add-on, I can no longer guarantee responses as quickly as  before.

### Please read this first [!FAQ]( https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/FAQ.md) before opening an “issue”

❇️ To report problems or request features, use [GitHub issues](https://github.com/jean-luc1203/jkbms-rs485-addon/issues).

For general questions and community support, visit our [Discussions](https://github.com/jean-luc1203/jkbms-rs485-addon/discussions).

---

## ⭐ Enjoying this add-on?

If this project has been helpful to you:
- **Star this repository** to help others discover it
- Share your experience in the [Home Assistant community](https://community.home-assistant.io/)
- Consider [supporting development](https://ko-fi.com/Y8Y3YHYZP) ☕

Your support motivates continued development and helps the project grow!

---

## License

MIT License
