
# JK-BMS RS485 Broadcast – Troubleshooting Guide

This document helps diagnose communication issues when using **JK-BMS in RS485 broadcast mode** with the SmartPhoton / Node-RED integration.

The module publishes diagnostic metrics that allow users to quickly determine whether the **RS485 bus**, **serial adapter**, or **BMS communication** is working correctly.

---

# Where to See the Diagnostic Counters

## Home Assistant (recommended)

The integration automatically creates a sensor via MQTT discovery.

Entity:

```
sensor.jk_bms_rs485_module_jkbms_health
```

To view the metrics:

1. Open **Home Assistant**
2. Go to **Developer Tools**
3. Select **States**
4. Search for:

```
sensor.jk_bms_rs485_module_jkbms_health
```

All diagnostic counters appear as **attributes** of the sensor.

These values update every **30 seconds**.

---

## MQTT

The raw health message is published on:

```
BMS_GLOBAL/health
```

Example payload:

```json
{
 "status":"healthy",
 "serial_age_s":0.038,
 "buffers_30s":137,
 "frame_candidates_30s":137,
 "short_buffers_30s":105,
 "multi_header_buffers_30s":16,
 "last_len":11,
 "avg_len_30s":82,
 "max_len_30s":319,
 "bytes_30s":11187,
 "transport":"serial",
 "mode":"broadcast"
}
```

You can inspect it using:

- MQTT Explorer
- Node-RED debug node
- mosquitto_sub

Example:

```
mosquitto_sub -t BMS_GLOBAL/health -v
```

---

# How the JK-BMS Broadcast Bus Works

The JK-BMS master continuously scans the RS485 bus.

Communication cycle:

```
Master Poll → Slave Response
```

Example sequence:

```
[Poll BMS 1] → [Reply BMS 1]
[Poll BMS 2] → [Reply BMS 2]
[Poll BMS 3] → [Reply BMS 3]
...
[Poll BMS 15]
```

Typical timing:

```
Poll interval ≈ 200–300 ms
Full bus scan ≈ 3–4 seconds
```

---

# RS485 Bus Topology

Typical recommended wiring:

```
         RS485 BUS
 ─────────────────────────────

   Master BMS
        │
        │
   ─────┴─────────────────────────
        │
      BMS #1
        │
      BMS #2
        │
      BMS #3
        │
      BMS #4
        │
      BMS #5
```

Recommendations:

- Use **twisted pair**
- Keep bus **linear (no star topology)**
- Use **termination resistor at bus ends**
- Only **one BMS configured as master**

---

# Diagnostic Metrics Explained

## status

Overall communication health.

| Value | Meaning |
|------|--------|
healthy | Serial communication active |
degraded | Communication slower than expected |
no_serial_data | No serial data received |

---

# serial_age_s

Time since the last serial frame was received.

Example:

```
serial_age_s = 0.038
```

Meaning the last frame arrived **38 ms ago**.

| Range | Interpretation |
|------|---------------|
0 – 0.3 s | Normal |
0.3 – 1 s | Bus slower |
>1 s | Possible problem |
>5 s | Communication lost |

---

# buffers_30s

Number of serial buffers received during the last **30 seconds**.

Example:

```
buffers_30s = 137
```

Typical healthy system:

```
130 – 140 buffers / 30 seconds
```

Low values may indicate that the **master stopped polling**.

---

# frame_candidates_30s

Number of buffers containing recognizable frame signatures.

Includes:

- Modbus polls
- JK-BMS reply headers

Healthy system:

```
frame_candidates_30s ≈ buffers_30s
```

Lower values may indicate **corrupted serial data**.

---

# short_buffers_30s

Small serial buffers (typically Modbus poll frames).

Typical poll size:

```
11 bytes
```

Typical value:

```
90 – 110
```

These correspond to the master scanning slave addresses.

---

# multi_header_buffers_30s

Buffers containing **multiple frames**.

Example:

```
poll + reply inside the same serial buffer
```

Typical value:

```
10 – 20
```

High values may indicate **serial fragmentation**.

---

# last_len

Size of the most recent buffer received.

Typical values:

```
11 bytes → Modbus poll
300–320 bytes → JK-BMS reply
```

---

# avg_len_30s

Average buffer size over 30 seconds.

Example:

```
avg_len_30s = 75
```

Typical range:

```
60 – 90
```

This represents the mixture of **poll frames** and **reply frames**.

---

# max_len_30s

Largest buffer size observed.

Typical value:

```
300 – 320 bytes
```

If this drops significantly, **JK replies may not be received correctly**.

---

# bytes_30s

Total serial traffic received during the last 30 seconds.

Example:

```
bytes_30s = 11187
```

Equivalent to:

```
≈ 370 bytes per second
```

Compared to serial capacity:

```
115200 baud ≈ 11520 bytes/s
```

Bus usage is therefore only **~3% of the available bandwidth**.

Typical range:

```
9000 – 12000 bytes / 30 seconds
```

---

# Typical Healthy System

A normal installation typically shows values close to:

```
status = healthy
serial_age_s < 0.2
buffers_30s ≈ 136
short_buffers_30s ≈ 100
multi_header_buffers_30s ≈ 15
avg_len_30s ≈ 70–80
bytes_30s ≈ 10000
```

---

# Common Problems and Causes

| Symptom | Likely Cause |
|-------|--------------|
serial_age_s > 1 | Serial connection lost |
buffers_30s drops | Master BMS stopped polling |
bytes_30s very low | Missing BMS replies |
avg_len_30s very small | Replies not decoded |
multi_header_buffers very high | Serial fragmentation |

---

# Basic Troubleshooting Checklist

1. Check **RS485 wiring**
2. Verify **USB‑RS485 adapter**
3. Confirm baudrate = **115200**
4. Ensure only **one JK‑BMS master**
5. Check **termination resistors**

---

# Recommended Tools

- Home Assistant Developer Tools
- MQTT Explorer
- Node‑RED debug nodes
- mosquitto_sub
