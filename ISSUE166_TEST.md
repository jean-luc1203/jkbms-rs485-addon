# Legacy issue #166 — isolated test add-on

**Status (2026-11-14):** DEV166.11 real-hardware Active Polling with two JK-BMS (addresses 1 and 2) completed a one-minute RJ45 gateway outage/recovery: at 18:51, 419/419 frames had been accepted by the strict gate (0 rejects), with 240 DATA replies (120 per BMS), 36 SETUP, 24 STATIC, 119 alarm; MQTT publisher accepted every DATA/SETUP/STATIC. Two transport circuits coexist. The gateway Active Polling path recovered on its own. A separate *Broadcast tcp-client2* watchdog fired at 18:50:14 with `Unrecognized action: disconnect`; DEV166.12 isolates that watchdog by mode and replaces this unsupported command. **DEV166.12 is automated-test-only until the next HAOS and Broadcasting physical checks.**
Base: published Legacy **4.1.12** (`rootfs/etc/node-red/flows.json`, SHA-256 `b8cc75b3503a6ac089188d1526a2547441893621d33c7a1fbffedba963b5e8d6`).
Issue: https://github.com/jean-luc1203/jkbms-rs485-addon/issues/166

## Isolation and installation

This branch exposes a **separate** Home Assistant add-on:

- name: `JK-BMS Legacy TEST - Issue 166`
- slug: `smartphoton_jkbms_fix166`
- version: `4.1.13-dev166.12`
- dedicated Node-RED config: `/config/smartphoton_jkbms_fix166`
- Node-RED/web port: `1891` (same as Legacy; never run both add-ons concurrently)

**Live test on HAOS Onduleur 192.168.0.217: first stop the original Legacy add-on completely, and only then start this experimental add-on.** The HAOS TEST VM is powered off. The user's independent ESPHome/ESP32 monitoring remains available while the Legacy RS485 add-on is stopped. Do not run both Legacy instances simultaneously: they use the same TCP port 1891, the same physical RS485 line and the same production MQTT Discovery/state topics (e.g. `homeassistant/...`, `BMS_master/...`). The experimental add-on keeps its own Node-RED config directory, but does NOT isolate MQTT data. This is a supervised test of an unvalidated patch, not a production release.

Home Assistant supports choosing a repository branch by adding `#branch-name` to its URL. Under Settings > Apps, add the test repository URL:

```text
https://github.com/jean-luc1203/jkbms-rs485-addon#fix/issue-166-broadcast-ghost-bms
```

Refresh the app store and select **JK-BMS Legacy TEST - Issue 166**, not the production version. For the supervised live test, configure the existing RS485 device and MQTT broker only once the original Legacy add-on is stopped. Never enable both add-ons together.

If the branch URL conflicts with an existing repository registration, install a local copy of the branch via Home Assistant's `local_apps` / `addons` share instead.

## Update note (dev166.2)

Fixed the test add-on startup script which used two trailing shell backslashes. The patch itself applied, but shell then attempted to execute `flows.json` as a command and stopped with `Permission denied` (exit 126). The new startup command is a single line. No production changes.

## Update note (dev166.3)

Restore the original Legacy Node-RED port 1891 across add-on metadata, Node-RED, health check and dashboard URL. The experimental add-on replaces the stopped Legacy add-on on the same HAOS production host for a supervised real-RS485 test; it must not run concurrently with the official Legacy add-on. The separate flow/config directory remains unchanged.

## Update note (dev166.4) — passive integrity monitoring

The observer is injected into the original Broadcast RS485 Framer, **after its existing frame extraction and before message emission**. It is wrapped in try/catch and does not drop, modify, reorder, or delay any frame. The eight prior corrections remain unchanged. The original 4.1.12 flows.json SHA is still verified.

It tracks each emitted JK-BMS reply in persistent Node-RED flow context key `issue166_integrity_passive`. Counts are cumulative across restarts unless the corresponding Node-RED context is cleared.

- `frames`, `types`, `lengths`: observed frames, DATA/SETUP distribution and up to 16 distinct lengths
- `checksum.ok/bad/unavailable`: JK 300-byte payload checksum, computed as sum(bytes 0..298) modulo 256 versus byte 299; unavailable on candidates shorter than 300
- `ack_crc.ok/bad/unavailable`: CRC16/MODBUS of bytes 300..305 versus 306..307, **only when the candidate is exactly 308 bytes**. Does NOT validate the JK 300-byte body
- `ack_shape_bad`: unexpected ACK layout; may be a framing or protocol variation
- `samples`: up to eight compact recent integrity anomalies (type, length, expected/received value), **not raw battery data**

The observer logs `ISSUE166_INTEGRITY_PASSIVE` once at first received frame, then approximately every 60 seconds while frames continue arriving:

```bash
ha apps logs cd4dd3d7_smartphoton_jkbms_fix166 | grep -F ISSUE166_INTEGRITY_PASSIVE
```

To read diagnostics without a long log, inspect the Node-RED flow context key `issue166_integrity_passive` through the Node-RED context sidebar. The first logged sample covers only one or a few frames; subsequent samples are more representative. Some legitimate transmission formats may differ from 308 bytes, so don't interpret an isolated mismatch as proof of BMS corruption.

**No rejection threshold is enabled.** Checksum validation for the DATA/SETUP contents is separate from the CRC of the optional trailing Modbus acknowledgment.

## Update note (dev166.5) — passive sequence/address and framing diagnostics

This update adds **only instrumentation**. It does not change the 4.1.12 Framer's extraction, the existing decoder's DATA-to-following-SETUP association, error handling, output ordering, BMS IDs, MQTT topics, or dashboard. The existing DEV166.4 integrity observer remains active.

New persistent Node-RED flow context keys, starting a new series at first use:

1. `issue166_sequence_passive` — one `ISSUE166_SEQUENCE_PASSIVE` log about every 60 seconds while JK frames arrive.
   - `types`, `transitions`: global sequence transitions (`setup->data`, `data->setup`, `setup->setup`, `data->data`)
   - `by_address`: same DATA/SETUP counts and transitions **per address 0..15**, derived only from the 8-byte Modbus trailer if its CRC, structure, and expected DATA/SETUP register are all valid. Do **not** infer per-BMS loss from global transitions on a bus with multiple devices
   - `ack_untrusted`, `ack_address_invalid`, `ack_type_mismatch`: the trailer is not usable as an address (or conflicts with the JK frame type)
   - `setup_id.checked/match_ack/mismatch_ack/invalid`: cross-check of SETUP BMS number from bytes 270..273 (uint32 LE) against validated ACK trailer address
   - `last_anomalies`: up to 8 compact, non-payload mismatch samples.
2. `issue166_framing_passive` — one `ISSUE166_FRAMING_PASSIVE` log about every 60 seconds after at least one JK reply is extracted.
   - `input_calls`, `input_bytes`, `emitted_bytes`, `jk_frames`, `modbus_polls`, `poll_by_slave`: observed inbound buffers and successfully emitted objects
   - `discarded_bytes`: bytes abandoned by the Framer, from strict byte conservation (`bytes before parsing - emitted bytes - retained bytes`)
   - `discard_calls`, `short_header_candidates`, `buffer_trims`, `trim_bytes`, `accounting_errors`, `buffer_retained`, `buffer_retained_max`: mechanisms and retained buffer length
   - `last_events`: up to 8 compact examples of discards/trims.

**Important limitations:** `discarded_bytes` shows local Framer skips and trimming, **not** RS485 packets lost upstream before they reached Node-RED. This version does not detect a completely missing SETUP without comparing cadence/sequence. The Framer has a pre-existing limitation: a Modbus poll split across multiple input buffers can be skipped; DEV166.5 measures this but **does not fix** it. A trailer address is treated as a protocol hypothesis to validate against SETUP identity; it is not yet used to associate DATA frames or publish MQTT.

To inspect the three summaries:

```bash
ha apps logs cd4dd3d7_smartphoton_jkbms_fix166 |
  grep -E 'ISSUE166_(INTEGRITY|SEQUENCE|FRAMING)_PASSIVE' |
  tail -n 9
```

Look especially for the addresses `0` and `2` under `by_address`, `setup_id.mismatch_ack`, repeated same-type transitions **per address**, and nonzero `discarded_bytes`. The former `issue166_integrity_passive` counters should continue cumulatively; the two new observers start their own counters at initial use.

**No new CRC/checksum rejection. No extra MQTT discovery cleanup. No production Legacy changes.**

## Update note (dev166.6) — per-register polls and actual decoder pairing audit

The original Node-RED function logic is **unchanged**. Two bounded, passive observers now operate on the already-extracted Modbus requests and directly on the existing DATA/SETUP decoder decisions:

- `ISSUE166_POLL_PASSIVE` (Framer): validated 11-byte Modbus requests classified by register `0x161E` (SETUP), `0x1620` (DATA), `other`, and destination address. Fields: `total`, `setup_161e`, `data_1620`, `by_address`, `last_polls`. This counts only requests *recognized by the existing Framer*; missed/fragmented polls cannot be reconstructed by this observer.
- `ISSUE166_PAIRING_PASSIVE` (decoder): `data_received`, `setup_received`, `data_overwritten`, `setup_without_pending`, `pairs`, `pairs_match`, `pairs_cross_address`, `pairs_untrusted_data_address`, `setup_ack_mismatch`, `setup_ack_untrusted`, `by_address`, `recent_anomalies`. It examines the current `pendingData` **just before the decoder replaces it on DATA** or assigns its BMS number **on the following SETUP**. It does **not** change those operations. An address derived from the JK frame trailer is trusted for matching only if BOTH the JK checksum and the Modbus trailer CRC, expected register, shape, address range, and type are valid.

`pairs_cross_address` counts cases where the original decoder actually assigns a queued DATA to a SETUP of **another BMS**; `data_overwritten` separately counts earlier pending DATA displaced by another DATA. `setup_without_pending` records SETUP messages with nothing in the decoder's single pending slot. Recent anomalies are compact bounded samples, not full battery frames.

All four/five observers produce summaries about once every 60 seconds and use separate persistent flow context keys. DEV166.4/DEV166.5 existing counters remain untouched. New counters begin at first invocation. No extra rejection, no MQTT changes, no automatic adoption of trailer address for decoding.

```bash
ha apps logs cd4dd3d7_smartphoton_jkbms_fix166 |
  grep -E 'ISSUE166_(POLL|PAIRING|SEQUENCE|FRAMING|INTEGRITY)_PASSIVE' |
  tail -n 10
```

For focused comparison, also use:

```bash
ha apps logs cd4dd3d7_smartphoton_jkbms_fix166 |
  grep -E 'ISSUE166_(POLL|PAIRING)_PASSIVE' |
  tail -n 4
```

**Interpretation:** A difference in cumulative poll/response counts alone is not proof of physical loss, especially for the Master which is not addressed by the 1..15 poll recognizer. If `pairs_cross_address > 0`, we have directly observed a misassociation in the unchanged decoder. Do not enable active frame re-association without a separate design/test phase.

## Update note (dev166.7) — immediate per-BMS DATA routing (behavior change)

**First behavior-changing experiment** on this branch after passive DEV166.4–166.6.

For standard 308-byte JK-BMS DATA replies with a recognized Modbus ACK trailer, the decoder now:
- Reads the BMS address directly from byte 300, accepts 0..15.
- Verifies the 8-byte ACK structure, expected DATA register 0x1620, and CRC16 of bytes 300..305 **as evidence for the trailer address only**. (The ACK CRC does not cover the JK body.)
- Immediately emits each DATA with `bms_type="data"`, `bms_numero=<validated trailer address>`, preserving `payload`, `_hex`, `_frameLength`, `_frameSource` and the original legacy `bms_adresse` field. DATA no longer needs to wait for a later SETUP.
- Leaves SETUP extraction and publication based on bytes 270–273 unchanged, including earlier #166 range checks.
- Avoids mixing legacy pending DATA into directly identified DATA. Clears obsolete pre-upgrade legacy `pendingData` and expires fallback queue entries after 12 seconds. Any fallback timestamp is stripped before downstream publication.

If a DATA reply does **not** have a trustworthy standard 308-byte ACK trailer (including wrong ACK CRC), it still takes the old single-`pendingData` pairing path for backward compatibility. This path remains a **known residual weakness**: it may overwrite an earlier fallback DATA or associate it with a later SETUP. `ISSUE166_PAIRING_PASSIVE` consequently now monitors *only fallback pairings*, not the directly routed DATA. In contrast, the new `ISSUE1667_ROUTING` statistics include all valid direct DATA, all SETUP, fallback DATA and fallback pairs by address.

**User-requested CRC scope:** Full JK-body checksum validation and any strict rejection of globally corrupt frames are **deferred** to a later DEV. The ACK CRC is used only to choose a reliable BMS identity for the new routing. Therefore, this release is not claimed to solve all ghost-entity causes.

Check after installation:

```bash
ha apps info cd4dd3d7_smartphoton_jkbms_fix166 |
  grep -E '^(state|version):'
ha apps logs cd4dd3d7_smartphoton_jkbms_fix166 |
  grep -E 'ISSUE1667_ROUTING|ISSUE166_(INTEGRITY|SEQUENCE|FRAMING)_PASSIVE|RangeError|OUT_OF_RANGE|observer error' |
  tail -n 12
```

Expected on this two-pack installation: `issue1667_routing.by_address["0"].direct_data` and `["2"].direct_data` rise regularly; `legacy_fallback_data` and `pending_cleared_on_direct` remain zero in normal 308-byte operation. The `SEQUENCE_PASSIVE` observer will continue to show the underlying DATA>SETUP excess from BMS_2, but it should no longer cause lost DATA in the decoder. The old historical `PAIRING_PASSIVE` series is not directly comparable across this upgrade.

**Important:** This experiment changes live MQTT data cadence; do not run concurrently with the official Legacy add-on on port 1891 and shared MQTT topics. If the update affects readings, restore the previously working 4.1.13-dev166.6 experimental build or stop the test add-on and restart the official 4.1.12 (never both together).

## Update note (dev166.8) — strict integrity gate, experimental 308-byte profile

**This release adds rejection, not just observation.** The filter runs in the **Broadcast decoder only**, before either DATA or SETUP can update MQTT/Home Assistant. It leaves the Framer's extraction and diagnostic counters, 11-byte Modbus request messages, Active Polling, and the original Legacy 4.1.12 flow unchanged.

For the directly observed **308-byte** reply profile:

1. Check JK header `55 AA EB 90` and frame type `0x01` (SETUP) or `0x02` (DATA).
2. Check **sum8 over bytes 0..298** against byte 299 (validates the JK body, NOT cryptographically).
3. Check ACK shape at 300..305 (`[address,10,16,1E|20,00,01]`), address in 0..15 and register consistent with the JK frame type.
4. Check **CRC16/MODBUS on bytes 300..305** against the little-endian CRC at 306..307. This only protects the ACK, not the 300-byte JK body.
5. For SETUP, independently validate its 32-bit LE identity in bytes 270..273 and require agreement with the ACK address. A plausible but different BMS ID is rejected.
6. Reject the reply **before entering the decoder** if any check fails, and clear any stale pending fallback DATA to avoid future wrong association.

A native **300-byte** reply with correct JK sum8 is accepted **without claiming an ACK CRC check** (there is no ACK). Its DATA still uses the legacy compatibility fallback and may have the known pairing limitation. Unsupported lengths including **310-byte padded formats** are rejected in this *experimental* strict profile: these variants may be genuine on other JK hardware and MUST be qualified before any general release.

The gate emits one `ISSUE1668_INTEGRITY_GATE` summary about every 60 s using flow key `issue1668_integrity_gate`:
- `seen`, `accepted_308`, `accepted_300_no_ack`, `rejected`
- `reasons`: `jk_checksum`, `ack_crc`, `ack_shape`, `ack_register`, `setup_ack_mismatch`, `unsupported_length`, etc.
- `recent_rejections`: up to 8 compact entries containing timestamp, reason, frame type/length; never full payloads.

The existing `ISSUE166_INTEGRITY_PASSIVE` counter runs **upstream** of this gate and may therefore count damaged replies even though no MQTT update is published. Use both diagnostics to confirm detection and rejection:

```bash
ha apps info cd4dd3d7_smartphoton_jkbms_fix166 | grep -E '^(state|version):'
ha apps logs cd4dd3d7_smartphoton_jkbms_fix166 |
  grep -E 'ISSUE1668_INTEGRITY_GATE|ISSUE1667_ROUTING|ISSUE166_INTEGRITY_PASSIVE|RangeError|OUT_OF_RANGE|observer error' |
  tail -n 12
```

Expected on this user's real Master+BMS_2 bus: `accepted_308` and `issue1667_routing.direct_data` increase, with `accepted_300_no_ack=0`, `rejected=0` under normal clean traffic; known corrupt unit-test samples are rejected. Compare the two per-address direct DATA counters and the HA dashboard after updating.

**Important boundaries:**
- A sum8 checksum is weak: coordinated byte modifications can cancel each other, so not every corruption can be detected. Neither checksum nor CRC certifies physical wire integrity end-to-end.
- A 308-byte frame missing entirely before the Framer is outside this gate's detection.
- A rejected reply means an individual reading may not update; the gate does not replace it with stale readings or toggle MQTT availability.
- Do not deploy this strict profile broadly until 300/308/310 variants and other firmware are tested. This is **not** the final release for issue #166.
- The owner should maintain 4.1.13-dev166.7 as a known-good fallback, and never run test and production add-ons simultaneously (same MQTT topics and port 1891).

## DEV166.12 — isolated TCP watchdogs and supported tcp-client2 control

### Real-hardware finding (DEV166.11 RJ45 test, 2026-11-14)

The operator disconnected the Waveshare gateway Ethernet at ~18:48 and restored it at ~18:49. LED traffic returned 5–10 seconds later. Active Polling A/B resumed, with strict Active gate counters rising from 316 (18:47) to 349 (18:49:11) to 419 (18:51:11), all accepted and attributed correctly. However, at 18:50:14 an unrelated legacy watchdog in another flow emitted:

```text
[function:Watchdog – check timeout] Watchdog: no data since 136s → reconnexion forcée
[tcp-client:JK BMS TCP] [WARNING]: Unrecognized action: disconnect
```

The two transports are separate:
- Active Polling gateway uses `TCP Request A` and `TCP Request B`, plus `Watchdog - failover A/B` in flow `3e191029bf5e8209`, tracking `lastDataTs_master`.
- Broadcasting gateway uses independent `JK BMS TCP` node (`node-red-contrib-tcp-client2`) in flow `aec15389f6a9ed83`, tracking `lastDataTs`. Its watchdog was not scoped to the Broadcasting transport, and used unsupported `action:'disconnect'`.
- `node-red-contrib-tcp-client2` documented dynamic actions are `connect`, `close` and `write`. Source: https://flows.nodered.org/node/node-red-contrib-tcp-client2

### Experimental code change

`issue166-apply.cjs` changes only the *Broadcast tcp-client2* function `0827976bdeec2605`, with strict baseline assertions on function text, exact wires, tcp-client2 node config and 2-second delay. It now:
- Runs **only** when both `global.get('bms_broadcasting') === true` and `global.get('use_gateway') === true`. In Active Polling, or serial mode, stale `lastDataTs` cannot trigger any TCP action or mutate watchdog state.
- Preserves the 120-second silent-connection timeout, last-data reset and the 2-second reconnection delay. Uses `action:'close'` followed by `action:'connect'`.
- Emits identifiable `ISSUE16612_TCP_WATCHDOG` warnings on Broadcasting timeouts.
- Leaves the Active Polling `Watchdog - failover A/B`, `TCP Request A/B`, DEV166.10 queuing and DEV166.11 reply identity gate unchanged.
- Keeps official Legacy 4.1.12 production unchanged. Tests use the isolated add-on only.

**Important limitation:** automated tests assert Node-RED function behavior and topology, but cannot reproduce tcp-client2 socket close/reconnect execution. A physical Broadcast-TCP disconnection/reconnection test is needed before public release; recovery of Active Polling alone does not prove recovery of Broadcasting.

### DEV166.12 test protocol

1. Ensure official Legacy 4.1.12 stays stopped, and only the isolated add-on accesses the gateway.
2. Update and start `4.1.13-dev166.12`, preserving Active Polling on JK-BMS addresses 1 and 2.
3. Confirm DATA/SETUP/STATIC/alarm strict gate totals grow for BMS 1 and 2, zero unexpected rejected frames and zero MQTT identity rejections.
4. Repeat a brief controlled RJ45 interruption only if desired; after 2–3 minutes from reconnection confirm resumed DATA and alarms. Specifically check that **neither** `ISSUE16612_TCP_WATCHDOG` nor `Unrecognized action: disconnect` appears while `bms_broadcasting:false`.
5. When returning to real-hardware Broadcasting testing, perform a separate prolonged silence test to verify that `action:'close'` and `action:'connect'` operate correctly with the actual tcp-client2 runtime. Do not claim Broadcast watchdog recovery validated until this step.

Log command:

```sh
ha apps logs cd4dd3d7_smartphoton_jkbms_fix166 |
  grep -Ei 'ISSUE16612_TCP_WATCHDOG|ISSUE16611_ACTIVE_GATE|ISSUE16611_MQTT_IDENTITY|ISSUE1669_ALARM_PASSIVE|Unrecognized action|RangeError' |
  tail -n 20
```

## DEV166.11 — strict Active Polling identity (EXPERIMENTAL)

**Baseline:** DEV166.10 was real-hardware validated on the two JK-BMS at Active Polling addresses 1 and 2. The TCP limiter queue restored FC03 alarms; at 2026-11-14 17:55 CET, the alarm observer saw 41 valid CRC replies, 20 for BMS_1 and 21 for BMS_2, no address mismatch. A later 30-second window had 4/4 valid transactions, zero pending and zero recent timeouts. This is the reference for the DEV166.11 A/B comparison.

**New strict Active Polling checks (only when `bms_broadcasting:false`):**

- DATA: 308-byte JK reply with header `55 AA EB 90 02`, JK sum8 body checksum, ACK `<addr> 10 16 20 00 01 <CRC16 LE>`, address 1..15. 
- SETUP: 308-byte JK reply with type 01, register 0x161E, valid checksums/ACK, AND setup body uint32LE at 270..273 equal to CRC-verified ACK address.
- STATIC: 308-byte JK reply with type 03, register 0x161C, valid checksums/ACK, address 1..15.
- FC03 alarms: 9 bytes `<addr> 03 04 <4 bytes> <CRC16 LE>`, valid Modbus CRC, address 1..15.
- All four reject an explicitly available `msg.diag_slave_id` that disagrees with the validated response address, even if CRCs are valid. When `diag_slave_id` is absent, identity is still derived strictly from the valid response.
- The guard stamps `msg._issue16611_reply_bms` and `msg.bms_numero` with the validated response address, for use downstream.
- The three Active Polling DATA/SETUP/STATIC MQTT publishers now **require** `msg._issue16611_reply_bms` and reject absent, non-integer/out-of-range or conflicting identities. They NEVER fall back to mutable `slaveAddress-Trame1/2/3` when `bms_broadcasting:false`. Discovery and retained state cannot be created from unidentified responses. Alarm MQTT uses the original decoder's ID, now protected by the strict alarm gate.
- The strict gate does not alter Broadcast mode; DEV166.8 Broadcast behavior and DEV166.10 TCP request queue are unchanged. Serial Active Polling uses the same identity checks.

**Important compatibility boundary:** 308-byte JK replies and 9-byte FC03 replies are proven for the current test setup only. The strict gate intentionally rejects other lengths; test additional hardware/firmware variants before including it in a general Legacy release. JK sum8 is a weak, non-cryptographic checksum: some balanced corruptions can evade it. The Modbus ACK CRC covers the ACK, not the JK body.

**Diagnostics:**

```sh
ha apps info cd4dd3d7_smartphoton_jkbms_fix166 | grep -E '^(state|version):'
ha apps logs cd4dd3d7_smartphoton_jkbms_fix166 | \
  grep -E 'ISSUE16611_(ACTIVE_GATE|MQTT_IDENTITY)|ISSUE1669_(ACTIVE|ALARM)_PASSIVE|RangeError|observer error' | tail -n 15
```

`ISSUE16611_ACTIVE_GATE`: `seen`, `accepted`, `rejected`, `by_kind`, `reasons`, `by_address` and bounded `recent_rejections`. 
`ISSUE16611_MQTT_IDENTITY`: publisher `by_kind` accepted/rejected and `reasons` (`missing_or_invalid_verified_id`, `verified_id_conflict`). Missing trusted identity after a buffer-parser indicates a propagation issue; the publisher **must not** silently use a global ID.

**Required live acceptance before broad release:**

1. Only the isolated test add-on running against the gateway; official Legacy 4.1.12 stopped. Keep BMS_1, BMS_2 in Active Polling.
2. Confirm incrementing DATA, SETUP, STATIC and alarm counters for both BMS. Verify real MQTT/HA values and discovery names on BMS_1 vs BMS_2, especially after reconnecting the gateway and restarting the add-on.
3. Confirm `ISSUE16611_ACTIVE_GATE.rejected=0` and no `ISSUE16611_MQTT_IDENTITY` rejections during ordinary valid traffic. A zero mismatch counter in the earlier passive logs alone does NOT prove MQTT metadata propagation through buffer-parser.
4. Confirm healthy rolling diagnostic stats and stable 1 request/s TCP queue. If replies are validated by the gate but none reach MQTT, **STOP** this experimental version and inspect the metadata-preservation path. Do not disable the publisher's fail-closed guard as a workaround.
5. Active Polling global-address misattribution test is now expected to assert BMS_1 MQTT topics on a valid delayed BMS_1 reply even when `slaveAddress-TrameN=2`.

The official Legacy 4.1.12 remains untouched. DEV166.10 is preserved as a Git commit on this development branch history; recovery to that build requires an explicit branch/version rollback procedure (not merely stopping and restarting a new version).

## DEV166.10 — real-hardware discovery: TCP alarm polls dropped at shared rate limiter

On 2026-11-14, with the real two JK BMS switched to Active Polling (addresses 1 and 2), DEV166.9 passive diagnostics showed 308-byte DATA/SETUP/STATIC replies (no observed integrity or address errors). However, no FC03 alarm replies reached the TCP debug or `ISSUE1669_ALARM_PASSIVE`. The real-time Node-RED debug capture at 17:44–17:45 confirmed:

- `Trame-Alarmes-BMS` is generated and visible at the **input** of the TCP rate limiter.
- The same topic is **never seen at the output** across multiple periods.
- DATA/SETUP/STATIC all appear at the output.
- Original node `2e3b52cb867e1b1a`, misleadingly named `100ms`, is actually configured as `pauseType=rate`, `rate=1`, `nbRateUnits=1`, `rateUnits=second`, `drop=true`. When a DATA and an ALARM poll arrive close together, the alarm is discarded before the TCP Request nodes.
- Original upstream `Diag Poll Sent` counted the alarm requests *before* the limiter, causing false "sent" statistics, unmatched pending requests and timeouts. This does not establish that all old 510 timeouts were caused by this path.

**Change in DEV166.10 (EXPERIMENTAL TEST ONLY):**
- Shared TCP rate limiter retains **one message per second** but sets `drop=false` (Node-RED queues excess messages instead of discarding). Node renamed `TCP queue 1 msg/s - DATA + alarmes`.
- New function `DEV166.10 Diag TX après limiteur` (ID `f16610d1a9b36cc0`) is between rate limiter and `Route TCP slot A/B`. It records `diag_tx_id`, `diag_slave_id`, `diag_poll_ts` and updates diagnostics when a message is released from the limiter and passed to TCP routing.
- Original upstream `Diag Poll Sent` bypasses diagnostics for gateway traffic only; remains unchanged for Serial Active Polling. This is a bookkeeping fix, **not proof that the network send completed**.
- No modifications to the JK-BMS frame formats, CRC handling, Broadcast strict integrity gate or MQTT BMS identity mapping. An independent Active Polling address misattribution weakness remains open.
- The configured request rate on the user's two-BMS system was far below 1/sec on average (roughly 20–25 requests/minute), which makes queuing a reasonable test strategy. **The queue is not guaranteed to remain bounded under overload**; do not generalize this directly to arbitrary numbers of BMS.

**Test protocol on real hardware:** Do not run two add-ons against the same gateway simultaneously. Install DEV166.10 from the experimental branch using `ha apps update cd4dd3d7_smartphoton_jkbms_fix166` and retain configuration for Active Polling addresses 1 and 2. Once running, watch for `Trame-Alarmes-BMS` **after** the limiter, and ideally 9-byte FC03 reply at TCP debug, then nonzero `ISSUE1669_ALARM_PASSIVE`. Compare `diag_active_polling_stats.polls_by_frame_30s.alarms`, `valid_by_frame_30s.alarms`, timeouts and `pending` after a fresh start. Confirm DATA/SETUP/STATIC still update both BMS. If the request passes but no response appears, inspect TCP, actual BMS FC03 0x12A0 support, CRC, and response routing. On test failure, stop and revert to last known good experimental version; do not modify official Legacy 4.1.12.

Automated tests verify the generated node wiring, queue configuration, and upstream/downstream diagnostic behavior; they do **not** execute the actual Node-RED delay or TCP request runtime. Live validation is mandatory.

## Update note (dev166.9) — passive Active Polling validation (NO behavior change)

The **Broadcast** strict integrity gate, DATA direct routing, and existing diagnostics from DEV166.8 remain intact. The official Legacy 4.1.12 baseline remains unchanged. **There are NO new Active Polling rejects, MQTT topic changes, or repairs to global-address publishing in DEV166.9.**

Original 4.1.12 Active Polling has separate FC16 write/poll loops for STATIC (request register 0x161C), SETUP (0x161E), DATA (0x1620), plus FC03 alarm polling (0x12A0). The three existing validators check header; DATA additionally checks length == 308. SETUP and STATIC do not enforce parser minimum length. The three MQTT publishers select BMS ID from global `slaveAddress-Trame1/2/3`, NOT a response-matched BMS ID. A delayed response may therefore be attributed incorrectly. The 4.1.12 alarm decoder reads the address from the reply but does not perform its Modbus CRC check.

**DEV166.9 instruments, without changing output:**
- `Vérifie Trame 1` (STATIC), `Vérifie Trame 2` (SETUP), `Vérifie Trame 3` (DATA): each counts frame lengths, whether too short for its parser, JK sum8 body checksum, ACK CRC16, ACK shape/register, SETUP-ID/ACK disagreement, ACK address vs global loop address, and ACK address vs `msg.diag_slave_id` (when available). The register/type/shape assumptions are **hypotheses to verify** against emulator and actual devices, not grounds for rejection.
- `trt. réponse alarmes`: counts FC03 alarm response size (expected 9), function code, count 4, CRC16 on 7 bytes, address range 1..15, and request/response disagreement. **Only observes**, no alarm publish changes.
- Summaries roughly every 60 seconds:
  - `ISSUE1669_ACTIVE_PASSIVE` context key `issue1669_active_passive`
  - `ISSUE1669_ALARM_PASSIVE` context key `issue1669_alarm_passive`
- A mismatch with the global polling address is **not automatically proof of a real wrong publication**: diagnostic fields might be delayed or absent. It does expose a risk worth eliminating after matching request/response, and the original publisher is known to use this global address.

Regression tests include BMS_1/BMS_2 mismatch, valid DATA/SETUP/STATIC samples, mutated CRC and body checksum, short SETUP/STATIC samples, valid and corrupted alarm replies, and differential comparisons with unmodified validator outputs.

An additional non-mutating regression test **runs all three original Active Polling MQTT publishers** with a synthetic delayed BMS_1 reply while `slaveAddress-Trame1/2/3` points to BMS_2. It confirms the outgoing state topics are `BMS_2/...` instead of `BMS_1/...`. This directly reproduces the legacy attribution weakness at the publisher level. No production-data incident is claimed; the test is intentionally failing-by-design at the behavioral level but asserting current behavior in CI until the future fix is implemented.

**Do not run this active-polling lab test on the production Onduleur installation** (one live Master address 0 and another BMS address 2). Recommended next step:
1. Keep production `4.1.13-dev166.8` running as the verified baseline. The 166.9 commit does not automatically update any running add-on.
2. Start a separate HAOS TEST or container environment and use the existing Raspberry Pi JK-BMS TCP emulator (`192.168.0.175:5032` has been used for two simulated BMS, after verifying emulator current configuration and reachable address range).
3. Configure Active Polling only in the test add-on, `bms_broadcasting:false`, `use_gateway:true`, an appropriate `jkbms_count` and `gateway_ip_port` from the simulator. Use an **isolated MQTT broker/discovery namespace** to avoid duplicate or retained production devices.
4. Verify `ISSUE1669_ACTIVE_PASSIVE` and `ISSUE1669_ALARM_PASSIVE` counters while switching simulator addresses and inducing delayed/partial responses in the isolated lab.
5. After observing real frame profiles and behavior, design a separate **DEV166.10 active identity fix and strict validation** with new regression tests; do not silently repurpose the already live-tested DEV166.8 behavior.

Example test logs:

```bash
ha apps info cd4dd3d7_smartphoton_jkbms_fix166 |
  grep -E '^(state|version):'
ha apps logs cd4dd3d7_smartphoton_jkbms_fix166 |
  grep -E 'ISSUE1669_(ACTIVE|ALARM)_PASSIVE|RangeError|OUT_OF_RANGE|observer error' |
  tail -n 12
```

## Patch application

The GitHub repository still contains the exact, **unmodified** 4.1.12 `flows.json` source. Uploading that 4.9 MB file through the connected GitHub interface was not possible.

Instead, the isolated add-on invokes `issue166-apply.cjs` *before Node-RED starts*. It verifies the base flow's SHA-256, replaces exactly eight identified function nodes using `issue166-functions.json`, adds the passive integrity, sequence/address, framing and poll observers to the existing Broadcast Framer, adds the passive pairing audit, direct DATA identity routing, and strict Broadcast integrity gate to the patched decoder, preserves the original dashboard URL on port 1891, then writes the generated flow **only** to the dedicated test config directory.

A missing patch, an unexpected base SHA, or an absent target node must stop startup: the test add-on must never silently run unpatched flows.

## Intended safeguards

- Decode SETUP BMS identifier as uint32 LE and reject values outside 0–15.
- Drop DATA below 282 bytes and SETUP below 284 bytes before their buffer parsers read out-of-range offsets.
- Clear pending DATA on a rejected SETUP, preventing an invalid packet from being matched with a later valid SETUP.
- Gate alarm extraction and alarm state/Discovery independently of existing DATA/SETUP validation filters.
- Guard both DATA (`Heating`) and SETUP MQTT publication against invalid IDs.
- Reject malformed numeric strings such as `14junk`.
- Preserve legitimate Master (0), slave 1, sparse slave 2, and slave 15 mapping.

**Known limit:** a damaged packet carrying a plausible integer 0–15 (for example `BMS_14`) may still pass an address range check. Solving that conclusively requires further protocol/frame-correlation evidence; it is not claimed fixed here.

The patch **does not automatically erase previously retained ghost MQTT configurations**. Cleanups should be performed only after the source stops emitting ghosts.

## Automated tests

With Node.js 22:

```bash
node rootfs/etc/node-red/issue166-apply.cjs \
  rootfs/etc/node-red/flows.json /tmp/issue166-flows.json
ISSUE166_FLOWS=/tmp/issue166-flows.json \
  node --test tests/issue166-ghost-bms.test.cjs
```

A GitHub Actions workflow performs the same verification on pushes to this branch.

## Required go/no-go before PR

1. Automated tests (including a byte-for-byte Framer differential comparison against unmodified 4.1.12 on a fragmented/noisy sample) all pass and generated flow parses successfully.
2. Experimental add-on starts on HAOS Onduleur only while the official Legacy add-on is stopped; no startup/RangeError exceptions.
3. Broadcasting real/simulated valid BMS data still updates expected Home Assistant entities and alarms.
4. Invalid identifiers / truncated or desynchronized frames create no new MQTT retained topics or HA ghost devices.
5. Observe enough runtime to cover reconnect/disruption cases; do not merge solely on unit-test results.

**Do not merge this temporary overlay into production** as-is. Once validated, apply the proven changes directly to the production flow in a reviewed release commit/PR, keeping the existing 4.1.12 intact until then.
