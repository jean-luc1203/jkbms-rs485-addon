// ISSUE #166 DEV166.5 — PASSIVE SEQUENCE / ADDRESS DIAGNOSTICS.
// Called inside the Framer's existing emission branch, after extraction.
// Does not mutate frames, drop/reorder messages or influence BMS/MQTT routing.
try {
    const sequenceKey166 = "issue166_sequence_passive";
    const sequenceNow166 = Date.now();
    let q166 = flow.get(sequenceKey166);
    const newTransitions166 = () => ({
        "setup->data": 0, "data->setup": 0,
        "setup->setup": 0, "data->data": 0
    });
    if (!q166 || q166.schema !== 1 || !q166.transitions) {
        q166 = {
            schema: 1,
            since: sequenceNow166,
            frames: 0,
            types: { data: 0, setup: 0, other: 0 },
            last_type: null,
            transitions: newTransitions166(),
            by_address: {},
            ack_untrusted: 0,
            ack_address_invalid: 0,
            ack_type_mismatch: 0,
            setup_id: { checked: 0, match_ack: 0, mismatch_ack: 0, invalid: 0 },
            last_anomalies: [],
            last_report_ts: 0
        };
    }
    for (const f166 of frames) {
        if (!f166 || f166.topic !== "broadcast/jkbms_reply" ||
            !Buffer.isBuffer(f166.payload)) continue;
        const b166 = f166.payload;
        const type166 = b166[4] === 1 ? "setup" : b166[4] === 2 ? "data" : "other";
        q166.frames++;
        q166.types[type166]++;
        if (type166 === "other") continue;

        if (q166.last_type) {
            const transition166 = q166.last_type + "->" + type166;
            q166.transitions[transition166] =
                (q166.transitions[transition166] || 0) + 1;
        }
        q166.last_type = type166;

        // The ACK trailer CRC covers bytes 300..305 only.
        // Trust the address only if CRC + ACK shape + register/type match.
        let trusted166 = false;
        if (b166.length === 308) {
            const crc166 = modbusCRC(b166, 300, 6);
            const crcOnWire166 = b166[306] | (b166[307] << 8);
            const expectedReg166 = type166 === "setup" ? 0x1E : 0x20;
            const shape166 = b166[301] === 0x10 && b166[302] === 0x16 &&
                b166[304] === 0x00 && b166[305] === 0x01;
            if (crc166 === crcOnWire166 && shape166) {
                if (b166[303] === expectedReg166) {
                    trusted166 = true;
                } else {
                    q166.ack_type_mismatch++;
                }
            }
        }
        if (!trusted166) {
            q166.ack_untrusted++;
            continue;
        }
        const address166 = b166[300];
        if (address166 > 15) {
            q166.ack_address_invalid++;
            if (q166.last_anomalies.length >= 8) q166.last_anomalies.shift();
            q166.last_anomalies.push({
                ts: sequenceNow166, kind: "ack_address_range",
                type: type166, address: address166
            });
            continue;
        }
        const key166 = String(address166);
        let a166 = q166.by_address[key166];
        if (!a166) {
            a166 = {
                data: 0, setup: 0, last_type: null,
                transitions: newTransitions166()
            };
            q166.by_address[key166] = a166;
        }
        a166[type166]++;
        if (a166.last_type) {
            const transition166 = a166.last_type + "->" + type166;
            a166.transitions[transition166] =
                (a166.transitions[transition166] || 0) + 1;
        }
        a166.last_type = type166;

        if (type166 === "setup") {
            const id166 = b166.readUInt32LE(270);
            q166.setup_id.checked++;
            if (id166 > 15) {
                q166.setup_id.invalid++;
            } else if (id166 !== address166) {
                q166.setup_id.mismatch_ack++;
            } else {
                q166.setup_id.match_ack++;
            }
            if (id166 !== address166) {
                if (q166.last_anomalies.length >= 8) q166.last_anomalies.shift();
                q166.last_anomalies.push({
                    ts: sequenceNow166, kind: "setup_id_vs_ack",
                    setup_id: id166, ack_address: address166
                });
            }
        }
    }
    flow.set(sequenceKey166, q166);
    if (q166.frames && (!q166.last_report_ts ||
        sequenceNow166 - q166.last_report_ts >= 60000)) {
        const perAddress166 = {};
        for (const [addr166, a166] of Object.entries(q166.by_address)) {
            perAddress166[addr166] = {
                data: a166.data, setup: a166.setup,
                delta: a166.data - a166.setup,
                data_data: a166.transitions["data->data"],
                setup_setup: a166.transitions["setup->setup"],
                setup_data: a166.transitions["setup->data"],
                data_setup: a166.transitions["data->setup"]
            };
        }
        node.warn("ISSUE166_SEQUENCE_PASSIVE " + JSON.stringify({
            frames: q166.frames,
            types: q166.types,
            transitions: q166.transitions,
            by_address: perAddress166,
            ack_untrusted: q166.ack_untrusted,
            ack_address_invalid: q166.ack_address_invalid,
            ack_type_mismatch: q166.ack_type_mismatch,
            setup_id: q166.setup_id,
            last_anomalies: q166.last_anomalies.slice(-3)
        }));
        q166.last_report_ts = sequenceNow166;
        flow.set(sequenceKey166, q166);
    }
} catch (e166) {
    node.warn("ISSUE166_SEQUENCE_PASSIVE observer error: " + String(e166));
}
