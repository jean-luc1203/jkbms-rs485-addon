# SmartPhoton JK-BMS Legacy 4.1.13 — release candidate RC2

**Status: DRAFT / NOT PUBLISHED.** This PR is a production-packaging candidate only. Keep it unmerged until the acceptance checklist is complete. Official production remains v4.1.12.

## RC2 packaging correction (15 Nov 2026)

The first physical installation of **4.1.13-rc2** stopped before Node-RED initialization with `s6-rc-oneshot-run: fatal: unable to exec /etc/s6-overlay/s6-rc.d/init-nodered/run: Permission denied` (exit 126). Investigation of the exact Git tree proved `init-nodered/run` had mode `100644` in the initial RC1 packaging, while main Legacy 4.1.12 uses `100755`. The startup script content itself was not the cause. The executable Git mode was restored to `100755`, and a GitHub Actions prerequisite now checks both the Git index mode and `test -x`. This change is specific to the release candidate packaging, not the issue #166 communication logic.

The version is now `4.1.13-rc2` so Home Assistant rebuilds the add-on instead of reusing its installed broken RC1 image. **The existing branch URL `release/legacy-4.1.13-rc1` remains intentionally unchanged to preserve the test repository's installation identity.** It now serves RC2.

RC2 has not yet been re-run on the physical HAOS VM. The official Legacy 4.1.12 production addon remains untouched.

## What changes compared with v4.1.12

- Issue #166: reject invalid BMS identifiers (including alarm MQTT/HA Discovery) and derive the BMS identity of Broadcast DATA replies from their validated Modbus acknowledgment, not from a shared pending SETUP.
- Broadcasting: reject corrupt JK body checksum, invalid 308-byte ACK CRC/register/address and incoherent SETUP/ACK identity before producing HA/MQTT state. The observed 300-byte no-ACK profile is supported with checksum only.
- Active Polling: ensure an alarm request is not silently dropped by the shared Node-RED 1 req/s TCP limiter; queue excess requests, and account for TCP request dispatch after the limiter.
- Active Polling DATA/SETUP/STATIC and FC03 alarms: validate observed response profile, CRC/checksum, requested and reply addresses; use verified identity for MQTT; never fall back to mutable polling globals.
- TCP Broadcasting watchdog: run only in gateway Broadcasting mode and replace unsupported tcp-client2 `disconnect` with `close`, followed by existing 2-second delay and `connect`.

## Installation and migration guarantees

- Production add-on name, slug `smartphoton_jkbms`, port 1891, config path `/config/smartphoton_jkbms/`, YAML options/schema, Dockerfile, MQTT discovery topics and entity identifiers stay unchanged.
- Keep the original exact Legacy 4.1.12 `rootfs/etc/node-red/flows.json` **unchanged** in Git; build the corrected flow via deterministic startup patcher with SHA-256 baseline preflight. This prevents accidental compatibility changes to unrelated nodes. The existing Legacy startup already overwrites user-edited flows; this release does not change that policy.
- Release tag/version for stable publication would be **4.1.13**, not this RC1. No tag or GitHub Release is created with this candidate.
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

No physical USB **Active Polling** trial has yet been shown. This remains a GO/NO-GO release criterion. The test on the isolated DEV166.12 startup namespace also does not replace a physical upgrade check with the production RC packaging before a broad public release.

### USB Active Polling evidence and stale Master reset messages (2026-11-15)

At 08:36:01, the experimental add-on reported `global use_gateway=false` and `global bms_broadcasting=false`; `/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0` opened successfully at 115200 8N1. Both real BMS, address 1 and 2, were active, with DATA/SETUP/STATIC and alarms flowing. At 08:36:03, the persistent `ISSUE16611_ACTIVE_GATE` state reported 1401 seen / 1400 accepted / 1 rejected (historical `alarm_length`, timestamp 14 Nov 19:11), by address BMS_1=703 BMS_2=697. At 08:37:04, it reported 1437 seen / 1436 accepted / 1 rejected. **Deltas: 36 new replies accepted, 0 new rejects, 18 accepted per BMS; DATA +20, SETUP +4, STATIC +2, alarms +10.** MQTT accepted +20 DATA, +4 SETUP, +2 STATIC, and still had no identity rejections. The uploaded dashboard screenshot showed both JK-BMS 1 and JK-BMS 2 with measurements.

One misleading log at 08:36:10 read `Setup flags reset: Master + BMS_1, BMS_2`, followed by `Discovery reset ... Master + BMS_1, BMS_2`, **although Active Polling no longer has a Master**. Inspection of the stock Legacy 4.1.12 `Reset discovery flags (auto nb_jkbms)` and `Init flags for discovery` functions shows they unconditionally reset **Master's internal discovery flags** and write `Master +` in the log for both modes. This is *not* proof of a new Master device, and neither the active integrity gate nor the MQTT identity counters showed a new Master response. It is a pre-existing reset/log semantic, not yet fixed by this candidate. Historic Master retained MQTT discovery, if any, is a separate cleanup concern after intentional DIP readdressing. Do not mistake these reset messages for a physical third BMS.

These proofs are from the **isolated DEV166.12 runtime**, whose patcher is incorporated into the production RC branch. They do not substitute for final end-to-end installation of the RC package, nor multi-firmware field validation.

## Release checklist (GO / NO-GO)

- [x] Isolated TCP Broadcasting validated on two real JK BMS and NB114.
- [x] Isolated TCP Active Polling validated on two real JK BMS and NB114.
- [x] Ethernet disconnection/recovery validated in both modes.
- [x] Production slug, path, options and port preserved in RC packaging.
- [x] CI of the exact production RC passes (including packaging): 76/76 tests passed in GitHub Actions #43630605293.
- [x] Serial USB Broadcasting validated on physical JK BMS (isolated DEV166.12, CH340, Master + BMS_2, 15 Nov 08:29–08:31).
- [x] Serial USB Active Polling validated on physical JK BMS (isolated DEV166.12, CH340, BMS_1 + BMS_2, 15 Nov 08:36–08:37).
- [ ] Confirm legitimate alternative 300/308-byte variants are not silently rejected in the field (or document unsupported profiles).
- [ ] Review log verbosity and retained MQTT cleanup guidance.
- [ ] Version bump from 4.1.13-rc2 to 4.1.13, final changelog, tag and publish only after explicit GO.

**Rollback:** keep v4.1.12 source/release tag available. Rolling back the add-on does not automatically delete retained MQTT topics created earlier. Create an HA backup before changing production.
