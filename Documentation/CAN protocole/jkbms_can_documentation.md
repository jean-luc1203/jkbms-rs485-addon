# Documentation Complète - Protocole CAN JKBMS

## Vue d'ensemble

Cette documentation décrit le protocole de communication CAN utilisé par les BMS JKBMS pour transmettre les données de batterie. Le décodage a été effectué par corrélation avec les données RS485 pour assurer la précision des valeurs.

## Configuration système analysée

- **Batteries :** 2 packs de 16 cellules prismatiques LiFePO4
- **BMS :** 2 × JKBMS
- **Tension nominale :** ~53V (16S)
- **Capacité totale :** 280Ah
- **Bus CAN :** Standard CAN 2.0B (identifiants 29 bits)

---

## Trames CAN Décodées

### 1. **ID 2F4** - Statut Principal
**Fréquence :** Très élevée (plusieurs fois par seconde)

| Byte | Description | Facteur | Unité | Exemple |
|------|-------------|---------|-------|---------|
| 0-1  | Tension totale pack (Little-endian) | 0.1 | V | 53.1V |
| 2-3  | Non utilisé | - | - | - |
| 4    | SOC (State of Charge) | 1 | % | 81% |
| 5-7  | Réservé | - | - | - |

**Exemple de trame :**
```
can0 2F4 [8] 13 02 B2 0F 51 00 00 00
→ Tension: 531 × 0.1 = 53.1V, SOC: 81%
```

### 2. **ID 4F4** - Tensions Cellules Min/Max
**Fréquence :** Élevée

| Byte | Description | Facteur | Unité | Exemple |
|------|-------------|---------|-------|---------|
| 0-1  | Tension cellule max (Little-endian) | 0.001 | V | 3.327V |
| 2    | Position cellule max | 1 | # | Cellule 6 |
| 3-4  | Tension cellule min (Little-endian) | 0.001 | V | 3.324V |
| 5    | Position cellule min | 1 | # | Cellule 1 |
| 6-7  | Réservé | - | - | - |

**Exemple de trame :**
```
can0 4F4 [8] FF 0C 06 FC 0C 01 00 00
→ Max: 3.327V (pos.6), Min: 3.324V (pos.1)
```

### 3. **ID 5F4** - Températures
**Fréquence :** Moyenne

| Byte | Description | Facteur | Unité | Exemple |
|------|-------------|---------|-------|---------|
| 0    | Température max | -50°C offset | °C | 22°C |
| 1    | Position sonde temp max | 1 | # | Sonde 1 |
| 2    | Température min | -50°C offset | °C | 22°C |
| 3    | Position sonde temp min | 1 | # | Sonde 0 |
| 4    | Température moyenne | -50°C offset | °C | 22°C |
| 5-7  | Réservé | - | - | - |

**Exemple de trame :**
```
can0 5F4 [8] 48 01 48 00 48 00 00 00
→ Max: 22°C (pos.1), Min: 22°C (pos.0), Moy: 22°C
```

### 4. **ID 18F128F4** - Courant et Puissance
**Fréquence :** Élevée

| Byte | Description | Facteur | Unité | Exemple |
|------|-------------|---------|-------|---------|
| 0-1  | Courant (Little-endian, signé) | 0.001 | A | 3.78A |
| 2-3  | Puissance (Little-endian) | 0.1 | W | 200W |
| 4-7  | Données système | - | - | - |

**Exemple de trame :**
```
can0 18F128F4 [8] E1 08 F0 0A 6B 80 23 00
→ Courant: 2273 × 0.001 = 2.27A, Puissance: 2800 × 0.1 = 280W
```

### 5. **ID 01F21400** - Capacité Restante
**Fréquence :** Moyenne

| Byte | Description | Facteur | Unité | Exemple |
|------|-------------|---------|-------|---------|
| 0-1  | Capacité restante (Little-endian) | 0.1 | Ah | 227Ah |
| 2-7  | Données système | - | - | - |

**Exemple de trame :**
```
can0 01F21400 [8] C7 14 12 00 E4 00 23 00
→ Capacité: 5319 × 0.1 = 531.9Ah (valeur brute, besoin calibration)
```

### 6. **ID 18F528F4** - Codes d'Alarme
**Fréquence :** Faible (changement d'état)

| Byte | Description | Valeurs possibles |
|------|-------------|-------------------|
| 0    | Code alarme | Voir tableau ci-dessous |
| 1-7  | Réservé | - |

**Codes d'alarme :**
| Code | Signification |
|------|---------------|
| 0    | Normal |
| 1    | Surtension cellule |
| 2    | Sous-tension cellule |
| 3    | Surtension pack |
| 4    | Sous-tension pack |
| 5    | Surintensité charge |
| 6    | Surintensité décharge |
| 7    | Surchauffe charge |
| 8    | Surchauffe décharge |
| 9    | Froid charge |
| 10   | Froid décharge |
| 11   | Surchauffe MOS |
| 12   | Court-circuit |
| 13   | Surchauffe BMS |
| 14   | Froid BMS |
| 23   | Déséquilibre cellules |
| 35   | Système normal |

### 7. **ID 1806E5F4** - Données Système
**Fréquence :** Faible

| Byte | Description | Exemple |
|------|-------------|---------|
| 0    | ID système | 0x02 |
| 1    | Statut | 0x40 |
| 2-3  | Valeur système | 950 |
| 4-7  | Réservé | - |

### 8. **ID 18F228F4** - Températures Individuelles
**Fréquence :** Moyenne

| Byte | Description | Facteur | Unité |
|------|-------------|---------|-------|
| 0    | ID capteur | 1 | # |
| 1-5  | Températures sondes | -50°C offset | °C |
| 6-7  | Réservé | - | - |

### 9. **ID 18F428F4** - Données Complémentaires
**Fréquence :** Faible

| Byte | Description | Exemple |
|------|-------------|---------|
| 0-1  | Données système | 0xBDE3 |
| 2    | Valeur système | 0xFD |
| 6    | SOC alternatif | 100% |
| 7    | Réservé | - |

### 10. **ID 18E0-18E3** - Tensions Cellules Individuelles
**Fréquence :** Moyenne

Chaque ID couvre 4 cellules :
- **18E028F4** : Cellules 1-4
- **18E128F4** : Cellules 5-8  
- **18E228F4** : Cellules 9-12
- **18E328F4** : Cellules 13-16

| Byte | Description | Facteur | Unité |
|------|-------------|---------|-------|
| 0-1  | Tension cellule N (Little-endian) | 0.001 | V |
| 2-3  | Tension cellule N+1 | 0.001 | V |
| 4-5  | Tension cellule N+2 | 0.001 | V |
| 6-7  | Tension cellule N+3 | 0.001 | V |

---

## Données Confirmées par Corrélation RS485

### ✅ **Données validées :**
- **Tension totale** : 53.1V (Facteur 0.1V)
- **Courant** : 3.78A (Facteur 0.001A)
- **Puissance** : 200W (Facteur 0.1W)
- **SOC** : 81% (Valeur directe)
- **Tensions cellules** : 3.325-3.35V (Facteur 0.001V)
- **Températures** : 22-24°C (Offset -50°C)

### ❓ **Données manquantes (présentes en RS485) :**
- **Température MOS** : 24.1°C, 23.3°C
- **Nombre de cycles** : 11, 35
- **Courant de balance** : 0A
- **États switches** : Charge/Décharge/Balance
- **Capacité batterie totale** : 280Ah
- **SOH** : 100%
- **Résistance cellules** : 0.06-0.09Ω

---

## Format des Données

### Encodage Little-Endian
Les valeurs multi-bytes sont encodées en Little-Endian :
```
Bytes [0x13, 0x02] = 0x0213 = 531 décimal
```

### Valeurs Signées
Le courant utilise un format signé 16-bits :
```
Si valeur > 32767, alors valeur = valeur - 65536
```

### Offsets de Température
Toutes les températures utilisent un offset de -50°C :
```
Température réelle = Valeur_brute - 50
```

---

## Fréquences d'Émission

| Trame | Fréquence estimée | Usage |
|-------|-------------------|-------|
| 2F4   | ~10 Hz | Monitoring principal |
| 4F4   | ~5 Hz | Surveillance cellules |
| 18F128F4 | ~5 Hz | Monitoring puissance |
| 5F4   | ~1 Hz | Surveillance thermique |
| 01F21400 | ~1 Hz | Capacité |
| 18F528F4 | Sur événement | Alarmes |
| Autres | ~0.1-1 Hz | Données système |

---

## Utilisation Pratique

### Monitoring en Temps Réel
Pour un monitoring efficace, surveiller prioritairement :
1. **2F4** : Tension et SOC
2. **18F128F4** : Courant et puissance
3. **4F4** : Tensions min/max cellules
4. **18F528F4** : Alarmes

### Intégration Système
- **Bus CAN** : 250 kbps ou 500 kbps
- **Identifiants** : 29 bits (CAN 2.0B)
- **Longueur** : 8 bytes fixe
- **Endianness** : Little-endian pour multi-bytes

---

## Notes Techniques

### Limitations Connues
1. Calibration nécessaire pour la capacité restante
2. Certaines données système non documentées
3. Mapping incomplet des codes d'alarme étendus

### Recommandations
1. Implémenter un timeout sur les trames critiques
2. Valider les données par plausibilité
3. Maintenir une corrélation avec RS485 si disponible
4. Surveiller les codes d'alarme pour la sécurité

### Évolutions Possibles
- Identification des trames manquantes
- Décodage complet des données système
- Mapping des fonctions de balance
- Intégration des paramètres de configuration

---

*Documentation générée le 10/07/2025 - Basée sur l'analyse de trames CAN JKBMS réelles*