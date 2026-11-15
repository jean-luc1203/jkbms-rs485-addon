# Legacy 4.1.13 — production rollout and rollback playbook

**Status: PREPARATION ONLY — no public merge, tag, stable version, or rollout yet.**
Issue #166, draft PR #190. Current public version 4.1.12. Release candidate physically exercised is 4.1.13-rc3.

## Evidence and version provenance

- The official `main` branch was checked on 2026-11-15 at commit `d52e1578f0ba6238862c8f5dc11fcc0992b17b6a`, still offering `config.yaml: version: 4.1.12`. Its only intervening commit since the RC branch split was an automatic FAQ update; production code did not change.
- A **pinned rollback source branch** `backup/legacy-4.1.12-before-4.1.13` points to `d52e1578f0ba6238862c8f5dc11fcc0992b17b6a`. Do not delete or rewrite this branch during rollout. URL: https://github.com/jean-luc1203/jkbms-rs485-addon/tree/backup/legacy-4.1.12-before-4.1.13
- The release candidate keeps `slug: smartphoton_jkbms`, the normal options and `/config/smartphoton_jkbms/`, and HTTP dashboard port 1891. The official HAOS add-on installed from `main` is `6020d92d_smartphoton_jkbms`. The separate RC3 test repo add-on is `db6e584d_smartphoton_jkbms`.
- The current Legacy initializer **unconditionally overwrites the Node-RED `flows.json` at every start**, including on public 4.1.12. This is existing behavior; never rely on ad-hoc Node-RED edits surviving a release. The 4.1.13 patcher writes the corrected flow to that path after the normal Legacy baseline is copied.
- The existing initializer does **not update the local `/config/smartphoton_jkbms/version` marker after the upgrade**; a subsequent restart can still print the historic upgrade notice. This is inherited from 4.1.12 and the flow is copied anyway. It is not proof that Supervisor still runs the old add-on. Verify actual running version with `ha apps info`.
- Home Assistant add-on options are Supervisor-managed and **not shared** just because the official and RC3 add-ons use the same `/config` directory. Verify the official add-on's serial/TCP, BMS mode and Premium options in the HAOS UI before starting it. Never paste MQTT credentials or SPV2 license keys into GitHub comments/logs.
- A real in-place update through the official HAOS repository can only be exercised after changing public `main`; the separate RC3 does not test that Supervisor operation. CI now simulates both fresh installation and **the actual s6 script on a copied 4.1.12 config**, without touching real HAOS or user data.

## Current operator's backup (created before RC test)

User confirmed a `/share/backup_jkbms/legacy_av_rc1_20261115.tar.gz` archive (~8.4 MB) on the HAOS VM, containing `smartphoton_jkbms/flows.json`, `settings.js`, `flows_cred.json`, runtime config and node modules. Do not assume that this alone backs up Supervisor-managed add-on options and credentials.

**Before releasing:** create an additional **full Home Assistant backup** (including the official Legacy app and configuration) and verify it is listed; preserve the existing tar outside the VM, if possible. For the tar, an integrity check is:
```sh
gzip -t /share/backup_jkbms/legacy_av_rc1_20261115.tar.gz &&
tar -tzf /share/backup_jkbms/legacy_av_rc1_20261115.tar.gz >/dev/null &&
echo "Legacy configuration archive: OK"
```
Do not restore this archive over a running add-on.

## Before public merge

1. Confirm main still has exactly the expected Legacy 4.1.12 baseline; rebase/merge its FAQ-only update without changing the reference flow or its patcher's SHA-256 baseline.
2. Confirm 81 Issue166 regression tests, **2 s6 upgrade simulation tests**, and executable launcher mode `100755` all pass on the **final merge commit**.
3. Review and accept the documented limitation to observed JK response formats (especially Active Polling 308-byte DATA/SETUP/STATIC and 9-byte FC03 alarms); request sanitized reports for unsupported firmware.
4. Verify backup of the official HAOS app/data and full Supervisor settings. Ensure **automatic updates of the official Legacy add-on are disabled** during the pilot.
5. Freeze code; change version from `4.1.13-rc3` to `4.1.13`, prepare final changelog, and verify no experimental RC or private IDs in released files.
6. Only after explicit publication approval, merge into `main` and verify the official store exposes `4.1.13`; create stable release/tag if desired. **IMPORTANT: updating `main` makes an update available to all existing official repository subscribers. A rollout cannot be silently limited to one installation merely by stopping manual updates; users who enabled auto-updates can receive it.**

## Official pilot after public availability (requires publication approval)

The operator must perform these steps on their HAOS VM; the GitHub connector cannot control the live Supervisor.

1. Stop the separate RC3 `db6e584d_smartphoton_jkbms` add-on. Ensure the older `cd4dd3d7_smartphoton_jkbms_fix166` test app is stopped; only **one add-on** should claim serial port, gateway, MQTT Discovery names and dashboard port 1891.
2. Compare official `6020d92d_smartphoton_jkbms` options in the UI with the current working RC3 configuration (USB by-id / 2 BMS / Active Polling / MQTT / Premium). Their stored options differ, even though `/config/smartphoton_jkbms` is shared.
3. Confirm full backup and tar integrity before proceeding. Update the **existing official** app rather than installing another repository duplicate.
4. When official store offers 4.1.13: `ha apps update 6020d92d_smartphoton_jkbms`; then `ha apps start 6020d92d_smartphoton_jkbms` if it is not started. Verify `ha apps info 6020d92d_smartphoton_jkbms` reports `state: started`, `version: 4.1.13`.
5. Inspect recent logs for `Issue #166 Legacy patch applied`, correct USB/TCP transport, BMS identities and MQTT connection. Confirm two live BMS, valid Premium, working dashboards, no unexpected `ISSUE1668_REJECT` / `ISSUE16611_REJECT` / `ISSUE16611_MQTT_REJECT`; alarms and global indicators sane.
6. Keep the add-on running under observation; do not run original/test/RC add-ons simultaneously on the same communication interfaces.

## Rollback if production 4.1.13 fails

1. **Stop the official 4.1.13 add-on** and any remaining experiments before interacting with the broker or restoring configuration.
2. Inspect logs and capture *sanitized* reasons (no passwords/license data). Preserve the latest backup before changing files.
3. The pinned source for the previous stable version is the branch `backup/legacy-4.1.12-before-4.1.13`. Home Assistant can install this branch as a **separate repository add-on**, but that has a different Supervisor app identity and stored options; do not assume it downgrades the official add-on in place. The existing full Home Assistant backup is preferable when a complete restoration is necessary.
4. In the HAOS UI, restore the appropriate backup with an understanding of its scope (configuration, addon options, installed version, database). A restore is a disruptive operation and may affect other HA services. If restoring only the previous Node-RED config, the add-on must be **stopped** and the operator must first inventory what the archive will overwrite; restore must be coordinated with the pinned 4.1.12 image, not the live 4.1.13 patched runtime.
5. Reconfigure a rollback add-on's own MQTT credentials, Premium license and serial/TCP options through the HAOS UI; ensure only one active publisher uses the BMS identities. Verify MQTT retained entities and alarms without bulk deleting `homeassistant/#`.

**Do not claim one-click automatic rollback.** The source branch provides reproducible code, while the actual HAOS restore/rollback steps depend on backups and Supervisor behavior.

## Separate follow-up, not part of 4.1.13

- Legacy 30-second MQTT Discovery re-publication behavior: #191.
- Selective manual retained cleanup of old phantom MQTT topics: see `RELEASE_NOTES_4.1.13_DRAFT.md`.
