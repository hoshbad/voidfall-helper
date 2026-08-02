# Handoff — Voidfall Combat Helper, Profilfunktionalität
*Erstellt: 2026-07-31 · ca. 2 nennenswerte Turns in dieser Session, Vorgeschichte siehe Kontext*

## Ziel
**Aktuelles Hauptziel:** Die **Profilfunktionalität** in `Output/prototype-v2.html` ausbauen. Masken 1 (Type), 2 (Configuration) und 3 (Result) sind vom User abgenommen und stehen. Maske 0 (Profiles) ist der nächste Arbeitsbereich.

**Teilziele:**
- erledigt — `Output/prototype-v2.html` nach Spezifikation gebaut, Geometrie-Audit sauber, vom User für Masken 1–3 abgenommen
- erledigt — `Output/design-tokens.css` um Next-/Back-/Reset-/Tie-/Scrim-Tokens ergänzt
- **offen** — Profilfunktionalität ausarbeiten (Umfang noch nicht spezifiziert — **im neuen Chat zuerst mit dem User klären, was genau er will**)
- später — Resolver / echte Kampfberechnung

## Kontext (über mehrere Turns aufgebaut)

### Projekt
- Arbeitsverzeichnis: `H:\OneDrive\Kram\Claude Code\Voidfall-Helper` — **kein Git-Repo, keine Versionierung**
- Input-Dateien: `README-CACHE.md`, `Briefing.md`, `COMBAT-RULES.md`, `Prompt 1 – UI-Entwuerfe.md`, `Prompt 2 – Feedback zu Entwuerfen.md`
- **Dateien ausschließlich in `Output/` anlegen oder ändern.** Nichts außerhalb anfassen.
- User arbeitet auf Deutsch, die **UI ist durchgehend Englisch**, Spielbegriffe exakt wie im Regelwerk.
- Harte Randbedingungen: eine einzige selbstständig lauffähige `.html`, CSS und JS inline, **keine externen Requests, keine Fonts, keine Kampfberechnung**. Muss per Doppelklick und offline auf iPhone/iPad laufen. Zielgeräte iPhone 393×852 (primär), iPad 820×1180 und 1180×820. Breakpoint 720 px.

### Stand von prototype-v2.html (~1000 Zeilen, lauffähig)
Aufbau in 13 nummerierten Abschnitten im Skript: 1 Texte, 2 Stammdaten, 3 Zustand, 4 Mini-Helfer, 5 Profil anwenden, 6 Navigation, 7 Maske 0, 8 Maske 1, 9 Maske 2, 10 Kurzergebnis, 11 Maske 3, 12 Reset, 13 Start.

**Datenmodell** — kein Invader-/Defender-Datensatz, sondern zwei neutrale Slots plus Rollenzuordnung:
```
S.data    = {p: blank(), q: blank()}
S.profile = {p: "none", q: "none"}      // Profil hängt am SLOT, nicht an der Rolle
S.shown   = {p: ["corvette"], q: [...]}  // progressiv sichtbare Flottentypen
S.roles   = {inv: "p", def: "q"}         // Swap dreht nur das um
S.advOpen = {p: false, q: false}
```
Zugriff über `slotOf(role)`, `D(role)`, `profOf(role)`. Prädikate: `isVoidborn(role)`, `isFallen(role)`, `isPlayer(role)`, `canSwap()`.

**Profil-relevante Funktionen (das ist der Arbeitsbereich):**
- `PROFILES` — 9 Einträge: `none` plus 8 Häuser (`valnis` Shields, `belitan` Targeting, `cortozaar` Torpedoes, `zenor` Destroyers, `shiveus` Dreadnoughts, `fenrax` Carriers, `astoran` Sentries, `marqualos` Drones). Je `{name, fleets:[], tech:{}}`.
- `applyProfile(slot)` — setzt `tech` auf Default zurück, überlagert `p.tech`, baut `S.shown[slot]` neu. Bei `none`: alle Flottentypen verfügbar, sichtbar nur die mit Wert > 0.
- `deviates(role, key)` — Abweichung vom Profil → cyanfarbener Punkt an der Zeile. Beachtet `destroyers`-Default 1 statt 0.
- `renderProfiles()` — Maske 0. Zeigt pro Rolle eine Karte; Voidborn-/Fallen-Seiten bekommen statt des Selects einen Hinweistext.
- Reset (`doReset()`) leert alles, **behält aber `S.profile`** und ruft `applyProfile` erneut auf.
- Typwechsel-Reset (`setType`) leert nur bei **echtem** Typwechsel und wendet das Profil danach neu an.

**Fachlicher Kernbefund (trägt die ganze UI):** COMBAT-RULES.md §9 listet 14 Technologien × 3 Zustände × 2 Seiten; **nur 8 verändern das Kampfergebnis**. Kampfneutral und entfernt: `Sentries`, `Dreadnoughts`, `Carriers`, `Starbases`, `Escape Pods`, `Salvage Scanner`, `Combat Replicators`. Verbleibend — Invader: Targeting, Shields, Torpedoes, Destroyer tile, Deep Space Missiles, Autonomous Drones. Defender: Targeting, Shields, Torpedoes, Deep Space Missiles, Energy Cells.

**Nutzungsprofil des Users:** Corvettes typisch 1–6, alle anderen Typen 1–3. Normalfall ist Corvettes + *ein* weiterer Schiffstyp. Gemischte Flotten selten.

**Lokalisierung:** `<script type="application/json" id="strings">` ganz oben, Namensräume `terms.*` (Spielbegriffe, nur Englisch — kein deutsches Regelwerk vorhanden, dürfen nicht frei übersetzt werden), `ui.*` und `log.*` (EN + DE). `t(key, params)` mit Fallback auf Englisch. Sprache über Konstante `DEFAULT_LANG` im Skript oder `?lang=de`. **`fetch()` scheidet aus** — über `file://` von der Same-Origin-Policy blockiert.

### Testumgebung — Fallstricke
- **Screenshots sind nicht möglich.** Der Browser-Pane kompositiert keine Frames. Ersatz: Geometrie-Audit per `javascript_tool`.
- **Der Preview-Pane strippt Query-Strings** (`?lang=de` kommt nicht an) und behält den JS-Kontext über `location.reload()` hinweg. Vor jedem Lauf `window.__vf.doReset()` aufrufen.
- **Versteckte Masken bleiben im DOM.** Test-Selektoren immer auf `.screen.on` scopen, bei ≥720 px zusätzlich auf `.side.inv` / `.side.def`.
- `window.__vf = {S, go, setType, swapSides, doReset, renderConfig, bump}` ist als Test-Hook exportiert.

## Produzierte Artefakte
- `Output/prototype-v2.html` — **aktuelle Arbeitsdatei.** Masken 1–3 vom User abgenommen. Audit bei 393×852, 820×1180, 1180×820 über alle vier Masken plus pvv/skirmish/fallen/pvp-Vollausbau und Tie-Zustand: keine Befunde, keine Konsolenfehler.
- `Output/design-tokens.css` — Design-Tokens mit dokumentierter Herkunft jedes Farbwerts, um v2-Tokens ergänzt. Muss mit dem Inline-Block in v2 synchron gehalten werden.
- `Output/00-INPUT-INVENTORY.md` — Eingabe-Inventar, Design-Kernprobleme K1–K10, freigegebene Entscheidungstabelle.
- `Output/01-DRAFT-COMPARISON.md` — Vergleich der drei Entwürfe.
- `Output/draft-1-keypad.html`, `Output/draft-2-stack.html`, `Output/draft-3-sector.html` — **nicht mehr anfassen.** Einzige Rückfallebene (kein Git).

## Entscheidungen
- **Sector Defenses bleiben beim Seitentausch am Slot, nicht an der Rolle** — Warum: Vom User in dieser Session ausdrücklich bestätigt ("genau richtig so"). Nach einem Tausch pvv↔skirmish sind die am Voidborn-Slot eingetragenen Sector Defenses ausgeblendet, weil der Voidborn dann angreift; der Spieler trägt sie auf seiner Seite neu ein. Sachlich korrekt — die Verteidigungen gehören zum angegriffenen Sektor, und der hat gewechselt. **Nicht neu diskutieren.**
- **Keine Tap-Zählung per DOM-Klicks mehr** — Warum: Vom User in dieser Session explizit abbestellt. Die Messung hat ihren Zweck erfüllt (v2 liegt bei 6 / 5 / 23 Taps für Standard / Standard mit Profil / Komplex gegenüber 8 / 7 / 30 bei Entwurf 2). Künftig weglassen.
- **Neuntes Profil `Astoran · Sentries` ergänzt** — Warum: Die Spezifikation nennt "8 Profile plus No profile", zählt aber nur sieben Häuser auf; ohne Astoran bot kein Profil den Sentry-Flottentyp an. Vom User nicht beanstandet.
- **`html,body{height:100%}` durch `min-height` ersetzt** — Warum: Machte den Body zu einer Box fester Viewporthöhe; die ~3000 px hohe Configuration-Maske scrollte überhaupt nicht. **Derselbe Fehler steckt in `draft-2-stack.html`** und wurde dort absichtlich nicht behoben (Rückfallebene bleibt unangetastet).
- **`terms.*` bewusst nur einsprachig** — Warum: Kein deutsches Regelwerk vorhanden, Spielbegriffe dürfen nicht frei übersetzt werden. `de` enthält nur `ui.*` und `log.*`; fehlende Schlüssel fallen auf Englisch zurück.
- **Datenmodell Slot/Rolle statt Invader/Defender** — Warum: macht den Seitentausch bei Voidborn-Kämpfen verlustfrei statt destruktiv.
- **`destroyerBonusSalvoStep` und `bombardAbsorptionSplit` sind keine Eingabefelder** — Warum: Optimierungsprobleme, die der deterministische Resolver selbst löst. Später nur im Log mit optionalem Override.

## Blocker
- **Der Umfang der Profilfunktionalität ist nicht spezifiziert.** Der User hat nur "wir machen uns an die Profilfunktionalität" gesagt. Denkbare Richtungen, die sich gegenseitig ausschließen können: eigene Profile anlegen/benennen/bearbeiten statt nur 9 hartcodierte auswählen · Profil aus der aktuellen Aufstellung ableiten ("als Profil speichern") · Technologie-Fortschritt über eine Partie hinweg pflegen (Basic → Improved) · Profil pro Mitspieler statt pro Slot. **Vor dem Bauen klären.**
- **Keine visuelle Prüfung möglich.** Das Geometrie-Audit deckt Layoutbrüche und Touch-Ziele ab, **nicht** Ästhetik, Kontrast oder Lesbarkeit. Der User muss die Datei selbst per Doppelklick öffnen und beurteilen.
- **Kein Git.** v2 bei größeren Umbauten vorher kopieren, nicht blind überschreiben.

## Nächste Schritte
1. `Output/prototype-v2.html` lesen, besonders Abschnitt 2 (`PROFILES`), 5 (`applyProfile`, `deviates`) und 7 (`renderProfiles`).
2. Den User fragen, was "Profilfunktionalität" konkret umfassen soll (siehe Blocker). Erst danach bauen.
3. Änderungen in `Output/prototype-v2.html` umsetzen; neue Tokens parallel in `Output/design-tokens.css` nachziehen.
4. Geometrie-Audit bei 393×852, 820×1180 und 1180×820 über alle vier Masken fahren, Konsole auf Fehler prüfen. State vor jedem Lauf über `window.__vf.doReset()` zurücksetzen, Selektoren auf `.screen.on` scopen.
5. **Keine Tap-Zählung.** Knapp berichten: was gebaut wurde, Audit-Ergebnis, offene Punkte.
```