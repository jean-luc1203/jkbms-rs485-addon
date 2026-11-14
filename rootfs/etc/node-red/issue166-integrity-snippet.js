// ISSUE #166 DEV166.4 — PASSIVE INTEGRITY OBSERVATION ONLY.
// Injected INSIDE "if (frames.length > 0)" in Broadcast RS485 Framer.
// No frame is rejected, changed, duplicated, delayed or re-ordered.
// The optional 8-byte Modbus ACK CRC does NOT protect the 300-byte JK body.
try {
    const diagKey166 = "issue166_integrity_passive";
    const now166 = Date.now();
    let d166 = flow.get(diagKey166);
    if (!d166 || d166.schema !== 1 || !d166.checksum) {
        d166 = {
            schema: 1,
            since: now166,
            last_frame_ts: 0,
            last_report_ts: 0,
            frames: 0,
            types: { data: 0, setup: 0, other: 0 },
            lengths: {},
            checksum: { ok: 0, bad: 0, unavailable: 0 },
            ack_crc: { ok: 0, bad: 0, unavailable: 0 },
            ack_shape_bad: 0,
            samples: []
        };
    }
    for (const f166 of frames) {
        if (!f166 || f166.topic !== "broadcast/jkbms_reply" || !Buffer.isBuffer(f166.payload)) {
            continue;
        }
        const b166 = f166.payload;
        const len166 = b166.length;
        const type166 = b166[4] === 1 ? "setup" : b166[4] === 2 ? "data" : "other";
        d166.frames++;
        d166.types[type166]++;
        d166.last_frame_ts = now166;
        const lenKey166 = String(len166);
        if (Object.prototype.hasOwnProperty.call(d166.lengths, lenKey166) ||
            Object.keys(d166.lengths).length < 16) {
            d166.lengths[lenKey166] = (d166.lengths[lenKey166] || 0) + 1;
        } else {
            d166.lengths.other = (d166.lengths.other || 0) + 1;
        }
        let anomaly166 = null;
        // JK content: bytes 0..298 sum modulo 256; byte 299 is its checksum.
        if (len166 >= 300) {
            let computed166 = 0;
            for (let k166 = 0; k166 < 299; k166++) {
                computed166 = (computed166 + b166[k166]) & 0xFF;
            }
            if (computed166 === b166[299]) {
                d166.checksum.ok++;
            } else {
                d166.checksum.bad++;
                anomaly166 = { kind: "jk_checksum", calculated: computed166, received: b166[299] };
            }
        } else {
            d166.checksum.unavailable++;
        }

        // The only recognized 8-byte ACK layout is at bytes 300..307.
        // Do not guess the trailer location on irregular frame lengths.
        if (len166 === 308) {
            const crc166 = modbusCRC(b166, 300, 6);
            const receivedCrc166 = b166[306] | (b166[307] << 8);
            if (crc166 === receivedCrc166) {
                d166.ack_crc.ok++;
            } else {
                d166.ack_crc.bad++;
                if (!anomaly166) {
                    anomaly166 = { kind: "ack_crc", calculated: crc166, received: receivedCrc166 };
                }
            }
            if (!(b166[301] === 0x10 && b166[302] === 0x16 &&
                  (b166[303] === 0x1E || b166[303] === 0x20) &&
                  b166[304] === 0 && b166[305] === 1)) {
                d166.ack_shape_bad++;
                if (!anomaly166) anomaly166 = { kind: "ack_shape" };
            }
        } else {
            // 300-byte body alone can be valid. Non-308 lengths are unclassified.
            d166.ack_crc.unavailable++;
        }

        if (anomaly166) {
            d166.samples.push({ ts: now166, type: type166, len: len166, ...anomaly166 });
            if (d166.samples.length > 8) d166.samples.shift();
        }
    }
    flow.set(diagKey166, d166);

    // Immediate initial baseline and at most one summary per 60 s thereafter.
    // These are OBSERVATIONS, not alarms and never change the data path.
    if (d166.frames > 0 &&
        (!d166.last_report_ts || now166 - d166.last_report_ts >= 60000)) {
        node.warn("ISSUE166_INTEGRITY_PASSIVE " + JSON.stringify({
            frames: d166.frames,
            types: d166.types,
            lengths: d166.lengths,
            checksum: d166.checksum,
            ack_crc: d166.ack_crc,
            ack_shape_bad: d166.ack_shape_bad,
            last_anomalies: d166.samples.slice(-2)
        }));
        d166.last_report_ts = now166;
        flow.set(diagKey166, d166);
    }
} catch (e166) {
    // Failure of the observer must not stop the existing Framer or drop frames.
    node.warn("ISSUE166_INTEGRITY_PASSIVE observer error: " + String(e166));
}
