# SmartPhoton JK-BMS Legacy 4.1.13 — release candidate RC2

**Status: DRAFT / NOT PUBLISHED.** This PR is a production-packaging candidate only. Keep it unmerged until the acceptance checklist is complete. Official production remains v4.1.12.

## RC2 packaging correction (15 Nov 2026)

The first physical installation of **4.1.13-rc1** stopped before Node-RED initialization with `s6-rc-oneshot-run: fatal: unable to exec /etc/s6-overlay/s6-rc.d/init-nodered/run: Permission denied` (exit 126). Investigation of the exact Git tree proved `init-nodered/run` had mode `100644` in the initial RC1 packaging, while main Legacy 4.1.12 uses `100755`. The startup script content itself was not the cause. The executable Git mode was restored to `100755`, and a GitHub Actions prerequisite now checks both the Git index mode and `test -x`. This change is specific to the release candidate packaging, not the issue #166 communication logic.

The version is now `4.1.13-rc2` so Home Assistant rebuilds the add-on instead of reusing its installed broken RC1 image. **The existing branch URL `release/legacy-4.1.13-rc1` remains intentionally unchanged to preserve the test repository's installation identity.** It now serves RC2.

RC2 has since been installed and run successfully on the physical HAOS VM in USB Active Polling mode, including live Premium activation (see acceptance sections below). The official Legacy 4.1.12 production addon remains unchanged and stopped.

## What changes compared with v4.1.12

- Issue #166: reject invalid BMS identifiers (including alarm MQTT/HA Discovery) and derive the BMS identity of Broadcast DATA replies from their validated Modbus acknowledgment, not from a shared pending SETUP.
- Broadcasting: reject corrupt JK body checksum, invalid 308-byte ACK CRC/register/address and incoherent SETUP/ACK identity before producing HA/MQTT state. The observed 300-byte no-ACK profile is supported with checksum only.
- Active Polling: ensure an alarm request is not silently dropped by the shared Node-RED 1 req/s TCP limiter; queue excess requests, and account for TCP request dispatch after the limiter.
- Active Polling DATA/SETUP/STATIC and FC03 alarms: validate observed response profile, CRC/checksum, requested and reply addresses; use verified identity for MQTT; never fall back to mutable polling globals.
- TCP Broadcasting watchdog: run only in gateway Broadcasting mode and replace unsupported tcp-client2 `disconnect` with `close`, followed by existing 2-second delay and `connect`.

## Installation and migration guarantees

- Production add-on name, slug `smartphoton_jkbms`, port 1891, config path `/config/smartphoton_jkbms/`, YAML options/schema, Dockerfile, MQTT discovery topics and entity identifiers stay unchanged.
- Keep the original exact Legacy 4.1.12 `rootfs/etc/node-red/flows.json` **unchanged** in Git; build the corrected flow via deterministic startup patcher with SHA-256 baseline preflight. This prevents accidental compatibility changes to unrelated nodes. The existing Legacy startup already overwrites user-edited flows; this release does not change that policy.
- Release tag/version for stable publication would be **4.1.13**, not this RC2. No tag or GitHub Release is created with this candidate.
- Legacy cannot automatically delete retained erroneous BMS_<number> MQTT topics created by old versions. Users may need to clean old phantom retained topics and stale HA devices after updating. Do not indiscriminately clear broker retained data.

## Evidence / limits

| Path | Real-hardware tests | Automated |
| --- | --- | --- |
| TCP Broadcasting (NB114, Master + BMS_2) | Normal traffic + 3 min RJ45 outage; watchdog invoked after 128s; recovered; 3370 valid and 0 rejects at 19:59 | Yes |
| TCP Active Polling (NB114, BMS_1 + BMS_2) | DATA, SETUP, STATIC, alarms valid; 1 min RJ45 outage; recovered; one 8-byte alarm message correctly rejected | Yes |
| Serial USB Broadcasting | **Validated on physical JK-BMS (15 Nov):** isolated DEV166.12 add-on, USB CH340 by-id serial opened at 115200 8N1; Master (0) + BMS_2 (2) Discovery/DATA; gate 46908→46970 accepted in 60s (+62), rejected 0; direct DATA Master 16910→16925 (+15), BMS_2 16909→16925 (+16); BMS_1 unchanged at 1 (historical). | Functions/framing tests |

| Serial USB Active Polling | **Validated on physical JK-BMS (15 Nov):** DEV166.12, USB CH340, `use_gateway=false` and `bms_broadcasting=false`; 08:36:03–08:37:04 strict gate 1400→1436 accepted (+36) and 1→1 rejected (no new rejects), BMS_1 703→721, BMS_2 697→715; MQTT DATA 798→818, SETUP 122→126, STATIC 82→84, no MQTT identity rejects. | Functions/identity tests |
| Other gateways, JK firmwares, 300-byte variants | Not broadly validated | Synthetic vectors only |

**A green CI is necessary but not sufficient to merge**. The 308-byte Active Polling strict format may be incompatible with serial firmware returning a different validated format. USB/serial acceptance in a separate test environment is a release blocker; consider early opt-in beta feedback before the general release.

### USB Broadcasting evidence and configuration discrepancy (2026-11-15)

The test HAOS VM had USB path `/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0`. The operator pasted options containing `use_gateway: true`, **but the add-on's actual startup log at 08:29:20 reported `global use_gateway=false`** and `global bms_broadcasting=true`. At 08:29:20 the physical serial port opened successfully at 115200 baud 8N1, replacing a transient `/dev/JKBMS-Fake` startup warning. The physical data path was therefore **USB-RS485 Broadcasting**, not TCP, during that logged run.

At 08:29:30/31, initial SETUP for Master and BMS_2 were published (80 MQTT messages each); DATA Discovery followed for both (67 sensors each), and the operator's dashboard showed both BMS tabs with cell voltages and temperatures. Between 08:29:54 and 08:30:54, `ISSUE1668_INTEGRITY_GATE` grew from 46908 to 46970 accepted (62 more) with no rejections; `ISSUE1667_ROUTING` Master direct DATA grew 16910→16925, BMS_2 16909→16925; BMS_1 stayed at 1. Framer and passive aggregate metrics persisted across restarts and include earlier TCP modes, so only the deltas after serial was opened provide new USB evidence. This is a successful **Broadcasting USB** functional acceptance on this hardware.

USB **Active Polling** was subsequently validated with the isolated DEV166.12 and later with the RC2 production-compatible package. These tests use two known physical JK-BMS devices; a wide hardware/firmware compatibility claim would still be premature.

### USB Active Polling evidence and stale Master reset messages (2026-11-15)

At 08:36:01, the experimental add-on reported `global use_gateway=false` and `global bms_broadcasting=false`; `/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0` opened successfully at 115200 8N1. Both real BMS, address 1 and 2, were active, with DATA/SETUP/STATIC and alarms flowing. At 08:36:03, the persistent `ISSUE16611_ACTIVE_GATE` state reported 1401 seen / 1400 accepted / 1 rejected (historical `alarm_length`, timestamp 14 Nov 19:11), by address BMS_1=703 BMS_2=697. At 08:37:04, it reported 1437 seen / 1436 accepted / 1 rejected. **Deltas: 36 new replies accepted, 0 new rejects, 18 accepted per BMS; DATA +20, SETUP +4, STATIC +2, alarms +10.** MQTT accepted +20 DATA, +4 SETUP, +2 STATIC, and still had no identity rejections. The uploaded dashboard screenshot showed both JK-BMS 1 and JK-BMS 2 with measurements.

One misleading log at 08:36:10 read `Setup flags reset: Master + BMS_1, BMS_2`, followed by `Discovery reset ... Master + BMS_1, BMS_2`, **although Active Polling no longer has a Master**. Inspection of the stock Legacy 4.1.12 `Reset discovery flags (auto nb_jkbms)` and `Init flags for discovery` functions shows they unconditionally reset **Master's internal discovery flags** and write `Master +` in the log for both modes. This is *not* proof of a new Master device, and neither the active integrity gate nor the MQTT identity counters showed a new Master response. It is a pre-existing reset/log semantic, not yet fixed by this candidate. Historic Master retained MQTT discovery, if any, is a separate cleanup concern after intentional DIP readdressing. Do not mistake these reset messages for a physical third BMS.

These proofs are from the **isolated DEV166.12 runtime**, whose patcher is incorporated into the production RC branch. They do not substitute for final end-to-end installation of the RC package, nor multi-firmware field validation.

### RC2 physical packaging acceptance — 2026-11-15 09:13–09:14 CET

After restoring the executable bit on the s6 launcher, the operator successfully updated the separately installed RC repository addon `db6e584d_smartphoton_jkbms` to `4.1.13-rc2` on HAOS. `state: started`, and the logs show:
- `init-nodered` and `nodered` started; `Issue #166 test patch applied` (legacy patcher diagnostic message retained).
- Node-RED uses **production config namespace** `/config/smartphoton_jkbms/` and dashboard port 1891.
- `use_gateway=false`, `bms_broadcasting=false`; serial USB by-id `/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0` opened at 115200 8N1.
- MQTT broker connected at 09:14:01. First static response BMS_1 passed `ISSUE16611_ACTIVE_GATE` and MQTT identity gate (1 seen/accepted; 0 rejected). BMS_1 and BMS_2 reported alive; alarm Discovery for both BMS was logged.
- Initial `/dev/JKBMS-Fake` open error was followed by successful change to the actual USB port; not a startup failure.
- The initial RC2 startup at 09:13 had `premium.key_configured=false` and `status=missing_key` because the new Supervisor add-on entry had independent options. **At 09:17 the operator installed a valid SPV2 key and Premium became `active:true`, `status:active`, `validation_status:valid`; premium dashboards were observed operational.** Do not publish the user's license or credentials in release documentation.
- The RC2 addon is a *separate Supervisor slug/repository* from the official 4.1.12, despite sharing the same inside-container configuration directory. This proves a live **packaging/startup smoke test**, but **does not prove the official in-place Supervisor upgrade**. The shared on-disk config is mutated on each start; the original Legacy directory was backed up by the operator before testing.

**Acceptance update:** RC2's DATA/SETUP/STATIC/alarm integrity and MQTT identity counters rose for both physical BMS without rejections; Premium activation and dashboard generation were confirmed by the operator (details below). Final production in-place Supervisor upgrade semantics remain to be validated; installing RC2 as a separately registered repository is not equivalent to upgrading the official add-on. No stable merge or GitHub Release yet.

### RC2 Premium and two-BMS USB acceptance — 2026-11-15 09:17–09:18 CET

The operator installed a Premium license in the RC2 add-on settings and restarted the add-on. The 09:17:04 logs verified `premium.key_configured=true`, SPV2 `active:true`, `status:active`, `validation_status:valid`, `tier:premium`, and the expected features including `multi_bms:true`, `dashboard_premium:true`, `csv_export:true`, `cycles_soh:true`, `cell_details:true`, `advanced_info:true`. The operator independently confirmed that the dashboards were created and supplied a screenshot of the functional JK-BMS_1/JK-BMS_2 dashboard. The license value itself is intentionally **not** included in this document.

USB Active Polling with CH340 at 115200 8N1 was confirmed by startup flags `use_gateway=false`, `bms_broadcasting=false` and the serial-by-id open event.

- At 09:17:06, `ISSUE16611_ACTIVE_GATE`: 103 seen / 103 accepted / **0 rejected**; `by_address` BMS_1=53, BMS_2=50; `by_kind` static=7, setup=9, data=58, alarm=29.
- At 09:18:07, `ISSUE16611_ACTIVE_GATE`: 139 seen / 139 accepted / **0 rejected**; BMS_1=71, BMS_2=68; static=9, setup=13, data=78, alarm=39.
- Observed deltas: **+36 accepted responses, 0 new rejects; +18 BMS_1 and +18 BMS_2**, comprising +2 static, +4 setup, +20 DATA, +10 alarm.
- `ISSUE16611_MQTT_IDENTITY`: at 09:18:07 9 static, 13 setup and 78 DATA had reached the MQTT publisher gates, **zero identity rejects**. Alarms at 09:18:08 were 40/40 format-valid and balanced 20/20 by address.
- The user observed functional dashboards and reported successful Premium creation/activation. A complete dashboard feature-by-feature audit and unrelated product configurations were not carried out.

Non-blocking pre-existing observations: a brief `/dev/JKBMS-Fake` startup open failure is followed immediately by correct serial port opening; the discovery initialization log always mentions Master in Active Polling, despite actual reply identities 1 and 2. Some `ISSUE166_FRAMING_PASSIVE` diagnostics are emitted even in Active Polling and include 317-byte samples; they are passive observers, **not** evidence of rejected legitimate Active Polling frames in the strict gate. Consider reducing verbose experimental diagnostics before the public stable version.

**RC2 smoke-test verdict: PASS for startup, two-BMS USB Active Polling, verified message identity, Premium license initialization and dashboards.** It remains a separate Supervisor add-on with the same internal configuration directory, so it does not prove a true in-place update path or broad third-party firmware compatibility.

## Release checklist (GO / NO-GO)

- [x] Isolated TCP Broadcasting validated on two real JK BMS and NB114.
- [x] Isolated TCP Active Polling validated on two real JK BMS and NB114.
- [x] Ethernet disconnection/recovery validated in both modes.
- [x] Production slug, path, options and port preserved in RC packaging.
- [x] CI of the exact production RC passes (including packaging): 76/76 tests passed in GitHub Actions #43630605293.
- [x] Serial USB Broadcasting validated on physical JK BMS (isolated DEV166.12, CH340, Master + BMS_2, 15 Nov 08:29–08:31).
- [x] Serial USB Active Polling validated on physical JK BMS (isolated DEV166.12, CH340, BMS_1 + BMS_2, 15 Nov 08:36–08:37).
- [ ] Confirm/document support limits for legitimate alternative 300/308-byte variants across other firmware/gateways; current physical coverage is one NB114 and one CH340 with two JK-BMS.
- [ ] Review log verbosity (especially experimental passive observer reports) and retained MQTT cleanup guidance.
- [x] RC2 installed and booted successfully on HAOS; validated USB Active Polling, 0 strict or MQTT identity rejects, SPV2 Premium active and dashboards created.
- [ ] Assess the exact in-place Supervisor upgrade path from official Legacy 4.1.12 to 4.1.13 (the separate repo RC2 did not exercise it).
- [ ] Version bump from 4.1.13-rc2 to 4.1.13, final changelog, tag and publish only after explicit GO.

**Rollback:** keep v4.1.12 source/release tag available. Rolling back the add-on does not automatically delete retained MQTT topics created earlier. Create an HA backup before changing production.
