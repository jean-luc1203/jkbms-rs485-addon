# SmartPhoton JK-BMS Legacy 4.1.13 — release candidate RC1

**Status: DRAFT / NOT PUBLISHED.** This PR is a production-packaging candidate only. Keep it unmerged until the acceptance checklist is complete. Official production remains v4.1.12.

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
| Serial USB Broadcasting | **Not yet performed after these changes** | Functions/framing tests only |
| Serial USB Active Polling | **Not yet performed after these changes** | Functions/identity tests only |
| Other gateways, JK firmwares, 300-byte variants | Not broadly validated | Synthetic vectors only |

**A green CI is necessary but not sufficient to merge**. The 308-byte Active Polling strict format may be incompatible with serial firmware returning a different validated format. USB/serial acceptance in a separate test environment is a release blocker; consider early opt-in beta feedback before the general release.

## Release checklist (GO / NO-GO)

- [x] Isolated TCP Broadcasting validated on two real JK BMS and NB114.
- [x] Isolated TCP Active Polling validated on two real JK BMS and NB114.
- [x] Ethernet disconnection/recovery validated in both modes.
- [x] Production slug, path, options and port preserved in RC packaging.
- [ ] CI of the exact production RC passes (including packaging).
- [ ] Serial USB Broadcasting validated on physical JK BMS.
- [ ] Serial USB Active Polling validated on physical JK BMS.
- [ ] Confirm legitimate alternative 300/308-byte variants are not silently rejected in the field (or document unsupported profiles).
- [ ] Review log verbosity and retained MQTT cleanup guidance.
- [ ] Version bump from 4.1.13-rc1 to 4.1.13, final changelog, tag and publish only after explicit GO.

**Rollback:** keep v4.1.12 source/release tag available. Rolling back the add-on does not automatically delete retained MQTT topics created earlier. Create an HA backup before changing production.
