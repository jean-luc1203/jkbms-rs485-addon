# Legacy issue #166 — isolated test add-on

**Status: development / NOT validated on a physical RS485 installation.**
Base: published Legacy **4.1.12** (`rootfs/etc/node-red/flows.json`, SHA-256 `b8cc75b3503a6ac089188d1526a2547441893621d33c7a1fbffedba963b5e8d6`).
Issue: https://github.com/jean-luc1203/jkbms-rs485-addon/issues/166

## Isolation and installation

This branch exposes a **separate** Home Assistant add-on:

- name: `JK-BMS Legacy TEST - Issue 166`
- slug: `smartphoton_jkbms_fix166`
- version: `4.1.13-dev166.1`
- dedicated Node-RED config: `/config/smartphoton_jkbms_fix166`
- dedicated Node-RED/web port: `1892`

**Test on HAOS TEST only, with its own MQTT broker and a separate test bus/gateway.** Do not run alongside production against the same physical port or MQTT broker. MQTT Discovery and BMS state topics still use the production names (e.g. `homeassistant/...`, `BMS_master/...`), so two running add-ons against one broker could overwrite each other's data.

Home Assistant supports choosing a repository branch by adding `#branch-name` to its URL. Under Settings > Apps, add the test repository URL:

```text
https://github.com/jean-luc1203/jkbms-rs485-addon#fix/issue-166-broadcast-ghost-bms
```

Refresh the app store and select **JK-BMS Legacy TEST - Issue 166**, not the production version. Configure a test RS485 interface or test TCP gateway and your test broker.

If the branch URL conflicts with an existing repository registration, install a local copy of the branch via Home Assistant's `local_apps` / `addons` share instead.

## Patch application

The GitHub repository still contains the exact, **unmodified** 4.1.12 `flows.json` source. Uploading that 4.9 MB file through the connected GitHub interface was not possible.

Instead, the isolated add-on invokes `issue166-apply.cjs` *before Node-RED starts*. It verifies the base flow's SHA-256, replaces exactly eight identified function nodes using `issue166-functions.json`, changes the test dashboard URL to port 1892, then writes the generated flow **only** to the dedicated test config directory.

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

1. Automated tests all pass and generated flow parses successfully.
2. Test add-on starts on isolated HAOS TEST; no startup/RangeError exceptions.
3. Broadcasting real/simulated valid BMS data still updates expected Home Assistant entities and alarms.
4. Invalid identifiers / truncated or desynchronized frames create no new MQTT retained topics or HA ghost devices.
5. Observe enough runtime to cover reconnect/disruption cases; do not merge solely on unit-test results.

**Do not merge this temporary overlay into production** as-is. Once validated, apply the proven changes directly to the production flow in a reviewed release commit/PR, keeping the existing 4.1.12 intact until then.
