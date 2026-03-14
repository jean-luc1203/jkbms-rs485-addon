
# Troubleshooting – How to Send Diagnostic Statistics

The add-on continuously monitors JK-BMS RS485 communication and publishes health statistics every **30 seconds**.

These diagnostics help identify issues such as:

- RS485 wiring problems
- unstable USB-RS485 adapters
- incorrect serial settings
- RS485 to TCP gateway buffering issues
- missing or partial frames on the bus

When requesting support, please send the diagnostic statistics described below.

---

## Method 1 – From Home Assistant (recommended)

The easiest method is to copy the diagnostic entity from Home Assistant.

### Steps

1. Open **Home Assistant**
2. Go to **Developer Tools**
3. Open the **States** tab
4. Search for the entity:

```
sensor.jk_bms_rs485_module_jkbms_health
```

(The exact entity name may vary depending on your installation.)

5. Copy the **state** and especially the **attributes**.

Example:

```json
{
  "status": "healthy",
  "serial_age_s": 0.051,
  "buffers_30s": 165,
  "frame_candidates_30s": 165,
  "short_buffers_30s": 135,
  "multi_header_buffers_30s": 0,
  "last_len": 308,
  "avg_len_30s": 64,
  "max_len_30s": 308,
  "bytes_30s": 10571,
  "transport": "tcp",
  "mode": "broadcast"
}
```

Please also include:

- JK-BMS model
- number of BMS units
- connection type:
  - direct USB-RS485
  - RS485 to TCP gateway
  - RS485 to UDP gateway

---

## Method 2 – From MQTT

If you use **MQTT Explorer**, **mosquitto_sub**, or another MQTT client, you can retrieve the health statistics directly from MQTT.

Topic:

```
BMS_GLOBAL/health
```

Example command:

```
mosquitto_sub -t BMS_GLOBAL/health -v
```

Example output:

```json
{
  "status":"healthy",
  "serial_age_s":0.051,
  "buffers_30s":165,
  "frame_candidates_30s":165,
  "short_buffers_30s":135,
  "multi_header_buffers_30s":0,
  "last_len":308,
  "avg_len_30s":64,
  "max_len_30s":308,
  "bytes_30s":10571,
  "transport":"tcp",
  "mode":"broadcast"
}
```

---

## Meaning of the Diagnostic Fields

| Field | Meaning |
|------|---------|
| status | Overall communication health |
| serial_age_s | Time since the last valid frame was received |
| buffers_30s | Number of buffers received in the last 30 seconds |
| frame_candidates_30s | Buffers containing a potential frame header |
| short_buffers_30s | Small buffers, often due to fragmentation or polls |
| multi_header_buffers_30s | Buffers containing multiple frame headers |
| last_len | Length of the last received buffer |
| avg_len_30s | Average buffer length over 30 seconds |
| max_len_30s | Maximum buffer length seen in the last 30 seconds |
| bytes_30s | Total bytes received in the last 30 seconds |
| transport | Active transport type: serial, tcp, or udp |
| mode | Current operating mode (usually broadcast) |

---

## Typical Healthy Examples

### Direct USB‑RS485

```json
{
  "status": "healthy",
  "serial_age_s": 0.05,
  "buffers_30s": 136,
  "short_buffers_30s": 105,
  "multi_header_buffers_30s": 14,
  "avg_len_30s": 78,
  "max_len_30s": 319,
  "bytes_30s": 10560,
  "transport": "serial",
  "mode": "broadcast"
}
```

### RS485 → TCP Gateway

```json
{
  "status": "healthy",
  "serial_age_s": 0.08,
  "buffers_30s": 166,
  "short_buffers_30s": 136,
  "multi_header_buffers_30s": 0,
  "avg_len_30s": 64,
  "max_len_30s": 308,
  "bytes_30s": 10868,
  "transport": "tcp",
  "mode": "broadcast"
}
```

---

## Important Notes

These health statistics are:

- lightweight
- always active
- safe to leave enabled in production

They **do not require permanent debug file logging**.

Debug file logging should only be enabled temporarily for advanced troubleshooting if specifically requested.

---

## What to Send for Support

When opening an issue or asking for help, please send:

1. the diagnostic JSON from Home Assistant or MQTT
2. your connection type (serial / tcp / udp)
3. your JK‑BMS model
4. number of BMS units
5. a short description of the issue

Example:

```
Connection type: TCP gateway
BMS count: 2
Issue: values stop updating after a few minutes

Diagnostic JSON:
{ ... }
```

Providing this information usually allows the problem to be identified much faster.
