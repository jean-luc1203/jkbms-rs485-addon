## 3.1

## ⚡️ Enhancements

##           🌟  Cloud MQTT Broker support  🌟

Enable secure, encrypted transmission of user-defined JK-BMS entities to a cloud broker such as HiveMQTT.

As a result, this data can be accessed anywhere in the world and on any device that has an MQTT client installed.

For example, on your phone, the ["IoT MQTT Panel"](https://play.google.com/store/apps/details?id=snr.lab.iotmqttpanel.prod&hl=en-US) application lets you connect to the Cloud Broker and display the JK-BMS values on your phone in a dashboard defined by you or downloaded from my Ko-Fi.

There's no need to install anything else at home, such as VPNs, proxies (Nginx) or personal plug&play networks like Zerotier or Tailscale.

## To select the entities you wish to export
use the "File editor" addon to modify the `configentities_list.json` file

For a fuller description, You can read the [`HiveMQ-Access.md` ](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/HiveMQ-Access.md)on the Github 

You can also watch the video explanation on my channel Youtube: [@domosimple](https://www.youtube.com/@domosimple)
## Translations

Fields descriptions in the module configuration automatically take into account the English or French language 😃

## ⚠️ Please, Save your module settings
As the format has changed. You will then need to fill it in again ‼️ ‼️

**Please** also, click on the **"Reset to default"** button on the configuration menu. This will clean up the configuration file and you will be able to define it again with your settings

**Screenshots**:
<img width="289" height="642" alt="1 (5)" src="https://github.com/user-attachments/assets/9a34eb2e-ca5f-41fb-87ad-e25c1d992b5f" />
<img width="290" height="643" alt="1 (4)" src="https://github.com/user-attachments/assets/5174d523-1d67-4446-8604-639811afff35" />
<img width="290" height="641" alt="1 (3)" src="https://github.com/user-attachments/assets/6324eced-a71d-4d81-b1f9-eae1ea71de05" />
<img width="293" height="641" alt="1 (2)" src="https://github.com/user-attachments/assets/34e4c9de-5366-4aa8-8b24-dc818b1e1c94" />
<img width="289" height="645" alt="1 (1)" src="https://github.com/user-attachments/assets/9017b879-be8d-484f-8373-5013c5c93b8c" />

** File to be modified to add/remove HAOS entities for external export**:

<img width="699" height="623" alt="1 (6)" src="https://github.com/user-attachments/assets/21ef7595-126e-4a92-9558-2a7b73e19666" />

## Mémory & CPU

I've streamlined the code and installation. Installation is faster and the module less memory-hungry.

## 3.0.13

## ⚡️ Enhancements

Add help to each configuration field.
At the top of each configuration field, there's now an explanation of the purpose of this parameter

 🐞 Bug fixes
No longer calls the TCP/IP gateway if the parameter is set to "false"

## ⚠️ Please, Save your configuration
As the format has changed. You will then need to fill it in again ‼️ ‼️

## 3.0.12

## ⚡️ Enhancements

It is now possible to have the debug option on both the rs485 port and the IP gateway.

⚠️ The `gateway_debug` parameter no longer exists, replaced by `communication_debug`

👀 Please, Don't forget to reset it to "false" once testing is complete. This could unnecessarily overload the module

<img width="680" height="100" alt="image" src="https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/images/Communication-debug.png" />


## 3.0.10

## ⚡️ Enhancements

Added a "debug" option to check whether there is communication via the IP - rs485 gateway. The information can be found in the live module log.

To enable it, change the gateway_debug parameter to "true"
`gateway_debug: true`

⚠️ Don't forget to reset it to "false" once testing is complete.

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
