# Phase E — Vergleich der drei Entwürfe

Drei klickbare Prototypen, gleiche Funktionalität, gleiche Farbwelt, drei grundlegend verschiedene Eingabemechaniken.

| Datei | Kurzname | Differenzierende Mechanik |
|---|---|---|
| [draft-1-keypad.html](draft-1-keypad.html) | **Keypad** | Ziffernblock 0–14 in der Daumenzone, Auto-Advance |
| [draft-2-stack.html](draft-2-stack.html) | **Stack** | Schnellwahl 1\|2\|3 + ± inline (die Briefing-Variante) |
| [draft-3-sector.html](draft-3-sector.html) | **Sector** | Tap / Wisch / Halten direkt auf der Schiffskachel |

---

## Vorbemerkung zur Farbpalette

Die Palette ist **nicht geraten**. Die offizielle App ist eine Flutter-CanvasKit-Anwendung: Sie rendert vollständig in ein WebGL-Canvas, hat kein DOM und kein auslesbares Stylesheet. Ich habe die Farben deshalb per Pixel-Sampling aus ihren eigenen Asset-Grafiken gewonnen (Bilder im Browser in ein Canvas gezeichnet, Farbhistogramm quantisiert). Heruntergeladen oder eingebettet wurde nichts.

Belegte Zuordnungen: `invader.png` → rot `#e00020`, `defender.png` → cyan `#30b0e0`, alle fünf Flotten-Icons → bernstein `#f0a000`, `voidborn_power.png` und `Corruption.png` → orange `#f07030`, Panel-Hintergrund `#302030`, Damage rot, Absorption blau/cyan, Sector Defense magenta, Starbase indigo. Der nützlichste Fund: Die App codiert **Basic als dunkles Pflaume, Improved als helles Silber** (`BackgroundTechBasic.png` vs. `BackgroundTechImproved.png`). Diese Codierung tragen alle drei Entwürfe für die Technologie-Zustände.

**Meine Ergänzung, nicht belegt:** die Farben pro Flottentyp (`--fleet-sentry` teal, `--fleet-dreadnought` blau, `--fleet-carrier` koralle, `--fleet-destroyer` violett). In der Referenz-App sind alle Flotten bernstein; ich habe die Farbtöne aus der jeweiligen Technologie-Kartenillustration abgeleitet, damit sich fünf Zeilen ohne Lesen unterscheiden lassen. Wenn dir das zu bunt ist, sind die Tokens die einzige Stelle, die dafür geändert werden muss.

Ebenfalls nicht übernehmbar: die Hausschrift von Voidfall. Externe Fonts sind ausgeschlossen, also System-Stack; der Sci-Fi-Charakter kommt über Versalien, Laufweite und Farbe.

---

## Die drei Entwürfe

### 1 · Keypad — „jede Zahl ein Tap"

Die fünf Flottentypen stehen als flache Liste untereinander, der Wert wird aber nicht an der Zeile eingestellt, sondern über einen fest im unteren Bildschirmdrittel liegenden Ziffernblock, der **0 bis 14 vollständig abdeckt**. Nach jeder Eingabe rückt die Auswahl automatisch auf die nächste Zeile — man tippt eine Flotte wie eine Telefonnummer, ohne den Daumen zu bewegen und ohne eine Zeile treffen zu müssen. Die Liste bleibt dabei sichtbar, weil der Block unter ihr liegt statt über ihr. Technologien sind Dreifach-Chips, ein Tap zykliert `None → Basic → Improved`.

**Optimiert für** den Spieler, der die Zahlen schon im Kopf hat und sie nur noch loswerden will — den Normalfall am Tisch.
**Trade-off:** Der Block belegt dauerhaft rund 200 px, die Technologie-Sektion rutscht damit unter die Faltkante. Und es gibt immer genau ein aktives Feld: Wer die Markierung übersieht, schreibt seine Zahl in die falsche Zeile.

### 2 · Stack — die Briefing-Variante, ungeschönt gebaut

Schnellwahl-Buttons 1\|2\|3 plus Minus und Plus, direkt an der Zeile, ohne Overlay, ohne aktives Feld, ohne Modus. Dazu progressive Offenlegung: Sichtbar ist zunächst nur die Corvette; weitere Flottentypen holt man über eine Chip-Leiste dazu, und jede Zeile bringt ihre abhängigen Technologien mit — die Corvette-Upgrades unter der Corvette, die Destroyer-Stufe unter dem Destroyer. Technologien sind hier **explizite Dreier-Segmente**: Jeder Zustand ist mit genau einem Tap erreichbar, während der zyklierende Chip aus Entwurf 1 für `Improved → None` zwei Taps braucht.

**Optimiert für** Vorhersagbarkeit. Was man sieht, kann man antippen; jeder Tap wirkt dort, wo der Finger ist. Das ist der Entwurf mit der geringsten Fehleranfälligkeit.
**Trade-off:** Ich habe die Zahlen-Mechanik bewusst **nicht** heimlich repariert, damit der Vergleich etwas aussagt. 6 Corvette Fleet Power kosten `3` plus dreimal `+` — vier Taps für eine Zahl. Im Komplex-Szenario summiert sich das zum schlechtesten Ergebnis im Feld.

### 3 · Sector — direkte Manipulation

Kein Formular, sondern der Kampfsektor: Beide Parteien stehen sich als Zonen gegenüber, die Flotten sind 100 × 96 px große Kacheln mit Silhouette und Fleet Power darin. **Tap = +1, horizontal wischen = Wert scrubben (≈ 18 px pro Punkt), 450 ms halten = auf 0**. Damit sind 9 Fleet Power ein Wisch statt neun Taps. Die zweite Idee betrifft die Technologien: Sie werden im Regelfall gar nicht eingegeben. Das Profil belegt sie vor, die Zone zeigt nur eine Leiste der **tatsächlich aktiven** Technologien, alles Übrige liegt in einem Bottom-Sheet.

**Optimiert für** den wiederholten Kampf mit konfiguriertem Profil — dort ist es der schnellste Entwurf im Feld und der einzige, der auf dem iPad wie ein Spielbrett und nicht wie ein Formular aussieht.
**Trade-off:** Tap, Wisch und langer Druck auf derselben Fläche sind nicht selbsterklärend. Der Entwurf braucht die Erklärzeile unter der Zone und verliert ohne sie sofort. Und wer **ohne** Profil arbeitet, zahlt für jede Technologie drei Taps (Sheet auf, Stufe, Sheet zu) — dann ist er der langsamste.

---

## Tap-Zählung

Alle Zahlen sind **am laufenden Prototyp gemessen**, nicht geschätzt: Ein Skript hat die Bedienschritte auf den echten DOM-Elementen ausgelöst und danach geprüft, dass der Zustand exakt dem Szenario entspricht (Fleet Power, Technologie-Stufen, Installationen, Endmaske). Ein Wisch zählt als eine Interaktion, ein Scroll ebenfalls.

**Szenario „Standard"** — Worked Example aus §8: Player vs Voidborn, Invader 4 Corvette FP + Basic Shields, Defender 3 Voidborn FP + 1 Sector Defense.

| Entwurf | ohne Profil | davon Scrolls | mit passendem Profil |
|---|---|---|---|
| 1 · Keypad | **7** | 0 | 6 |
| 2 · Stack | 8 | 0 | 7 |
| 3 · Sector | 9 | 0 | **6** |

**Szenario „Komplex"** — Player vs Player. Invader: 6 Corvette + 3 Destroyer + 2 Dreadnought FP, Improved Targeting, Basic Shields, Improved Destroyers, Autonomous Drones eingesetzt. Defender: 5 Corvette + 3 Sentry FP, 2 Sector Defenses, 1 Starbase, Improved Torpedoes, Energy Cells.

| Entwurf | gesamt | Taps | Scrolls | Invader-Anteil | Defender-Anteil |
|---|---|---|---|---|---|
| 1 · Keypad | **24** | 22 | 2 | 13 | 11 |
| 2 · Stack | 30 | 26 | 4 | 17 | 13 |
| 3 · Sector | 25 | 23 | 2 | 13 | 12 |

**Keiner der drei Entwürfe scheitert am Standard-Szenario** — die Schwelle von etwa einem Dutzend Interaktionen wird von allen deutlich unterboten, mit Profil liegen zwei bei sechs. Das eigentliche Ergebnis der Messung liegt woanders:

- **Die Zahlen-Eingabe entscheidet den Komplex-Fall, nicht die Technologien.** Zwischen Entwurf 1 und 2 liegen im Standard-Szenario 1 Interaktion, im Komplex-Szenario 6. Der gesamte Unterschied stammt aus den Flotten mit Werten über 3.
- **Die Briefing-Mechanik 1\|2\|3 plus ± ist im Feld die langsamste** und braucht zusätzlich doppelt so viele Scroll-Gesten, weil eine Stepper-Zeile rund 100 px hoch ist. Das bestätigt K3 aus dem Inventar quantitativ.
- **Das Profil ist der größte Hebel, den es gibt** — es spart in Entwurf 3 drei Interaktionen von neun. Kein Layout-Detail kommt in die Nähe dieses Effekts.

---

## Bewertung gegen die fünf Kriterien

| Kriterium | 1 · Keypad | 2 · Stack | 3 · Sector |
|---|---|---|---|
| **Geschwindigkeit Standard** | ● sehr gut (7) | ○ gut (8) | ◐ gut, mit Profil bester (9 / 6) |
| **Verhalten im Komplex-Fall** | ● bester (24) | ✗ schlechtester (30), viel Scrollen | ● gut (25) |
| **Fehleranfälligkeit** | ◐ ein aktives Feld = Modus; Auto-Advance kann Werte überschreiben | ● bester: kein Modus, jeder Tap wirkt lokal | ✗ Wisch trifft leicht daneben; Halten löscht ohne Rückfrage |
| **Einhandbedienung iPhone** | ● bester: Block liegt fest in der Daumenzone | ◐ Stepper wandern beim Scrollen aus der Reichweite | ● Kacheln groß, aber die Loadout-Leiste sitzt oben |
| **Übersicht iPad** | ○ zwei Formularspalten, funktional aber nüchtern | ○ zwei lange Stapel, viel Weißraum | ● bester: zwei Zonen bilden einen Sektor |

Zur Fehleranfälligkeit im Detail, weil sie im Briefing nicht vorkommt, aber am Spieltisch zählt:

- **Entwurf 2 ist der einzige ohne Modus.** Es gibt keinen Zustand, in dem ein Tap woanders landet, als er hingehört. Das ist ein härteres Argument, als die Tap-Zahlen es aussehen lassen.
- **Entwurf 1** wird gefährlich, wenn der Auto-Advance den Fokus weitergeschoben hat und der Nutzer eine Zahl korrigieren will: Sie landet in der Folgezeile. Dagegen hilft die sehr laute Markierung, aber nicht vollständig.
- **Entwurf 3** hat zwei Risiken: ein schneller Wisch landet einen Punkt daneben, und der lange Druck löscht kommentarlos. Beides ist reparierbar (Rasterung beim Scrubben, kurze Undo-Möglichkeit), aber es ist echter Aufwand.

---

## Ergebnis der Selbstprüfung (Phase D)

Alle drei Dateien wurden bei **393 × 852**, **820 × 1180** und **1180 × 820** geprüft, in jeder der vier Masken:

- **kein horizontales Scrollen** (`scrollWidth − innerWidth = 0` in allen 12 Kombinationen)
- **kein Element, das über den Viewport hinausragt**
- **alle Touch-Ziele ≥ 44 × 44 px** — geprüft über die tatsächlichen Bounding-Boxen jedes sichtbaren `button`, `select`, `summary`
- **keine JavaScript-Fehler in der Konsole** in keinem der drei Entwürfe
- der Breakpoint greift: ab 720 px stehen Invader und Defender nebeneinander (bei 820 px je 394–402 px pro Seite, bei 1180 px je 582 px)

Die Prüfung hat drei Mängel gefunden, die alle behoben sind:

1. Breadcrumb-Chips, Kurzergebnis-Chip und die Profil-Auswahl waren 36–40 px hoch statt 44 — in allen drei Entwürfen.
2. Die Segment-Buttons im Advanced-Bereich und der „Next"-Button am Ziffernblock waren 38 bzw. 36 px hoch.
3. **Ein echter Bedienfehler in Entwurf 1:** Nach dem letzten Defender-Feld sprang der Auto-Advance zurück auf die Invader-Maske — also genau dann, wenn der Nutzer fertig ist und das Ergebnis sehen will. Der Fokus bleibt jetzt innerhalb der Seite stehen. Gefunden wurde das nicht beim Ansehen, sondern beim instrumentierten Tap-Zählen.

**Screenshots konnte ich nicht liefern.** Der Browser in dieser Umgebung stellt den Vorschau-Bereich nicht dar und kompositiert deshalb keine Frames; jeder Screenshot-Versuch läuft in einen Timeout. Statt einer Sichtprüfung habe ich das oben beschriebene automatisierte Geometrie-Audit gefahren, das die drei Kriterien aus Phase D (kein horizontales Scrollen, keine abgeschnittenen Elemente, keine zu kleinen Touch-Ziele) direkt an den gerenderten Boxen misst — das ist strenger als der Augenschein, ersetzt aber nicht dein eigenes Urteil über die Optik. Der Ordner `Output/screenshots/` bleibt deshalb leer und ist nicht angelegt. **Öffne die drei Dateien bitte selbst per Doppelklick**, das ist der Punkt, an dem ich dich nicht vertreten kann.

---

## Meine Empfehlung

**Keiner der drei Entwürfe sollte so gebaut werden, wie er dasteht.** Die Messung zeigt sehr deutlich, dass die drei Mechaniken nicht gegeneinander stehen, sondern verschiedene Teilprobleme lösen — und dass jeder Entwurf genau eines davon am besten löst. Ich stelle sie deshalb nicht diplomatisch nebeneinander:

| Teilproblem | Gewinner | Begründung |
|---|---|---|
| **Fleet Power erfassen** | **1 · Keypad** | Jede Zahl von 0 bis 14 in genau einem Tap, exakt, ohne Gestenkenntnis, ohne Off-by-one. Entscheidet den Komplex-Fall. |
| **Technologie-Stufe setzen** | **2 · Stack** | Das explizite Dreier-Segment erreicht jeden Zustand mit einem Tap. Der zyklierende Chip aus Entwurf 1 braucht für `Improved → None` zwei. |
| **Welche Technologien überhaupt zu sehen sind** | **3 · Sector** | Profil belegt vor, die Leiste zeigt nur Aktives, der Rest liegt im Sheet. Größter Einzelhebel der ganzen Messung. |
| **Ort der Corvette-Upgrades** | **1 und 2** | Angedockt an die Corvette-Zeile statt in einer Technologie-Liste. Löst K2 (Corvette-Abhängigkeit) auf der Ebene des Layouts statt über Erklärtext. |
| **Layout auf dem iPad** | **3 · Sector** | Zwei gegenüberliegende Zonen sind der einzige Vorschlag, der die Fläche nutzt, statt zwei Formularspalten nebeneinanderzustellen. |

**Konkret würde ich bauen:** Entwurf 1 als Grundgerüst — Zeilenliste plus Ziffernblock in der Daumenzone —, darin die Technologien nach dem Modell von Entwurf 3 (Profil-Vorbelegung, Leiste nur mit Aktivem, Sheet für den Rest) und in diesem Sheet die expliziten Dreier-Segmente aus Entwurf 2 statt zyklierender Chips. Auf Tablet-Breite wechselt das Ganze in die Zonen-Darstellung von Entwurf 3.

Zwei Punkte, an denen ich über die drei Entwürfe hinausgehen würde:

- **Der Ziffernblock sollte einklappbar sein.** Er ist der Grund für Entwurf 1s Vorsprung, kostet aber dauerhaft 200 px. Ein Griff zum Zuklappen gibt die Technologie-Sektion frei, ohne die schnelle Zahleneingabe aufzugeben.
- **Maske 3 sollte bei reduzierten Kampfarten entfallen.** Bei `Player vs Fallen House` hat sie null Eingabefelder, bei `Player vs Voidborn` zwei Zahlen. Das ist keine eigene Maske wert (K5 aus dem Inventar). Ich würde die Defender-Seite dort als kompakten Streifen unter die Invader-Maske setzen — spart in jedem zweiten Kampf zwei Interaktionen und macht die Breadcrumb ehrlicher: Sie zeigt dann, was tatsächlich zu tun ist.

Der Wisch-Mechanismus aus Entwurf 3 ist die eleganteste Idee im Feld, und ich würde ihn trotzdem **nicht** als primäre Eingabe nehmen. Er ist in der Messung nicht schneller als der Ziffernblock, aber deutlich fehleranfälliger und muss gelernt werden. Als *zusätzliche* Geste auf derselben Zeile — Ziffernblock für die Zahl, Wisch für die schnelle Korrektur — kostet er nichts und hilft denen, die ihn entdecken.

---

## Offene Fragen an dich

1. **Ziffernblock permanent oder einklappbar?** Permanent ist schneller, einklappbar gibt der Technologie-Sektion Platz. Ich tendiere zu einklappbar mit „standardmäßig offen".
2. **Maske 3 bei Voidborn und Fallen House einsparen?** Das weicht von deinem Vier-Masken-Ablauf ab. Ich halte es für richtig, aber es ist deine Struktur.
3. **Profile:** Wie viele brauchst du, und sollen sie benennbar/editierbar sein? Ich habe acht feste Beispiel-Profile nach Häusern hinterlegt (Valnis · Shields, Zenor · Destroyers …). In den Prototypen sind sie hartcodiert, weil `localStorage` ausgeschlossen ist — für die echte App wäre das der offensichtliche Speicherort.
4. **Abweichungs-Markierung:** Weicht eine Technologie vom Profil ab, zeigen die Entwürfe einen kleinen cyanfarbenen Punkt. Reicht das, oder soll es deutlicher sein?
5. **Farben pro Flottentyp** — meine Ergänzung, in der Referenz-App sind alle Flotten bernstein. Behalten oder auf einheitliches Bernsteingold zurück?
6. **Das „dummy"-Etikett am Kurzergebnis:** Ich habe es bewusst sichtbar gelassen, damit klar ist, dass dort noch nicht gerechnet wird. Für den echten Betrieb fällt es weg — stört es dich beim Beurteilen?
7. **Bombard:** Steckt in allen drei Entwürfen im Advanced-Bereich. Willst du es überhaupt behalten, oder fliegt es ganz raus?
