# Prompt für Claude Code — Voidfall Combat Helper, Phase 1: UI-Entwürfe

---

## Rolle & Ziel

Du bist UI/UX-Designer und Frontend-Prototyper. Ich baue einen Combat-Rechner für das Brettspiel **Voidfall**. Die Rechenlogik ist trivial und kommt später. Der einzige Grund, warum dieses Tool gut oder schlecht wird, ist die **Dateneingabe**: Pro Kampf sind zwei Seiten mit je fünf Flottentypen, bis zu vierzehn Technologien in je drei Zuständen, Installationen und mehreren Spieler-Entscheidungen zu erfassen — und das am Spieltisch, auf dem Handy, mitten in einer laufenden Partie, in unter einer Minute.

**Deine Aufgabe in dieser Session: drei klickbare UI-Prototypen, die dieses Eingabeproblem auf drei grundlegend verschiedene Arten lösen.** Keine Kampflogik.

---

## Input-Dateien (in dieser Reihenfolge lesen)

1. `README-CACHE.md` — Projekt-Index, immer zuerst
2. `Briefing.md` — meine funktionalen Anforderungen, verbindlich
3. `COMBAT-RULES.md` — die vollständige Regelspezifikation. Für dich relevant vor allem **§9 (Implementation checklist)**: die dortige Input-Struktur ist die Menge aller Felder, die deine UI erfassen muss. §2, §3, §4 und §7 brauchst du, um zu verstehen, *wann* welches Feld überhaupt relevant ist.

Bei Widersprüchen zwischen den Dateien: frag nach, rate nicht.

---

## Harte Randbedingungen

- **Keine Kampfberechnung.** Kein Resolver, keine Initiative-Rechnung, kein Salvo-Loop. Ergebnisanzeige und Kampflog werden mit realistisch aussehenden **hartcodierten Dummy-Werten** befüllt (nimm das Worked Example aus `COMBAT-RULES.md` §8 als Vorlage), damit die Ergebnis-Maske und das Floating-Element beurteilbar sind.
- **Alle Dateien ausschließlich im Unterordner `Output/`.** Keine Datei außerhalb anlegen oder verändern.
- **Ein Entwurf = eine einzige, selbstständig lauffähige `.html`-Datei.** CSS und JS inline. Keine Build-Tools, keine npm-Abhängigkeiten, keine externen CDN-Requests, keine Fonts von außen — die Datei muss per Doppelklick und offline auf iPhone und iPad funktionieren.
- **UI-Sprache: durchgehend Englisch.** Spielbegriffe exakt wie im Regelwerk (`Fleet Power`, `Corvette`, `Sentry`, `Destroyer`, `Dreadnought`, `Carrier`, `Sector Defense`, `Starbase`, `Approach step`, `Salvo step`, `Basic`/`Improved`).
- **Kein `localStorage` in den Prototypen.** State nur im Speicher.
- **Zielgeräte:** iPhone 15 Pro (393 × 852 CSS-Pixel) als primäres Gerät, iPad Air (820 × 1180 hoch, 1180 × 820 quer). Ab Tablet-Breite müssen Maske 2 und 3 nebeneinander stehen (siehe `Briefing.md`).

---

## Vorgehen

Arbeite die Phasen der Reihe nach ab. **Nach Phase A hältst du an und legst mir das Inventar vor, bevor du irgendeinen Entwurf baust.**

### Phase A — Eingabe-Inventar (`Output/00-INPUT-INVENTORY.md`)

Bevor du gestaltest, machst du das Problem sichtbar. Erstelle eine vollständige Tabelle **jedes einzelnen Eingabefeldes**, das die UI erfassen muss, abgeleitet aus `COMBAT-RULES.md` §9 und den Regeln in §2–§4 und §7:

| Feld | Wertebereich | Gilt für Invader / Defender / beide | Sichtbarkeitsbedingung | Häufigkeit |
|---|---|---|---|---|

- **Sichtbarkeitsbedingung** ist die wichtigste Spalte: Die meisten Felder sind in den meisten Kämpfen irrelevant. `Sector Defenses` gibt es nur beim Defender. `Improved Deep Space Missiles` fragt nach benachbarten Sektoren mit Shipyard/Starbase. Die Corvette-Upgrades (`Targeting`, `Shields`, `Torpedoes`) sind sinnlos ohne Corvette Fleet Power. Der Destroyer-Bonus-Salvo-Step ist nur wählbar, wenn der Invader Destroyer hat. Bei `Player vs Voidborn` entfällt die gesamte Technologie-Sektion des Defenders. Und so weiter.
- **Häufigkeit** ist deine Schätzung, in wie vielen realen Kämpfen dieses Feld überhaupt gesetzt wird (hoch / mittel / selten). Sie steuert später, was Standard-Sichtfeld ist und was hinter eine Aufklapp-Ebene wandert.
- Ergänze am Ende eine kurze Liste der **Design-Kernprobleme**, die du aus dem Inventar ableitest (z. B. „14 Technologien × 3 Zustände × 2 Seiten passen nicht auf einen iPhone-Screen — welche Reduktionsstrategien gibt es?").

**Stopp. Zeig mir das Inventar und deine abgeleiteten Kernprobleme. Erst nach meinem OK weiter.**

### Phase B — Design-Tokens (`Output/design-tokens.css`)

Die offizielle App unter `https://voidfallapp.mindclashgames.com/` ist bedienungsseitig mein **Negativbeispiel** — aber Farbwelt und visuelle Anmutung sollen möglichst übernommen werden. Sieh dir die Seite an und leite eine Palette ab: Hintergründe, Akzentfarbe, Invader- vs. Defender-Farbcodierung, Farben pro Flottentyp, Typografie-Skala, Abstände, Radien.

- Ergebnis ist eine Datei mit CSS-Custom-Properties, die **alle drei Entwürfe unverändert einbinden** (per Copy-Paste inline, da Single-File). So unterscheiden sich die Entwürfe in Layout und Interaktion, nicht in der Farbwahl — sonst vergleiche ich Äpfel mit Birnen.
- **Keine Grafiken von der Seite herunterladen oder einbetten.** Icons baust du als Inline-SVG selbst nach (Flottentyp-Silhouetten, Technologie-Symbole, Fleet-Power-Würfel).
- Wenn die Seite nicht abrufbar ist: definiere eine plausible Sci-Fi-Palette im Stil des Spielmaterials und **notiere im Vergleichsdokument, dass die Palette geraten ist**.

### Phase C — Die drei Entwürfe

`Output/draft-1-<kurzname>.html`, `Output/draft-2-<kurzname>.html`, `Output/draft-3-<kurzname>.html`

**Alle drei müssen dieselbe Funktionalität aus `Briefing.md` abdecken:**

- Vier Masken: (1) Kampf-Art, (2) Invader, (3) Defender, (4) Ergebnis
- Maske 1 mit **genau einem Tap** zur Kampfart und direktem Sprung auf Maske 2 — kein „Weiter"-Button
- Breadcrumb-Navigation, Daten bleiben beim Wechsel erhalten
- Floating-Kurzergebnis oben rechts, auf allen Masken sichtbar (Kurzfassung: wer gewinnt, wie viele FP bleiben), Dummy-Werte, aktualisiert sich sichtbar bei Eingaben
- Maske 4 zweigeteilt: Ergebnis oben, darunter ein nachvollziehbarer Kampflog mit Approach-Step und allen Salvo-Steps (Dummy-Daten aus §8)
- Ab Tablet-Breite: Maske 2 und 3 nebeneinander, mit funktionierendem Breakpoint

**Die drei Entwürfe müssen sich in der Interaktionsmechanik unterscheiden, nicht in der Optik.** Die entscheidende Differenzierungsachse ist: *Wie werden Flottenstärken und die Technologie-Zustände erfasst, ohne dass der Nutzer scrollt und sucht?* Denk in echten Alternativen, zum Beispiel:

- direkte Manipulation auf einer Sektor-Darstellung vs. formularartige Listen vs. ein einziger progressiv aufklappender Stapel
- alles auf einem Screen sichtbar vs. gestufte Offenlegung mit „Advanced"-Ebene
- Technologien als Toggle-Chips mit Dreifach-Zustand vs. durchsuchbare Auswahl vs. einmalig konfiguriertes Spieler-Profil, das über Kämpfe hinweg gilt
- numerische Eingabe per Schnellwahl-Buttons 1–3 plus ±, per Stepper, per Slider oder per Tap-to-increment auf dem Icon selbst

Aus `Briefing.md` stammt der Vorschlag Zahlen-Buttons 1–3 plus Plus/Minus. Nimm ihn als **eine** der Optionen ernst, aber prüfe ihn kritisch: Fleet Power geht bis 14. Wenn du eine bessere Lösung siehst, bau sie in einem der Entwürfe und begründe sie.

Jeder Entwurf braucht:

- Touch-Ziele von mindestens 44 × 44 px, Kernbedienelemente in der Daumenzone des unteren Bildschirmdrittels
- funktionierende Navigation zwischen allen vier Masken, State bleibt erhalten
- realistische Beispielinhalte, keine Lorem-Ipsum-Platzhalter
- oben in der Datei einen HTML-Kommentar mit Name, Kernidee des Entwurfs und dem, was du bewusst geopfert hast

### Phase D — Selbstprüfung

Bevor du mir die Entwürfe vorlegst, prüfst du sie selbst und dokumentierst das Ergebnis:

1. **Viewport-Test:** Jeden Entwurf bei 393 × 852, 820 × 1180 und 1180 × 820 rendern und ansehen. Kein horizontales Scrollen, keine abgeschnittenen Elemente, keine überlappenden Touch-Ziele. Screenshots nach `Output/screenshots/`.
2. **Tap-Zählung — das ist die eigentliche Bewertungsmetrik.** Zähle für jeden Entwurf die Anzahl der Interaktionen (Taps, Scroll-Gesten, Eingaben) vom Start bis zum fertigen Ergebnis für zwei Szenarien:
   - **Szenario „Standard"** — der häufige Fall: Invader 4 Corvette FP mit Basic Shields, Defender Voidborn mit 3 FP und 1 Sector Defense (= das Worked Example aus §8).
   - **Szenario „Komplex"** — der Stresstest: Player vs. Player, Invader mit 6 Corvette FP + 3 Destroyer FP + 2 Dreadnought FP, Improved Targeting, Basic Shields, Improved Destroyers, Autonomous Drones eingesetzt; Defender mit 5 Corvette FP + 3 Sentry FP, 2 Sector Defenses, 1 Starbase, Improved Torpedoes, Energy Cells.

   Trag die Zahlen in eine Vergleichstabelle ein. Ein Entwurf, der im Standard-Szenario mehr als etwa ein Dutzend Interaktionen braucht, ist gescheitert — sag das dann auch so.
3. **Konsole:** keine JS-Fehler.

### Phase E — Vergleichsdokument (`Output/01-DRAFT-COMPARISON.md`)

- Ein Absatz pro Entwurf: Kernidee, für wen/welche Situation er optimiert ist, bewusster Trade-off
- Die Tap-Zähl-Tabelle aus Phase D
- Bewertung gegen: Geschwindigkeit im Standard-Szenario, Verhalten im Komplex-Szenario, Fehleranfälligkeit bei Fehleingaben, Einhandbedienung auf dem iPhone, Übersichtlichkeit auf dem iPad
- **Deine klare Empfehlung mit Begründung**, und wenn dir eine Kombination aus Elementen mehrerer Entwürfe besser erscheint als jeder einzelne, sag das explizit statt diplomatisch drei gleichwertige Optionen nebeneinanderzustellen.
- Offene Fragen an mich, die du nicht selbst entscheiden konntest

---

## Was du in dieser Session **nicht** tust

- keine Kampflogik, kein Resolver, keine Regelimplementierung
- keine Dateien außerhalb von `Output/`
- keine Build-Konfiguration, kein `package.json`, kein Framework
- kein README, das ich nicht angefordert habe
- nicht Phase C beginnen, bevor ich das Inventar aus Phase A freigegeben habe

## Wie ich arbeite

- Wenn dir etwas an meinen Anforderungen unklar ist: frag nach, statt eine Annahme zu treffen.
- Wenn du meinen Ansatz für falsch hältst — auch die Idee der Zahlen-Buttons 1–3, auch den Vier-Masken-Ablauf — sag es direkt und schlag eine bessere Alternative vor.
- Ich will lieber eine wirklich durchdachte Lösung als drei halbherzige. Die drei Entwürfe sind Erkundung, keine Auslieferung: Jeder einzelne soll für sich genommen ernst gemeint sein.
