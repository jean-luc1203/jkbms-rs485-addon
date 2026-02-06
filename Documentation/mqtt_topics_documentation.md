# MQTT Topics Structure - JK-BMS Add-on

The JK-BMS add-on publishes three categories of data via MQTT:

## 1. Live Data

Real-time data published on simple topics:

### Topic Format
```
{BMS_NAME}/{SENSOR_NAME}
```

### Cell Measurements
- `{BMS_NAME}/Cell_X_volt` : Voltage of each cell in Volts (X from 1 to 16)
  - Example: `BMS_1/Cell_1_volt` → `3.328`
- `{BMS_NAME}/Cell_X_ohm` : Internal resistance of each cell in Ohms (X from 1 to 16)
  - Example: `BMS_1/Cell_1_ohm` → `0.003`

### Temperatures
- `{BMS_NAME}/Mos_temp` : MOSFET temperature in °C
  - Example: `BMS_1/Mos_temp` → `19.3`
- `{BMS_NAME}/Sonde_X_temp` : Temperature probe readings (X from 1 to 4) in °C
  - Example: `BMS_1/Sonde_1_temp` → `21.7`

### Power and Current
- `{BMS_NAME}/Puissance_Totale` : Total power in Watts
  - Example: `BMS_1/Puissance_Totale` → `447.814`
- `{BMS_NAME}/Courant_total` : Total current in Amperes (negative = discharge)
  - Example: `BMS_1/Courant_total` → `-8.8`
- `{BMS_NAME}/Tension_Totale_volt` : Total battery voltage in Volts
  - Example: `BMS_1/Tension_Totale_volt` → `53.31`

### Balancing
- `{BMS_NAME}/Balance_courant` : Balancing current in Amperes
  - Example: `BMS_1/Balance_courant` → `0`
- `{BMS_NAME}/Balance_Action` : Balancing state (0 = inactive, 1 = active)
  - Example: `BMS_1/Balance_Action` → `0`

### State of Charge
- `{BMS_NAME}/SOC_pourcentage` : State of charge in %
  - Example: `BMS_1/SOC_pourcentage` → `86`
- `{BMS_NAME}/Capacite_restante_Ah` : Remaining capacity in Ah
  - Example: `BMS_1/Capacite_restante_Ah` → `240.78`
- `{BMS_NAME}/Capacite_batterie_Ah` : Total battery capacity in Ah
  - Example: `BMS_1/Capacite_batterie_Ah` → `280`
- `{BMS_NAME}/SOH_pourcentage` : State of health in %
  - Example: `BMS_1/SOH_pourcentage` → `100`

### Cycles and History
- `{BMS_NAME}/Nombre_Cycle` : Number of charge/discharge cycles
  - Example: `BMS_1/Nombre_Cycle` → `90`
- `{BMS_NAME}/Cycle_Capacite_Ah` : Total cycled capacity in Ah
  - Example: `BMS_1/Cycle_Capacite_Ah` → `25292.242`
- `{BMS_NAME}/Total_runtime` : Total runtime in seconds
  - Example: `BMS_1/Total_runtime` → `34906707`
- `{BMS_NAME}/Total_runtime_formatted` : Formatted runtime (DDDdHHhMMm)
  - Example: `BMS_1/Total_runtime_formatted` → `404D0H18M`

### State Switches
- `{BMS_NAME}/Switch_Charge` : Charge switch state (0 = off, 1 = on)
  - Example: `BMS_1/Switch_Charge` → `1`
- `{BMS_NAME}/Switch_Decharge` : Discharge switch state (0 = off, 1 = on)
  - Example: `BMS_1/Switch_Decharge` → `1`
- `{BMS_NAME}/Switch_Balance` : Balancing state (0 = off, 1 = on)
  - Example: `BMS_1/Switch_Balance` → `0`

### Heating
- `{BMS_NAME}/Heating` : Heating state (0 = off, 1 = on)
  - Example: `BMS_1/Heating` → `0`
- `{BMS_NAME}/Heating_Current` : Heating current in Amperes
  - Example: `BMS_1/Heating_Current` → `0`

### Charge Status
- `{BMS_NAME}/charge_status` : Charge status code (0 = Bulk, 1 = Float, 2 = Other)
  - Example: `BMS_1/charge_status` → `0`
- `{BMS_NAME}/charge_status_text` : Charge status text
  - Example: `BMS_1/charge_status_text` → `Bulk`
- `{BMS_NAME}/charge_status_time` : Time in current status in seconds
  - Example: `BMS_1/charge_status_time` → `0`
- `{BMS_NAME}/charge_status_time_formatted` : Formatted time
  - Example: `BMS_1/charge_status_time_formatted` → `0S`

### Cell Statistics
- `{BMS_NAME}/cell_voltage_average` : Average cell voltage in Volts
  - Example: `BMS_1/cell_voltage_average` → `3.332`
- `{BMS_NAME}/cell_voltage_delta` : Voltage delta between cells in Volts
  - Example: `BMS_1/cell_voltage_delta` → `0.007`
- `{BMS_NAME}/cell_voltage_max_number` : Number of cell with max voltage
  - Example: `BMS_1/cell_voltage_max_number` → `12`
- `{BMS_NAME}/cell_voltage_min_number` : Number of cell with min voltage
  - Example: `BMS_1/cell_voltage_min_number` → `8`
- `{BMS_NAME}/cell_voltage_max_value` : Maximum voltage value in Volts
  - Example: `BMS_1/cell_voltage_max_value` → `3.335`
- `{BMS_NAME}/cell_voltage_min_value` : Minimum voltage value in Volts
  - Example: `BMS_1/cell_voltage_min_value` → `3.328`

## 2. Configuration Parameters (Settings)

Modifiable BMS parameters. Each parameter has two topics:

### Topic Format
```
{BMS_NAME}/control/{SETTING_NAME}/state      # Read current value
{BMS_NAME}/control/{SETTING_NAME}/set        # Modify value (publish new value)
```

### Cell Voltage Protections
- `smart_sleep_voltage` : Smart sleep voltage threshold (0-5V, step 0.01V)
  - Example: `BMS_2/control/smart_sleep_voltage/state` → `0.5`
- `cell_voltage_undervoltage_protection` : Undervoltage protection threshold (1.2-4.5V, step 0.001V)
  - Example: `BMS_2/control/cell_voltage_undervoltage_protection/state` → `2.8`
- `cell_voltage_undervoltage_recovery` : Undervoltage recovery threshold (1.2-4.5V, step 0.001V)
  - Example: `BMS_2/control/cell_voltage_undervoltage_recovery/state` → `2.9`
- `cell_voltage_overvoltage_protection` : Overvoltage protection threshold (1.2-4.5V, step 0.001V)
  - Example: `BMS_2/control/cell_voltage_overvoltage_protection/state` → `3.65`
- `cell_voltage_overvoltage_recovery` : Overvoltage recovery threshold (1.2-4.5V, step 0.001V)
  - Example: `BMS_2/control/cell_voltage_overvoltage_recovery/state` → `3.6`
- `cell_soc100_voltage` : Cell voltage at 100% SOC (1.2-4.5V, step 0.001V)
  - Example: `BMS_2/control/cell_soc100_voltage/state` → `3.45`
- `cell_soc0_voltage` : Cell voltage at 0% SOC (1.0-4.5V, step 0.001V)
  - Example: `BMS_2/control/cell_soc0_voltage/state` → `2.5`
- `cell_request_charge_voltage` : Requested charge voltage (1.2-5V, step 0.01V)
  - Example: `BMS_2/control/cell_request_charge_voltage/state` → `3.55`
- `cell_request_float_voltage` : Float voltage (1.2-5V, step 0.01V)
  - Example: `BMS_2/control/cell_request_float_voltage/state` → `3.45`
- `power_off_voltage` : Power off voltage (1.2-4.5V, step 0.01V)
  - Example: `BMS_2/control/power_off_voltage/state` → `2.8`

### Current Protections
- `max_charge_current` : Maximum charge current (0-600A, step 0.1A)
  - Example: `BMS_2/control/max_charge_current/state` → `100.0`
- `max_discharge_current` : Maximum discharge current (0-600A, step 0.1A)
  - Example: `BMS_2/control/max_discharge_current/state` → `100.0`
- `charge_overcurrent_protection_delay` : Charge overcurrent protection delay (2-600s, step 1s)
  - Example: `BMS_2/control/charge_overcurrent_protection_delay/state` → `30`
- `charge_overcurrent_protection_recovery_time` : Charge overcurrent recovery time (2-3600s, step 1s)
  - Example: `BMS_2/control/charge_overcurrent_protection_recovery_time/state` → `60`
- `discharge_overcurrent_protection_delay` : Discharge overcurrent protection delay (2-600s, step 1s)
  - Example: `BMS_2/control/discharge_overcurrent_protection_delay/state` → `30`
- `discharge_overcurrent_protection_recovery_time` : Discharge overcurrent recovery time (2-3600s, step 1s)
  - Example: `BMS_2/control/discharge_overcurrent_protection_recovery_time/state` → `60`
- `short_circuit_protection_recovery_time` : Short circuit recovery time (2-600s, step 1s)
  - Example: `BMS_2/control/short_circuit_protection_recovery_time/state` → `60`

### Temperature Protections
- `charge_overtemperature_protection` : Charge overtemperature threshold (-40 to 150°C, step 0.5°C)
  - Example: `BMS_2/control/charge_overtemperature_protection/state` → `65`
- `charge_overtemperature_protection_recovery` : Charge overtemperature recovery (-40 to 150°C, step 0.5°C)
  - Example: `BMS_2/control/charge_overtemperature_protection_recovery/state` → `60`
- `discharge_overtemperature_protection` : Discharge overtemperature threshold (-40 to 150°C, step 0.5°C)
  - Example: `BMS_2/control/discharge_overtemperature_protection/state` → `65`
- `discharge_overtemperature_protection_recovery` : Discharge overtemperature recovery (-40 to 150°C, step 0.5°C)
  - Example: `BMS_2/control/discharge_overtemperature_protection_recovery/state` → `60`
- `charge_undertemperature_protection` : Charge undertemperature threshold (-40 to 150°C, step 0.5°C)
  - Example: `BMS_2/control/charge_undertemperature_protection/state` → `2`
- `charge_undertemperature_protection_recovery` : Charge undertemperature recovery (-40 to 150°C, step 0.5°C)
  - Example: `BMS_2/control/charge_undertemperature_protection_recovery/state` → `7`
- `power_tube_overtemperature_protection` : MOSFET overtemperature threshold (-40 to 150°C, step 0.5°C)
  - Example: `BMS_2/control/power_tube_overtemperature_protection/state` → `60`
- `power_tube_overtemperature_protection_recovery` : MOSFET overtemperature recovery (-40 to 150°C, step 0.5°C)
  - Example: `BMS_2/control/power_tube_overtemperature_protection_recovery/state` → `55`

### Balancing
- `balance_trigger_voltage` : Balancing trigger delta (0.003-1V, step 0.001V)
  - Example: `BMS_2/control/balance_trigger_voltage/state` → `0.01`
- `balance_starting_voltage` : Balancing starting voltage (V)
  - Example: `BMS_2/control/balance_starting_voltage/state` → `3.44`
- `max_balance_current` : Maximum balancing current (0-10A, step 0.1A)
  - Example: `BMS_2/control/max_balance_current/state` → `2.0`

### Battery Configuration
- `total_battery_capacity_ah` : Total battery capacity (Ah)
  - Example: `BMS_2/control/total_battery_capacity_ah/state` → `280`
- `cell_count` : Number of cells
  - Example: `BMS_2/control/cell_count/state` → `16`
- `connexion_wire_resistance_1` : Connection wire resistance (Ω)
  - Example: `BMS_2/control/connexion_wire_resistance_1/state` → `0`
- `device_address` : Device address
  - Example: `BMS_2/control/device_address/state` → `2`
- `short_circuit_protection_delay` : Short circuit protection delay (µs)
  - Example: `BMS_2/control/short_circuit_protection_delay/state` → `1500`

### Configuration Switches
- `charging_switch` : Enable charging (True/False)
  - Example: `BMS_2/control/charging_switch/state` → `True`
- `discharging_switch` : Enable discharging (True/False)
  - Example: `BMS_2/control/discharging_switch/state` → `True`
- `balance_switch` : Enable balancing (True/False)
  - Example: `BMS_2/control/balance_switch/state` → `True`
- `smart_sleep_switch` : Smart sleep mode (True/False)
  - Example: `BMS_2/control/smart_sleep_switch/state` → `False`
- `disable_pcl_module_switch` : Disable PCL module (True/False)
  - Example: `BMS_2/control/disable_pcl_module_switch/state` → `False`
- `timed_stored_data_switch` : Timed data storage (True/False)
  - Example: `BMS_2/control/timed_stored_data_switch/state` → `True`
- `charging_floating_mode` : Floating mode (True/False)
  - Example: `BMS_2/control/charging_floating_mode/state` → `True`
- `display_always_on_switch` : Display always on ([false,false] = array format)
  - Example: `BMS_2/control/display_always_on_switch/state` → `[false,false]`

## 3. Static Specifications

Static BMS information, published at startup or when configuration changes.

### Topic Format
```
{BMS_NAME}/state/{INFO_NAME}
```

### System Information
- `{BMS_NAME}/state/bms` : BMS model
  - Example: `BMS_2/state/bms` → `JK_PB2A16S15P`
- `{BMS_NAME}/state/fw` : Firmware version
  - Example: `BMS_2/state/fw` → `15A`
- `{BMS_NAME}/state/sw` : Software version
  - Example: `BMS_2/state/sw` → `15.41`
- `{BMS_NAME}/state/uptime` : BMS uptime in seconds
  - Example: `BMS_2/state/uptime` → `29003700`
- `{BMS_NAME}/state/power_count` : Number of power-ups
  - Example: `BMS_2/state/power_count` → `31`

### Identification
- `{BMS_NAME}/state/serialnb` : BMS serial number
  - Example: `BMS_2/state/serialnb` → `JK-Pack-2`
- `{BMS_NAME}/state/brand` : BMS brand/name
  - Example: `BMS_2/state/brand` → `JK-BMS-2`
- `{BMS_NAME}/state/manufacturing_date` : Manufacturing date (YYMMDD format)
  - Example: `BMS_2/state/manufacturing_date` → `250307` (March 7, 2025)

### Security
- `{BMS_NAME}/state/password1` : Primary password
  - Example: `BMS_2/state/password1` → `1234`
- `{BMS_NAME}/state/password2` : Secondary password
  - Example: `BMS_2/state/password2` → `1`

### Communication Protocols
- `{BMS_NAME}/state/uart1_protocol_number` : UART1 protocol number
  - Example: `BMS_2/state/uart1_protocol_number` → `7`
- `{BMS_NAME}/state/can_protocol_number` : CAN protocol number
  - Example: `BMS_2/state/can_protocol_number` → `6`

### LCD/Buzzer Configuration
- `{BMS_NAME}/state/lcd_buzzer_trigger` : Buzzer trigger type (0-25)
  - Example: `BMS_2/state/lcd_buzzer_trigger` → `0`
- `{BMS_NAME}/state/lcd_buzzer_trigger_value` : Trigger value in %
  - Example: `BMS_2/state/lcd_buzzer_trigger_value` → `65`
- `{BMS_NAME}/state/lcd_buzzer_release_value` : Release value in %
  - Example: `BMS_2/state/lcd_buzzer_release_value` → `60`

### Charge Timings
- `{BMS_NAME}/state/request_charge_voltage_time` : Charge voltage duration in hours
  - Example: `BMS_2/state/request_charge_voltage_time` → `1`
- `{BMS_NAME}/state/request_float_voltage_time` : Float voltage duration in hours
  - Example: `BMS_2/state/request_float_voltage_time` → `6`

---

## Naming Convention

- **{BMS_NAME}** : Configured BMS name (e.g., BMS_1, BMS_2)
- **{SENSOR_NAME}** : Sensor name (e.g., Cell_1_volt, Mos_temp)
- **{SETTING_NAME}** : Parameter name (e.g., max_charge_current)
- **{INFO_NAME}** : Static information name (e.g., serialnb, fw)

## Topic Usage

### Reading Data
Subscribe to topics to receive values:
```
# All data from a BMS
BMS_1/#

# Only cell voltages
BMS_1/Cell_+_volt

# A specific sensor
BMS_1/SOC_pourcentage
```

### Modifying Parameters
Publish the new value to the `/set` topic:
```
Topic: BMS_1/control/max_charge_current/set
Payload: 120.5

Topic: BMS_1/control/charging_switch/set
Payload: False
```

The new value will be confirmed on the corresponding `/state` topic.

---

## Complete Topic Reference

### Live Data Topics

| Topic | Description |
|-------|-------------|
| `{BMS}/Cell_1_volt` | Cell 1 voltage (V) |
| `{BMS}/Cell_2_volt` | Cell 2 voltage (V) |
| `{BMS}/Cell_3_volt` | Cell 3 voltage (V) |
| `{BMS}/Cell_4_volt` | Cell 4 voltage (V) |
| `{BMS}/Cell_5_volt` | Cell 5 voltage (V) |
| `{BMS}/Cell_6_volt` | Cell 6 voltage (V) |
| `{BMS}/Cell_7_volt` | Cell 7 voltage (V) |
| `{BMS}/Cell_8_volt` | Cell 8 voltage (V) |
| `{BMS}/Cell_9_volt` | Cell 9 voltage (V) |
| `{BMS}/Cell_10_volt` | Cell 10 voltage (V) |
| `{BMS}/Cell_11_volt` | Cell 11 voltage (V) |
| `{BMS}/Cell_12_volt` | Cell 12 voltage (V) |
| `{BMS}/Cell_13_volt` | Cell 13 voltage (V) |
| `{BMS}/Cell_14_volt` | Cell 14 voltage (V) |
| `{BMS}/Cell_15_volt` | Cell 15 voltage (V) |
| `{BMS}/Cell_16_volt` | Cell 16 voltage (V) |
| `{BMS}/Cell_1_ohm` | Cell 1 internal resistance (Ω) |
| `{BMS}/Cell_2_ohm` | Cell 2 internal resistance (Ω) |
| `{BMS}/Cell_3_ohm` | Cell 3 internal resistance (Ω) |
| `{BMS}/Cell_4_ohm` | Cell 4 internal resistance (Ω) |
| `{BMS}/Cell_5_ohm` | Cell 5 internal resistance (Ω) |
| `{BMS}/Cell_6_ohm` | Cell 6 internal resistance (Ω) |
| `{BMS}/Cell_7_ohm` | Cell 7 internal resistance (Ω) |
| `{BMS}/Cell_8_ohm` | Cell 8 internal resistance (Ω) |
| `{BMS}/Cell_9_ohm` | Cell 9 internal resistance (Ω) |
| `{BMS}/Cell_10_ohm` | Cell 10 internal resistance (Ω) |
| `{BMS}/Cell_11_ohm` | Cell 11 internal resistance (Ω) |
| `{BMS}/Cell_12_ohm` | Cell 12 internal resistance (Ω) |
| `{BMS}/Cell_13_ohm` | Cell 13 internal resistance (Ω) |
| `{BMS}/Cell_14_ohm` | Cell 14 internal resistance (Ω) |
| `{BMS}/Cell_15_ohm` | Cell 15 internal resistance (Ω) |
| `{BMS}/Cell_16_ohm` | Cell 16 internal resistance (Ω) |
| `{BMS}/Mos_temp` | MOSFET temperature (°C) |
| `{BMS}/Sonde_1_temp` | Temperature probe 1 (°C) |
| `{BMS}/Sonde_2_temp` | Temperature probe 2 (°C) |
| `{BMS}/Sonde_3_temp` | Temperature probe 3 (°C) |
| `{BMS}/Sonde_4_temp` | Temperature probe 4 (°C) |
| `{BMS}/Puissance_Totale` | Total power (W) |
| `{BMS}/Courant_total` | Total current (A) |
| `{BMS}/Tension_Totale_volt` | Total voltage (V) |
| `{BMS}/Balance_courant` | Balancing current (A) |
| `{BMS}/Balance_Action` | Balancing action (0/1) |
| `{BMS}/SOC_pourcentage` | State of charge (%) |
| `{BMS}/Capacite_restante_Ah` | Remaining capacity (Ah) |
| `{BMS}/Capacite_batterie_Ah` | Battery capacity (Ah) |
| `{BMS}/SOH_pourcentage` | State of health (%) |
| `{BMS}/Nombre_Cycle` | Cycle count |
| `{BMS}/Cycle_Capacite_Ah` | Total cycled capacity (Ah) |
| `{BMS}/Total_runtime` | Total runtime (s) |
| `{BMS}/Total_runtime_formatted` | Total runtime formatted |
| `{BMS}/Switch_Charge` | Charge switch (0/1) |
| `{BMS}/Switch_Decharge` | Discharge switch (0/1) |
| `{BMS}/Switch_Balance` | Balance switch (0/1) |
| `{BMS}/Heating` | Heating status (0/1) |
| `{BMS}/Heating_Current` | Heating current (A) |
| `{BMS}/charge_status` | Charge status code (0-2) |
| `{BMS}/charge_status_text` | Charge status text |
| `{BMS}/charge_status_time` | Time in status (s) |
| `{BMS}/charge_status_time_formatted` | Time in status formatted |
| `{BMS}/cell_voltage_average` | Average cell voltage (V) |
| `{BMS}/cell_voltage_delta` | Cell voltage delta (V) |
| `{BMS}/cell_voltage_max_number` | Max voltage cell number |
| `{BMS}/cell_voltage_min_number` | Min voltage cell number |
| `{BMS}/cell_voltage_max_value` | Max voltage value (V) |
| `{BMS}/cell_voltage_min_value` | Min voltage value (V) |

### Configuration Topics (Read/Write)

| Topic (state) | Topic (set) | Description |
|---------------|-------------|-------------|
| `{BMS}/control/smart_sleep_voltage/state` | `{BMS}/control/smart_sleep_voltage/set` | Smart sleep voltage (V) |
| `{BMS}/control/cell_voltage_undervoltage_protection/state` | `{BMS}/control/cell_voltage_undervoltage_protection/set` | Undervoltage protection (V) |
| `{BMS}/control/cell_voltage_undervoltage_recovery/state` | `{BMS}/control/cell_voltage_undervoltage_recovery/set` | Undervoltage recovery (V) |
| `{BMS}/control/cell_voltage_overvoltage_protection/state` | `{BMS}/control/cell_voltage_overvoltage_protection/set` | Overvoltage protection (V) |
| `{BMS}/control/cell_voltage_overvoltage_recovery/state` | `{BMS}/control/cell_voltage_overvoltage_recovery/set` | Overvoltage recovery (V) |
| `{BMS}/control/cell_soc100_voltage/state` | `{BMS}/control/cell_soc100_voltage/set` | 100% SOC voltage (V) |
| `{BMS}/control/cell_soc0_voltage/state` | `{BMS}/control/cell_soc0_voltage/set` | 0% SOC voltage (V) |
| `{BMS}/control/cell_request_charge_voltage/state` | `{BMS}/control/cell_request_charge_voltage/set` | Requested charge voltage (V) |
| `{BMS}/control/cell_request_float_voltage/state` | `{BMS}/control/cell_request_float_voltage/set` | Float voltage (V) |
| `{BMS}/control/power_off_voltage/state` | `{BMS}/control/power_off_voltage/set` | Power off voltage (V) |
| `{BMS}/control/max_charge_current/state` | `{BMS}/control/max_charge_current/set` | Max charge current (A) |
| `{BMS}/control/max_discharge_current/state` | `{BMS}/control/max_discharge_current/set` | Max discharge current (A) |
| `{BMS}/control/charge_overcurrent_protection_delay/state` | `{BMS}/control/charge_overcurrent_protection_delay/set` | Charge overcurrent delay (s) |
| `{BMS}/control/charge_overcurrent_protection_recovery_time/state` | `{BMS}/control/charge_overcurrent_protection_recovery_time/set` | Charge overcurrent recovery (s) |
| `{BMS}/control/discharge_overcurrent_protection_delay/state` | `{BMS}/control/discharge_overcurrent_protection_delay/set` | Discharge overcurrent delay (s) |
| `{BMS}/control/discharge_overcurrent_protection_recovery_time/state` | `{BMS}/control/discharge_overcurrent_protection_recovery_time/set` | Discharge overcurrent recovery (s) |
| `{BMS}/control/short_circuit_protection_recovery_time/state` | `{BMS}/control/short_circuit_protection_recovery_time/set` | Short circuit recovery (s) |
| `{BMS}/control/charge_overtemperature_protection/state` | `{BMS}/control/charge_overtemperature_protection/set` | Charge overtemp protection (°C) |
| `{BMS}/control/charge_overtemperature_protection_recovery/state` | `{BMS}/control/charge_overtemperature_protection_recovery/set` | Charge overtemp recovery (°C) |
| `{BMS}/control/discharge_overtemperature_protection/state` | `{BMS}/control/discharge_overtemperature_protection/set` | Discharge overtemp protection (°C) |
| `{BMS}/control/discharge_overtemperature_protection_recovery/state` | `{BMS}/control/discharge_overtemperature_protection_recovery/set` | Discharge overtemp recovery (°C) |
| `{BMS}/control/charge_undertemperature_protection/state` | `{BMS}/control/charge_undertemperature_protection/set` | Charge undertemp protection (°C) |
| `{BMS}/control/charge_undertemperature_protection_recovery/state` | `{BMS}/control/charge_undertemperature_protection_recovery/set` | Charge undertemp recovery (°C) |
| `{BMS}/control/power_tube_overtemperature_protection/state` | `{BMS}/control/power_tube_overtemperature_protection/set` | MOSFET overtemp protection (°C) |
| `{BMS}/control/power_tube_overtemperature_protection_recovery/state` | `{BMS}/control/power_tube_overtemperature_protection_recovery/set` | MOSFET overtemp recovery (°C) |
| `{BMS}/control/balance_trigger_voltage/state` | `{BMS}/control/balance_trigger_voltage/set` | Balance trigger voltage (V) |
| `{BMS}/control/balance_starting_voltage/state` | `{BMS}/control/balance_starting_voltage/set` | Balance starting voltage (V) |
| `{BMS}/control/max_balance_current/state` | `{BMS}/control/max_balance_current/set` | Max balance current (A) |
| `{BMS}/control/total_battery_capacity_ah/state` | `{BMS}/control/total_battery_capacity_ah/set` | Total battery capacity (Ah) |
| `{BMS}/control/cell_count/state` | `{BMS}/control/cell_count/set` | Cell count |
| `{BMS}/control/connexion_wire_resistance_1/state` | `{BMS}/control/connexion_wire_resistance_1/set` | Wire resistance (Ω) |
| `{BMS}/control/device_address/state` | `{BMS}/control/device_address/set` | Device address |
| `{BMS}/control/short_circuit_protection_delay/state` | `{BMS}/control/short_circuit_protection_delay/set` | Short circuit delay (µs) |
| `{BMS}/control/charging_switch/state` | `{BMS}/control/charging_switch/set` | Charging switch (True/False) |
| `{BMS}/control/discharging_switch/state` | `{BMS}/control/discharging_switch/set` | Discharging switch (True/False) |
| `{BMS}/control/balance_switch/state` | `{BMS}/control/balance_switch/set` | Balance switch (True/False) |
| `{BMS}/control/smart_sleep_switch/state` | `{BMS}/control/smart_sleep_switch/set` | Smart sleep switch (True/False) |
| `{BMS}/control/disable_pcl_module_switch/state` | `{BMS}/control/disable_pcl_module_switch/set` | Disable PCL module (True/False) |
| `{BMS}/control/timed_stored_data_switch/state` | `{BMS}/control/timed_stored_data_switch/set` | Timed data storage (True/False) |
| `{BMS}/control/charging_floating_mode/state` | `{BMS}/control/charging_floating_mode/set` | Floating mode (True/False) |
| `{BMS}/control/display_always_on_switch/state` | `{BMS}/control/display_always_on_switch/set` | Display always on |

### Static Information Topics (Read Only)

| Topic | Description |
|-------|-------------|
| `{BMS}/state/bms` | BMS model |
| `{BMS}/state/fw` | Firmware version |
| `{BMS}/state/sw` | Software version |
| `{BMS}/state/uptime` | Uptime (s) |
| `{BMS}/state/power_count` | Power-up count |
| `{BMS}/state/serialnb` | Serial number |
| `{BMS}/state/brand` | Brand/name |
| `{BMS}/state/manufacturing_date` | Manufacturing date (YYMMDD) |
| `{BMS}/state/password1` | Password 1 |
| `{BMS}/state/password2` | Password 2 |
| `{BMS}/state/uart1_protocol_number` | UART1 protocol number |
| `{BMS}/state/can_protocol_number` | CAN protocol number |
| `{BMS}/state/lcd_buzzer_trigger` | LCD buzzer trigger type |
| `{BMS}/state/lcd_buzzer_trigger_value` | Buzzer trigger value (%) |
| `{BMS}/state/lcd_buzzer_release_value` | Buzzer release value (%) |
| `{BMS}/state/request_charge_voltage_time` | Charge voltage time (h) |
| `{BMS}/state/request_float_voltage_time` | Float voltage time (h) |
