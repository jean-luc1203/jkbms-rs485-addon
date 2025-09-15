## Exporting Home Assistant entities to the cloud

It can be very interesting to export your data to the cloud so that you can
monitor it from outside your home.
There are several ways of doing this, the most common of which are VPNs or reverse proxies.
This infrastructure is not always easy to set up.

Here's another approach, using an MQTT Cloud Broker such as HiveMQ
, which has a free option.

The idea is to regularly push the entities you want to this broker.
You can then read them from any client, and of course
from your phone.

**Here's how to activate this function in the Smartphoton JKBMS module**.
* Create a long-lived token in HA

  Menu User / Security / Long-lived access tokens / **Create token** * Create a long-lived token in HA.

  Give it a name such as "Smartphoton - JK-BMS Addon token" and save the token
. Then paste it into the module configuration in the field named
 HA Long term access tokens

* Create a free account on [(HiveMQ)](https://www.hivemq.com/)

  - Create your 1st cluster and retrieve the **TLS MQTT URL**.

    Copy and paste it into the Cloud MQTT Broker address field of the module.
    This looks like: `ca204074sdjh678b374bae5b858.s1.eu.hivemq.cloud:8883`

  - Create a user/password to access this URL.

And start the JKBMS module.

## This documentation isn't finished yet, but I'll do my best to finish it quickly.

