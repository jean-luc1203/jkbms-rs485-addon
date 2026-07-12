# How to Send JK-BMS Diagnostic Statistics

Use this procedure when requesting support for a JK-BMS communication problem.

The SmartPhoton diagnostics support both operating modes:

- **Broadcast**: one JK-BMS is configured as RS485 Master.
- **Active Polling**: SmartPhoton polls each configured BMS.

The active mode is detected automatically.

---

## Recommended Method: Home Assistant Dashboard

Open these two views:

- **JK-BMS Communication Overview**
- **JK-BMS Advanced Diagnostics**

Please send:

1. one screenshot of the Overview page;
2. one complete screenshot of the Advanced page;
3. a short description of the problem.

The screenshots should show the current state, health score, explanation, transport, operating mode and the relevant communication counters.

---

## Home Assistant Diagnostic Entity

The main diagnostic entity is:

```text
sensor.jk_bms_aggregator_jkbms_health
```

The exact entity ID may vary slightly depending on the installation.

To retrieve it:

1. Open **Home Assistant**.
2. Go to **Developer Tools**.
3. Open **States**.
4. Search for `jkbms_health`.
5. Copy the state and all attributes.

Important attributes include:

```text
mode
transport
health_score
health_reason
health_reason_text
health_flags
worst_health_score
worst_health_reason
worst_health_flags
health_incident_count
```

Depending on the detected mode, additional Broadcast or Active Polling counters will also be present.

---

## MQTT Method

The raw health message is published on:

```text
BMS_GLOBAL/health
```

Example:

```bash
mosquitto_sub -t BMS_GLOBAL/health -v
```

You can also use:

- MQTT Explorer;
- a Node-RED debug node;
- another MQTT client.

Copy the complete JSON payload without removing fields.

---

## Additional Information to Include

Please also provide:

```text
JK-BMS model:
Number of BMS units:
Connection type:
Operating mode shown by the dashboard:
Problem description:
Approximate time when the problem occurred:
```

Possible connection types include:

- direct USB-RS485;
- RS485-to-TCP gateway;
- RS485-to-UDP gateway.

---

## Mode-Specific Information

### Broadcast mode

The most useful counters include:

```text
serial_age_s
buffers_30s
bytes_30s
frame_candidates_30s
frames_emitted_30s
frame_yield_ratio
short_buffers_30s
multi_header_buffers_30s
detected_bms
detected_bms_list
```

`many_short_buffers` and `high_multi_header_concat` may appear as informational observations. They do not necessarily indicate a fault when valid complete frames are still reconstructed correctly.

### Active Polling mode

The most useful counters include:

```text
polls_sent_30s
responses_received_30s
valid_responses_30s
timeouts_30s
response_success_ratio
avg_response_time_ms
max_response_time_ms
complete_poll_cycles_30s
avg_poll_cycle_time_ms
pending_transactions
configured_bms
responding_bms
missing_bms
```

Per-BMS health attributes are especially useful when only one BMS is affected.

---

## What to Send

A complete support request should contain:

```text
1. Overview dashboard screenshot
2. Advanced dashboard screenshot
3. Complete Home Assistant entity attributes or MQTT JSON
4. JK-BMS model
5. Number of BMS units
6. Connection type
7. Short description of the problem
```

Example:

```text
Connection type: RS485-to-TCP gateway
BMS count: 2
Mode: Active Polling
Issue: BMS 2 stops responding after several minutes

Diagnostic JSON:
{ ... }
```

The persistent incident memory is useful even if communication has already returned to normal, so do not reset the diagnostics before collecting the information.

---

## Debug Logging

The health diagnostics are lightweight and safe to leave enabled permanently.

Permanent debug-file logging is not required.

Enable detailed debug logging only temporarily and only when specifically requested for advanced troubleshooting.
