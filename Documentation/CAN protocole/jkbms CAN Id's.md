# JKBMS CAN ID Documentation

## Overview

This documentation describes the CAN (Controller Area Network) identifiers used for communication with JKBMS (Battery Management System) devices. The system processes CAN frames to extract battery monitoring and control data.

## CAN Frame Format

CAN frames follow the standard format:
```
can0 [CAN_ID] [8] [DATA_BYTES]
```

Example: `can0 2F4 [8] 12 34 56 78 9A BC DE F0`

## Supported CAN IDs

### 1. **0x2F4** - Main Status
**Type**: `main_status`  
**Frequency**: High  
**Description**: Primary battery information

**Data Decoding:**
- **Bytes 0-1**: Total voltage (unsigned, × 0.1 V)
- **Bytes 2-3**: Current (signed, × 0.1 A, offset -400)
- **Byte 4**: State of Charge (SOC) in %

**Returned Data:**
- `totalVoltage`: Total voltage in V
- `soc`: State of charge in %
- `current`: Current in A (positive = charging, negative = discharging)

---

### 2. **0x4F4** - Cell Min/Max Voltages
**Type**: `cell_minmax`  
**Description**: Information about minimum and maximum cell voltages

**Data Decoding:**
- **Byte 0**: Cell voltage delta (× 0.001 V)
- **Bytes 1-2**: Maximum cell voltage (× 0.001 V)
- **Byte 2**: Maximum cell position
- **Bytes 3-4**: Minimum cell voltage (× 0.001 V)
- **Byte 5**: Minimum cell position

**Returned Data:**
- `deltaCellVoltage`: Cell voltage difference in V
- `maxCellVoltage`: Maximum voltage in V
- `maxCellPosition`: Maximum cell position
- `minCellVoltage`: Minimum voltage in V
- `minCellPosition`: Minimum cell position

---

### 3. **0x5F4** - Temperatures
**Type**: `temperatures`  
**Description**: Temperature sensor data

**Data Decoding:**
- **Byte 0**: Maximum temperature (offset -50°C)
- **Byte 1**: Maximum temperature sensor position
- **Byte 2**: Minimum temperature (offset -50°C)
- **Byte 3**: Minimum temperature sensor position
- **Byte 4**: Average temperature (offset -50°C)

**Returned Data:**
- `maxTemp`: Maximum temperature in °C
- `maxTempPosition`: Maximum sensor position
- `minTemp`: Minimum temperature in °C
- `minTempPosition`: Minimum sensor position
- `avgTemp`: Average temperature in °C

---

### 4. **0x7F4** - Alarm Information
**Type**: `alarm_info`  
**Description**: BMS alarm and alert status

**Data Decoding:**
- **Bytes 0-3**: Alarm bits (32 bits, 2 bits per alarm)

**Alarm Levels:**
- `0`: No alarm
- `1`: Serious
- `2`: Important
- `3`: General

**Alarm Types:**
1. Cell overvoltage
2. Cell undervoltage
3. Total voltage overvoltage
4. Total voltage undervoltage
5. Large pressure difference of monomer
6. Discharge overcurrent
7. Charge overcurrent
8. Temperature is too high
9. Temperature is too low
10. Excessive temperature difference
11. SOC too low
12. Insulation is too low
13. High voltage interlock fault
14. External communication failure
15. Internal communication failure

---

### 5. **0x18F128F4** - Power and Current
**Type**: `power_current`  
**Description**: Power data and cycle counter

**Data Decoding:**
- **Bytes 0-1**: Current (signed, × 0.001 A)
- **Bytes 2-3**: Power (× 0.1 W)
- **Bytes 6-7**: Cycle count

**Returned Data:**
- `current`: Current in A
- `power`: Power in W
- `cycleCount`: Number of charge/discharge cycles

---

### 6. **0x01F21400** - General Monitoring
**Type**: `monitoring`  
**Description**: Comprehensive monitoring data

**Data Decoding:**
- **Bytes 0-1**: Voltage (unsigned, × 0.01 V)
- **Bytes 2-3**: Current (signed, × 0.1 A)
- **Bytes 4-5**: Temperature (signed, ÷ 10 °C)
- **Bytes 6-7**: Cycle count

**Returned Data:**
- `voltage`: Voltage in V
- `current`: Current in A
- `temperature`: Temperature in °C
- `cycleCount`: Number of cycles

---

### 7. **0x18F528F4** - Cycle Count and Alarms
**Type**: `cycle_count`  
**Description**: Cycle counter with alarm code

**Data Decoding:**
- **Byte 0**: Alarm code
- **Bytes 1-2**: Cycle count

**Alarm Codes:**
- `0`: Normal
- `1`: Cell overvoltage
- `2`: Cell undervoltage
- `3`: Pack overvoltage
- `4`: Pack undervoltage
- `5`: Charge overcurrent
- `6`: Discharge overcurrent
- `7`: Charge overtemp
- `8`: Discharge overtemp
- `9`: Charge undertemp
- `10`: Discharge undertemp
- `11`: MOS overtemp
- `12`: Short circuit
- `13`: BMS overtemp
- `14`: BMS undertemp
- `23`: Cell imbalance
- `35`: System normal

---

### 8. **0x1806E5F4** - Status Data
**Type**: `status_data`  
**Description**: System status data

**Data Decoding:**
- **Bytes 2-3**: Main value (16 bits)
- **Other bytes**: Raw data preserved

---

### 9. **0x18F228F4** - Individual Temperatures
**Type**: `individual_temps`  
**Description**: Individual sensor temperatures

**Data Decoding:**
- **Bytes 1-5**: Sensor temperatures (offset -50°C)
- **Byte 0**: System data

**Returned Data:**
- `temperatures`: Array of temperatures in °C
- `mosTemp`: MOS temperature in °C
- `sensorCount`: Number of active sensors

---

### 10. **0x18F428F4** - Alternative SOC
**Type**: `alt_soc_data`  
**Description**: Alternative SOC data

**Data Decoding:**
- **Bytes 0-1**: System data
- **Byte 6**: Alternative SOC

---

### 11. **0x18E[0-3]28F4** - Individual Cell Voltages
**Type**: `cell_voltages`  
**Description**: Individual cell voltages by groups

**ID Pattern:**
- `18E028F4`: Cells 1-4
- `18E128F4`: Cells 5-8
- `18E228F4`: Cells 9-12
- `18E328F4`: Cells 13-16

**Data Decoding:**
- **Bytes 0-1**: Group cell 1 (× 0.001 V)
- **Bytes 2-3**: Group cell 2 (× 0.001 V)
- **Bytes 4-5**: Group cell 3 (× 0.001 V)
- **Bytes 6-7**: Group cell 4 (× 0.001 V)

---

## BMS Identification

The code includes BMS identification logic based on certain values:

### Identification Criteria:
1. **Type `cycle_count`**: 
   - `cycleCount === 35` → BMS2
   - Other value → BMS1

2. **Type `power_current`**:
   - `cycleCount === 35` → BMS2
   - `cycleCount === 12` → BMS1
   - Other value → unknown

3. **Type `individual_temps`**:
   - `mosTemp > 24°C` → BMS2
   - `mosTemp ≤ 24°C` → BMS1

## Unrecognized Frame Handling

Frames with unrecognized CAN IDs are processed by the `decodeExperimental()` function which searches for potential patterns:

### Detected Patterns:
- **Possible MOS temperature**: Values between 70-80 (after -50°C offset)
- **Possible cycle count**: 16-bit values between 10-50

## Output Structure

Each decoded frame returns an object with:
- `timestamp`: ISO timestamp
- `canId`: CAN identifier
- `bmsId`: BMS identifier (BMS1, BMS2, or unknown)
- `rawData`: Raw data (integer array)
- `rawHex`: Formatted hexadecimal data
- `type`: Decoded data type
- Type-specific fields

## Technical Notes

- All signed values use two's complement
- Temperature offsets are -50°C
- Voltage precision varies by context (0.001V to 0.1V)
- Standard CAN format uses 8 data bytes
- Alarms use a level system (0-3)
- Current values may have different scaling factors depending on the CAN ID
- Some frames contain reserved or unused bytes that are preserved in raw format