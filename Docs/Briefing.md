## Anforderungen ##
- Im Browser lauffähig, clientseitige Berechnung.
- UI optimiert für aktuelle Smartphones (insb. iPhone 15 Pro) und Tables (insb. iPad Air 3).

### Referenz ###
Es gibt unter https://voidfallapp.mindclashgames.com/ einen solchen Combat Simulator, der allerdings eine ganz unintuitive und aufwendige Bedienung hat; ein echtes Negativbeispiel. Allerdings sind die Farben und Grafiken möglichst zu verwenden.

## Eingabeschritte ##
Mehrere Masken führen durch die Eingabe:
1. Kampf-Art auswählen
2. Konfiguration des Angreifers
3. Konfiguration des Verteidigers
(Wichtig: Bei ausreichend großer Anzeigefläche (Tablet) sollen die Masken 2 und 3 nebeneinander dargestellt werden, damit man beides gleichzeitig befüllen kann.)
4. Kampfergebnis

### Weiteres ###
- einfacher Wechsel der Masken durch Breadcrum-Leiste; Daten werden bei Wechsel beibehalten
- Kampfergebnis wird bei jeder Dateneingabe live berechnet
- Ergebnis wird auf Maske 4 dargestellt, aber zusätzlich oben rechts (als Floating Element?), dort aber nur in Kurzfassung (Wer gewinnt? Wie viele FP bleiben übrig?)

### Details zu Maske 1 ###
Hier wählt man den Kampf-Typ aus:
- Player versus Player
- Player (Attacker) vs Voidborn
- Voidborn vs Player (Defender)
- Player (Attacker) vs Fallen House

Wichtig ist mir, dass man nur einen einzigen Klick benötigt, um direkt zu Maske 2 zu kommen.

### Details zu Maske 2 ###
- Eingabe wie viele Schiffe welcher Typen vorhanden sind.
  - Auch hier ist eine schnelle und einfache Eingabe essenziell. Ich könnte mir vorstellen, dass man Zahlen-Buttons von 1–3 (quasi als Schnellauswahl) sowie einen Plus- und einen Minus-Button (für Detail-Anpassungen) hat. 
- Man muss auswählen können, welche der möglichen Technologien in welcher Stufe (Basic/Improved) man besitzt und welche möglichen Ressourcen man einsetzen möchte.

### Details zu Maske 3 ###

### Details zu Maske 4 ###
- Aufgeteilt in zwei Bereiche.
- Oben: Kampfergebnis. Wer gewinnt und welche FP sind übrig?
- Darunter: Kampflog. Nachvollziehbare Aufschlüsselung des Approach-Steps und aller Salvo-Steps. Ziel ist, dass man einfach nachvollziehen kann, wie es zum Ergebnis gekommen ist.

