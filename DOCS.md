# Smartphoton JK-BMS-RS485 Add-on Home Assistant based on node red

Smartphoton JK-BMS-RS485 is a BMS management add-on via RS485 port (wired) from the JKong company

**BMS Type**
* [x] PBxA1xS1xP

<br /><br />
---
## Installation
---

Installing this add-on is no different from installing any other Home Assistant add-on.

1. Add the "https://github.com/jean-luc1203/Smartphoton-JK-BMS-RS485/" repository to the add-on shop
1. Click the "Install" button to install the add-on...
1. Configure your installation in the configuration menu.
1. Start the "Smartphoton JK-BMS-RS485" add-on module.
1. Check the "Smartphoton JK-BMS-RS485" logs to see if everything went well.

You can use the [Smartphoton JK-BMS-RS485 Configuration][addon-config] for your yaml

<br /><br />


---
## Battery
---

### Option: `Choice of port Battery list or listbatterie`
Choosing the battery's USB port. ("false" not to use it)<br />
Chemin : ip ou serial. (<ip>:<port>) or /dev/serial/by-id/<serial name><br />
Type : ip ou serial<br />
Battery : choice of battery. false ou pylontech<br />
nbSlave : Number of slave batteries (jkbms only)


<br /><br />
**example**
```yaml
- chemin: "false"
```
or for usb battery communication

```yaml
- chemin: /dev/serial/by-id/usb-Prolific_Technology_Inc._ATEN_USB_to_Serial_Bridge_EQDPb115818-if00-port0
  type: serial
  batterie: pylontech
```

or for battery communication via ip or elfin

```yaml
- chemin: 192.168.1.252:8888
  type: ip
  batterie: pylontech
```

<br /><br />
**Available options**

<table style="width:100%; border-collapse: collapse;" border="1">
  <thead>
    <tr>
      <th>Clé</th>
      <th>chemin</th>
      <th>type</th>
      <th>batterie</th>
      <th>nbSlave</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Nom</strong></td>
      <td>chemin</td>
      <td>type</td>
      <td>batterie</td>
      <td>nbSlave</td>
    </tr>
    <tr>
      <td><strong>Valeur par défaut</strong></td>
      <td>false</td>
      <td>serial</td>
      <td>pylontech</td>
      <td>1</td>
    </tr>
    <tr>
      <td><strong>Obligatoire</strong></td>
      <td>oui</td>
      <td>oui</td>
      <td>oui</td>
      <td>non</td>
    </tr>
    <tr>
      <td><strong>Pylontech</strong></td>
      <td>Adresse ip, chemin serial</td>
      <td>ip, serial</td>
      <td>false, pylontech</td>
      <td>1</td>
    </tr>
    <tr>
      <td><strong>JKBMS</strong></td>
      <td>Adresse ip, chemin serial</td>
      <td>ip, rs485</td>
      <td>false, jkbms</td>
      <td>1,2,3 ... 15</td>
    </tr>
  </tbody>
</table>


---
## MQTT (required)
---
You must have an mqtt broker (you can install it via the addon shop. [Addon Mosquitto broker][addon-mqtt])
You will then need to add mqtt integration (see mqtt doc)


### Option:
**mqttadresse** Address of your broker

**mqttport** port broker

**mqttuser** login user

**mqttpass** login password
<br /><br />
---
## Other options
---
### Option: `Log Level`
The `log_level` option controls the level of log output by the addon and can
be changed to be more or less verbose, which might be useful when you are
dealing with an unknown issue. Possible values are:

- `trace`: Show every detail, like all called internal functions.
- `debug`: Shows detailed debug information.
- `info`: Normal (usually) interesting events.
- `warning`: Exceptional occurrences that are not errors.
- `error`: Runtime errors that do not require immediate action.
- `fatal`: Something went terribly wrong. Add-on becomes unusable.

Please note that each level automatically includes log messages from a
more severe level, e.g., `debug` also shows `info` messages. By default,
the `log_level` is set to `info`, which is the recommended setting unless
you are troubleshooting.

### Option: `ssl` (non testé)

Enables/Disables SSL (HTTPS) on the web interface.
Set it `true` to enable it, `false` otherwise.

**Note**: _The SSL settings only apply to direct access and has no effect
on the Ingress service._

### Option: `certfile`

The certificate file to use for SSL.

**Note**: _The file MUST be stored in `/ssl/`, which is the default_

### Option: `keyfile`

The private key file to use for SSL.

**Note**: _The file MUST be stored in `/ssl/`, which is the default_


## Changelog & Releases
---

`MAJOR.MINOR.PATCH`

- `MAJOR`: Incompatible or major changes.
- `MINOR`: Backwards-compatible new features and enhancements.
- `PATCH`: Backwards-compatible bugfixes and package updates.


## Support
---
- [Github][depot-mqtt]
- [Site][site]
- [Forum][forum]
- [Documentations Github][documentation]


## Authors & contributors
---
Smartphoton JK-BMS-RS485, Jean-luc

The original setup of this repository is by [Franck Nijhof][frenck].




[addon-badge]: https://my.home-assistant.io/badges/supervisor_addon.svg
[addon-licence]: https://domosimple.eu/licence.php
[addon-config]: http://domosimple.eu/onduleur/
[addon]: https://my.home-assistant.io/redirect/supervisor_addon/?addon=a0d7b954_nodered&repository_url=https%3A%2F%2Fgithub.com%2Fhassio-addons%2Frepository
[addon-mqtt]: https://my.home-assistant.io/redirect/supervisor_addon/?addon=core_mosquitto&repository_url=https%3A%2F%2Fgithub.com%2Fhassio-addons%2Frepository
[depot-mqtt]: https://github.com/jean-luc1203/smartphoton-ha-addon/
[site]: https://smartphoton.fr/
[forum]: http://domosimple.eu/forum/
[documentation]: https://github.com/jean-luc1203/Smartphoton-Documentation
[alpine-packages]: https://pkgs.alpinelinux.org/packages
[contributors]: https://github.com/hassio-addons/addon-node-red/graphs/contributors
[discord-ha]: https://discord.gg/c5DvZ4e
[discord]: https://discord.me/hassioaddons
[forum]: https://community.home-assistant.io/t/home-assistant-community-add-on-node-red/55023?u=frenck
[frenck]: https://github.com/frenck
[issue]: https://github.com/hassio-addons/addon-node-red/issues
[node-red-nodes]: https://flows.nodered.org/?type=node&num_pages=1
[nodered-docs]: https://nodered.org/docs
[nodered]: https://nodered.org
[npm-packages]: https://www.npmjs.com
[reddit]: https://reddit.com/r/homeassistant
[releases]: https://github.com/hassio-addons/addon-node-red/releases
[semver]: http://semver.org/spec/v2.0.0.htm
