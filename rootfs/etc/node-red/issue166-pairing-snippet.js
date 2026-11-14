// ISSUE #166 DEV166.6 — PASSIVE AUDIT OF THE EXISTING SINGLE pendingData.
// Installed as a helper in the real decoder, called BEFORE its original
// DATA overwrite and BEFORE its original SETUP pairing. No mutation of
// pendingData, frames, outputFrames, original context or MQTT routing.
function issue166AuditPairing(kind166, current166, previousPending166, setupId166) {
    try {
        const k166 = "issue166_pairing_passive";
        const now166 = Date.now();
        let d166 = flow.get(k166);
        if (!d166 || d166.schema !== 1 || !d166.by_address) {
            d166 = {
                schema: 1, since: now166, last_report_ts: 0,
                data_received: 0, setup_received: 0,
                data_overwritten: 0, setup_without_pending: 0,
                pairs: 0, pairs_match: 0, pairs_cross_address: 0,
                pairs_untrusted_data_address: 0,
                setup_ack_mismatch: 0, setup_ack_untrusted: 0,
                by_address: {}, recent_anomalies: []
            };
        }
        const add166 = (address166, name166) => {
            if (!Number.isInteger(address166) || address166 < 0 ||
                address166 > 15) return;
            const key166 = String(address166);
            let a166 = d166.by_address[key166];
            if (!a166) {
                a166 = {
                    data_received: 0, setup_received: 0,
                    data_overwritten: 0, matched_pairs: 0,
                    cross_pairs_as_data_source: 0,
                    cross_pairs_as_setup_destination: 0
                };
                d166.by_address[key166] = a166;
            }
            a166[name166]++;
        };
        const anomaly166 = (sample166) => {
            d166.recent_anomalies.push({ts: now166, ...sample166});
            if (d166.recent_anomalies.length > 8) {
                d166.recent_anomalies.shift();
            }
        };
        // Only trust the ACK address after verifying BOTH the JK body checksum
        // and its independent eight-byte Modbus trailer CRC + shape + register.
        const address166 = (b166, expectedKind166) => {
            if (!Buffer.isBuffer(b166) || b166.length !== 308 ||
                b166[0] !== 0x55 || b166[1] !== 0xAA ||
                b166[2] !== 0xEB || b166[3] !== 0x90 ||
                b166[4] !== (expectedKind166 === "data" ? 2 : 1))
                return null;
            let sum166 = 0;
            for (let j166 = 0; j166 < 299; j166++) {
                sum166 = (sum166 + b166[j166]) & 0xFF;
            }
            if (sum166 !== b166[299]) return null;
            const reg166 = expectedKind166 === "data" ? 0x20 : 0x1E;
            if (b166[301] !== 0x10 || b166[302] !== 0x16 ||
                b166[303] !== reg166 || b166[304] !== 0 ||
                b166[305] !== 1 || b166[300] > 15) return null;
            let crc166 = 0xFFFF;
            for (let j166 = 300; j166 < 306; j166++) {
                crc166 ^= b166[j166];
                for (let bit166 = 0; bit166 < 8; bit166++) {
                    crc166 = (crc166 & 1) ?
                        ((crc166 >>> 1) ^ 0xA001) : (crc166 >>> 1);
                }
            }
            if ((crc166 & 0xFFFF) !== (b166[306] | (b166[307] << 8)))
                return null;
            return b166[300];
        };
        const dataAddress166 = kind166 === "data" ?
            address166(current166, "data") :
            previousPending166 && previousPending166.payload ?
                address166(previousPending166.payload, "data") : null;

        if (kind166 === "data") {
            d166.data_received++;
            add166(dataAddress166, "data_received");
            if (previousPending166) {
                d166.data_overwritten++;
                const oldAddress166 = address166(previousPending166.payload, "data");
                add166(oldAddress166, "data_overwritten");
                anomaly166({
                    kind: "pending_data_overwrite",
                    old_data_address: oldAddress166,
                    new_data_address: dataAddress166
                });
            }
        } else if (kind166 === "setup") {
            d166.setup_received++;
            add166(setupId166, "setup_received");
            const setupAckAddress166 = address166(current166, "setup");
            if (setupAckAddress166 === null) d166.setup_ack_untrusted++;
            else if (setupAckAddress166 !== setupId166) {
                d166.setup_ack_mismatch++;
                anomaly166({
                    kind: "setup_identity_vs_ack",
                    setup_id: setupId166,
                    ack_address: setupAckAddress166
                });
            }
            if (!previousPending166) {
                d166.setup_without_pending++;
            } else {
                d166.pairs++;
                if (dataAddress166 === null) {
                    d166.pairs_untrusted_data_address++;
                    anomaly166({
                        kind: "pair_unknown_data_address",
                        assigned_setup_id: setupId166
                    });
                } else if (dataAddress166 === setupId166) {
                    d166.pairs_match++;
                    add166(dataAddress166, "matched_pairs");
                } else {
                    d166.pairs_cross_address++;
                    add166(dataAddress166, "cross_pairs_as_data_source");
                    add166(setupId166, "cross_pairs_as_setup_destination");
                    anomaly166({
                        kind: "cross_bms_pair",
                        real_data_address: dataAddress166,
                        assigned_setup_id: setupId166
                    });
                }
            }
        }

        flow.set(k166, d166);
        if (!d166.last_report_ts || now166 - d166.last_report_ts >= 60000) {
            node.warn("ISSUE166_PAIRING_PASSIVE " + JSON.stringify({
                data_received: d166.data_received,
                setup_received: d166.setup_received,
                data_overwritten: d166.data_overwritten,
                setup_without_pending: d166.setup_without_pending,
                pairs: d166.pairs,
                pairs_match: d166.pairs_match,
                pairs_cross_address: d166.pairs_cross_address,
                pairs_untrusted_data_address: d166.pairs_untrusted_data_address,
                setup_ack_mismatch: d166.setup_ack_mismatch,
                setup_ack_untrusted: d166.setup_ack_untrusted,
                by_address: d166.by_address,
                recent_anomalies: d166.recent_anomalies.slice(-3)
            }));
            d166.last_report_ts = now166;
            flow.set(k166, d166);
        }
    } catch (e166) {
        node.warn("ISSUE166_PAIRING_PASSIVE observer error: " + String(e166));
    }
}
