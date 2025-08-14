## 3.0.10

## ⚡️ Enhancements

Added a "debug" option to check whether there is communication via the IP - rs485 gateway. The information can be found in the live module log.
Don't forget to reset it to "false" once testing is complete.

<img width="680" height="100" alt="image" src="https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/images/GW-IP-debug.png" />

## 3.0.8

## 🐞 Bug fixes
following the enlightened suggestion of https://github.com/lgrenetier
I have changed "node-red-dashboard": "*", to "node-red-dashboard": "3.6.3"
so that the module can be installed

## 3.0.7
change a timer for the MQTT alive

## 3.0.6

## 🐞 Bug fixes

- Check that MQTT is communicating with the module
I have created a Topic in the MQTT broker to confirm that the module is able to talk to the broker at. This Topic is called **JK-BMS-RS485-CAN-module** and it must be equal to **"Online"**.
You can check this with MQTTExplorer
<img width="680" height="100" alt="image" src="https://github.com/user-attachments/assets/ca40210b-f563-45c8-a73f-43a67e05cb32" />


- Checking communication with the BMS:
To check that communication with the BMS is working properly, a log is created in the module's log file. Every 30 seconds you should be able to see this type of text

```
6 Aug 18:42:13 - [warn] [function:SerialNb] BMS SerialNb: JK-Pack-2
6 Aug 18:42:43 - [warn] [function:SerialNb] BMS SerialNb: JK-Pack-1
6 Aug 18:43:13 - [warn] [function:SerialNb] BMS SerialNb: JK-Pack-2
6 Aug 18:43:43 - [warn] [function:SerialNb] BMS SerialNb: JK-Pack-1
```

## 3.0.5

## ⚡️ Enhancements

- Code change for "static" & "setup" frames. 
Auto-discovery sent once on module start-up.

Then only the data is sent.
This loads the MQTT broker 10x less. The acquisition time is now set at 4 seconds for 2 BMS.

- Add new topic named **BMS_1/cell_voltage_min_number** which gives the voltage of the lowest cell in the pack 



## 3.0.4
Change pickup time

## 3.0.3
Init flow variable

## 3.0.2

## 🐞 Bug fixes
No longer send auto-discovery topics with data frames. Send them just once at startup.
This will relieve the MQTT broker and improve the speed of data updates in HAOS.
This loads the MQTT broker 500x less

## 3.0.1

## ⚡️ Enhancements

**SETUP fields**

Defining the various boudary values for the BMS  **setup** variable

For the various variables, I now define realistic **min** and **max** limits, as well as the **increment/decrement step** and, if necessary, its unit.

## V3.0.0

## ⚡️ Enhancements
CAN bus support is now available 💫

## 📚 Documentation
Added documentation for CAN support. See DOCS.md

## 2.0.6
Change CAN flow

## 2.0.5
Change Dockerfile

## 2.0.3
Give access write to can0

## 2.0.2
Change Dockerfile to support CANutils

## 2.0.1

## 🐞 Bug fixes
Correction of the use of the variable "Broadcasting"

## 📚 Documentation
Added documentation on RS485 & CAN protocols for jkbms


## 2.0.0

## ⚡️ Enhancements
Here is the add-on's new functionality in Version 2.0

It is now possible to leave a BMS in Master mode.

This involves setting all 4 small switches to the **down** or **0000** position.
Parameters can no longer be modified in this mode !

In this configuration, the BMS will query the other BMSs if any are connected to the RS485 bus.

The BMS will then broadcast the information it has retrieved cyclically every 5 seconds. This information will be read by this add-on

## 📚 Documentation

Please read the Github [README.md](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/README.md)

## ⚠️ Attention
As a precaution, please make a backup before this update. (it can be useful)

## 1.2.9
Changed timeout for the serial node out

## 1.2.8
test for BMS brodcasting mode with multiple BMS on Bus

## 1.2.7
Change broadcast flow

## 1.2.6
## ⚡️ Enhancements

- Start of BMS management in Master Bus Broadcasting mode.
- Addition of a Boolean field and creation of a specific flow to manage broadcast frames.
- Check whether you are in broadcast or full mode, with the option of modifying BMS parameters

## 🐞 Bug fixes
       -
## 📚 Documentation
       -

## 1.2.5
All's well, the JKBMS configuration fields are no longer erased when the module is updated.

## 1.2.4
Final local tests before releasing the latest version

## 1.2.3
Changed flow initialisation structure for new schema of jkbms fields

## 1.2.2
Still modification for jkbms fields

## 1.2.1
Modification of the loss of JKBMS configuration fields when updating the module

## 1.2.0

## Adds the possibility of using an RS485 <---> ethernet or Wifi gateway

 - *Use the IP address of the gateway and the port defined in the GW to the module
   configuration*

!! Parameters modification via the gateway **has not yet been implemented**. Only via the USB port.

## 1.1.11
Change flow for GW

## 1.1.10
Changed flow for GW preparation

## 1.1.9
Test with config.yaml

## 1.1.8
Test with config.yaml

## 1.1.4
Creation optional fields for GW

## 1.1.3
Change access right to nodered files

## 1.1.2
Modification for GW fields and 3 times more faster for data reading

## 1.1.1
Trying to add Gateway IP fields

## 1.1.0
1st version tested and approved
Data acquisition speed has been greatly increased

## 1.0.18
Modification of default USB device ttyUSB0 to ttyUSBx. Otherwise, there may be a conflict with other modules that could use ttyUSB0.

## 1.0.17
Module installation ok, modification of one flow

## 1.0.16
First tests NOK, try another Dockerfile

## 1.0.15
First real tests with 2 JKBMS's

## 1.0.14
Test call URL external image from DOCS.md

## 1.0.13
Change nb-jkbms to nb_jkbms and the flows that use it

## 1.0.12
New Flows with variable from the config menu

## 1.0.11
Change DOCS.md to reflect the new documentation of the software

## 1.0.10
Change Readme.md to reflect the new design of the software

## 1.0.9
Change config.js & Installation of my flows

## 1.0.8
Change slug

## 1.0.7
Change Path working directory

## 1.0.6
Modification config menu

## 1.0.5
Modification config menu

## 1.0.4
Access right to init nodered

## 1.0.3
Reconstruction from Linux machine

## 1.0.2
File permission Modification to executable

## 1.0.1
Modification config.yaml

## 1.0.0

- Module construction le 06-06-2025
