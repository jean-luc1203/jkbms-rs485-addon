**Smartphoton JK-BMS-RS485 & CAN bus** [(*JKong company*)](https://jikongbms.com/product-category/smart-bms/smart-lifepo4-bms/) is a BMS management add-on that use an RS485 or CAN port (wired)

**BMS Type**

* [x] **PB2A16S20P**
* [x] **PB2A16S15P**
* [x] **PB1A16S15P**
* [x] **PB1A16S10P**
* [x] **New one with the FW:19**

## Features V3.0.0

- Configuration interface for JK-BMS software settings
- Modbus RS485 <--> USB communication
- Modbus RS485 <--> **IP Gateway** (Ethernet or Wifi) communication
- CAN bus broadcasting (New !! July 2025)
- Control panel integrated into Home Assistant
- Multi-BMS support
- MQTT integration (open to other software)
- Multi modes rs485: Master or Listening


## It has 3 operating modes.


**1) Master mode**

In this mode, the software interrogates each BMS (addresses from 1 to 15) via the RS485 bus to retrieve static, setup and dynamic values.
Several parameters can be changed from the software.

To activate Master mode, leave the parameter:

	`bms_broadcasting: false`

**2) Listening mode**

In this mode, the software listens to the rs485 bus. One of the BMSs has been defined as the master of the rs485 bus. This involves setting all 4 small switches to the down or 0000 position.
This is the BMS that will query the other BMSs if any are connected. This BMS will then broadcast the information it has retrieved cyclically every 5 seconds.
It is not possible to change several parameters from the software in this mode.
Only setup and dynamic information is retrieved.
This mode must be used if your inverter requires one of the BMSs to be the Master Bus!

To activate Listen mode, set the parameter

	`bms_broadcasting: true`

  ## Screenshot

  ![Logo](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JK-BMS-Screenshot-1.gif)

---

  ![USB Material select](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/Fonctionnement-LED-cable-rs485.gif)

⚠️ For the moment only stick with FTDI, CH340, or CP2102 chip that will be recognized as ttyUSBx are compatible.
Those that create an interface of type ttyACM0 are not functional ⚠️

## Configuration
---
## <u>Fields on the configuration tab</u>

|variable                |Explanations                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| path       | The path to the USB port where the Serial port RS485 adapter is connected to your machine. <u>For example</u>: */dev/serial/by-id/usb-1a86_USB_Serial-if00-port0* or */dev/ttyUSB0* if the port is unique. You can find the path to use in the Settings-System-Hardware-All Hardware menu, under ttyUSB. see the photo below                                                                                                                                                                                                                                                                     |
|  nb_jkbms  |                                                                                                                                                                                                                                                                                                                            Number of JK BMSs to control (from 1 to 15)                                                                                                                                            |
|  use_gateway  |                                                                                                                                                                                                                                                                                                                            Using an IP gateway ?                                                                                                                                              |
|  gateway_ip  |                                                                                                                                                                                                                                                                                                                            address of the IP gateway                                                                                                                                        |
|  gateway_port  |                                                                                                                                                                                                                                                                                                                            Gateway port number                                                                                                                                         |
|  bms_broadcasting  |                                                                                                                                                                                                                                                                                                                             "true" if one the BMSs is configured in master mode (0000)                                                                                                                             
|  CAN bus usage  |                                                                                                                                                                                                                                                                                                                            Using the CAN bus broadcasting (yet implemented in july 2025)                                                                                                                              
|  mqttaddress  |                                                                                                                                                                                                 The IP address or DNS name of your MQTT broker. By default, this will be the internal address of HAOS                                                                                                                       
|  mqttport   |                                                                                                                                                                                                 Port number of the MQTT broker             
|  mqttuser  |                                                                                                                                                                                                 User name for MQTT authentication broker                                               
|  mqttpass  |                                                                                                                                                                                                Password for MQTT authentication. **Put it in quotation marks**                                                                                                                                       |

**3) CAN broadcasting**

Here is the latest development (July 2025).
**CAN bus support is now fully functional**

This is the second RJ45 connector from the left. The BMS broadcast information in loop mode

## <u>&ndash;&raquo; 💫 &laquo;&ndash; </u> Complementary and pre-configured Dashboard: 💫

You can obtain **two pre-configured dashboards** that you can import into your Home Assistant home automation system.
This can save you several hours of work in formatting the data by yourself.
Have a look here: [![here](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/s/495acc37c7)

## 🚨 Alarm management (since 01.11.2025) 🚨

The module can manage 21 alarms identified by the BMS.

It will create 4 HAOS entities telling you that there are alarms in progress,
How many and which ones. It also tells you on which BMS there is an alarm.
There is also an entity designed to trigger an automatic system based on a global binary senso: `binary_sensor.bms_global_bms_global_alarm`

You can see which alarms are possible on this [*table*](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/Documentation/Alarmes-description.md)

⚠️ for the moment, this is only functional in Master/Slave mode. 
The 2 other modes, broadcasting & CANbus will be dealt with as soon as I have time


## Installation

### Via the add-on shop

1. Add this repository in Home Assistant: `https://github.com/jean-luc1203/jkbms-rs485-addon`
2. Install the "Smartphoton_JKBMS RS485 Home Assistant Addon"
3. Configure the parameters according to your installation
4. Start the module

### Manual installation (for development)

1. Clone this repository in the `/addons/` folder of your Home Assistant installation
2. Reload the add-ons
3. Install and configure

## Use

- BMS appear in MQTT devices

![BMS-in-MQTT-devices](images/JKBMS-in-MQTT-devices.png)

- Entities created

![JKBMS-entities](images/JKBMS-entities.png)


## Authors & contributors

For the creation of the module under HAOS, I drew inspiration from Nolak's work for smartphoton
as well as assistance from various AI.
The Node Red flow are from me. Jean-Luc Martinelli or JLM.

[![Buy Me A Coffee on ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y3YHYZP)      [!["Buy Me A Coffee on Paypal"](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/paypal.png)](https://www.paypal.com/donate/?hosted_button_id=864NCUWH4VJ8N)


## Support

To report problems or request features, use GitHub issues.

## License

MIT License