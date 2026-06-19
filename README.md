⭐ **If this add-on is useful to you, please star this repository!**  
It helps other Home Assistant users discover this project and supports future development.

[![GitHub stars](https://img.shields.io/github/stars/jean-luc1203/jkbms-rs485-addon?style=social)](https://github.com/jean-luc1203/jkbms-rs485-addon/stargazers)
[![Active installations](https://img.shields.io/badge/active_installations-7500+-brightgreen)](https://github.com/jean-luc1203/jkbms-rs485-addon)
[![Daily clones](https://img.shields.io/badge/daily_clones-50+-blue)](https://github.com/jean-luc1203/jkbms-rs485-addon)
[![Community Forum](https://img.shields.io/badge/community-forum-blue)](https://github.com/jean-luc1203/jkbms-rs485-addon/discussions)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-Compatible-41BDF5)](https://www.home-assistant.io/)
[![MQTT](https://img.shields.io/badge/MQTT-Compatible-green)](https://mqtt.org/)
[![Docker](https://img.shields.io/badge/Docker-Supported-blue)](https://github.com/jean-luc1203/jkbms-rs485-addon/tree/main/standalone)

---

❗️ **Personal/non-commercial use permitted.**  
Business, professional or commercial use requires a separate commercial license.

# Smartphoton JK-BMS RS485 & CAN Bus Add-on

> **7500+ installations** · **67+ daily clones** · **Community-driven development** · **Professional Home Assistant integration**

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y3YHYZP)
[![Donate with PayPal](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/paypal.png)](https://www.paypal.com/ncp/payment/PSQPALQJT9UBW)

Smartphoton JK-BMS is a professional Home Assistant add-on for monitoring, controlling and integrating JK-BMS battery management systems through **RS485**, **TCP/IP gateways** or **CAN Bus**.

It transforms Home Assistant into a complete battery monitoring and energy management platform, with MQTT Discovery, multi-BMS support, advanced diagnostics, alarm management and optional Premium dashboard generation.

---

Community & Support
Need help, want to report a bug, request a feature, or share your setup?

Join the official Simply Home Energy Discord community:

🔗 DISCORD_INVITE_LINK

Connect with other users, get support, discuss new features, and stay informed about the latest updates.


## 🚀 Major Upgrade: Variable Cell Count Support (1S to 16S)

The add-on now supports battery packs with any cell count from **1S to 16S**.

> No more wrong cell delta values on non-16S packs.

### What this improves

- Correct support for 4S, 8S, 15S, 16S and other supported pack sizes
- Accurate cell minimum, maximum, average and delta calculations
- Automatic exclusion of unused cell slots
- Better dashboard accuracy
- More reliable automations and diagnostics

### Why this matters

Until now, many users with non-16-cell battery packs could see incorrect cell statistics because unused cell slots were still present in the frame layout.

This feature makes the add-on cell-count aware, which is a major improvement for real-world battery installations.

---

## 🎯 What is this?

Smartphoton JK-BMS is a professional-grade monitoring and control solution for JK-BMS battery management systems.

It provides:

- Real-time battery monitoring
- Multi-BMS management
- Home Assistant MQTT Discovery
- RS485 USB communication
- RS485 TCP/IP gateway support
- CAN Bus support
- Alarm monitoring
- Direct configuration from Home Assistant
- Optional Premium dashboard generation
- Modular integration with the Smartphoton ecosystem

No expensive proprietary software is required.

---

## 🔋 Supported BMS Models

Supported JK-BMS models include:

- PB2A16S20P - PB2A16S15P - PB1A16S15P - PB1A16S10P - PB2A16S30P
- All compatible models with FW: 14 - 15 - 19
- Battery packs from 1S to 16S

---

## ⚡ Key Features

| Feature | Description |
|--------|-------------|
| 🆕 Variable Cell Count Support | Automatically adapts to battery packs from 1S to 16S |
| 🎛️ Full Configuration UI | Change BMS settings directly from Home Assistant |
| 🔌 Multiple Connectivity | RS485 USB, RS485 Ethernet/WiFi Gateway and CAN Bus |
| 📊 Multi-BMS Support | Manage up to 15 BMS units simultaneously |
| 🏠 Native Home Assistant Integration | Devices and entities created automatically through MQTT Discovery |
| 📡 MQTT Compatible | Works with Home Assistant and any MQTT-compatible system |
| 🚨 21 Alarm Types | Comprehensive alarm monitoring system |
| 👑 Premium Dashboard System | Automatic generation of professional dashboards |
| 🌐 Modern HTML Dashboard | Responsive interface for desktop, tablet and smartphone |
| 📋 Legacy Lovelace Dashboard | Traditional Home Assistant dashboard generation |
| 🌍 Multi-Language Dashboard | Automatic French or English dashboard generation |
| 🧩 Modular Architecture | Compatible with other Smartphoton modules |
| 🐳 Docker Standalone Support | Can run independently from Home Assistant OS |

---

## 👑 Premium Features

The optional Premium license unlocks advanced dashboard and ecosystem features.

Premium is designed for users who want a complete, automated and professional Home Assistant energy interface without manually building dashboards.

---

## ✨ Automatic Dashboard Generation

Premium users can automatically generate professional Home Assistant dashboards.

No YAML editing.  
No manual Lovelace card creation.  
No manual dashboard maintenance.

The add-on automatically creates dashboards based on the installed Smartphoton modules and the selected configuration.

---

## 🖥️ Available Dashboard Modes

### 📋 Legacy Dashboard

The Legacy dashboard uses native Home Assistant Lovelace cards.

It is ideal for users who prefer the traditional Home Assistant interface and want dashboards directly integrated into HA.

### 🌐 Modern HTML Dashboard

![Smart Energy Premium JK Dashboard](images/jk.png)

The Modern HTML dashboard provides a responsive, professional and mobile-friendly interface.

It is designed for:

- Desktop computers
- Tablets
- Smartphones

Features include:

- Modern energy visualizations
- Fast navigation
- Responsive layout
- Mobile-optimized views
- Advanced battery visualization
- Historical charts
- Alarm monitoring
- Multi-BMS overview

### 🔀 Both Dashboards

Premium users can choose to generate:

- Legacy Lovelace only
- Modern HTML only
- Both dashboards simultaneously

This allows each user to keep the interface that best fits their Home Assistant setup.

---

## 🌍 Multi-Language Dashboard Support

Dashboards can be generated automatically in the language selected in the add-on configuration.

Currently supported:

- English
- French

---


## 🔗 Smartphoton Ecosystem

Smartphoton JK-BMS is part of a larger ecosystem for Home Assistant energy management.

Compatible Smartphoton modules include:

- 🔋 Smartphoton JK-BMS
- 🔋 [Pylontech / Pelio](https://github.com/jean-luc1203/Pylontech-rs232-haos)
- ⚡ Smartphoton Voltronic
- 💰 Smart Energy Finance
- 🌐 Smartphoton HTML Dashboard

Together, these modules can provide a unified view of batteries, inverters, energy flows, financial savings and system diagnostics.

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y3YHYZP)
[![Donate with PayPal](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/paypal.png)](https://www.paypal.com/ncp/payment/PSQPALQJT9UBW)

---

## 🚀 Three Operating Modes

### 1️⃣ Master Mode

The add-on queries each BMS directly through RS485.

This mode provides full monitoring and full configuration access.

```yaml
bms_broadcasting: false
```

Available features:

- Read live BMS data
- Modify BMS settings
- Monitor alarms
- Monitor cells
- Monitor temperatures
- Use full Home Assistant integration

---

### 2️⃣ Listening Mode

One BMS acts as the RS485 master.

The add-on listens to the RS485 traffic and publishes available data to Home Assistant.

This mode is ideal when an inverter requires one BMS to be the bus master.

```yaml
bms_broadcasting: true
```

Available features:

- Read-only monitoring
- Multi-BMS data reception
- Home Assistant MQTT publishing
- Dashboard compatibility

---

### 3️⃣ CAN Bus Mode

CAN Bus mode uses the second RJ45 connector of compatible JK-BMS units.

This mode is designed for direct CAN Bus communication and autonomous broadcast operation.

---

## 📸 See It In Action

### Control Panel

![Control Panel Animation](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JK-BMS-Screenshot-15-11-2025.gif)

### Hardware Connection Guide

![Hardware Connection Guide](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/Fonctionnement-LED-cable-rs485.gif)

---

## 💢 Important Safety Note

This add-on is designed for monitoring, automation and energy optimization.

It must not be the only safety layer of an electrical installation.

A failure of Home Assistant, Node-RED, MQTT, USB/RS485 communication, TCP/IP gateway communication or the host system should not be able, by itself, to create a critical power situation.

Please ensure your installation keeps safe fallback behavior, hardware protections and conservative default settings even if this add-on stops working or loses communication.

⚠️ See [SAFETY.md](SAFETY.md) for more details and recommended fail-safe design principles.

---

## 🛠️ Installation

### Via Home Assistant Add-on Store

1. Open Home Assistant
2. Go to Settings
3. Go to Add-ons
4. Open the Add-on Store
5. Click the three dots in the upper-right corner
6. Select Repositories
7. Add the repository URL:

```text
https://github.com/jean-luc1203/jkbms-rs485-addon
```

8. Install the add-on
9. Configure your settings
10. Start the add-on

---

## 🐳 Docker Standalone

Smartphoton JK-BMS can also run independently from Home Assistant OS using Docker.

This is useful for:

- Home Assistant Core installations
- Docker-based Home Assistant installations
- Linux servers
- Virtual machines
- Advanced deployments

👉 [Docker Installation Guide](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/standalone/README.md)

Thanks to community contributor @SergeyYmb.

---

## ⚙️ Configuration

| Parameter | Description | Example |
|----------|-------------|---------|
| `path` | USB serial port path | `/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0` |
| `nb_jkbms` | Number of BMS units | `1` to `15` |
| `use_gateway` | Enable TCP/IP gateway mode | `true` / `false` |
| `gateway_ip` | Gateway IP address | `192.168.1.100` |
| `gateway_port` | Gateway port | `502` |
| `bms_broadcasting` | Enable listening mode | `true` / `false` |
| `mqttaddress` | MQTT broker address | `192.168.1.50` |
| `mqttport` | MQTT broker port | `1883` |
| `mqttuser` | MQTT username | `homeassistant` |
| `mqttpass` | MQTT password | `"your_password"` |

### USB Adapter Tip

Find your USB path in:

Home Assistant → Settings → System → Hardware → All Hardware

Look for a `ttyUSB` device.

Compatible adapters:

- FTDI
- CH340
- CP2102

Not recommended:

- Adapters creating `ttyACM0` interfaces

---

## 🌐 TCP/IP Gateway Support

You can connect your BMS remotely using an RS485 Ethernet or WiFi gateway in transparent mode.

This is useful when:

- The Home Assistant server is far from the batteries
- USB cabling is not practical
- Multiple installations need remote access
- The BMS cabinet is in another room or building

✅ Tested gateways are documented here:

[View compatible gateway models](https://github.com/jean-luc1203/jkbms-rs485-addon/tree/main/images/Modbus-Gateway)

---

## 🚨 Advanced Alarm Management

The add-on monitors 21 alarm types.

Examples include:

- Battery overvoltage
- Battery undervoltage
- Cell overvoltage
- Cell undervoltage
- Charge overcurrent
- Discharge overcurrent
- Overtemperature
- Undertemperature
- Cell imbalance
- Communication problems

### Home Assistant Alarm Entities

The add-on creates dedicated alarm entities:

- Active alarm count
- Alarm details
- Affected BMS identification
- Global binary sensor for automation triggers

📋 [Complete alarm reference table](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/Documentation/Alarmes-description.md)

Alarm management is currently available in Master mode. Broadcasting and CAN alarm support are planned.

---

## 📊 Home Assistant Integration

### MQTT Discovery

BMS units appear automatically as devices inside the Home Assistant MQTT integration.

![MQTT Devices](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JKBMS-in-MQTT-devices.png)

---

### Automatic Cell-Count-Aware Calculations

The add-on reads the real cell count reported by the BMS and adjusts cell analysis accordingly.

This means:

- No more incorrect cell delta values on non-16S packs
- Correct min, max and average calculations
- Correct support for 4S, 8S, 15S and 16S packs
- Better accuracy for dashboards, diagnostics and automations

---

### MQTT Topics

The JK-BMS add-on publishes three main categories of MQTT data:

1. Live Data
2. Configuration Parameters
3. Static Specifications

All topics are documented here:

[MQTT Topics Documentation](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/Documentation/mqtt_topics_documentation.md)

---

### Rich Entity Set

The add-on provides extensive Home Assistant entities for monitoring and automation.

![Available Entities](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JKBMS-entities.png)

---

## 📊 RS485 Diagnostic Dashboard

If you experience communication issues with RS485, use the diagnostic dashboard.

👉 [Troubleshooting Guide](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/Documentation/jkbms_rs485_troubleshooting_enhanced.md)

A ready-to-use diagnostic dashboard is available here:

[RS485 Diagnostic Dashboard YAML](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/Documentation/jk_bms_rs485_diagnostics_dashboard.yaml)

### Diagnostic Features

- Real-time communication health status
- Frame reconstruction efficiency
- Serial/TCP buffer analysis
- BMS detection tracking
- Built-in interpretation and troubleshooting help

### Installation

1. Go to Home Assistant → Dashboards
2. Click Edit Dashboard
3. Open the raw configuration editor
4. Copy and paste the diagnostic YAML file content

### Preview

<img width="900" height="577" alt="rs485_diag_preview png" src="https://github.com/user-attachments/assets/6b822c31-f14a-41cc-8e58-789cbd8760f6" />

### Notes

- Requires MQTT Discovery enabled
- Entities are automatically created by the add-on
- Starting from v3.6.4, RS485 frame parsing is stricter and may expose existing communication issues that were previously hidden

---

## 🤝 Support This Project

This add-on is developed and maintained by one person in their free time.

If this project saves you time or money, please consider supporting future development.

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y3YHYZP)
[![PayPal](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/paypal.png)](https://www.paypal.com/donate/?hosted_button_id=864NCUWH4VJ8N)

### Development Impact

Your support directly enables:

- Purchase of the latest JK-BMS hardware for compatibility testing
- New features
- Bug fixes
- Documentation improvements
- Dashboard improvements
- Hardware compatibility testing
- Community support

---

## 🗺️ Roadmap

Upcoming features:

- Alarm management for Broadcasting mode
- Alarm management for CAN mode
- Enhanced multi-gateway support
- Advanced cell balancing analytics
- Historical data export tools
- Additional Smartphoton dashboard modules
- Extended Premium dashboard features
- Deeper Smartphoton ecosystem integration

Development velocity depends on community support and available time.

---

## 📝 Changelog

See [CHANGELOG.md](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/CHANGELOG.md) for version history.

---

## 🐛 Issues & Feature Requests

Given the success of this add-on, response times may vary.

Before opening a new issue, please:

1. Read the [FAQ](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/FAQ.md)
2. Check existing issues
3. Try the RS485 Diagnostic Dashboard if no data is received
4. Include screenshots and logs when possible

Use GitHub Issues for:

- Bug reports
- Installation help
- Configuration problems
- Feature requests

For general questions and community help, use GitHub Discussions.

---

## 🆘 Choose the Right Issue Template

| Template | When to use | Example |
|----------|-------------|---------|
| 🐛 Bug report | Something is broken or crashes | No data received, CRC errors, add-on crashes |
| ❓ Question / Support | Installation or configuration help | How do I connect via TCP gateway? |
| ✨ Feature request | You have an idea for improvement | Add support for another BMS |

Why templates matter:

They help understand your setup quickly and provide faster support.

Pro tip: include a screenshot of the Diagnostic Dashboard whenever possible.

---

## 👨‍💻 Credits

**Development:** Jean-Luc Martinelli (JLM)  
**Inspiration:** Nolak's work for Smartphoton  
**Docker contributor:** @SergeyYmb  
**Community:** Supporters, testers and Home Assistant users

---

## 📜 License

MIT License.

See [LICENSE](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/LICENSE) for details.

---

## 🌟 Star History

If this project is useful to you, please leave a star.

It helps other Home Assistant users discover the project and motivates continued development.

[![Star History](https://img.shields.io/github/stars/jean-luc1203/jkbms-rs485-addon?style=social)](https://github.com/jean-luc1203/jkbms-rs485-addon/stargazers)

---

**Made with ❤️ for the Home Assistant community**
