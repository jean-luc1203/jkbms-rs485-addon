# JK-BMS RS485 Communication Diagnostics – Troubleshooting Guide

This guide explains the unified SmartPhoton / Node-RED communication diagnostics for JK-BMS installations.

The diagnostic system supports both RS485 architectures:

- **Broadcast mode**: one JK-BMS is configured as Master and SmartPhoton listens to the bus.
- **Active Polling mode**: SmartPhoton acts as RS485 master and polls each configured BMS.

The active mode is detected automatically. The same Home Assistant dashboard adapts its counters and explanations without requiring manual configuration.

---

# Where to See the Diagnostics

## Home Assistant dashboard

Two views are available:

- **JK-BMS Communication Overview**  
  Installer-oriented summary with health state, score, explanation and incident memory.

- **JK-BMS Advanced Diagnostics**  
  Detailed counters for the currently active communication mode.

Only the relevant Broadcast or Active Polling sections are displayed.

## Home Assistant entity

The diagnostic sensor is created through MQTT discovery:

```text
sensor.jk_bms_aggregator_jkbms_health
```

Its attributes contain the detailed counters, health reason, score, detected BMS and incident history.

## MQTT

The raw health payload is published on:

```text
BMS_GLOBAL/health
```

Example:

```bash
mosquitto_sub -t BMS_GLOBAL/health -v
```

The topic can also be inspected with MQTT Explorer or a Node-RED debug node.

---

# Health Model

The primary communication state is:

| State | Meaning |
|---|---|
| `healthy` | Communication is operating normally |
| `degraded` | Communication is still working but one or more indicators are outside the normal range |
| `communication_error` | Communication is lost or no longer reliable |

A complementary score from **0 to 100** gives a quick indication of communication quality.

The state always has priority over the score. The score is intended to help compare the severity of incidents, not replace the diagnosis.

The system also stores an incident history:

- worst score observed;
- worst explanation;
- worst internal reason code;
- worst diagnostic flags;
- incident count.

This allows troubleshooting even after communication has returned to normal.

---

# Broadcast Mode

In Broadcast mode, one JK-BMS is configured as the RS485 Master. It scans the bus and exchanges data with the other BMS units while SmartPhoton listens passively.

Typical sequence:

```text
BMS Master poll → Slave response
BMS Master poll → Slave response
...
```

The dashboard focuses on framing and transport quality.

## Main Broadcast counters

### `serial_age_s`

Time since the latest serial data was received.

A continuously low value confirms that the bus is alive. A steadily increasing value indicates that serial traffic has stopped.

### `buffers_30s`

Number of serial read buffers received during the last 30 seconds.

This value depends on the serial driver, adapter and operating system. It should remain reasonably stable for a given installation.

### `bytes_30s`

Total number of serial bytes received during the last 30 seconds.

A sudden drop can indicate missing replies, a stopped BMS Master or a disconnected RS485 link.

### `frame_candidates_30s`

Number of recognizable frame candidates found in the incoming stream.

A candidate is not necessarily equal to one serial buffer because a buffer may contain part of a frame or several complete frames.

### `frames_emitted_30s`

Number of complete valid frames reconstructed and emitted by the framer.

### `Frames emitted per candidate`

Average number of complete frames extracted from each candidate.

This value can legitimately be greater than `1.00` when one input buffer contains multiple complete frames. It is not an efficiency percentage.

### `short_buffers_30s`

Number of small serial buffers.

Many short buffers are common with some USB-RS485 adapters, TCP gateways and serial drivers. They are not considered a fault when complete valid frames are reconstructed correctly.

### `multi_header_buffers_30s`

Number of buffers containing more than one recognizable frame header.

This usually means that several frames were grouped into one serial read. It is normal when the framer separates them correctly.

### Detected BMS

Broadcast mode shows:

- **Detected BMS**
- **Detected BMS list**

Because SmartPhoton is only listening, it can confirm which BMS units were observed but cannot always know how many BMS units should have been present.

The healthy explanation therefore deliberately states:

```text
All detected broadcast BMS are communicating normally
```

It does not claim that every expected BMS is present unless an expected count is known elsewhere.

---

# Active Polling Mode

In Active Polling mode, SmartPhoton is the RS485 master and sends requests to each configured BMS.

Typical sequence:

```text
SmartPhoton request → BMS response
SmartPhoton request → BMS response
...
```

Because the module knows the configured BMS list, it can identify responding and missing units directly.

## Main Active Polling counters

### Requests and responses

- requests sent;
- responses received;
- valid responses;
- timeouts;
- transaction success ratio.

A healthy installation should show valid responses matching the expected requests, with no recurring timeouts.

### Request / response latency

- average response time;
- maximum response time;
- age of the latest valid response.

These values help identify a slow adapter, overloaded TCP gateway or unstable RS485 bus.

### Polling cycles

- current cycle state;
- current cycle progress;
- complete cycles;
- average cycle duration;
- maximum cycle duration;
- pending transactions.

A complete cycle means that every configured BMS has been polled successfully.

### Per-BMS health

The dashboard displays an individual card for each configured BMS, including:

- state;
- successful responses;
- timeout count;
- age of the latest valid response.

This makes it possible to distinguish a global RS485 failure from a problem affecting only one BMS.

---

# Diagnostic Flags and Informational Observations

The dashboard separates two different concepts.

## Diagnostic flags

These indicate a real communication problem and may reduce the health score.

Examples include:

- repeated timeouts;
- missing configured BMS;
- stale serial data;
- invalid or incomplete communication cycles;
- poor response success ratio.

## Informational observations

These describe the way the transport delivers data but do not indicate a fault by themselves.

Current examples:

```text
many_short_buffers
high_multi_header_concat
```

These observations do not reduce the score when the framer continues to reconstruct valid complete frames.

This distinction prevents false alarms caused by normal serial or TCP buffering behaviour.

---

# Reference Healthy Results

The following values are examples from validated tests, not universal limits.

## Active Polling, 2 BMS

```text
Health score: 100 / 100
Timeouts: 0
Average response latency: approximately 230 ms
Complete polling cycle: approximately 6 s
Continuous operation: more than 10 hours
```

## Broadcast, 2 BMS

```text
Health score: 100 / 100
Serial age: below 0.2 s
Buffers / 30 s: approximately 136
Bytes / 30 s: approximately 11,000
Frame candidates / 30 s: approximately 136
Frames emitted / 30 s: approximately 152
Short buffers / 30 s: approximately 104
Multi-header buffers / 30 s: approximately 16
Frames emitted per candidate: approximately 1.12
```

The absolute values will vary with the number of BMS units, adapter type, transport and polling configuration. Stability and consistency are more important than matching these exact numbers.

---

# Common Symptoms

| Symptom | Likely interpretation |
|---|---|
| `serial_age_s` keeps increasing | Serial traffic has stopped |
| `bytes_30s` suddenly drops | Missing replies or disconnected bus |
| No detected BMS in Broadcast mode | No valid JK-BMS frames are being received |
| One configured BMS is missing in Active Polling | Address, wiring or BMS-specific communication fault |
| Timeouts increase continuously | Unstable RS485 bus, wrong address, slow gateway or disconnected BMS |
| Response latency rises sharply | Congested TCP gateway, serial adapter delay or bus instability |
| Polling cycles remain incomplete | One or more BMS units are not completing their transactions |
| Many short buffers with healthy valid frames | Normal transport fragmentation |
| Many multi-header buffers with healthy valid frames | Normal frame concatenation |
| Score is 100 with informational observations | Communication is healthy; observations are not penalties |

---

# Basic Troubleshooting Checklist

1. Confirm the operating mode shown by the dashboard.
2. Verify that only one device is acting as RS485 master.
3. Confirm the RS485 baud rate is `115200`.
4. Check A/B polarity and common reference wiring.
5. Use a linear RS485 bus rather than a star topology.
6. Check termination at the two physical ends of the bus.
7. Compare configured BMS addresses with the detected or responding list.
8. Observe whether the counters remain stable for several minutes.
9. Disconnect one BMS intentionally to confirm that the diagnostic detects the failure.
10. Restore the connection and verify that the current state returns to healthy while the incident remains recorded.

---

# Recommended Tools

- SmartPhoton JK-BMS Communication Overview
- SmartPhoton JK-BMS Advanced Diagnostics
- Home Assistant Developer Tools
- MQTT Explorer
- Node-RED debug nodes
- `mosquitto_sub`
