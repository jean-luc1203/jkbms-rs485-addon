# JK-BMS decoding frames - JK-BMS trames décodage

3 frames JK-BMS (Trame 1, Trame 2, Trame 3) avec :

- Adresse décimale
- Adresse hexadécimale
- Taille (octets)
- Type
- Nom du champ
- Description


# Trame 1 – Spécifications statiques

| Décimal | Hexa | Taille | Type | Nom du champ | Description |
| :--: | :--: | :--: | :--: | :-- | :-- |
| 6 | 0x06 | 13 | ASCII | BMS_A | Nom du BMS |
| 22 | 0x16 | 3 | ASCII | FW_A | Version firmware |
| 30 | 0x1E | 5 | ASCII | SW_N | Version software |
| 38 | 0x26 | 4 | uint32le | Uptime_S | Uptime (secondes) |
| 42 | 0x2A | 4 | uint32le | Power_count_N | Nombre de cycles d’allumage |
| 46 | 0x2E | 13 | ASCII | SerialNb_N | Numéro de série |
| 62 | 0x3E | 8 | ASCII | Password1_A | Mot de passe 1 |
| 78 | 0x4E | 8 | ASCII | Manufacturing_date_N | Date de fabrication |
| 102 | 0x66 | 8 | ASCII | Brand_A | Marque |
| 118 | 0x76 | 8 | ASCII | Password2_A | Mot de passe 2 |
| 184 | 0xB8 | 1 | uint8 | UART1_protocol_number_N | Protocole UART1 |
| 185 | 0xB9 | 1 | uint8 | CAN_protocol_number_N | Protocole CAN |
| 234 | 0xEA | 1 | uint8 | LCD_buzzer_trigger_N | Trigger buzzer LCD |
| 238 | 0xEE | 4 | uint32le | LCD_buzzer_trigger_value_N | Valeur déclenchement buzzer |
| 242 | 0xF2 | 4 | uint32le | LCD_buzzer_release_value_N | Valeur relâchement buzzer |
| 266 | 0x10A | 1 | uint8 | Request_Charge_voltage_Time_S | Temps demande tension charge (0.1s) |
| 267 | 0x10B | 1 | uint8 | Request_Float_voltage_Time_N | Temps demande tension float (0.1s) |

# Trame 2 – Paramètres de configuration (Setup)

| Décimal | Hexa | Taille | Type | Nom du champ | Description |
| :--: | :--: | :--: | :--: | :-- | :-- |
| 6 | 0x06 | 4 | int32le | smart_sleep_voltage_V | Tension de veille intelligente (V) |
| 10 | 0x0A | 4 | int32le | cell_voltage_undervoltage_protection_V | Protection sous-tension cellule (V) |
| 14 | 0x0E | 4 | int32le | cell_voltage_undervoltage_recovery_V | Récupération sous-tension cellule (V) |
| 18 | 0x12 | 4 | int32le | cell_voltage_overvoltage_protection_V | Protection surtension cellule (V) |
| 22 | 0x16 | 4 | int32le | cell_voltage_overvoltage_recovery_V | Récupération surtension cellule (V) |
| 26 | 0x1A | 4 | int32le | balance_trigger_voltage_V | Tension de déclenchement équilibrage (V) |
| 30 | 0x1E | 4 | int32le | cell_soc100_voltage_V | Tension cellule à 100% SOC (V) |
| 34 | 0x22 | 4 | int32le | cell_soc0_voltage_V | Tension cellule à 0% SOC (V) |
| 38 | 0x26 | 4 | int32le | cell_request_charge_voltage_V | Tension de charge demandée (V) |
| 42 | 0x2A | 4 | int32le | cell_request_float_voltage_V | Tension de floating demandée (V) |
| 46 | 0x2E | 4 | int32le | power_off_voltage_V | Tension d’extinction (V) |
| 50 | 0x32 | 4 | int32le | max_charge_current_A | Courant max de charge (A) |
| 54 | 0x36 | 4 | int32le | charge_overcurrent_protection_delay_S | Délai protection surcharge charge (s) |
| 58 | 0x3A | 4 | int32le | charge_overcurrent_protection_recovery_time_S | Temps de recouvrement surcharge charge (s) |
| 62 | 0x3E | 4 | int32le | max_discharge_current_S | Courant max de décharge (A) |
| 66 | 0x42 | 4 | int32le | discharge_overcurrent_protection_delay_S | Délai protection surcharge décharge (s) |
| 70 | 0x46 | 4 | int32le | discharge_overcurrent_protection_recovery_time_S | Temps de recouvrement surcharge décharge (s) |
| 74 | 0x4A | 4 | int32le | short_circuit_protection_recovery_time_S | Temps recouvrement court-circuit (s) |
| 78 | 0x4E | 4 | int32le | max_balance_current_A | Courant max équilibrage (A) |
| 82 | 0x52 | 4 | int32le | charge_overtemperature_protection_T | Protection surchauffe charge (°C) |
| 86 | 0x56 | 4 | int32le | charge_overtemperature_protection_recovery_T | Recouvrement surchauffe charge (°C) |
| 90 | 0x5A | 4 | int32le | discharge_overtemperature_protection_T | Protection surchauffe décharge (°C) |
| 94 | 0x5E | 4 | int32le | discharge_overtemperature_protection_recovery_T | Recouvrement surchauffe décharge (°C) |
| 98 | 0x62 | 4 | int32le | charge_undertemperature_protection_T | Protection sous-température charge (°C) |
| 102 | 0x66 | 4 | int32le | charge_undertemperature_protection_recovery_T | Recouvrement sous-température charge (°C) |
| 106 | 0x6A | 4 | int32le | power_tube_overtemperature_protection_T | Protection surchauffe MOSFET (°C) |
| 110 | 0x6E | 4 | int32le | power_tube_overtemperature_protection_recovery_T | Recouvrement surchauffe MOSFET (°C) |
| 114 | 0x72 | 4 | int32le | cell_count_N | Nombre de cellules |
| 118 | 0x76 | 1 | bool | charging_switch_B | Interrupteur de charge |
| 122 | 0x7A | 1 | bool | discharging_switch_B | Interrupteur de décharge |
| 126 | 0x7E | 1 | bool | balance_switch_B | Interrupteur d’équilibrage |
| 130 | 0x82 | 4 | int32le | total_battery_capacity_Ah | Capacité totale batterie (Ah) |
| 134 | 0x86 | 4 | int32le | short_circuit_protection_delay_S | Délai protection court-circuit (s) |
| 138 | 0x8A | 4 | int32le | balance_starting_voltage_V | Tension de début équilibrage (V) |
| 158 | 0x9E | 4 | int32le | Connexion_wire_resistance_1_R | Résistance câble 1 (Ω) |
| 270 | 0x10E | 4 | int32le | Device_address_N | Adresse du BMS |
| 282 | 0x11A | 1 | bool | display_always_on_switch_B | Affichage toujours allumé (bit 4) |
| 282 | 0x11A | 1 | bool | smart_sleep_switch_B | Mode veille intelligente (bit 7) |
| 282 | 0x11A | 1 | bool | disable_pcl_module_switch_B | Désactiver module PCL (bit 8) |
| 283 | 0x11B | 1 | bool | timed_stored_data_switch_B | Stockage des données programmé (bit 1) |

# Trame 3 – Données dynamiques (Live Data)

| Décimal | Hexa | Taille | Type | Nom du champ | Description |
| :--: | :--: | :--: | :--: | :-- | :-- |
| 6 | 0x06 | 2 | uint16le | Cell_1_volt_V | Tension cellule 1 (V) |
| 8 | 0x08 | 2 | uint16le | Cell_2_volt_V | Tension cellule 2 (V) |
| 10 | 0x0A | 2 | uint16le | Cell_3_volt_V | Tension cellule 3 (V) |
| 12 | 0x0C | 2 | uint16le | Cell_4_volt_V | Tension cellule 4 (V) |
| 14 | 0x0E | 2 | uint16le | Cell_5_volt_V | Tension cellule 5 (V) |
| 16 | 0x10 | 2 | uint16le | Cell_6_volt_V | Tension cellule 6 (V) |
| 18 | 0x12 | 2 | uint16le | Cell_7_volt_V | Tension cellule 7 (V) |
| 20 | 0x14 | 2 | uint16le | Cell_8_volt_V | Tension cellule 8 (V) |
| 22 | 0x16 | 2 | uint16le | Cell_9_volt_V | Tension cellule 9 (V) |
| 24 | 0x18 | 2 | uint16le | Cell_10_volt_V | Tension cellule 10 (V) |
| 26 | 0x1A | 2 | uint16le | Cell_11_volt_V | Tension cellule 11 (V) |
| 28 | 0x1C | 2 | uint16le | Cell_12_volt_V | Tension cellule 12 (V) |
| 30 | 0x1E | 2 | uint16le | Cell_13_volt_V | Tension cellule 13 (V) |
| 32 | 0x20 | 2 | uint16le | Cell_14_volt_V | Tension cellule 14 (V) |
| 34 | 0x22 | 2 | uint16le | Cell_15_volt_V | Tension cellule 15 (V) |
| 36 | 0x24 | 2 | uint16le | Cell_16_volt_V | Tension cellule 16 (V) |
| 80 | 0x50 | 2 | int16le | Cell_1_ohm_R | Résistance cellule 1 (Ω) |
| 82 | 0x52 | 2 | int16le | Cell_2_ohm_R | Résistance cellule 2 (Ω) |
| 84 | 0x54 | 2 | int16le | Cell_3_ohm_R | Résistance cellule 3 (Ω) |
| 86 | 0x56 | 2 | int16le | Cell_4_ohm_R | Résistance cellule 4 (Ω) |
| 88 | 0x58 | 2 | int16le | Cell_5_ohm_R | Résistance cellule 5 (Ω) |
| 90 | 0x5A | 2 | int16le | Cell_6_ohm_R | Résistance cellule 6 (Ω) |
| 92 | 0x5C | 2 | int16le | Cell_7_ohm_R | Résistance cellule 7 (Ω) |
| 94 | 0x5E | 2 | int16le | Cell_8_ohm_R | Résistance cellule 8 (Ω) |
| 96 | 0x60 | 2 | int16le | Cell_9_ohm_R | Résistance cellule 9 (Ω) |
| 98 | 0x62 | 2 | int16le | Cell_10_ohm_R | Résistance cellule 10 (Ω) |
| 100 | 0x64 | 2 | int16le | Cell_11_ohm_R | Résistance cellule 11 (Ω) |
| 102 | 0x66 | 2 | int16le | Cell_12_ohm_R | Résistance cellule 12 (Ω) |
| 104 | 0x68 | 2 | int16le | Cell_13_ohm_R | Résistance cellule 13 (Ω) |
| 106 | 0x6A | 2 | int16le | Cell_14_ohm_R | Résistance cellule 14 (Ω) |
| 108 | 0x6C | 2 | int16le | Cell_15_ohm_R | Résistance cellule 15 (Ω) |
| 110 | 0x6E | 2 | int16le | Cell_16_ohm_R | Résistance cellule 16 (Ω) |
| 144 | 0x90 | 2 | int16le | Mos_temp_T | Température MOSFET (°C) |
| 154 | 0x9A | 4 | uint32le | Puissance_Totale_W | Puissance totale (W) |
| 158 | 0x9E | 4 | int32le | Courant_total_A | Courant total (A) |
| 162 | 0xA2 | 2 | int16le | Sonde_1_temp_T | Température sonde 1 (°C) |
| 164 | 0xA4 | 2 | int16le | Sonde_2_temp_T | Température sonde 2 (°C) |
| 170 | 0xAA | 2 | int16le | Balance_courant_A | Courant d’équilibrage (A) |
| 172 | 0xAC | 1 | byte | Balance_Action_B | Action équilibrage (bitfield/état) |
| 173 | 0xAD | 1 | uint8 | SOC_pourcentage_P | État de charge (SOC, %) |
| 174 | 0xAE | 4 | int32le | Capacite_restante_Ah | Capacité restante (Ah) |
| 178 | 0xB2 | 4 | int32le | Capacite_batterie_Ah | Capacité totale batterie (Ah) |
| 182 | 0xB6 | 4 | int32le | Nombre_Cycle_N | Nombre de cycles |
| 186 | 0xBA | 4 | int32le | Cycle_Capacite_Ah | Capacité par cycle (Ah) |
| 190 | 0xBE | 1 | uint8 | SOH_pourcentage_P | État de santé (SOH, %) |
| 194 | 0xC2 | 4 | uint32le | Total_runtime_S | Temps total de fonctionnement (s) |
| 198 | 0xC6 | 1 | byte | Switch_Charge_B | État interrupteur charge |
| 199 | 0xC7 | 1 | byte | Switch_Decharge_B | État interrupteur décharge |
| 200 | 0xC8 | 1 | byte | Switch_Balance_B | État interrupteur équilibrage |
| 234 | 0xEA | 2 | uint16le | Tension_Totale_volt_V | Tension totale du pack (V) |
| 254 | 0xFE | 2 | int16le | Sonde_3_temp_T | Température sonde 3 (°C) |
| 258 | 0x102 | 2 | int16le | Sonde_4_temp_T | Température sonde 4 (°C) |

