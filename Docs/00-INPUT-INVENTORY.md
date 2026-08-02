# Phase A — Eingabe-Inventar

Vollständige Liste aller Felder, die die UI erfassen muss, abgeleitet aus `COMBAT-RULES.md` §9 (Input-Struktur) und den Wirkungsregeln in §2, §3, §4, §6 und §7.

**Legende Häufigkeit** — Schätzung, in wie vielen realen Kämpfen das Feld einen vom Default abweichenden Wert bekommt:
`hoch` = fast jeder Kampf · `mittel` = jeder dritte bis fünfte Kampf · `selten` = Ausnahmefall, oft nie.

**Legende Seite** — `INV` = Invader, `DEF` = Defender, `beide` = auf beiden Seiten erfassbar.

Spielbegriffe stehen durchgängig in der englischen Originalform, weil die UI englisch ist.

---

## 0. Globale Felder (Maske 1)

| Feld | Wertebereich | Gilt für | Sichtbarkeitsbedingung | Häufigkeit |
|---|---|---|---|---|
| `combatType` | `PvP` · `Player vs Voidborn` · `Voidborn vs Player` (Skirmish) · `Player vs Fallen House` | – | immer | hoch |

`combatType` ist der **Master-Schalter des gesamten Formulars**. Er entscheidet, ob die Invader- oder die Defender-Seite überhaupt eine Fleet-/Technologie-Sektion bekommt:

| combatType | Maske 2 (Invader) | Maske 3 (Defender) |
|---|---|---|
| Player vs Player | voller Spieler-Satz | voller Spieler-Satz |
| Player vs Voidborn | voller Spieler-Satz | 2 Zahlen (Voidborn FP, Sector Defenses) |
| Voidborn vs Player (Skirmish) | 1 Zahl (Voidborn FP) | voller Spieler-Satz |
| Player vs Fallen House | voller Spieler-Satz | **keine Eingabe** (2 gedruckte Sector Defenses, fix) |

---

## 1. Fleet Power

Nur Fleet Power zählt, nicht die Anzahl der Fleet-Token `[§1.1]`. Cube-Limit 14 pro Spieler über **alle** Typen zusammen `[§2]`; realistisch pro Kampf deutlich weniger.

| Feld | Wertebereich | Gilt für | Sichtbarkeitsbedingung | Häufigkeit |
|---|---|---|---|---|
| `corvette` FP | 0–14 (real 0–9) | beide (Spielerseiten) | Seite ist ein Spieler | **hoch** — der Normalfall jedes Kampfes |
| `sentry` FP | 0–14 (real 0–6) | beide (Spielerseiten) | Seite ist Spieler **und** besitzt Technology `Sentries` | mittel |
| `destroyer` FP | 0–14 (real 0–6) | beide (Spielerseiten) | Seite ist Spieler **und** besitzt Technology `Destroyers` | mittel |
| `dreadnought` FP | 0–14 (real 0–6) | beide (Spielerseiten) | Seite ist Spieler **und** besitzt Technology `Dreadnoughts` | mittel |
| `carrier` FP | 0–14 (real 0–6) | beide (Spielerseiten) | Seite ist Spieler **und** besitzt Technology `Carriers` | selten |
| `voidbornFP` | 0–9 (Sektor) / 0–~12 (Skirmish, kein Limit `[Errata §6.2]`) | die Voidborn-Seite | `combatType` enthält Voidborn | hoch (in Voidborn-Kämpfen) |

Bedeutungsasymmetrien, die die UI transportieren muss:

- **Sentry** ist auf beiden Seiten ein völlig anderes Schiff: als DEF 1 Approach Damage pro FP und **0 Initiative**, als INV 1 Initiative pro FP und kein Approach Damage `[§2.1, §4.1]`. Ein Defender, der nur Sentries hat, kann im Salvo Step überhaupt keinen Schaden austeilen `[§9.7]`.
- **Dreadnought** gibt als INV Approach Absorption pro FP, als DEF Salvo Absorption pro FP `[§2.1]`.
- **Carrier** deployt nur als INV Corvetten `[§3.0]`, gibt als DEF Salvo Absorption.
- **Voidborn FP** verhält sich exakt wie Corvette FP `[§2.3]` — die UI darf hier nicht fünf Flottentypen anbieten.

---

## 2. Installationen (nur Defender)

| Feld | Wertebereich | Gilt für | Sichtbarkeitsbedingung | Häufigkeit |
|---|---|---|---|---|
| `sectorDefenses` | 0–3 (praktisch) | **DEF** | Defender-Seite, jeder `combatType` außer Fallen House | **hoch** |
| `starbases` | 0–2 | **DEF** | Defender ist ein **Spieler** (Voidborn-Sektoren haben keine Starbases); max 1 ohne, max 2 mit `Improved Starbases` | mittel |
| Fallen-House-Sector-Defenses | **fix 2** | DEF | `combatType = Player vs Fallen House` — nicht editierbar, nur anzeigen | – |

- Beide feuern je 1 Approach Damage `[§2.4]`.
- Starbases feuern auch ohne die Technology `Starbases` `[§2.4]`.
- Ein Sektor kann Sector Defenses ohne jede Fleet Power haben `[§2.4]` — die UI darf FP = 0 nicht als „kein Kampf" behandeln.

---

## 3. Sektor-Umgebung

| Feld | Wertebereich | Gilt für | Sichtbarkeitsbedingung | Häufigkeit |
|---|---|---|---|---|
| `adjacentSectorsWithShipyardOrStarbase` | 0 · 1 · 2+ (Cap 2) | beide | nur wenn die Seite `Deep Space Missiles` besitzt — INV ab `Basic`, DEF erst ab `Improved` `[§3.2, §3.3]` | selten |

Einzige Frage an den Nutzer, die sich **nicht** aus seinem eigenen Tableau beantworten lässt, sondern einen Blick auf die Karte erfordert. Deshalb teuer und möglichst zu vermeiden.

---

## 4. Technologien

`COMBAT-RULES.md` §9 listet 14 Technologien mit je drei Zuständen (`NONE`/`BASIC`/`IMPROVED`). **Beim Durchgehen der Wirkungsregeln bleiben davon nur 8 übrig, die das Kampfergebnis überhaupt verändern.** Das ist der wichtigste Befund dieser Phase und steht deshalb an dieser Stelle statt in den Kernproblemen.

### 4.1 Ergebnisrelevante Technologien

| Feld | Wertebereich | Gilt für | Sichtbarkeitsbedingung | Häufigkeit |
|---|---|---|---|---|
| `Targeting` | NONE / BASIC / IMPROVED | beide | `BASIC` sinnlos ohne ≥1 Corvette FP; `IMPROVED` wirkt mit **jeder** initiative­gebenden FP `[§4.2, §7.2]` | mittel |
| `Shields` | NONE / BASIC / IMPROVED | beide | nur bei ≥1 Corvette FP `[§7.2, Errata §4.7]` | **hoch** |
| `Torpedoes` | NONE / BASIC / IMPROVED | beide | nur bei ≥1 Corvette FP `[§4.4, §4.5]` | mittel |
| `Destroyers` | BASIC / IMPROVED | **INV** (nur INV-Wirkung) | nur bei ≥1 Destroyer FP. `NONE` ist redundant — ohne die Technology gibt es keine Destroyer FP. Unterschied: `IMPROVED` = +1 flat Approach Damage `[§2.2]` | mittel |
| `Deep Space Missiles` | NONE / BASIC / IMPROVED | beide, asymmetrisch | `BASIC` nur INV (kostet 1 Energy); `IMPROVED` beide. Beides nur relevant bei `adjacentSectorsWithShipyardOrStarbase` ≥ 1 `[§3.2, §3.3]` | selten |
| `Energy Cells` | NONE / HAS (Basic und Improved wirken **identisch**) | **DEF** | Defender-Spielerseite; wirkt nur, wenn der Defender ≥1 Approach Damage austeilt — auch absorbierten `[§3.2]` | selten |
| `Autonomous Drones` | NONE / BASIC / IMPROVED | **INV** (+ DEF im Skirmish) | INV: 1 Approach + 1 (Basic) bzw. 2 (Improved) Salvo Absorption gegen 1 Trade-Token. DEF: nur im Evaluation-Phase-Skirmish, dort **automatisch erfolgreiche Verteidigung** `[§7.3]` | selten |
| `Combat Replicators` | NONE / IMPROVED (Basic ohne Kampfwirkung) | **INV** | wirkt ausschließlich im Unentschieden: wandelt Tie → Sieg `[§5.3]` | selten |

### 4.2 Technologien ohne jede Wirkung auf das Kampfergebnis

Diese sechs stehen in der Checkliste §9, verändern aber nachweislich keine Zahl im Resolver. **Vorschlag: aus der Eingabemaske streichen** (siehe offene Frage 2).

| Technology | Warum irrelevant |
|---|---|
| `Sentries` | Basic/Improved unterscheiden sich nur im Deploy-Timing, nicht in Kampfwerten `[§7.1]`. Der einzige relevante Input ist die Sentry **FP**. |
| `Dreadnoughts` | Improved erhöht nur das FP-Limit **pro Token** — und Token sind kampfirrelevant `[§1.1, §2.1]`. Basic Dreadnoughts geben bereits die Defender-Salvo-Absorption. |
| `Carriers` | dito — Improved ändert nur FP pro Token `[§2.1]`. |
| `Starbases` | Basic/Improved regeln nur max 1 vs. 2 Starbases pro Sektor. Das ist aus dem gezählten Wert `starbases` bereits ablesbar, und Starbases feuern ohnehin ohne die Technology `[§2.4]`. |
| `Escape Pods` | Verschiebt recalled FP ins Home-Sector, entfernt sie aber genauso aus dem Combat-Sektor → identisches Ergebnis `[§10.5]`. Reiner Log-Hinweis. |
| `Salvage Scanner` | Setzt Reclaim-Token **vor** Kampfbeginn / entfernt Corruption **nach** dem Sieg `[§7.3]`. Keine Kampfwirkung. |

Auch `Combat Replicators` (Basic) und `Hyperdrive` sowie `Cloning` gehören funktional in diese Gruppe.

**Effekt der Reduktion:** statt 14 × 3 × 2 Seiten = 84 Technologie-Zuständen bleiben pro Kampf maximal **8 Invader- + 5 Defender-Schalter** — und in einem typischen Kampf sind davon 2–3 gesetzt.

---

## 5. Spieler-Entscheidungen (`choices`)

| Feld | Wertebereich | Gilt für | Sichtbarkeitsbedingung | Häufigkeit |
|---|---|---|---|---|
| `carrierDeploysCorvettes` | bool | INV | ≥1 Carrier FP. Praktisch **immer ja** — Default `true` `[§3.0]` | selten (als bewusste Entscheidung) |
| `returnTradeToken` | bool | INV (DEF im Skirmish) | `Autonomous Drones` ≠ NONE. Echte Kosten-Nutzen-Entscheidung des Spielers | selten |
| `spendEnergyForDSM` | bool | INV | `Deep Space Missiles = BASIC` **und** `adjacent… ≥ 1` `[§3.3]` | selten |
| `destroyerBonusSalvoStep` | 1..n | INV | ≥1 Destroyer FP. Der einmalige +1 Damage pro Destroyer FP, Timing frei `[§4.5]` | mittel (wenn Destroyer im Spiel) |
| `bombardUsed` | bool | INV | Uplift-Focus mit Bombard-Aktion `[§7.4]` | selten |
| `bombardMaterialsSpent` | 0, 3, 6, 9 … | INV | `bombardUsed` | selten |
| `bombardAbsorptionSplit` | {approach: n, salvo: m}, n+m = ⌊Materials/3⌋ | INV | `bombardMaterialsSpent` ≥ 3 | selten |

**Kritische Anmerkung:** `destroyerBonusSalvoStep` und `bombardAbsorptionSplit` sind keine Informationen, die der Nutzer *hat* — es sind Optimierungsprobleme, die er *lösen* müsste. Bei einem deterministischen Kampf kann der Resolver beide Varianten durchrechnen und die beste wählen. Als Eingabefeld sind sie ein Designfehler; als optionaler „Override" im Log sind sie sinnvoll. Das nimmt der komplexesten Maske drei Felder.

---

## 6. Skirmish-spezifische Felder

Nur bei `combatType = Voidborn vs Player`.

| Feld | Wertebereich | Gilt für | Sichtbarkeitsbedingung | Häufigkeit |
|---|---|---|---|---|
| `voidbornFP` (Skirmish) | 0–~12 | INV | Skirmish. Basis = Corruption auf Civ-Tracks + Agenda-Slots `[§6.2]` | hoch (im Skirmish) |
| `cycle` | 1 / 2 / 3 | – | Skirmish; +1 Voidborn FP in Cycle 2 und 3 `[§6.2]` | hoch (im Skirmish) |
| `crisisModifier` | −n … +n | INV | Skirmish **und** Co-op/Solo-Modus `[§6.2, Errata]` | selten |
| `gameMode` | Competitive / Co-op-Solo | – | nur nötig, wenn `crisisModifier` erfasst werden soll | selten |

Sonderregel: Voidborn mit 0 FP **verlieren automatisch** `[Errata §6.2]` — die UI sollte 0 nicht als ungültige Eingabe blockieren.

---

## 7. Umfangsbilanz

| Szenario | Sichtbare Pflichtfelder | Theoretisch mögliche Felder |
|---|---|---|
| Player vs Fallen House | 1 (Corvette FP) | ~20 |
| Player vs Voidborn (Worked Example §8) | 3 | ~22 |
| Voidborn vs Player (Skirmish) | 3 | ~20 |
| **Player vs Player, Vollausbau** | 6–8 | **~50** |

Der Abstand zwischen diesen beiden Spalten ist das eigentliche Designproblem: In jedem konkreten Kampf sind rund **80–90 % aller Felder irrelevant**, aber *welche* 80 % hängt an drei verschachtelten Bedingungsebenen.

---

## Design-Kernprobleme

**K1 — Die Sichtbarkeitslogik ist dreistufig verschachtelt.**
`combatType` → `Fleet Power` → `Technology` → `choice`. Beispiel: `spendEnergyForDSM` ist nur sichtbar, wenn die Seite Invader ist **und** DSM auf Basic steht **und** mindestens ein benachbarter Sektor eine Shipyard/Starbase hat. Ein statisches Formular zeigt dauerhaft rund 70 % tote Felder; ein rein dynamisches Formular springt bei jeder Eingabe in der Höhe und zerstört das Muskelgedächtnis. Beide Extreme sind falsch — die Entwürfe müssen dazwischen unterschiedliche Antworten finden.

**K2 — Die Corvette-Abhängigkeit erzwingt eine Eingabereihenfolge.**
`Shields`, `Torpedoes` und `Basic Targeting` sind ohne Corvette FP wirkungslos. Fleet Power muss also **vor** den Technologien erfasst werden — oder die Technologien müssen sich visuell an die Corvette-Zeile hängen, statt in einer eigenen Sektion zu leben. Letzteres halte ich für die stärkere Idee: die drei Corvette-Upgrades gehören direkt an die Corvette, nicht in eine Technologie-Liste.

**K3 — Die Zahlen-Buttons 1–3 aus dem Briefing decken den Median, nicht den Kopf der Verteilung.**
Fleet Power geht bis 14; realistisch liegt Corvette FP zwischen 2 und 9, die übrigen Typen zwischen 1 und 6. 1–3 plus ± bedeutet für 7 Corvette FP: Tap „3", dann viermal „+" = 5 Interaktionen für **eine** Zahl. Bei fünf Flottentypen ist das der teuerste Teil der ganzen Maske. Alternativen, die die Entwürfe gegeneinander ausspielen sollten: ein 0–9-Ziffernraster (immer 1 Tap), Tap-to-increment direkt auf dem Schiffs-Icon mit Long-Press zum Zurücksetzen, oder ein horizontaler Wert-Streifen. Ich werde die Briefing-Variante in genau einem Entwurf ernsthaft bauen und in den anderen beiden gegen sie antreten lassen.

**K4 — Technologien sind partie-stabil, Fleet Power ist kampf-flüchtig.**
Die eigenen Technologien ändern sich in einer Partie vielleicht fünfmal, die Flottenstärke in **jedem** Kampf. Sie in derselben Maske gleichrangig nebeneinanderzustellen, bestraft den Nutzer bei jedem Folgekampf mit derselben Arbeit. Ein einmal konfiguriertes Spieler-Profil, das über Kämpfe hinweg gilt, ist die naheliegende Antwort — nur in-memory, da `localStorage` in den Prototypen ausgeschlossen ist.

**K5 — Der Vier-Masken-Ablauf ist für drei von vier Kampfarten überdimensioniert.**
Bei `Player vs Fallen House` hat Maske 3 **null** Eingabefelder. Bei `Player vs Voidborn` sind es zwei Zahlen. Nur PvP rechtfertigt zwei volle Masken. Eine Maske stur anzuzeigen, weil das Ablaufmodell sie vorsieht, kostet mindestens zwei Taps pro Kampf. Mindestens ein Entwurf sollte den Ablauf an der Kampfart ausrichten, statt umgekehrt.

**K6 — Invader und Defender sind keine spiegelbildlichen Formulare.**
Sector Defenses und Starbases nur DEF, Autonomous Drones und Basic DSM nur INV, Energy Cells nur DEF, der Destroyer-Approach-Damage nur INV, und Sentry/Dreadnought/Carrier bedeuten je nach Seite etwas anderes. Ein gemeinsames Komponenten-Layout für beide Seiten wäre bequem zu bauen und in der Sache falsch. Die Farbcodierung Invader/Defender muss diesen Unterschied tragen.

**K7 — Zwei „Eingaben" sind in Wahrheit Rechenaufgaben.**
`destroyerBonusSalvoStep` und `bombardAbsorptionSplit` sollte der Resolver selbst optimieren (siehe §5). Damit fallen sie aus der Eingabemaske heraus und tauchen nur noch im Kampflog als „Destroyer bonus salvo used in step 2 (optimal)" auf — mit optionalem Override.

**K8 — Genau ein Feld erfordert einen Blick auf die Karte.**
`adjacentSectorsWithShipyardOrStarbase` ist die einzige Angabe, die der Nutzer nicht von seinem eigenen Tableau ablesen kann. Es ist zugleich selten. Es gehört tief hinter eine Aufklapp-Ebene und darf nie im Standardsichtfeld stehen.

**K9 — Fehleingaben sind nur begrenzt erkennbar.**
Prüfbar sind: Summe aller FP ≤ 14, Starbases ≤ 2, Voidborn FP ≤ 9 außerhalb des Skirmish. **Nicht** prüfbar ist die Token-Aufteilung (kampfirrelevant) — die UI darf hier keine Regel erfinden. Ein stiller Sanity-Hinweis ist besser als eine harte Sperre, weil Sonderregeln existieren.

**K10 — Das Live-Ergebnis muss auch unvollständige Eingaben verkraften.**
Das Floating-Kurzergebnis soll sich laut Briefing bei jeder Eingabe aktualisieren. Direkt nach Maske 1 sind aber beide Seiten leer, und 0 FP vs. 0 FP ist ein Tie. Das Element braucht einen ehrlichen „unvollständig"-Zustand, sonst zeigt es beim ersten Blick eine Falschaussage.

---

## Offene Fragen an dich

1. **Fallen House:** Ich gehe davon aus, dass die Defender-Seite dort ausschließlich aus den zwei gedruckten Sector Defenses besteht — keine Fleet Power, keine weiteren Installationen, keine Technologien, keine Salvo Steps `[§3.6]`. Kann ein Fallen-House-Sektor in deiner Praxis zusätzliche Sector Defenses oder Fleet Power tragen?
2. **Die sechs kampfneutralen Technologien** (§4.2): raus aus der Eingabe, oder aus Vollständigkeitsgründen als deaktivierte Anzeige behalten? Ich empfehle: raus.
3. **Bombard (Uplift Focus):** überhaupt abbilden? Es kostet drei Felder für einen sehr seltenen Fall. Ich würde es in Phase 1 in einem „Advanced"-Bereich unterbringen und in mindestens einem Entwurf ganz weglassen.
4. **Skirmish-Voidborn-FP:** Soll die App die Zahl aus Corruption + Cycle + Krisenmodifikatoren herleiten, oder gibst du die fertige Zahl direkt ein? Das entscheidet über drei zusätzliche Felder.
5. **Spieler-Profil (K4):** Ist die Idee interessant, dass Technologien einmal pro Partie gesetzt werden und über Kämpfe hinweg gelten? Das ist die stärkste Reduktionsstrategie, die ich sehe — sie braucht aber später `localStorage` und in Phase 1 einen In-Memory-Ersatz.
6. **Rolle des Voidborn im Skirmish:** Dein Briefing nennt Maske 2 „Angreifer". Im Skirmish ist der Angreifer der Voidborn und der Spieler der Verteidiger. Ich behalte die Reihenfolge Invader → Defender bei, sodass Maske 2 im Skirmish nur eine einzige Zahl enthält. Einverstanden, oder soll im Skirmish die Spielerseite zuerst kommen?

---

## Entscheidungen (freigegeben)

| # | Frage | Entscheidung |
|---|---|---|
| 1 | Fallen House | Defender = ausschließlich die zwei gedruckten Sector Defenses. Keine FP, keine weiteren Installationen, keine Salvo Steps. |
| 2 | Kampfneutrale Technologien (§4.2) | **Raus aus der Eingabe.** Es bleiben 8 INV- / 5 DEF-Schalter. |
| 3 | Bombard (Uplift Focus) | In einen **Advanced**-Bereich ausgelagert. |
| 4 | Skirmish-Voidborn-FP | **Direkte Zahleneingabe.** Keine Herleitung aus Corruption/Cycle/Krise → `cycle`, `crisisModifier`, `gameMode` entfallen als Felder. |
| 5 | Spieler-Profil (K4) | **Ja.** Auswahl auf Maske 1, inkl. Option „No profile". Das Profil **voraktiviert** Technologien; in Maske 2/3 bleibt jede Technologie frei schaltbar. Abweichungen vom Profil werden sichtbar markiert. |
| 6 | Voidborn-Rolle im Skirmish | Reihenfolge Invader → Defender bleibt. Maske 2 enthält im Skirmish nur eine Zahl. |

Daraus folgt für die Entwürfe:

- Die Technologie-Sektion schrumpft auf **8 Invader-Schalter** (`Targeting`, `Shields`, `Torpedoes`, `Destroyers` basic/improved, `Deep Space Missiles`, `Autonomous Drones`, `Combat Replicators`, + Bombard in Advanced) und **5 Defender-Schalter** (`Targeting`, `Shields`, `Torpedoes`, `Deep Space Missiles` improved, `Energy Cells`).
- Die Skirmish-Sonderfelder aus §6 entfallen bis auf `voidbornFP`.
- Die Fleet-Typ-Zeilen für Sentry/Destroyer/Dreadnought/Carrier hängen nicht mehr an einer Technologie-Abfrage, sondern am Profil (bzw. sind ohne Profil alle sichtbar).

---

**Phase A abgeschlossen und freigegeben.**
