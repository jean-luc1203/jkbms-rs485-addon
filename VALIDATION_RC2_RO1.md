# SmartPhoton Legacy — 4.1.15-rc2-ro1

**Candidat de qualification exclusivement en lecture seule RS485.** Aucun essai d'écriture BMS, aucune installation sur production. Le ZIP contient le projet complet avec le flow canonique, le registre, les tests et leurs résultats. Les scripts historiques de commandes restent présents mais leurs entrées et leurs chemins physiques sont verrouillés dans ce candidat. Les protections propres au BMS ne sont pas modifiées.

## Installation locale HAOS (machine Test uniquement)

1. Arrêter les modules JK-BMS qui accèdent au même bus, au même broker ou à la configuration partagée. Désactiver leur démarrage automatique et les automatismes de commande sur la machine Test. Faire une sauvegarde de Test et en particulier `/config/smartphoton_jkbms` (partagé avec l'ancienne Legacy) ainsi que des options existantes. Ne pas désinstaller l'ancienne version. Utiliser le broker de Test isolé de la production, sans bridge MQTT vers la production.
2. Décompresser le ZIP dans le dossier des applications locales (`local_apps`, `/local_apps` dans le terminal ; `addons`/`/addons` pour les installations qui utilisent encore ce nom). Le sous-dossier `smartphoton_jkbms` doit contenir directement `config.yaml`, `Dockerfile` et `rootfs/`. Conserver les permissions Unix des scripts ; de préférence extraire sur un système Linux/HAOS. Si le transfert Samba les a retirées, restaurer les permissions des scripts S6 `run` et `up` avant de construire. Ne pas ajouter un second dossier contenant la même app locale.
3. Dans Paramètres > Applications > Installer une application, menu de la boutique > Rechercher les mises à jour ; choisir **JK-BMS wired management — RC2 TEST RO** (version 4.1.15-rc2-ro1). Installer/construire puis configurer les options RS485 USB ou passerelle TCP et MQTT de Test comme avant. CAN_bus_usage=false, Send_bip=false, pas de démarrage automatique ni watchdog pendant le premier essai. Ne connecter aucun bus utilisé simultanément par un autre maître.
4. Démarrer, ouvrir les journaux, vérifier que la version est bien ro1 et que les données se renouvellent. Si aucun démarrage ou aucune télémétrie, arrêter, conserver les logs (ne pas contourner le verrou).

Source procédure : https://contributors.home-assistant.io/apps/guides/testing/ et https://contributors.home-assistant.io/apps/first-app/.

## Essais ciblés (pas d'écriture de registre)

- D'abord transport USB/mode habituel de Test : vérifier BMS attendus, nombre de cellules, tensions min/max et SOC, alarmes affichées normalement. Vérifier les IDs du dashboard port 1891 et les topics MQTT. Utiliser la découverte publiée après le démarrage pour distinguer d'anciens retained des nouvelles créations ; ne rien supprimer en masse.
- Sur BMS_GLOBAL/health, relever `telemetry_quality_by_bms`, `telemetry_stale_threshold_s`, `rc2_test_read_only` ; comparer l'âge et les compteurs. Observer 20–30 min, puis si possible tester la reprise après interruption de communication non critique. Vérifier la fraîcheur sans confondre valeur retained et nouvelle acquisition.
- Refaire un court essai via la passerelle TCP de Test / simulateur (si disponible), puis en Broadcasting si l'installation/simulateur est déjà dans ce mode ; ne pas reconfigurer physiquement le BMS pour l'essai. Aucun test de commandes, et ne pas provoquer de protection réelle de batterie.
- En cas de nouvel ID inattendu, tension incohérente ou perte de communication : arrêter, sauvegarder journaux et messages MQTT avec horodatage, sans effacer automatiquement les retained. Recherche de `ISSUE166` / `ISSUE189_TELEMETRY_REJECT` / `RC2_READ_ONLY`.

Retour arrière : arrêter RC2, restaurer au besoin la sauvegarde de configuration et les options antérieures (partage du dossier /config), redémarrer l'ancienne application seule. Ne pas redémarrer les automatismes de production dans Test. Aucune publication publique.

## Preuves et limites

Voir `REGISTRE_TECHNIQUE_Legacy_RC2.md`, `tests/evidence-rc2-ro1/` et les tests `tests/*.cjs`. Les 119 tests unitaires/intégration simulée et les assertions sur le corpus externe ont passé dans le laboratoire Node.js 22.16.0. Le corpus externe original est celui de l'issue #189 ; le CSV est un résultat de comparaison de quatre variantes, pas 224 nouveaux tests de RC2. Les anciens topics individuels restent non atomiques ; le diagnostic de qualité ne remplace pas la disponibilité native des entités HA. Le plafond technique de 6 V/cellule, le rejet de zéro et le fallback de 16 cellules avant SETUP restent des hypothèses à qualifier. Le blocage de transmission est testé hors runtime complet, pas une certification électrique. **Aucune construction Docker ni exécution HAOS réelle n'a eu lieu dans le laboratoire.**

La transaction 0x1114 n'est pas livrée dans cette qualification ; elle doit être validée sur le transport avant toute réactivation. Pas d'extension fonctionnelle, pas de fork fusionné. GO conditionnel build et lecture seule sur Test ; NO-GO production.
