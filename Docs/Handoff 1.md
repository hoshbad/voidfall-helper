# Handoff — Voidfall Combat Helper, UI-Phase
*Erstellt: 2026-07-30 · ca. 8 nennenswerte Turns*

## Ziel
**Aktuelles Hauptziel:** `Output/prototype-v2.html` bauen — ein konsolidierter Prototyp, der die drei explorativen Entwürfe nach dem Feedback des Users zusammenführt. Weiterhin **keine Kampflogik**, nur Eingabe-UI plus hartcodierte Dummy-Ergebnisse.

**Teilziele:**
- erledigt — Phase A: Eingabe-Inventar aus COMBAT-RULES.md §9 abgeleitet, vom User freigegeben
- erledigt — Phase B: Design-Tokens aus der offiziellen App abgeleitet
- erledigt — Phase C/D/E: drei Entwürfe gebaut, geprüft, verglichen; User hat entschieden
- **offen** — `Output/prototype-v2.html` nach der unten stehenden Spezifikation bauen
- offen — `Output/design-tokens.css` um neue Tokens ergänzen (Next-Button, Reset, Tie-Hinweis)
- später (nicht diese Session) — Resolver / echte Kampfberechnung

## Kontext (über mehrere Turns aufgebaut)

### Projekt
- Arbeitsverzeichnis: `H:\OneDrive\Kram\Claude Code\Voidfall-Helper` — **kein Git-Repo**
- Input-Dateien (lesen in dieser Reihenfolge): `README-CACHE.md`, `Briefing.md`, `COMBAT-RULES.md`, `Prompt 1 – UI-Entwuerfe.md`
- **Dateien ausschließlich in `Output/` anlegen oder ändern.** Nichts außerhalb anfassen.
- Der User arbeitet auf Deutsch, die **UI ist durchgehend Englisch**, Spielbegriffe exakt wie im Regelwerk (`Fleet Power`, `Corvette`, `Sentry`, `Destroyer`, `Dreadnought`, `Carrier`, `Sector Defense`, `Starbase`, `Approach step`, `Salvo step`, `Basic`/`Improved`).

### Harte Randbedingungen
- Eine einzige selbstständig lauffähige `.html`, CSS und JS inline. Keine Build-Tools, keine npm-Deps, **keine externen CDN-Requests, keine externen Fonts**. Muss per Doppelklick und offline auf iPhone/iPad laufen.
- **Kein `localStorage`** in den Prototypen, State nur im Speicher.
- **Keine Kampfberechnung.** Ergebnis und Log sind hartcodierte Dummy-Werte aus COMBAT-RULES.md §8 (Worked Example). Das Floating-Kurzergebnis nutzt einen bewusst simplen Platzhalter (Summenvergleich der Fleet Power), **keinen Resolver**.
- Zielgeräte: iPhone 15 Pro 393 × 852 (primär), iPad 820 × 1180 und 1180 × 820. Breakpoint für Nebeneinander-Layout: **720 px**.

### Fachlicher Kernbefund (wichtigstes Ergebnis von Phase A)
COMBAT-RULES.md §9 listet 14 Technologien × 3 Zustände × 2 Seiten. **Davon verändern nur 8 das Kampfergebnis.** Kampfneutral und deshalb komplett aus der UI entfernt: `Sentries`, `Dreadnoughts`, `Carriers`, `Starbases` (Basic/Improved ändern nur FP-Limits *pro Token* — Token sind laut §1.1 kampfirrelevant), `Escape Pods` (recalled FP verlässt den Sektor so oder so), `Salvage Scanner` (wirkt vor/nach dem Kampf). `Combat Replicators` wurde auf Wunsch des Users zusätzlich entfernt (siehe Entscheidungen).

**Verbleibende Technologien — Invader (6):** Targeting, Shields, Torpedoes, Destroyer tile, Deep Space Missiles, Autonomous Drones.
**Defender (5):** Targeting, Shields, Torpedoes, Deep Space Missiles, Energy Cells.

Weitere Befunde, die die UI tragen:
- Targeting/Shields/Torpedoes sind **ohne Corvette Fleet Power wirkungslos** → sie gehören an die Corvette-Zeile, nicht in eine generische Technologie-Liste. (Ausnahme: Improved Targeting braucht keine Corvetten.)
- `destroyerBonusSalvoStep` und `bombardAbsorptionSplit` aus §9 sind **keine Eingaben, sondern Optimierungsprobleme** — der deterministische Resolver soll sie selbst optimal wählen. Nicht als Formularfeld bauen.
- Sentry bedeutet je nach Seite etwas völlig anderes (Defender: 1 Approach Damage/FP, **0 Initiative**; Invader: 1 Initiative/FP, kein Approach Damage).
- Fallen House als Defender = ausschließlich 2 gedruckte Sector Defenses, keine FP, keine Techs, keine Salvo Steps.

### Nutzungsprofil des Users (kippte eine frühere Empfehlung)
14 Fleet Power ist theoretisches Maximum, real fast nie. **Corvettes typisch 1–6, alle anderen Typen 1–3.** Der Normalfall ist Corvettes + *ein* weiterer Schiffstyp, selten zwei. Gemischte Flotten sind selten. Daraus folgt: Der Tap-Vorsprung des Ziffernblocks (Entwurf 1) stammte rechnerisch komplett aus Werten > 3 und mehreren Flottentypen — beides trifft auf den User nicht zu.

### Farbpalette — abgetastet, nicht geraten
Die offizielle App `https://voidfallapp.mindclashgames.com/` ist eine **Flutter-CanvasKit-App**: rendert vollständig in ein WebGL-Canvas, kein DOM, kein auslesbares Stylesheet, kein Screenshot möglich. Palette wurde per Pixel-Sampling aus ihren Asset-Grafiken gewonnen (Assets liegen unter `/assets/assets/<name>`, Liste unter `/assets/AssetManifest.json`; im Browser in ein Canvas gezeichnet, Farbhistogramm quantisiert). **Nichts heruntergeladen oder eingebettet.**

Belegte Werte: `invader.png` → rot `#e00020` · `defender.png` → cyan `#30b0e0` · alle Flotten-Icons → bernstein `#f0a000` · `voidborn_power.png`/`Corruption.png` → orange `#f07030` · Panel `#302030`/`#403040` · Damage `#e03020` · Absorption `#0050a0`+`#30b0e0` · Sector Defense `#a01060` · Starbase `#302080` · Shipyard `#608060` · Hintergrund `#000000`/`#400030`/`#501040`.

**Wichtigste Übernahme:** Die App codiert **Basic = dunkles Pflaume `#302030`, Improved = helles Silber `#d0c0c0`** (`BackgroundTechBasic.png` vs. `BackgroundTechImproved.png`). Diese Codierung trägt die Technologie-Zustände.

**Meine Ergänzung, nicht belegt:** Farben pro Flottentyp (`--fleet-sentry` teal, `--fleet-dreadnought` blau, `--fleet-carrier` koralle, `--fleet-destroyer` violett), abgeleitet aus der jeweiligen Technologie-Kartenillustration. In der Referenz-App sind alle Flotten bernstein. User hat "Farben und Schriften sind gut" bestätigt.

Hausschrift nicht übernehmbar (keine externen Fonts) → System-Stack, Sci-Fi-Charakter über Versalien, Laufweite, Farbe.

### Gemessene Tap-Zahlen (am laufenden Prototyp, nicht geschätzt)
Standard-Szenario = Worked Example §8. Komplex = PvP mit gemischten Flotten.

| Entwurf | Standard | Standard mit Profil | Komplex |
|---|---|---|---|
| 1 Keypad | 7 | 6 | 24 |
| 2 Stack | 8 | 7 | 30 |
| 3 Sector | 9 | 6 | 25 |

### Spezifikation prototype-v2 (mit dem User abgestimmt und freigegeben)

**Basis:** Entwurf 2 (`draft-2-stack.html`) — Stepper inline, jeder Tap wirkt lokal, kein Modus, progressive Offenlegung über die Chip-Leiste „+ Fleet type".

**Maskenstruktur (4 statt bisher 4, aber anders geschnitten):**
- `0` Profiles · `1` Type · `2` Configuration · `3` Result
- **Start auf Maske 1.** Maske 0 ist optional über die Breadcrumb erreichbar (typisch einmal pro Partie).
- Maske 1: ein Tap auf die Kampfart navigiert direkt auf Maske 2. **Kein Next-Button auf Maske 1** (würde der Ein-Tap-Regel widersprechen).
- Masken 0 und 2 bekommen unten rechts einen **Next-Button**, damit man dem Fluss von oben nach unten folgen kann statt hochzuscrollen.
- **Maske 2 verschmilzt die alten Masken 2+3:** Invader über Defender auf dem Smartphone, ab 720 px nebeneinander.

**Zahleneingabe:**
- Die ±-Buttons wandern aus der Stepper-Reihe **hoch in die Kopfzeile der Unit**, direkt neben die große Zahl.
- Dadurch steht die volle Breite für die Schnellwahl frei: **Corvette `[1][2][3][4][5][6]`** (≈49 px pro Button bei 393 px Viewport), **alle anderen Typen `[1][2][3]`** (≈103 px).
- Gerechnete Innenbreite einer Unit-Zeile bei 393 px Viewport: **321 px**. `[−][1]…[6][+]` in einer Reihe ergäbe 36 px pro Button → verletzt die 44-px-Regel, deshalb die Verlagerung der ±.

**Technologien:**
- **Dreier-Segmente** (Zielzustand direkt antippen), nicht die zyklierenden Chips aus Entwurf 1. Begründung: immer genau ein Tap, Zustand lesbar statt aus Farbe dekodierbar, degradiert sauber auf zwei Buttons wo es nur zwei Zustände gibt (`Energy Cells: None | Owned`, `Destroyer tile: Basic | Improved`).
- Corvette-Upgrades bleiben an die Corvette-Zeile angedockt, Destroyer-Stufe an die Destroyer-Zeile.
- **Deep Space Missiles bekommt ein flaches Steuerelement mit Label auf eigener Zeile:**
  - Invader: `[Off][Basic][Imp 1][Imp 2]` (4 Buttons à ~75 px) + Fußnote *„Basic spends 1 Energy and needs an adjacent Shipyard or Starbase."*
  - Defender: `[Off][Imp 1][Imp 2]` inline (Basic wirkt beim Defender nicht)
  - **Immer voller Umfang sichtbar, auch ohne Profil** — das Profil wählt nur vor. Damit entfallen die Felder `adjacentSectorsWithShipyardOrStarbase` und `spendEnergyForDSM` ersatzlos.

**Profile:**
- 8 hartcodierte Beispiel-Profile nach Häusern (Valnis · Shields, Belitan · Targeting, Zenor · Destroyers, Shiveus · Dreadnoughts, Cortozaar · Torpedoes, Fenrax · Carriers, Marqualos · Drones) plus **„No profile"**.
- Das Profil **voraktiviert** nur. In der Kampfmaske bleibt jede Technologie frei schaltbar. Abweichung vom Profil wird mit einem kleinen cyanfarbenen Punkt markiert.
- Profile überleben den Reset.

**Seitentausch:**
- Bei `Player vs Voidborn` und `Voidborn vs Player` muss man die Seiten tauschen können, **ohne eingetragene Werte zu verlieren**.
- Umsetzung: Datenmodell als **Spielerseite / Voidborn-Seite** statt Invader/Defender — dann ist der Tausch verlustfrei, es dreht sich nur die Rolle. Nur-Invader- bzw. Nur-Defender-Technologien bleiben gespeichert und werden lediglich ein-/ausgeblendet.
- **Der Tausch umgeht den Typwechsel-Reset**, obwohl er technisch ein Typwechsel ist.

**Reset:**
- Icon-Button **mittig in der Kopfzeile**, von jeder Maske erreichbar. Rückfrage vor Ausführung. Danach zurück auf Maske 1, alle Felder leer, **Profile bleiben**.
- Zusätzlicher Reset auf Maske 3 (siehe unten).
- Das „dummy"-Etikett am Kurzergebnis **entfällt** — es kostet ~30 px, die für den Reset-Button gebraucht werden. Kopfzeilen-Rechnung bei 393 px: 4 Breadcrumb-Chips (182) + Reset (44) + Kurzergebnis ohne Etikett (92) + Abstände/Padding (40) = 358 px.

**Typwechsel-Reset:** Bei Auswahl eines neuen Kampftyps alle Werte zurücksetzen — **aber nur, wenn sich der Typ tatsächlich ändert**. Erneutes Antippen desselben Typs löscht nichts. Nach dem Reset die Profil-Vorbelegung neu anwenden.

**Maske 3 (Result):**
- Zweigeteilt: Ergebnis oben, Kampflog darunter.
- **Alle Log-Steps per Default aufgeklappt.**
- **Back + Reset zweimal**: einmal unter dem Ergebnis-Block, einmal unter dem Log — vom User ausdrücklich doppelt gewünscht, damit man nach dem Lesen des Logs nicht hochscrollen muss.
- **Tie-Hinweis:** Wenn das Ergebnis ein Unentschieden ist, Hinweiszeile einblenden: *„Tie — with Improved Combat Replicators you may deploy 1 Fleet Power and win instead."*

**Textauslagerung / Lokalisierung:**
- Ein einziger **`<script type="application/json" id="strings">`-Block ganz oben in der Datei**, alle Sprachen nebeneinander, per `JSON.parse` gelesen.
- **`fetch()` auf eine externe JSON scheidet aus** — über `file://` von der Same-Origin-Policy blockiert (Safari und Chrome). Das ist der Weg, den man zuerst probiert; er scheitert genau im Zielszenario (Doppelklick, offline, iPhone).
- Zwei getrennte Namensräume: **`terms.*`** für Spielbegriffe (regelwerkstreu, dürfen nicht frei umformuliert werden) und **`ui.*`** für Prosa.
- Log-Sätze als **Vorlagen mit Platzhaltern**, z. B. `"salvo.simultaneous": "Initiative {a} vs {b} — equal, so both sides fire simultaneously."` Dazu eine kleine `t(key, params)`-Funktion.
- Späterer Umstieg auf Geschwister-Dateien `strings.de.js` per `<script src>` bleibt möglich (funktioniert über `file://`, anders als `fetch`).

### Testumgebung — Fallstricke
- **Screenshots sind in dieser Umgebung nicht möglich.** Der Browser-Pane wird nicht dargestellt, kompositiert keine Frames, jeder Screenshot-Versuch läuft in einen 5-s-Timeout. Ersatz: automatisiertes Geometrie-Audit per `javascript_tool` — prüft `scrollWidth − innerWidth`, Bounding-Boxen aller sichtbaren `button`/`select`/`summary` gegen 44 px, und Elemente, die über den Viewport hinausragen. Das Skript treibt die App zusätzlich durch alle Masken.
- **Der Preview-Pane behält den JS-Kontext über `location.reload()` hinweg.** State aus einem vorherigen Testlauf bleibt erhalten und verfälscht Messungen. Vor jedem Lauf den State explizit zurücksetzen.
- **Versteckte Masken bleiben im DOM.** `document.querySelector('.chip')` trifft Elemente der unsichtbaren Maske. Test-Selektoren immer auf `.screen.on` scopen.
- Beim Tablet-Breakpoint (≥720 px) rendern beide Seiten in *beiden* Masken — Test-Selektoren treffen sonst die falsche Seite.

## Produzierte Artefakte
- `Output/00-INPUT-INVENTORY.md` — vollständiges Eingabe-Inventar, 10 Design-Kernprobleme (K1–K10), Entscheidungstabelle. Vom User freigegeben.
- `Output/design-tokens.css` — Design-Tokens mit dokumentierter Herkunft jedes Farbwerts. Muss für v2 um Tokens für Next-Button/Reset/Tie-Hinweis ergänzt werden.
- `Output/draft-1-keypad.html` — Ziffernblock 0–14 in der Daumenzone, Auto-Advance. **Nicht mehr anfassen.**
- `Output/draft-2-stack.html` — Schnellwahl 1|2|3 + ±, inline. **Basis für v2. Nicht mehr anfassen** — v2 ist eine neue Datei.
- `Output/draft-3-sector.html` — Tap/Wisch/Halten auf Schiffskacheln. **Vom User verworfen** (funktioniert am PC nicht, zu fummelig). Nicht weiterverfolgen.
- `Output/01-DRAFT-COMPARISON.md` — Vergleich, Tap-Tabelle, Empfehlung, offene Fragen.

## Entscheidungen
- **Entwurf 2 wird Basis, nicht Entwurf 1** — Warum: Das Nutzungsprofil des Users (Corvettes + 1 Typ, Werte 1–3) entwertet den Keypad-Vorteil, der komplett aus Werten > 3 und Mischflotten stammte. Zusätzlich hat Entwurf 2 als einziger keinen Modus, in dem ein Tap woanders landen kann. Verworfen: meine ursprüngliche Empfehlung „Keypad als Grundgerüst".
- **Entwurf 3 komplett verworfen** — Warum: Geste (Tap/Wisch/Halten auf derselben Fläche) funktioniert am PC nicht und ist dem User zu fummelig. Sein Technologie-Modell (Profil-Vorbelegung) wird aber übernommen.
- **Dreier-Segment statt zyklierender Chip für Technologien** — Warum: immer ein Tap statt bis zu zwei, Zustand lesbar statt aus Farbe zu dekodieren, degradiert sauber auf zwei Buttons. Kosten: ~100 px mehr pro Seite. Akzeptiert, weil das Profil den Bereich in den meisten Kämpfen überflüssig macht.
- **6 Zahlen-Buttons nur für Corvette, ± wandern in die Kopfzeile** — Warum: `[−][1]…[6][+]` in einer Reihe ergibt 36 px pro Button und verletzt die 44-px-Regel; ohne ± passen 6 Buttons mit 49 px. Spart bei Corvette 6 drei Taps.
- **Combat Replicators aus der Eingabe entfernt, dafür Tie-Hinweis auf Maske 3** — Warum: Der User hielt sie für ergebnisneutral; das stimmt für Basic, aber **Improved wandelt laut Glossary S. 25 / §5.3 ein Unentschieden in einen Sieg**. Kompromiss: null Eingabekosten, Ausgabe bleibt korrekt. User hat zugestimmt.
- **Sechs kampfneutrale Technologien ersatzlos aus der UI** — Warum: verändern nachweislich keine Zahl im Resolver (Herleitung siehe Kontext). Reduziert 84 Technologie-Zustände auf max. 11 Schalter.
- **`destroyerBonusSalvoStep` und `bombardAbsorptionSplit` sind keine Eingabefelder** — Warum: Optimierungsprobleme, die der deterministische Resolver selbst lösen kann. Erscheinen später nur im Log mit optionalem Override.
- **Skirmish-Voidborn-FP als direkte Zahleneingabe** — Warum: User will die fertige Zahl eintragen statt Herleitung aus Corruption + Cycle + Krisenmodifikatoren. Damit entfallen `cycle`, `crisisModifier`, `gameMode`.
- **Bombard bleibt im Advanced-Bereich** — Warum: sehr selten, kostet drei Felder. User hat der Auslagerung zugestimmt.
- **Start auf Maske 1, nicht auf Maske 0** — Warum: Start auf Profiles würde jedem Kampf einen Tap hinzufügen und die Ein-Tap-Regel für die Kampfart faktisch aufheben.
- **Datenmodell Spielerseite/Voidborn-Seite statt Invader/Defender** — Warum: macht den Seitentausch bei Voidborn-Kämpfen verlustfrei statt destruktiv.
- **`fetch()`-basierte Lokalisierung ausgeschlossen** — Warum: Same-Origin-Policy blockiert es über `file://`, also genau im Zielszenario.

## Blocker
- **Keine visuelle Prüfung möglich.** Screenshots scheitern in dieser Umgebung (Details siehe Kontext). Das Geometrie-Audit deckt Layout-Brüche und Touch-Ziele ab, **nicht** Ästhetik, Kontrast oder Lesbarkeit. Der User muss die Datei selbst per Doppelklick öffnen und beurteilen.
- **Kein Git.** Es gibt keine Versionierung; die drei alten Entwürfe sind die einzige Rückfallebene. Deshalb v2 als **neue Datei** anlegen, nicht `draft-2-stack.html` überschreiben.
- Offene Frage aus dem Vergleichsdokument, vom User noch nicht beantwortet: sollen die **Farben pro Flottentyp** (meine Ergänzung) bleiben oder auf einheitliches Bernsteingold zurück? Er hat „Farben und Schriften sind gut" gesagt — ich lese das als Zustimmung, es ist aber nicht explizit bestätigt.

## Nächste Schritte
1. `Output/draft-2-stack.html` lesen — es ist die Codebasis, aus der v2 hervorgeht (Tokens-Block, Icon-Sprite, Profil-Logik, Stepper, Tri-Segment sind dort bereits vorhanden und wiederverwendbar).
2. `Output/00-INPUT-INVENTORY.md` lesen, besonders die Entscheidungstabelle und K1–K10.
3. `Output/prototype-v2.html` nach der Spezifikation oben bauen. Kopfkommentar mit Kernidee und bewussten Opfern beibehalten (Konvention der drei Entwürfe).
4. `Output/design-tokens.css` um die neuen Tokens ergänzen und den Inline-Block in v2 synchron halten.
5. Geometrie-Audit bei 393 × 852, 820 × 1180 und 1180 × 820 über alle vier Masken fahren; Konsole auf Fehler prüfen. State vor jedem Lauf zurücksetzen, Selektoren auf `.screen.on` scopen.
6. Tap-Zählung für Standard- und Komplex-Szenario **am laufenden Prototyp messen** (Skript treibt echte DOM-Elemente, danach Zustand gegen das Szenario verifizieren) und gegen die Tabelle oben stellen.
7. Ergebnis knapp berichten: was gebaut wurde, gemessene Tap-Zahlen, Audit-Ergebnis, verbliebene offene Punkte.