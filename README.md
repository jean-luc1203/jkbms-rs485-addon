# Smartphoton JK-BMS RS485 & CAN Bus Add-on

> **1,500+ installations** · **40+ daily clones** · **Community-driven development**

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Y8Y3YHYZP) [![Donate with PayPal](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/paypal.png)](https://www.paypal.com/donate/?hosted_button_id=864NCUWH4VJ8N)

---

## 🎯 What is this?

**Professional-grade monitoring and control** for JK-BMS battery management systems via RS485 or CAN bus.

This add-on transforms your Home Assistant into a complete BMS control center - no expensive proprietary software needed.

### Supported BMS Models
- PB2A16S20P / PB2A16S15P
- PB1A16S15P / PB1A16S10P  
- All models with FW:19

---

## ⚡ Key Features (v3.0.0)

| Feature | Description |
|---------|-------------|
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

```yaml
bms_broadcasting: false
```

### 2️⃣ Listening Mode  
One BMS acts as the RS485 master (DIP switches: 0000).  
**Read-only mode** - ideal when your inverter requires one BMS to be the bus master.

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

## 🛠️ Installation

### Via Home Assistant Add-on Store
1. Add this repository: `https://github.com/jean-luc1203/jkbms-rs485-addon`
2. Install "Smartphoton_JKBMS RS485 Home Assistant Addon"
3. Configure your settings
4. Start the add-on

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

### Rich Entity Set
Full sensor coverage for monitoring and automation:

![Available Entities](https://raw.githubusercontent.com/jean-luc1203/jkbms-rs485-addon/main/images/JKBMS-entities.png)

---

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

⚠️ Given the success of this add-on, I can no longer guarantee responses as quickly as  before.

### Please read this first [!FAQ]( https://github.com/jean-luc1203/jkbms-rs485-addon/blob/main/FAQ.md) before opening an “issue”

❇️ To report problems or request features, use [GitHub issues](https://github.com/jean-luc1203/jkbms-rs485-addon/issues).

For general questions and community support, visit our [Discussions](https://github.com/jean-luc1203/jkbms-rs485-addon/discussions).

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
