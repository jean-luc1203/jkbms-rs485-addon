# Legacy 4.1.13 — draft release notes

> **NOT YET RELEASED.** These are release notes proposed for the eventual stable **4.1.13**. Production remains **4.1.12**. Candidate currently on draft PR #190 as `4.1.13-rc3`. Do not advertise 4.1.13 as published before the merge, final version bump and official release.

## Fixes

### BMS identification and MQTT entity safety — #166
- Reject malformed or out-of-range JK-BMS identities before MQTT state / Home Assistant Discovery / alarm publication.
- Use the validated Modbus reply identity instead of mutable polling state to prevent responses being attributed to the wrong battery.
- Validate JK body checksums, Modbus CRCs, function/register, message length and address information as applicable to the observed frame profiles; reject invalid messages before publication.

### Active Polling / TCP
- Fix Node-RED's TCP polling rate limiter silently discarding alarm requests.
- Preserve the identity of delayed responses and use verified addresses for DATA, SETUP and STATIC MQTT messages.
- Validate 9-byte FC03 alarm replies and reject truncated or corrupt frames.

### TCP Broadcasting watchdog — related #165
- Isolate the legacy `tcp-client2` watchdog to gateway Broadcasting mode.
- Replace unsupported `disconnect` action with supported `close`, followed by the existing delay and `connect`.

### Logging
- Normal operation no longer emits repetitive experimental `ISSUE166` statistical warnings.
- Enable existing `communication_debug: true` temporarily to receive INFO-level detailed statistics while troubleshooting.
- Real rejected frames / MQTT identity conflicts remain visible as rate-limited WARN records, and every rejection is still counted.

## What stays the same

- Legacy add-on slug and existing Home Assistant add-on options; Node-RED configuration directory and dashboard port `1891`.
- MQTT topic naming and Home Assistant discovery entity identifiers.
- Existing Premium features and license workflow.
- Original production 4.1.12 base flow in Git is still used as the fixed input to the deterministic startup patcher; flow patching aborts if the embedded baseline unexpectedly changes.

## Tested combinations

| Transport | Broadcasting | Active Polling |
| --- | --- | --- |
| RS485 via NB114 Ethernet gateway | PASS | PASS |
| Wired RS485 via CH340 USB adapter | PASS | PASS |

Two physical JK-BMS devices were used. Ethernet disconnect/recovery was exercised in both TCP modes, and a malformed 8-byte alarm response was rejected safely during recovery. Candidate `4.1.13-rc3` also passed an HAOS startup test with two physical BMS in USB Active Polling, an active SPV2 Premium license, and working dashboards.

Automated regression suite: **81/81 PASS** on RC3; this is not evidence of compatibility with every JK firmware or gateway.

## Installation and rollback precautions

1. Back up Home Assistant / the Legacy Node-RED configuration before upgrading, and ensure that only one add-on has the RS485 port / TCP gateway and dashboard port open.
2. Make a note of the serial `/dev/serial/by-id/...` path or the TCP gateway address, BMS count, Broadcasting vs Active Polling mode, and MQTT broker configuration. Do **not** put passwords or license keys in support reports.
3. After the release is available through the official repository, update the **existing official add-on**, not an experimental repository entry. Check that BMS addresses and measurements are correct for the installed topology.
4. For support, temporarily enable `communication_debug` and collect logs showing reason codes, not secrets.
5. Retain the 4.1.12 backup for rollback if your hardware's reply format is incompatible. If the strict gate rejects a valid device's responses, report sanitized log reason codes, model/firmware, transport and sample length; avoid applying random patches to production.

**Compatibility limits:** Active Polling's current strict reply profile expects 308-byte DATA/SETUP/STATIC with valid JK and Modbus acknowledgment checks, plus 9-byte FC03 alarm replies. Broadcasting accepts the verified profiles implemented by the gate, including 300-byte no-ACK bodies with supported integrity validation. Other proprietary JK firmware frame variants were not exhaustively evaluated, and may require follow-up support.

## Existing retained MQTT topics from older ghost BMS devices

Fixing the creation of phantom devices does **not** automatically delete old MQTT retained topics or Home Assistant device-registry entries already created by older versions.

**Do not clear the broker's retained database or delete broad `homeassistant/#` or `BMS_#` subtrees.** Doing so would remove legitimate devices and discovery state.

To clean a known phantom BMS **after verifying its identity is not present in the actual hardware topology**:
1. Stop unnecessary test add-ons and confirm which BMS identifiers are genuine.
2. Inspect broker retained topics with an MQTT browser (for example MQTT Explorer), checking the exact, clearly orphaned phantom BMS identifier.
3. Remove *only* those exact orphaned retained topics using the MQTT broker's supported retained-message deletion mechanism (zero-length retained publish). Record the affected topic names first.
4. Confirm the legitimate BMS Discovery topics and measurements are still present. If Home Assistant still shows an orphaned entity/device, remove the stale entry through the Home Assistant UI after ensuring it is not recreated.

Specific topic paths and deletion commands must be based on a **real captured retained-topic inventory**; do not guess MQTT paths or paste broad wildcard deletion scripts.

## Known unrelated Legacy behavior

The older Legacy flow unconditionally resets MQTT Discovery flags every 30 seconds, causing repeated retained config publications. This is tracked separately in **#191**, because changing it without Broker/Home Assistant restart recovery testing could cause missing entities. It is **not** part of 4.1.13.

## Release gate still open

- The separately installed RC test repository uses a different Supervisor app identity. Although it shares the normal Node-RED config directory and confirms packaging/startup, this **does not prove an in-place upgrade of the original 4.1.12 Supervisor add-on**.
- Perform final review of version metadata / install-rollback behavior and decide the controlled public deployment before merging #190.
- No public stable tag, release, merge, or user update is authorized by this document alone.
