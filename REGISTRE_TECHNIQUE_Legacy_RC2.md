# SmartPhoton — registre technique Legacy RC2

État : 18 novembre 2026 — incrément laboratoire 4. **NO-GO pour publication et essais matériels à ce stade.**

## Référence et règles

- Base RC1 : PR #194, branche `maintenance/legacy-flow-consolidation-docker`, commit `794f161a01b032a8aab82b3d3e151abcc1657c34` ; blob du flow RC1 `174ae4673b4199c2e048b6bd515ef8a712318f8b`.
- Patch cumulatif `legacy-rc2-increment4-lab.patch`, applicable sur RC1 (ne pas cumuler avec incréments 1–3). SHA256 `ab3a3b884b97d25ac1e8fac0641b465d07677c85807058c95156afaeec3f284d` ; SHA256 du flow après application `45660c23c7f24c5df96e200d8b5e1d10018635d3347a4d65814d1b7f05816579`.
- Tout traitement JK-BMS Legacy dans `rootfs/etc/node-red/flows.json` ; aucun snippet ni patcher au build ou au démarrage. Seuls tests/documentation/CI séparés. HAOS et Docker standalone embarquent le même flow.
- Aucun changement de noms MQTT/discovery, aucune nouvelle fonctionnalité dans cette passe. Le fork PR #195 est une source d'hypothèses, pas une base à fusionner. Multi-Pack en pause.

## Registre des acquis

| Référence | Cause / invariant | Correction et preuve | Reste à faire |
|---|---|---|---|
| #166, 4.1.13 | Identités non vérifiées, trames dégradées ; imposer intégrité avant création d'identité et publication | Correctifs historiques validés sur matériel réel en 4.1.13, réintégrés dans RC1 ; tests permanents | Validation de la version finale, pas réexécution aveugle de tous les essais historiques |
| #192, 4.1.14 | Dashboard Premium supposait IDs consécutifs ; utiliser les IDs observés et distinguer master | Correctif historique intégré dans RC1 | Retester migrations et dashboards sur version finale |
| Régression 4.1.14 | Correctifs #166 omis du flow livré en supprimant la transformation au démarrage | RC1 réunit #166 et #192 dans le flow canonique ; CI historique HAOS/standalone réussie | Reconstruire RC2, contrôler octet pour octet les flows embarqués |
| #189 | Checksum JK et CRC invalides, fixture 36,066 V ; cause historique non prouvée sans trame originale | Corpus externe rejoué ; gates avant consommateurs; rejet mesures partielles et hors plage; compte cellules par BMS; fragmentation en-tête ; alarmes indépendantes | Disponibilité/fraîcheur, plage 0–6 V (zéro rejeté), fallback 16S avant SETUP, limites variantes firmware et cohérence topics MQTT |
| #195 / P2 | Décodage 0x1114 : bool tableau LCD, bits Smart Sleep/PCL/Timed Stored Data décalés | 20 mots synthétiques par parseur (bits isolés et combinaisons) ; vrai buffer-parser 3.2.2 ; 2 tests rouge avant, verts après ; LCD bit4, sleep6, PCL7, timed8, float9 | Vérification firmware/matériel ciblée ; ne pas ajouter de fonction de commande Broadcasting |
| #195 / P2 | Octet DATA 172 divisé par 100 ; valeur MQTT binaire 0/1 non respectée | Deux parseurs LIVE échelle 1 ; normalisation 0/1 dans les gates existants ; tests 0/1/2/255 ; aucune modification de topic | Vérifier sur un cycle réel d'équilibrage si possible ; octet 200 et autres nouvelles données non modifiés |
| P0/P1 | Cache registre 0x1114 indexé par le compteur mutable de polling | `97ba2dfa27f6b50c` utilise `_issue16611_reply_bms` et valide le mot uint16 ; rejet ne bloque pas le loop SETUP ; test retard BMS1 alors que compteur=2 | Ce cache n'est pas une preuve de fraîcheur. Ne pas le traiter comme autorisation d'écriture. État persistant ancien possible. |
| P0 | Dashboard port 1891 LIVE et STATIC utilisent compteur global ; SETUP accepte fallback ID | Formatters `5b3a149fadaaeeaf`, `bf829c99eeb5a2c4`, `f5a2072c35bc736d` utilisent identité vérifiée ; LIVE reprend compte de cellules validé ; 3 tests échouent avant et passent après | UI intégrée réelle à contrôler sur HAOS, pas modification Premium dans cet incrément |

## P1 : défaut d'écriture confirmé, non corrigé dans cet incrément

Exécution en mémoire des cinq fonctions Legacy pour BMS 2, mot initial 0x2409, commande True (aucun ordre réel émis) :

| Commande | Nœud | Attendu | Effectivement encodé | Cache immédiatement après |
|---|---|---|---|---|
| Disable PCL | e50d85dd307014b0 | 0x2489 | 0x0080 | 0x2409 |
| Smart Sleep | bd040c956b93d05e | 0x2449 | 0x0040 | 0x2409 |
| Timed Stored Data | c04897193ef2596b | 0x2509 | 0x0100 | 0x2409 |
| LCD Always On | 06902826a92d0714 | 0x2419 | 0x2419 | 0x2419 (optimiste) |
| Charging Floating Mode | 54b0991b2504e747 | 0x2609 | 0x2609 | 0x2609 (optimiste) |

Source de référence Multi-Pack : `fix/dev81-0-broadcast-discovery-scada-readonly`, blob `ea05c4acf6a5656086cb6e84a4d0298f7d6981b6` (`rootfs/etc/node-red/active-polling.js`), CONTROL_DEFS et séquence switch vers lignes 673–680 ; lecture mot LE282, masque, FC16 0x1114, nouvelle lecture 0x161e, confirmation. Préserver ce principe déjà travaillé et testé en Multi-Pack ; le code ne doit pas être importé tel quel en Legacy. Les masques incluent chauffage bit0 (aucune nouvelle commande Legacy à ajouter). Le nœud Multi-Pack de publication active lit directement le mot, même si son parseur SETUP générique présente encore des champs décalés ; son parseur Broadcasting a les masques corrigés. À reporter dans le registre Multi-Pack lors de la reprise, sans modifier cette branche maintenant.

### Exigences de la correction P1

- Une seule transaction 0x1114 à la fois par BMS (ou bus si la sérialisation du transport l'exige) ; ne pas utiliser un mot persistant chargé au démarrage comme source autoritative.
- Identifier le BMS depuis le topic original, autorisation explicite, refuser broadcasting et commandes MQTT retained ; vérifier booléen, adresse, et session. Éviter le trigger MQTT historique pour ces commandes s'il supprime la provenance ; pas de publication optimiste.
- Lecture SETUP ciblée (0x161E), réponse strictement valide et corrélée à la requête ; calcul du mot 16 bits ; écrire uniquement si nécessaire ; CRC16 ; confirmer par relecture du mot complet, avec état explicite de résultat inconnu sur timeout ou perte de session. Ne pas rejouer automatiquement une écriture inconnue.
- Utiliser les chemins USB et TCP existants, préserver leur file et cadence ; attention au limiteur TCP, aux messages déjà en file, à la reconnexion et au contexte localfilesystem. Ne jamais attribuer un retour par le compteur global de polling. Tester absence de réémission après expiration/restart, refus, commandes concurrentes distinctes, ACK incorrect, relecture incohérente, réponse tardive et isolation inter-BMS.
- Le prototype doit rester dans le flow unique ; l'implémentation transactionnelle et sa validation sont encore ouvertes.

## Résultats reproductibles

- Baseline RC2 incrément 3 : 98/98 tests sous Node.js 22.16.0.
- Incrément 4 : 5 tests rouge avant correction décodeur/cache ; 3 tests rouge avant correction dashboards ; 3 tests permanents wire-to-MQTT Active BMS2, Broadcasting master et BMS2. Total 109/109, zéro échec, zéro skip, confirmé après réapplication du patch sur ZIP RC1 propre. `git diff --check` propre.
- Banc contributeur #189 : 56 scénarios × 4 variantes = 224 exécutions, assertions spécifiques RC2 réussies. Module réel buffer-parser dans archive, contextes/MQTT mockés. Pas de broker ni matériel ni isolation réseau explicite. Cas Q04 (publication multi-topics non atomique) reste reproductible à 818 mV transitoires ; pas de changement de topics ici.
- CI : préparation d'installation de buffer-parser@3.2.2 uniquement dans workflow de régression, pas de nouvelle dépendance runtime. La CI modifiée n'a pas encore été exécutée ; package runtime actuel dépend de `*`, version construite à contrôler. Le corpus complet du contributeur reste externe ; quelques cas synthétiques sont maintenant intégrés aux tests permanents.
- Sources : [PR #194](https://github.com/jean-luc1203/jkbms-rs485-addon/pull/194), [PR #195](https://github.com/jean-luc1203/jkbms-rs485-addon/pull/195), [issue #189 corpus](https://github.com/jean-luc1203/jkbms-rs485-addon/issues/189#issuecomment-6987623960), [moteur DEV81](https://github.com/jean-luc1203/jkbms-rs485-addon-DEVeloppment/blob/fix/dev81-0-broadcast-discovery-scada-readonly/rootfs/etc/node-red/active-polling.js), [référence JK02_32S (BLE, layout correspondant à confirmer sur RS485)](https://github.com/syssi/esphome-jk-bms/blob/main/docs/protocol-design-ble.md).

## Critères de sortie

1. Fermer P1 commande registre et P0 disponibilité/qualité sans masquer les protections ; arbitrer la compatibilité Q04 sans renommer les topics.
2. Relire les anomalies de décodage restantes PR #195 individuellement ; pas d'extension de fonctionnalités (octet 200/précharge : migration potentiellement incompatible, différer à défaut de preuve suffisante ; type batterie/sondes supplémentaires hors périmètre).
3. Valider régressions, construire HAOS et standalone, vérifier le flow exact et le vrai parser dans les images ; tests de migration et réinstallation.
4. Procédure matérielle ciblée sur les deux BMS et deux transports, Active/Broadcast, reprise de communication, LCD et registre (ne pas modifier les protections vitales pour tester). Réutiliser les preuves historiques en les distinguant des tests de la version finale.
5. Publication Legacy seulement après GO explicite ; ensuite portage raisonné vers Multi-Pack en tenant compte du moteur transactionnel distinct.

Aucun changement GitHub ni matériel pendant cet incrément. Registre local à versionner lorsqu'on préparera la PR RC2.

## Qualification 4.1.15-rc2-ro1 — 18 novembre 2026

Référence **de test uniquement, lecture seule RS485**, pas release publique ni solution finale P1. Le flow contient les acquis RC2.4 ainsi que :
- Verrou explicite à chacun des trois chemins d'émission RS485 (USB, TCP A/B) : seuls les polls de lecture JK 0x161C/0x161E/0x1620 (FC16, valeur zéro) et 0x12A0 (FC03) avec adresse 1..15 et CRC valides sont autorisés, uniquement en active polling. Le client TCP passif ne reçoit que connect/close, sans payload.
- Refus des commandes MQTT de configuration et des commandes DRY avant publication optimiste ; autorisation de modification forcée à false. CAN désactivé pour la qualification. Les contrôles existants peuvent rester visibles ; ne pas les utiliser.
- Purge des fragments et des données en attente au démarrage ; réinitialisation des compteurs de qualité, vérification des IDs sans création de contexte fantôme.
- Qualité et âge depuis la dernière acquisition acceptée par BMS dans le diagnostic MQTT BMS_GLOBAL/health ; seuil 120 s minimum (adapté à la cadence en polling). Ne change pas availability des anciennes entités MQTT ni leur état retained. Une absence de nouvelle valeur ne prouve pas une valeur physique actuelle. Les anciennes entités fantômes ne sont pas effacées automatiquement.
- Version exacte du parser 3.2.2 dans package.json, partagée entre HAOS et standalone. Un seul flow canonique, sans patcher au démarrage ni au build.
- Source locale RC1 blob 174ae4673b4199c2e048b6bd515ef8a712318f8b, flow RO1 SHA256 9a30272818122b309ec0ebc65c915712e37b37f57fc7fb7797d4cc3053056af2. 597 nœuds, 151 fonctions, aucune erreur de syntaxe des fonctions/init/finalize ni lien wire orphelin ni ID dupliqué.
- 119/119 tests sous Node 22.16.0, buffer-parser réel 3.2.2 ; banc externe 56 scénarios x 4 variantes = 224 exécutions comparatives, assertions RC2 spécifiques réussies. Contextes et MQTT simulés, pas de runtime complet, pas de matériel. Les 224 exécutions incluent les régressions voulues dans les versions anciennes. Journaux et CSV dans tests/evidence-rc2-ro1. Q04 et limites de protocoles restent ouverts.
- P1 : prototype de transaction étudié hors du flow livré, non intégré ni validé. Ne pas réactiver les écritures par simple contournement du verrou. Il reste à démontrer la corrélation lecture/écriture/relecture et le comportement du transport réel.
- Docker et HAOS : scripts de démarrage vérifiés syntaxiquement ; construction et démarrage NON exécutés faute de moteur Docker local. Le premier build sera sur machine de test ou CI. Aucun changement GitHub/production/Multi-Pack. GO conditionnel pour construire et qualifier uniquement en lecture seule, NO-GO production et écritures.
