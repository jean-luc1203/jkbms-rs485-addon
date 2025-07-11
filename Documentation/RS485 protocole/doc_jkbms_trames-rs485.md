# Documentation – Décodage des Trames JK-BMS

## Objectif
Ce flow Node-RED permet :

- d’interroger un ou plusieurs JKBMS via RS485 (USB ou passerelle IP),
- de lire trois types de trames (statiques, configuration, dynamiques),
- de décoder les données reçues,
- de publier les résultats sur MQTT pour intégration dans Home Assistant.

---

## Organisation des trames

| Trame | Type de données              | Registre Modbus | Code fonction | Adresse HEX | Node de départ     |
|-------|-------------------------------|------------------|----------------|-------------|--------------------|
| 1     | Statique (infos BMS)          | `5660`           | `0x10`         | `0x161C`    | `Fixes Trame 1`    |
| 2     | Paramètres / réglages BMS     | `5662`           | `0x10`         | `0x161E`    | `Setup Trame 2`    |
| 3     | Données en temps réel (live)  | `5664`           | `0x10`         | `0x1620`    | `Live Trame 3`     |

Chaque trame est envoyée à une adresse esclave variable (de 1 à N), pour interroger plusieurs BMS en boucle.

---

## Format général d’une trame JK-BMS

- **En-tête :** `0x55 0xAA 0xEB 0x90` (valeurs fixes)
- **Type trame :**
  - Trame 1 : `0xEB 0x90`
  - Trame 2 : `0xEB 0x90 0x01`
  - Trame 3 : `0xEB 0x90 0x02`
- **Longueur attendue :**
  - Trame 1 : variable selon firmware
  - Trame 2 : ~300 octets
  - Trame 3 : 308 octets

---

## Détail du décodage

### Trame 1 – Informations statiques du BMS

Cette trame contient des données fixes comme l’identifiant, le firmware, les dates, etc.

| Champ                       | Type    | Offset | Longueur | Description                      |
|----------------------------|---------|--------|----------|----------------------------------|
| `BMS_A`                    | ASCII   | 6      | 13       | Nom/Type du BMS                  |
| `FW_A`                     | ASCII   | 22     | 3        | Version firmware                 |
| `SW_N`                     | ASCII   | 30     | 5        | Numéro logiciel interne          |
| `Uptime_S`                 | Uint32  | 38     | 4        | Durée de fonctionnement en sec   |
| `Power_count_N`           | Uint32  | 42     | 4        | Nombre d'allumages               |
| `SerialNb_N`               | ASCII   | 46     | 13       | Numéro de série                  |
| `Password1_A`              | ASCII   | 62     | 8        | Mot de passe 1                   |
| `Password2_A`              | ASCII   | 118    | 8        | Mot de passe 2                   |
| `Manufacturing_date_N`    | ASCII   | 78     | 8        | Date de fabrication              |
| `Brand_A`                  | ASCII   | 102    | 8        | Marque                           |
| `UART1_protocol_number_N` | Uint8   | 184    | 1        | Protocole UART utilisé           |
| `CAN_protocol_number_N`   | Uint8   | 185    | 1        | Protocole CAN utilisé            |
| `LCD_buzzer_trigger_N`    | Uint8   | 234    | 1        | Seuil de déclenchement du buzzer|
| `Request_Charge_voltage_Time_S` | Uint8 | 266 | 1  | Temps avant activation charge   |

**Traitement :**
- Trame vérifiée (header),
- Décodée via `buffer-parser`,
- Publiée sur MQTT avec topic `BMS_#/state/*`.

---

### Trame 2 – Paramètres de configuration

Cette trame contient tous les paramètres configurables (tensions seuils, courants, températures, activation de fonctions, etc.).

| Champ                                        | Type      | Offset | Unité   | Description                                       |
|---------------------------------------------|-----------|--------|---------|---------------------------------------------------|
| `cell_voltage_undervoltage_protection_V`    | Int32le   | 10     | V       | Seuil de protection de sous-tension cellule       |
| `cell_voltage_overvoltage_protection_V`     | Int32le   | 18     | V       | Seuil de surtension cellule                       |
| `max_charge_current_A`                      | Int32le   | 50     | A       | Courant max de charge                             |
| `max_discharge_current_S`                   | Int32le   | 62     | A       | Courant max de décharge                           |
| `charge_overtemperature_protection_T`       | Int32le   | 82     | °C      | Temp. max charge                                  |
| `discharge_overtemperature_protection_T`    | Int32le   | 90     | °C      | Temp. max décharge                                |
| `charging_switch_B`, `discharging_switch_B` | Bool      | 118/122| -       | Activation des MOS                                |
| `total_battery_capacity_Ah`                 | Int32le   | 130    | Ah      | Capacité de la batterie définie                   |
| `cell_count_N`                              | Int32le   | 114    | -       | Nombre de cellules                                |
| `smart_sleep_switch_B`                      | Bool      | 282.7  | -       | Mode veille intelligent activé ?                  |

**Traitement :**
- Trame filtrée par en-tête,
- Décodée avec `buffer-parser` et publiée sur MQTT,
- Les paramètres sont exposés comme entités Home Assistant (switch, number).

---

### Trame 3 – Données temps réel

Cette trame contient toutes les valeurs dynamiques :

| Type de données           | Exemples                                 |
|---------------------------|------------------------------------------|
| Tensions cellules         | `Cell_01_voltage_V` à `Cell_16_voltage_V`|
| Températures              | `Temp_sensor_1_T`, `MOS_Temperature_T`  |
| Courant et tension pack   | `Pack_current_A`, `Pack_voltage_V`      |
| État des relais MOS       | `Charge_MOS`, `Discharge_MOS`           |
| SOC estimé                | `SOC_P`, `Remaining_capacity_Ah`        |
| Alarmes, flags            | `Balancing_active_B`, `Protection_flag` |

Un traitement additionnel est fait :
- calcul du delta et moyenne des tensions cellules,
- identification des cellules les plus hautes et les plus basses,
- tous les résultats sont publiés individuellement **et** sous forme de JSON.

**Topic MQTT :**
- `BMS_xx/donnees_dynamiques`
- Chaque champ est aussi publié séparément (`BMS_xx/Voltage_pack`, etc.)

---

## Publication MQTT

- Découverte automatique Home Assistant (`discovery` MQTT)
- Suffixes normalisés : `_V`, `_A`, `_T`, `_S`, `_P`, `_Ah`, etc.
- Topic de base : `BMS_#`
- Entités catégorisées : `diagnostic`, `config`, `state`
- Informations complètes sur le BMS dans chaque `device`

---

## Support multi-BMS

Le système boucle automatiquement sur plusieurs adresses esclaves grâce à :

- `global.get("slaveAddress-TrameX")`
- Variable `nb_jkbms`
- Incrément cyclique des adresses via `Loop Modbus adresse`

Cela permet d'interroger plusieurs BMS dans la même instance Node-RED.

---

## Auteur
Développé par [JLM 2025](https://domosimple.eu/forum)

---

Pour toute question, contribution ou signalement de bug, merci de consulter le dépôt GitHub associé.

