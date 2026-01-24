## v3.5.4 - 24-01-2026
## ⚡️ Enhancements
#### Addition of an Authorization/Prohibition Switch entity to modify settings

In the Global BMS device, this switch: 
- switch.bms_global_authorize_modify_settings (ON / OFF)

enables/disables the ability to modify BMS settings. 

This is to prevent unwanted and unintended modifications.
This entity acts on all BMS devices.

<img width="829" height="419" alt="image" src="https://github.com/user-attachments/assets/7f5a1bda-b878-4762-93e0-31ea0b8ac057" />


##  _______________________________________________________

## v3.5.3 - 16-01-2026
## ⚡️ Enhancements
#### Optimisation of the number of alarm messages sent per second

**BEFORE** Over 60 seconds with 2 BMS:  
*30 messages / 60s = 0.5 msg/s EVEN IF NOTHING CHANGES*


**AFTER** optimisation Over 60 seconds with 2 BMS (normal scenario, no alarms): 
*2 messages / 60s = 0.03 msg/s   Reduction: ÷ 15! (from 30 to 2 messages)*

If an alarm appears on a BMS:

*Timeline:
  Overall status OFF → 0 messages
  BMS_2 alarm ON → Aggregation detects: OFF → ON → 1 message 🚨
  Status remains ON   → 0 messages
  BMS_2 alarm OFF → Aggregation detects: ON → OFF → 1 message ✅*

##📈 **TOTAL summary** with all optimisations in versions **v3.5.2 & v3.5.3**
## Final result: **75 msg/s → ~33.5 msg/s (÷ 2.2)** 🎉

The Broker will appreciate this 💪 . 
This will be even more noticeable as the number of BMSs increases.

##Other changes.

Filters added for invalid BMS numbers. Only the following should remain:
BMS_master, BMS_1 to BMS_15

<img width="389" height="249" alt="image" src="https://github.com/user-attachments/assets/6975e234-4126-4221-8713-fa07c81c9d4b" />

##  ____________________________________________________________________


## v3.5.2 - 15-01-2026
## ⚡️ Enhancements

#### Optimisation of the number of topics sent to the MQTT Broker
Indeed, for 2 BMS measured over 60 seconds:

📊 **Before and after comparison**

| Metric | BEFORE (Non-optimised setup) | AFTER Phase 1 (Optimised setup) | Gain |
| :--- | :--- | :--- | :--- |
| Messages total/60s | ~4600 | 2000 | -57% |
| Overall average | 75-77 msg/s | 33.67 msg/s | ÷ 2.3 |
| BMS_master | 39 msg/s | 17 msg/s | ÷ 2.3 |
| BMS_2 | 37 msg/s | 16.66 msg/s | ÷ 2.2 |

I have reduced the number of setup frames sent. 
They are now only sent when the module starts up and when a setup is modified.
### This results in a **2.3x reduction** in the number of topics sent. 
The broker will appreciate this 👍
Data frames are still sent at a rate of 4 seconds.

##  ____________________________________________________________________


## v3.5.1 - 09-01-2026

### 🐞 Corrections (Bugfix)

[Issue#80](https://github.com/jean-luc1203/jkbms-rs485-addon/issues/80)
# A complete overhaul of the section that processes **TCP/IP gateway** data.

The frames coming from these gateways are poorly ordered, broken or mixed up.

	I had to reconstruct them before processing them for decryption.

#### ⚠️  Normally, no changes should be noticed by those using the USB adapter.

-----------------------------------------------

<img width="225" height="653" alt="image" src="https://github.com/user-attachments/assets/80efd86e-6b9c-4526-9129-779bdc628d37" />

<img width="327" height="324" alt="image" src="https://github.com/user-attachments/assets/02e3f43d-bc81-4060-b050-7fcbcccd8ed2" />

<img width="297" height="256" alt="image" src="https://github.com/user-attachments/assets/bf40efec-307b-4a32-926e-cade18f0f220" />

-----------------------------------------------


## v3.4.2 - 26-12-2025

### 🐞 Corrections (Bugfix)

Correction of values for `switch_discharge` and `switch_charge` when a **BMS is in Master mode (0000)**

<img width="474" height="156" alt="image" src="https://github.com/user-attachments/assets/ffbb5b7f-a52c-4526-b819-6bd46d9cc137" />

to 

<img width="386" height="181" alt="image" src="https://github.com/user-attachments/assets/57db4c2c-9218-4345-8934-fc0bee59830b" />



The values are now correctly displayed. 
![Issue](https://github.com/jean-luc1203/jkbms-rs485-addon/issues/73#issuecomment-3691696725)

##  ____________________________________________________________________


## v3.4.1 - 25-12-2025

### 🐞 Corrections (Bugfix)
Various bug fixes

## ⚡️ Enhancements

Preparation of a **standalone version** that could run on Windows or Linux without Home Assistant and without installing other software.

**It is not finished yet!**

Still a lot of work to be done to implement this option.

- 3 dashboards are ready: 1 for live data, 1 for setups, and 1 for static information.


##  ____________________________________________________________________


## v3.3.13 - 10-12-2025

### ⚡️ Enhancements

Addition of 2 sensors that provide the status of the heating function connected to the JK

- `sensor.bms_x_heating`                 Is the heating function activated ?    -    (ON / OFF) 
- `sensor.bms_x_heating_current`         Indicates the amperage used for heating
- `sensor.bms_x_heating_status_text`     Indicates whether the heating function is activated

<img width="346" height="148" alt="image" src="https://github.com/user-attachments/assets/a81ec864-de59-4e85-b125-27eb11b69065" />


##  ____________________________________________________________________


## v3.3.12 - 07-12-2025

### 🔧 Corrections (Bugfix)

Correction of the minimum value for `bms_master_bms_device_address: 0 (range 1.0 - 247.0)`. The value 0 will be now allowed

##  ____________________________________________________________________



## v3.3.11 - 07-12-2025

### 🔧 Corrections (Bugfix)

- **Correction of MQTT value ranges**: Resolution of the error "The range is 0 to 100 but the value is higher" for Home Assistant entities.
  - Increase of the default range from 0-100 to 0-5000 in the "Setup To MQTT" node.
  - Added custom bounds (`customBounds`) for all BMS parameters (max currents up to 600A, battery capacity up to 2000Ah, protection delays up to 5000s)
  - Affected corrections: `total_battery_capacity_Ah`, `max_discharge_current`, `discharge_overcurrent_protection_delay`, `short_circuit_protection_delay`, and other BMS configuration parameters

  ### Custom value ranges added:

  **Currents and capacities:**
  - Max charge current: 0-600
  - Max discharge current: 0-600
  - Max balance current: 0-10
  - Total battery capacity: 5-2000

  **Protection delays (in seconds):**
  - Short circuit protection delay: 0-5000
  - Charge overcurrent protection delay: 2-600
  - Discharge overcurrent protection delay: 2-600
  - Charge overcurrent recovery time: 2-3600
  - Discharge overcurrent recovery time: 2-3600
  - Short circuit recovery time: 2-600

  **Cell voltages:**
  - Smart sleep voltage: 0-5
  - Undervoltage/overvoltage protections: 1.2-4.5
  - Balance trigger: 0.003-1
  - SOC 0%/100% voltages: 1-4.5
  - Request charge/float voltages: 1.2-5
  - Power off voltage: 1.2-4.5
  - Balance starting voltage: 1.2-4.25

  **Temperatures:**
  - Charge/discharge overtemperature protections: -40 to 150
  - Charge undertemperature protections: -40 to 50
  - Power tube overtemperature protections: 30-100

  **Others:**
  - Cell count: 1-32
  - Wiring resistance: 0-1000
  - Device address: 1-247
  
##  ____________________________________________________________________

# 3.3.10

### 🐞 Debug
Increase to 25 the maximum value for the parameter: `number.bms_x_bms_request_float_voltage_time

### ⚡️ Enhancements

When starting up, the module sends a "bip" to my website smartphoton.ch.
This allows me to get an idea of how many modules are installed.
💡 No private information is sent. Only the word "bip".
You can disable this feature in the module configuration.

##  ____________________________________________________________________


# 3.3.8

### 🐞 Debug
Correction of malformed topic: discovery topic `device_address`

There was an extra space character.

##  ____________________________________________________________________


# 3.3.7

## ⚡️ Enhancements
## 🚨Alarm management implementations 🚨

ℹ️ One BMS with the switches **set to 0000**

It is therefore the master of the RS485 bus and, for my module,

it is in broadcasting mode !

![Alarm(s)](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/refs/heads/main/images/Alarms-broadcasting-off.png)

### Alarm management will automatically create these entities in HAOS.
- ❶ `binary_sensor.bms_global_bms_global_alarm`	It indicates if any of the BMS are in alarm mode.
  It can take the values `"off"` or `"on"`   *device_class: problem*

- ❷ `sensor.bms_x_bms_x_visual_status` Visual status for each BMS
  It can take the values `"✅ No alarm"` or `"🚨 x alarm(s)"`

- ❸`sensor.bms_x_bms_x_alarm_status` Status for each BMS
  It can take the values `"No BMS alarms"` or `"🚨 BMS Alarm Alert"`

- ❹ `sensor.bms_x_bms_x_alarm_list` List of one or more alarms from a BMS
  It can take one or several labels as described below:


*"Balancing resistance too high",               
"MOS over-temperature protection",             
"Number of cells does not match parameter",    
"Abnormal current sensor",                     
"Cell over-voltage protection",                
"Battery over-voltage protection",             
"Overcurrent charge protection",               
"Charge short-circuit protection",             
"Over-temperature charge protection",          
"Low temperature charge protection",           
"Internal communication anomaly",              
"Cell under-voltage protection",               
"Battery under-voltage protection",            
"Overcurrent discharge protection",            
"Discharge short-circuit protection",          
"Over-temperature discharge protection",       
"Charge MOS anomaly",                          
"Discharge MOS anomaly",                       
"GPS disconnected",                            
"Please modify the authorization password in time",                             
"Discharge activation failure",                
"Battery over-temperature alarm",              
"Temperature sensor anomaly",                  
"Parallel module anomaly",                     
"Erreur fictive Bit 24",                            
"Erreur fictive Bit 25",                            
"Erreur fictive Bit 26",                            
"Erreur fictive Bit 27",                            
"Erreur fictive Bit 28",                            
"Erreur fictive Bit 29",                            
"Erreur fictive Bit 30",                            
"Erreur fictive Bit 31"*                            

![Alarm(s) ON](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/refs/heads/main/images/Alarms-broadcasting-on.png)
![Alarm(s) OFF](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/refs/heads/main/images/Alarms-broadcasting-on-2.png)

##  ____________________________________________________________________


# 3.3.6

## ⚡️ Enhancements

###  When in broadcast mode 📺

**BMS Master with the switches set on 0000**

To connect, for example, the Master BMS to the inverter that requires it.
*Examples*: Victron, Deye, etc ...

Adding automatically entities HAOS:
- ❶ sensor.bms_master_total_runtime_formatted

	`ex: 323D1H14M (DHM 323 days, 1 hour and 14 minutes)`
- ❷ sensor.bms_master_charge_status_text  `ex: Bulk, Absorption, Float`
- ❸ sensor.bms_master_charge_status_time

	`ex: 1H34S (1 hour and 34 seconds)`

### 🐞 Debug

- Added the ability to view live frames received in the logs for operational analysis

###  🌍 Traductions:
The configuration fields are now translated into:
- `English / German / Spanish / French / Portuguese / Italian / Polish`

### 🔢 Telemetry ?  

I am considering introducing a telemetry system to get a good idea of the number of live installations of my module.
But I would like to hear your opinion. For the moment, **nothing has been implemented yet**!

💥 Polls for you at this [location](/https://github.com/jean-luc1203/jkbms-rs485-addon/discussions/52) 💥

Thank you in advance for your response.


##  ____________________________________________________________________


## 3.3.3

## 🐞 Bug fixes

Changed some of the TCP timer connection to the IP Gateway

##  ____________________________________________________________________


## 3.3.1

## 🐞 Bug fixes

Correction of the timer for alarms when using IP Gateway

##  ____________________________________________________________________


## 3.3.0

## 🐞 Bug fixes & Enhancements

- Improved timer management
- addition of a delay node to regulate traffic and avoid crossing frames
- Major code overhaul to improve timing Efficiency
- Modified management of IP gateway usage
- Precaution regarding the management of damaged Alarms frames

⚠️ Please save your module before the update.

I have run tests, but I haven't been able to test everything. So please take precautions.
I would also appreciate your feedback on whether it works well or not at all.


##  ____________________________________________________________________

## 3.2.3

## 🐞 Bug fixes
Correct management of a single BMS, all 125 entities are correctly discovered when there is only one BMS in master/slave mode.


##  ____________________________________________________________________


## 3.2.1

## 🐞 Bug fixes
Increase the number maxi of BMS `jkbms_count` to 15 instead of 10


##  ____________________________________________________________________


## 3.2.0

## ⚡️ Enhancements

# 🚨  Alarm management  🚨

Management of the 23 alarms that JK-BMS can trigger.
See DOCS.md file for more information

The module will create sensors automatically in HAOS.
These are:

- ❶ `binary_sensor.bms_x_bms_alarm_active`
- ❷ `sensor.bms_1_bms_1_alarm_list`

These 2 sensors indicate on which BMS there is an alarm and the wording of these alarms. If there is more than one, they are separated by a comma.

A global sensor:

- ❸ `binary_sensor.bms_global_bms_global_alarm`
This is a binary sensor that enables simple automation in the event of an alarm on any BMS.

It was a big, long job, but I think it was worth it.
You tell me.

You can see a short live demonstration on my Youtube [channel](https://www.youtube.com/@domosimple)
- --
<img width="840" height="292" alt="image" src="https://github.com/user-attachments/assets/4e4a3295-2b64-49cb-b257-d17ff279e21c" />

<img width="530" height="251" alt="image" src="https://github.com/user-attachments/assets/7ba844ae-7c5f-45da-8ffa-226c2b3179d5" />

<img width="1105" height="612" alt="image" src="https://github.com/user-attachments/assets/8bf939d9-82d5-4b9f-ba96-22db16404a02" />


##  ____________________________________________________________________



## 3.1.11

## ⚡️ Enhancements

- Addition of 2 new sensors:
  - ❶ `sensor.bms_1_charge_status_text` which indicates whether the battery is in
  `Bulk / Absorption / Float` mode

  - ❷ `sensor.bms_1_charge_status_time_formatted` which indicates how long the balancing
  takes to reach the `balance trigger voltage
<img width="863" height="321" alt="image" src="https://github.com/user-attachments/assets/ba998fc6-d215-4819-9fd4-90e5628c0a87" />


##  ____________________________________________________________________



## 3.1.10

## ⚡️ Enhancements

- Addition of 1 sensors `sensor.bms_x_total_runtime_formatted`

This gives the number of days-hours-minute your JK-BMS has been running

in Day-Hour-Minute format, for example:  `300D22H46M`

No need to create a template in HAOS to calculate it


##  ____________________________________________________________________


## 3.1.9

## 🐞 Bug fixes
Correction of wrong T3 sensor temperature

##  ____________________________________________________________________


## 3.1.8

## ⚡️ Important change

The MQTT Cloud synchronization part has been removed. It is now part of an additional module called: [HAOS Encrypted MQTT Cloud Topic Synchronizer](https://github.com/jean-luc1203/HomeAssistant-MQTT-Cloud-2way-Synchronizer)

⚠️ Please save your module configuration in a notepad. Then press “Reset to defaults” to clear the configuration file. Next, fill in the module configuration fields again and restart the module

## ⚡️ Enhancements

- Addition of 2 sensors controlling the LCD buzzer
<img width="670" height="129" alt="LCD-Buzzer" src="https://github.com/user-attachments/assets/f6fabab5-843c-4db6-86ec-96954081ed07" />

- Display the Module Addon Version number into the log at startup

## 🐞 Bug fixes

- Various bugs have been corrected in the TCP/IP Gateway section
- No more attempts to connect to Cloud Broker

##  ____________________________________________________________________

## 3.1.2

 🐞 Bug fixes --> Incorrect min / max ranges for MQTT number entities

[Issue #29](https://github.com/jean-luc1203/jkbms-rs485-addon/issues/29)

All Home Assistant entities now have appropriate scales.

###  📌 For this to be taken into account !!!
it is **essential to Delete the MQTT device** `BMS_1, BMS_2, BMS_3, etc.`

So that the entities can be recreated with the correct value scales


## 3.1.1

 🐞 Bug fixes

Changed base image amd64 home assistant addon from 'stable' to '18.1.0'.
due to a change in the 'stable' image


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



