## Allgemeines Feedback ##
- Farben und Schriften sind gut.
- 14 FP sind zwar das theoretische Maximum, werden aber in der Realität so gut wie nie vorkommen. Bei Corvettes ist 1-6 der typische Bereich (wobei 6 schon viel ist), während bei den anderen Schiffstypen 1-3 der Normalfall ist. Daher funktioniert die Schnellwahl aus Entwurf 2 zusammen mit "+" und "-" gut. Corvettes könnte man auf 6 Zahlen-Buttons erweitern (oder wäre das zu viel Platzbedarf?).
- Entwurf 3 ist gänzlich unbrauchbar, weil es am PC nicht funktioniert und mir generell zu fummelig ist.
- Ich finde Entwurf 2 insgesamt stimmig. Die Art, wie man hier durchgeführt wird, passt am besten zum Tisch-Gefühl. Entwurf 1 ist gut, wenn man oft viele gemischte Kämpfe hätte, also Kämpfe mit vielen Schiffstypen gleichzeitig. Das ist aber eher selten der Fall. Meist hat man Corvettes plus 1 zusätzlichen Schiffstypen, selten vielleicht mal 2. Es stimmt, dass Entwurf 2 deutlich mehr vertikalen Platz braucht und die Übersicht daher weniger gut ist, dafür ist jeder Tap immer lokal, was gut ist.
- Unsicher bin ich mir noch beim Technologie-Selector: Entwurf 1 ist diesbezüglich platzsparender, braucht aber mehr Taps (aber auch nicht viele). Bei Entwurf 2 klickt man direkt den Zielzustand an, auf Kosten der Sichtbarkeit.

## Änderungen/Erweiterungen ##
- Bei Auswahl eines neuen Kampftyps alle eingegeben Werte resetten.
- Bei den zwei Typen "Voidborn vs. Player" und "Player vs. Voidborn" soll es eine Möglichkeit geben, die Seiten zu wechseln. Habe ich zB "Voidborn vs. Player" ausgewählt und schon eingetragen, merke dann aber, dass es genau andersrum ist, will ich schnell wechseln können, ohne dass die eingetragenen Werte verloren gehen.
- Verschmelze Maske 2 und 3 miteinander. Invader kommt vor Verteidiger. Am Smartphone untereinander, ab Tablet nebeneinander. Es wird also geben: 0) Profiles, 1) Type, 2) Configuration, 3) Result.
- Rechts unten am Ende jeder Maske muss ein "Next"-Button hin, der zur nächsten Maske führt. Grund: Damit man nicht extra wieder nach oben scrollen bzw. ganz oben in die Breadcrum klicken muss, sondern dem logischen "von oben nach unten" folgen kann. 
- Combat Log: 
  - alle Steps per Default aufgeklappt
  - Am Ende jedes der zwei Bereiche zwei Buttons einfügen:
    - Back (zurück zur vorherigen Maske, um Änderungen vorzunehmen)
	- Reset (Definition siehe unten)

## Technologien ##
- Combat Replicators entfernen, da sie keinen Einfluss aufs Kampfergebnis haben (sondern nur die Belohnung verbessern)
- Bei der Improved-Version der Deep Space Missles muss man wählen können, ob man 1 oder 2 "adjacent sectors with one or more Shipyards or Starbases present" hat. Das muss aber elegant auswählbar sein. Vielleicht sogar einfach "IMP 1" und "IMP 2" als getrennte Buttons?

## Was noch nötig ist ##
- Integriere einen "Reset"-Button, der von jeder Maske aus zugreifbar ist, vermutlich mittig in die Leiste oben. Bei Klick kommt Rückfrage, ob man wirklich neu anfangen möchte. Bei Bestätigung kommt man zu Maske 1. Alle zuvor befüllten Felder leeren. Profile beibehalten.

## Weiteres ##
- Ich möchte später alle Texte auf einfache Art anpassen und ggf. lokalisieren können. Welche Optionen gibt es, wie du sie gebündelt auslagern kannst, sodass ich sie später außerhalb von Claude editieren kann? (Beispiel: Vielleicht möchte ich später aus einen Satz wie "equal, so both sides fire simultaneously" so etwas machen wie "tied, simultaneosouly fire".