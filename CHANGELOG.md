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
