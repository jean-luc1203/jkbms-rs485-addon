#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const CONFIG_DEFAULT = "/usr/src/node-red/config.yaml";
const OPTIONS_JSON_DEFAULT = "/data/options.json";

/**
 * Convert a schema key to an environment variable name.
 *
 * Examples:
 *   jkbms_path        -> JKBMS_PATH
 *   mqttadresse_port  -> MQTTADRESSE_PORT
 *   CAN_bus_usage     -> CAN_BUS_USAGE
 *
 * @param {string} key - Option key from Home Assistant add-on schema.
 * @returns {string} Environment variable name in UPPER_SNAKE_CASE.
 */
function envNameForKey(key) {
    return key.toUpperCase().replace(/[^A-Z0-9]/g, "_");
}

/**
 * Parse a boolean value from a string.
 *
 * The following values are treated as true (case-insensitive):
 *   "1", "true", "yes", "on"
 * Everything else is treated as false.
 *
 * @param {string} raw - Raw string value from the environment.
 * @returns {boolean} Parsed boolean.
 */
function parseBool(raw) {
    const v = String(raw).trim().toLowerCase();
    return v === "1" || v === "true" || v === "yes" || v === "on";
}

/**
 * Convert a raw string value from an environment variable
 * to the appropriate JavaScript type based on the type specification.
 *
 * Examples of typeSpec (without the optional marker "?"):
 *   "str"
 *   "password"
 *   "bool"
 *   "int(1,15)"
 *   "int"
 *   "float"
 *   "port"
 *
 * Note: integer ranges like "int(1,15)" are currently ignored.
 * The value is parsed as a plain integer.
 *
 * @param {string} raw - Raw string value from the environment.
 * @param {string} typeSpec - Type specification from the schema (without "?").
 * @returns {any} Parsed value in an appropriate JavaScript type.
 * @throws {Error} If the value cannot be parsed to the requested type.
 */
function parseValue(raw, typeSpec) {
    const t = String(typeSpec).trim().toLowerCase();

    if (t.startsWith("bool")) {
        return parseBool(raw);
    }

    if (t.startsWith("int") || t.startsWith("port")) {
        const n = parseInt(raw, 10);
        if (Number.isNaN(n)) {
            throw new Error(`cannot parse integer from '${raw}'`);
        }
        return n;
    }

    if (t.startsWith("float")) {
        const n = parseFloat(raw);
        if (Number.isNaN(n)) {
            throw new Error(`cannot parse float from '${raw}'`);
        }
        return n;
    }

    // str, password, or any other type is treated as string
    return raw;
}

/**
 * Mask a value for logging if it is considered sensitive.
 *
 * @param {any} value - Original value to potentially mask.
 * @param {boolean} isSensitive - Whether the value is sensitive (e.g. password).
 * @returns {any} Masked value ("*****") if sensitive, otherwise the original value.
 */
function maskIfSensitive(value, isSensitive) {
    return isSensitive ? "*****" : value;
}

/**
 * Main entry point for generating /data/options.json.
 *
 * It performs the following steps:
 *   1. Load config.yaml (the Home Assistant add-on config) as YAML.
 *   2. Read the "options" section as base defaults.
 *   3. Read the "schema" section to determine types and optional flags.
 *   4. For each schema key:
 *      - Read corresponding environment variable (highest priority).
 *      - If not set, fall back to the default in "options".
 *      - If required and no value is provided, report an error.
 *   5. Write the resulting object to /data/options.json.
 *   6. Log the generated options with sensitive values masked.
 *
 * Returns process exit code:
 *   0 on success
 *   1 on validation or IO errors
 *
 * @returns {number} Exit code.
 */
function main() {
    const configPath = process.env.CONFIG_YAML || CONFIG_DEFAULT;
    const optionsJsonPath = process.env.OPTIONS_JSON || OPTIONS_JSON_DEFAULT;

    console.log(
        `Generating ${optionsJsonPath} based on the schema in ${configPath} and docker environment variables...`
    );

    let cfg;
    try {
        const text = fs.readFileSync(configPath, "utf8");
        cfg = yaml.load(text) || {};
    } catch (err) {
        if (err.code === "ENOENT") {
            console.error(`ERROR: config.yaml not found at ${configPath}`);
        } else {
            console.error(
                `ERROR: unable to read config.yaml at ${configPath}: ${err.message}`
            );
        }
        process.exit(1);
    }

    // Default values from the add-on:
    const baseDefaults = cfg.options || {};
    if (typeof baseDefaults !== "object" || Array.isArray(baseDefaults)) {
        console.error("ERROR: 'options' section is not a mapping in config.yaml");
        process.exit(1);
    }

    const schema = cfg.schema || {};
    if (typeof schema !== "object" || Array.isArray(schema)) {
        console.error("ERROR: 'schema' section missing or invalid in config.yaml");
        process.exit(1);
    }

    const finalOptions = {};
    const sensitiveKeys = new Set();
    const errors = [];

    for (const [key, typeSpec] of Object.entries(schema)) {
        // Normalize typeSpec to string
        let typeSpecStr = String(typeSpec);
        typeSpecStr = typeSpecStr.trim();

        const optional = typeSpecStr.endsWith("?");
        const baseType = optional
        ? typeSpecStr.slice(0, -1) // remove "?"
        : typeSpecStr;

        const isSensitive = baseType === "password";
        if (isSensitive) {
            sensitiveKeys.add(key);
        }

        const envName = envNameForKey(key);
        const rawEnv = process.env[envName];

        // Highest priority: value from environment variable
        if (rawEnv !== undefined) {
            try {
                const value = parseValue(rawEnv, baseType);
                finalOptions[key] = value;
            } catch (e) {
                errors.push(
                    `Invalid value for ${envName}='${maskIfSensitive(rawEnv,isSensitive)}' for option '${key}' ` +
                    `(expected ${typeSpecStr}): ${e.message || e}`
                );
            }
            continue;
        }

        // Fallback: default from 'options' section, if present
        if (Object.prototype.hasOwnProperty.call(baseDefaults, key)) {
            finalOptions[key] = baseDefaults[key];
            continue;
        }

        // If optional and no env/default -> just skip this key
        if (optional) {
            continue;
        }

        // Required option with no env and no default -> error
        errors.push(
            `Missing required option '${key}'. ` +
            `No env var ${envName} set and no default in 'options' section.`
        );
    }

    if (errors.length > 0) {
        for (const e of errors) {
            console.error("ERROR:", e);
        }
        process.exit(1);
    }

    // Ensure directory exists
    const dir = path.dirname(optionsJsonPath);
    fs.mkdirSync(dir, { recursive: true });

    // Write final options to options.json
    fs.writeFileSync(
        optionsJsonPath,
        JSON.stringify(finalOptions, null, 2),
                     "utf8"
    );

    // Prepare masked copy of the options for logging
    const maskedOptions = {};
    for (const [key, value] of Object.entries(finalOptions)) {
        maskedOptions[key] = maskIfSensitive(value, sensitiveKeys.has(key));
    }

    console.log(`Generated ${optionsJsonPath}:`);
    console.log(JSON.stringify(maskedOptions, null, 2));
}

// Run main and exit with its status code
const exitCode = main();
process.exit(exitCode);
