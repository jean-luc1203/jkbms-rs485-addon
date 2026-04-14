# Safety

## Purpose of this project

This add-on is designed for monitoring, automation and energy optimization.

It can improve battery visibility, automation logic, scheduling and system coordination, but it should not be considered the only protection layer of an electrical installation.

## Important principle

A failure of Home Assistant, Node-RED, MQTT, USB/RS485 communication, Docker, or the host system should not by itself create a critical power situation.

This project should ideally be used as an **optimization and orchestration layer**, not as the only barrier preventing blackout, deep discharge, unsafe switching, or similar critical events.

## Recommended usage

For real-world installations, users should keep:

* hardware protections enabled on the BMS, inverter and battery system
* safe fallback behavior if communication is lost
* conservative default settings in the inverter or energy system
* independent alerting or fail-safe rules for critical conditions

## Practical expectation

If this add-on stops working, the expected consequence should ideally be:

* loss of optimization
* reduced automation
* delayed or missing telemetry

It should not be the only thing preventing a major power failure.

## Final note

This project can be a powerful control and supervision tool, but critical electrical safety should always rely on more than one layer.

