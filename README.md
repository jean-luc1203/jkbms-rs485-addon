---
⭐ **If this add-on is useful to you, please star this repository!**  
It helps other Home Assistant users discover this project.

[![GitHub stars](https://img.shields.io/github/stars/jean-luc1203/jkbms-rs485-addon?style=social)](https://github.com/jean-luc1203/jkbms-rs485-addon/stargazers)
[![Active installations](https://img.shields.io/badge/active_installations-1100+-brightgreen)](https://github.com/jean-luc1203/jkbms-rs485-addon)
[![Community Forum](https://img.shields.io/badge/community-forum-blue)](https://github.com/jean-luc1203/jkbms-rs485-addon/discussions)
[![Reddit](https://img.shields.io/badge/reddit-r%2Fhomeassistant-orange)](https://www.reddit.com/r/homeassistant/)
---
❗️ Personal/non-commercial use permitted; business/professional/commercial use requires a separate commercial license.

# Smartphoton JK-BMS RS485 & CAN Bus Add-on

> **4800+ installations** · **50+ daily clones** · **Community-driven development**

## 🚀 Major Upgrade: Variable Cell Count Support (1S to 16S) - 2026-04-05

The add-on now supports **battery packs with any cell count from 1S to 16S**.

> **No more wrong cell delta values on non-16S packs.**

### ✅ What this improves
- Correct support for **4S, 8S, 15S, 16S** and all other supported pack sizes from **1 to 16 cells**
- Accurate **cell min / max / average / delta** calculations
- Automatic exclusion of **unused cell slots**
- Better dashboard accuracy
- More reliable automations and diagnostics

### Why this matters
Until now, many users with non-16-cell battery packs could see incorrect cell statistics because unused cell slots were still present in the frame layout.  
This new feature makes the addon **cell-count aware**, which is a major improvement for real-world installations.

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y3YHYZP) [![Donate with PayPal](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/paypal.png)](https://www.paypal.com/donate/?hosted_button_id=864NCUWH4VJ8N)

---

## 🎯 What is this?

**Professional-grade monitoring and control** for JK-BMS battery management systems via RS485 or CAN bus.

This add-on transforms your Home Assistant into a complete BMS control center - no expensive proprietary software needed.

### Supported BMS Models
- PB2A16S20P / PB2A16S15P
- PB1A16S15P / PB1A16S10P  
- All models with FW:19
- **Variable cell-count battery packs from 1S to 16S**

---

## ⚡ Key Features

| Feature | Description |
|---------|-------------|
| 🆕 **Variable Cell Count Support** | Automatically adapts to battery packs from 1S to 16S using the BMS-reported `cell_count_N` |
| 🎛️ **Full Configuration UI** | Change BMS settings directly from Home Assistant |
| 🔌 **Multiple Connectivity** | RS485 USB, RS485 Ethernet/WiFi Gateway, CAN Bus |
| 📊 **Multi-BMS Support** | Manage up to 15 BMS units simultaneously |
| 🏠 **Native HA Integration** | Control panel integrated into Home Assistant |
| 📡 **MQTT Compatible** | Works with any MQTT-compatible system |
| 🚨 **21 Alarm Types** | Comprehensive alarm management system |

---

## 🚀 Three Operating Modes

### 1️⃣ Master Mode
The add-on queries each BMS (addresses 1-15) via RS485 to retrieve all data.  
**Full control** - modify parameters directly from the software.

✅ Supports packs from **1S to 16S** with automatic cell-count-aware calculations.

```yaml
bms_broadcasting: false
```

### 2️⃣ Listening Mode  
One BMS acts as the RS485 master (DIP switches: 0000).  
**Read-only mode** - ideal when your inverter requires one BMS to be the bus master.

✅ Supports packs from **1S to 16S** with automatic cell-count-aware calculations.

```yaml
bms_broadcasting: true
```

### 3️⃣ CAN Bus Mode *(New! July 2025)*
Direct CAN bus broadcasting via the second RJ45 connector.  
**Loop broadcasting** - autonomous operation.

---

## 📸 See It In Action

![Control Panel Animation](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JK-BMS-Screenshot-15-11-2025.gif)

![Hardware Connection Guide](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/Fonctionnement-LED-cable-rs485.gif)

---
## 💢 Important Safety Note 

This add-on is designed for monitoring, automation and energy optimization.
It should not be the only safety layer of an electrical installation.

A failure of Home Assistant, Node-RED, MQTT, USB/RS485 communication or the host system should not be able, by itself, to create a critical power situation.

Please ensure your installation keeps safe fallback behavior, hardware protections, and conservative default settings even if this add-on stops working or loses communication.

⚠️ See [SAFETY.md](SAFETY.md) for more details and recommended fail-safe design principles.

---
## 🛠️ Installation

### Via Home Assistant Add-on Store
- Settings
- Apps
- Choose "Add App", when you do this three dots appear in the upper right hand side
- Go to github.com
- Find the jkbms-rs485-add on 
- Click on the 3 dots and choose repository
- Copy and past the ip location from the browser address bar and paste into the repository name

  `https://github.com/jean-luc1203/jkbms-rs485-addon`
- Proceed with install
- Configure your settings
- Start the add-on

### Docker Standalone *(New! December 2025)*
Run **independently from HAOS** via Docker!  
Perfect for Home Assistant Core or Docker installations.

**👉 [Docker Installation Guide](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/standalone/README.md)**

*Thanks to community contributor @SergeyYmb*

---

## ⚙️ Configuration

| Parameter | Description | Example |
|-----------|-------------|---------|
| `path` | USB port path | `/dev/serial/by-id/usb-1a86_USB_Serial-if00-port0` |
| `nb_jkbms` | Number of BMS units | `1` to `15` |
| `use_gateway` | Using IP gateway? | `true` / `false` |
| `gateway_ip` | Gateway IP address | `192.168.1.100` |
| `gateway_port` | Gateway port | `502` |
| `bms_broadcasting` | Master BMS mode (0000)? | `true` / `false` |
| `mqttaddress` | MQTT broker address | `192.168.1.50` |
| `mqttport` | MQTT broker port | `1883` |
| `mqttuser` | MQTT username | `homeassistant` |
| `mqttpass` | MQTT password (in quotes) | `"your_password"` |

**💡 Pro Tip:** Find your USB path in Settings → System → Hardware → All Hardware (look for ttyUSB)

⚠️ **Compatible USB adapters:** FTDI, CH340, CP2102 chips (ttyUSBx)  
❌ **Not compatible:** Adapters creating ttyACM0 interfaces

---

## 🌐 TCP/IP Gateway Support

Connect your BMS remotely via RS485/Ethernet gateway in transparent mode.  
No need to have your server physically near the batteries!

✅ **Tested gateways:** [View compatible models](https://github.com/jean-luc1203/jkbms-rs485-addon/tree/main/images/Modbus-Gateway)

---

## 🚨 Advanced Alarm Management

**21 alarm types** automatically monitored:
- Battery over/under voltage
- Over/under temperature  
- Current limits exceeded
- Cell imbalance
- And 16 more...

**4 Home Assistant entities created:**
- Active alarm count
- Alarm details
- Affected BMS identification  
- Global binary sensor for automation triggers

📋 [Complete alarm reference table](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/Documentation/Alarmes-description.md)

*Currently available in Master mode - Broadcasting & CAN modes coming soon*

---

## 💫 Ready-to-Use Dashboards

**Save hours of configuration work!**  
Get two pre-configured, professional dashboards:

[![Get Dashboards](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/s/495acc37c7)

- Complete data visualization
- Alarm monitoring cards
- Multi-BMS comparison views
- Mobile-optimized layout

---

## 📊 Home Assistant Integration

### MQTT Discovery
BMS units appear automatically as devices in MQTT integration:

![MQTT Devices](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JKBMS-in-MQTT-devices.png)

### Automatic Cell-Count-Aware Calculations
The add-on automatically reads the real cell count reported by the BMS and adjusts cell analysis accordingly.

This means:
- no more incorrect cell delta values on non-16S packs
- correct min / max / average calculations on 4S, 8S, 15S and other supported pack sizes
- better accuracy for diagnostics, dashboards and automations

### ⛑ Here is a list of all topics that are created automatically.
MQTT Topics Structure - JK-BMS Add-on  
The JK-BMS add-on publishes three categories of data via MQTT:
1. Live Data
2. Configuration Parameters (Settings)
3. Static Specifications

All topics are described in the documentation ![here](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/Documentation/mqtt_topics_documentation.md) !

### Rich Entity Set
Full sensor coverage for monitoring and automation:

![Available Entities](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JKBMS-entities.png)

---

## Troubleshooting & 📊 RS485 Diagnostic Dashboard

If you experience communication issues with the RS485 broadcast mode, please consult the troubleshooting guide:

👉 [Troubleshooting Guide](/Documentation/jkbms_rs485_troubleshooting_enhanced.md)

## 📊 RS485 Diagnostic Dashboard

A ready-to-use diagnostic ![dashboard](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/Documentation/jk_bms_rs485_diagnostics_dashboard.yaml) is available to monitor RS485 communication quality.

### Features
- Real-time communication health status
- Frame reconstruction efficiency (yield ratio)
- Serial/TCP buffer analysis
- BMS detection tracking
- Built-in interpretation and troubleshooting guide

### Installation
1. Go to **Home Assistant → Dashboards**
2. Click **Edit Dashboard**
3. Click **⋮ → Raw configuration editor**
4. Copy/paste the content of:

`jk_bms_rs485_diagnostics_dashboard.yaml`

### Preview of RS485 Diagnostic

<img width="900" height="577" alt="rs485_diag_preview png" src="https://github.com/user-attachments/assets/6b822c31-f14a-41cc-8e58-789cbd8760f6" />

### Notes
- Requires MQTT Discovery enabled
- Entities are automatically created by the addon
- Starting from v3.6.4, RS485 frame parsing is stricter and may expose existing communication issues that were previously hidden

## 🤝 Support This Project

This add-on is **developed and maintained by one person** in their free time.

**If this saves you time or money, please consider supporting future development:**

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y3YHYZP) [![PayPal](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/paypal.png)](https://www.paypal.com/donate/?hosted_button_id=864NCUWH4VJ8N)

**90 early supporters** helped make this project possible - thank you! 🙏

### Development Impact
Your support directly enables:
- 🏪 Purchase of the latest JK-BMS upon release. To ensure compatibility
- ✨ New features (CAN bus support was community-funded!)
- 🐛 Bug fixes and maintenance
- 📚 Documentation improvements
- 🔧 Hardware compatibility testing
- 💬 Community support

**Current development time:** ~10-15 hours/week  
**Funded by:** Community donations

---

## 🗺️ Roadmap

### Upcoming Features
- [ ] Alarm management for Broadcasting mode
- [ ] Alarm management for CAN mode
- [ ] Enhanced multi-gateway support
- [ ] Advanced cell balancing analytics
- [ ] Historical data export tools

*Development velocity depends on community support and available time*

---

## 📝 Changelog

See [CHANGELOG.md](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/CHANGELOG.md) for version history.

---

## 🐛 Issues & Feature Requests
## Support

⚠️ Given the success of this add-on, I can no longer guarantee responses as quickly as before.

### Please read this first [!FAQ](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/FAQ.md) before opening an issue

❇️ To report problems or request features, use [GitHub issues](https://github.com/jean-luc1203/jkbms-rs485-addon/issues).

For general questions and community support, visit our [Discussions](https://github.com/jean-luc1203/jkbms-rs485-addon/discussions).

---

## 🆘 Having an issue? Choose the right template!

When opening a new issue, please **select one of these templates** (required):

| Template | When to use | Example |
|----------|-------------|---------|
| **🐛 Bug report** | Something is **broken** or crashes | "No data received", "CRC errors", "Add-on crashes" |
| **❓ Question/Support** | **Installation help** or **configuration** | "How do I connect via TCP gateway?", "Entities unavailable" |
| **✨ Feature request** | You have an **idea** for improvement | "Add diagnostic sensors", "Support JBD BMS" |

**Why templates?** They help me understand your setup quickly and give you the fastest possible help. 🙏

**Before opening:**
1. Read [FAQ.md](FAQ.md) ✅
2. Check existing issues (use search) 🔍
3. Try the [Diagnostic Dashboard](#diagnostic-dashboard) if no data is received 📊

**Pro tip:** Include a screenshot of your **Diagnostic Dashboard** (if available) — it shows me instantly if it's a connection problem! 🚀

---

## 👨‍💻 Credits

**Development:** Jean-Luc Martinelli (JLM)  
**Inspiration:** Nolak's work for Smartphoton  
**Docker contributor:** @SergeyYmb  
**Community:** 90+ supporters and growing

---

## 📜 License

MIT License - See [LICENSE](https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/LICENSE)

---

## 🌟 Star History

If you find this project useful, give it a star! ⭐  
It helps others discover this add-on and motivates continued development.

[![Star History](https://img.shields.io/github/stars/jean-luc1203/jkbms-rs485-addon?style=social)](https://github.com/jean-luc1203/jkbms-rs485-addon/stargazers)

---

**Made with ❤️ for the Home Assistant community**
