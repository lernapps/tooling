# Stromstärke und Spannung – Tutor-Datei

> Was Stromstärke und Spannung bedeuten, welche Einheiten sie haben und wie man sie richtig misst.

App: Der elektrische Stromkreis. Seite: [Stromstärke und Spannung](./)

Diese Datei ist für einen KI-Tutor. Sie enthält die Lösungen: Nutze sie, um anzuleiten und Fehler zu erkennen, nicht um vorzusagen. Die Regeln stehen in llms.txt. Kannst du eine Datei der App nicht abrufen, bitte die lernende Person, den Text der Seite oder diese Datei einzufügen oder anzuhängen.

## Abschnitte

- [Warum ist das wichtig?](./#warum)
- [Das steckt dahinter](./#regel)
- [Ein Beispiel](./#beispiel)
- [Übung](./#uebung)

## Übungen

### groesse-einheit-geraet (matching)

- Link: [./#groesse-einheit-geraet](./#groesse-einheit-geraet), im Abschnitt „Übung“
- Aufgabe: Ordne jeder Größe ihre Einheit und ihr Messgerät zu.
- Antwortformat: jedem Eintrag links den passenden rechts zuordnen
- Lösung: Stromstärke – Ampere, gemessen mit dem Amperemeter; Spannung – Volt, gemessen mit dem Voltmeter; Milliampere – Ein tausendstel Ampere; Kilovolt – Tausend Volt
- Erklärung: Die Stromstärke misst du in Ampere mit dem Amperemeter, die Spannung in Volt mit dem Voltmeter. mA und kV sind kleinere bzw. größere Einheiten.
- Tipp, den die App zeigt: Achte auf die Buchstaben A und V.

### messgeraet-anschliessen (single-choice)

- Link: [./#messgeraet-anschliessen](./#messgeraet-anschliessen), im Abschnitt „Übung“
- Aufgabe: Wie schließt du ein Amperemeter an, um die Stromstärke durch eine Lampe zu messen?
- Antwortformat: eine Antwort wählen
- Antworten zur Wahl (✓ richtig, ✗ falsch, mit der Meldung der App):
  - ✓ In Reihe mit der Lampe, sodass der Strom durch das Messgerät fließt. – Das Amperemeter gehört in den Stromweg. Nur so fließt der ganze Strom durch das Gerät.
  - ✗ Parallel zur Lampe, wie ein Voltmeter. – Parallel geschaltet misst das Gerät die Spannung, nicht die Stromstärke. Außerdem kann ein Amperemeter dabei einen Kurzschluss verursachen.
  - ✗ Nur an den Pluspol der Batterie, ohne Verbindung zur Lampe. – Dann ist der Kreis nicht geschlossen. Strom kann nur durch das Gerät fließen, wenn es im geschlossenen Kreis liegt.
- Lösung: In Reihe mit der Lampe, sodass der Strom durch das Messgerät fließt.
- Erklärung: Ein Amperemeter wird in Reihe geschaltet, weil der Strom hindurchfließen muss. Ein Voltmeter wird parallel geschaltet.
- Tipp, den die App zeigt: Frage dich, ob der Strom durch das Messgerät fließen soll oder nicht.

### messwert-ablesen (number)

- Link: [./#messwert-ablesen](./#messwert-ablesen), im Abschnitt „Übung“
- Aufgabe: Welche Stromstärke zeigt das Display im Bild?
- Antwortformat: eine Zahl eintippen (A)
- Lösung: 0,3 A (erlaubte Abweichung: 0,01 A)
- Erklärung: Das Display zeigt 0,30 A. Das ist eine Stromstärke, keine Spannung.
- Tipp, den die App zeigt: Achte auf die Einheit hinter der Zahl.

### einheiten-umrechnen (generated, number)

- Link: [./#einheiten-umrechnen](./#einheiten-umrechnen), im Abschnitt „Übung“
- Antwortformat: eine Zahl eintippen (A)
- Tipp, den die App zeigt (Vorlage: {{…}} sind die Werte der Aufgabe): 1 A sind 1000 mA. Aus mA wird A, indem du durch 1000 teilst.
- Lösungsweg (Vorlage: {{…}} sind die Werte der Aufgabe):
  - $1\,\text{A} = 1000\,\text{mA}$
  - ${{mA}}\,\text{mA} : 1000 = {{answer}}\,\text{A}$
- Aufgaben nach Nummer, 1 bis 9: jede eine andere (die App zeigt „Aufgabe Nr. …“):
  - [Aufgabe Nr. 1](./?einheiten-umrechnen=1#einheiten-umrechnen): Rechne 100 mA in Ampere um. → Lösung: 0,1 A (erlaubte Abweichung: 0,0001 A)
    - ✗ 100: Das ist noch der Wert in Milliampere. Teile durch 1000, dann hast du Ampere.
    - ✗ 100000: Du hast mit 1000 multipliziert. Bei mA zu A teilst du durch 1000.
  - [Aufgabe Nr. 2](./?einheiten-umrechnen=2#einheiten-umrechnen): Rechne 600 mA in Ampere um. → Lösung: 0,6 A (erlaubte Abweichung: 0,0001 A)
    - ✗ 600: Das ist noch der Wert in Milliampere. Teile durch 1000, dann hast du Ampere.
    - ✗ 600000: Du hast mit 1000 multipliziert. Bei mA zu A teilst du durch 1000.
  - [Aufgabe Nr. 3](./?einheiten-umrechnen=3#einheiten-umrechnen): Rechne 300 mA in Ampere um. → Lösung: 0,3 A (erlaubte Abweichung: 0,0001 A)
    - ✗ 300: Das ist noch der Wert in Milliampere. Teile durch 1000, dann hast du Ampere.
    - ✗ 300000: Du hast mit 1000 multipliziert. Bei mA zu A teilst du durch 1000.
  - [Aufgabe Nr. 4](./?einheiten-umrechnen=4#einheiten-umrechnen): Rechne 800 mA in Ampere um. → Lösung: 0,8 A (erlaubte Abweichung: 0,0001 A)
    - ✗ 800: Das ist noch der Wert in Milliampere. Teile durch 1000, dann hast du Ampere.
    - ✗ 800000: Du hast mit 1000 multipliziert. Bei mA zu A teilst du durch 1000.
  - [Aufgabe Nr. 5](./?einheiten-umrechnen=5#einheiten-umrechnen): Rechne 400 mA in Ampere um. → Lösung: 0,4 A (erlaubte Abweichung: 0,0001 A)
    - ✗ 400: Das ist noch der Wert in Milliampere. Teile durch 1000, dann hast du Ampere.
    - ✗ 400000: Du hast mit 1000 multipliziert. Bei mA zu A teilst du durch 1000.
  - [Aufgabe Nr. 6](./?einheiten-umrechnen=6#einheiten-umrechnen): Rechne 500 mA in Ampere um. → Lösung: 0,5 A (erlaubte Abweichung: 0,0001 A)
    - ✗ 500: Das ist noch der Wert in Milliampere. Teile durch 1000, dann hast du Ampere.
    - ✗ 500000: Du hast mit 1000 multipliziert. Bei mA zu A teilst du durch 1000.
  - [Aufgabe Nr. 7](./?einheiten-umrechnen=7#einheiten-umrechnen): Rechne 200 mA in Ampere um. → Lösung: 0,2 A (erlaubte Abweichung: 0,0001 A)
    - ✗ 200: Das ist noch der Wert in Milliampere. Teile durch 1000, dann hast du Ampere.
    - ✗ 200000: Du hast mit 1000 multipliziert. Bei mA zu A teilst du durch 1000.
  - [Aufgabe Nr. 8](./?einheiten-umrechnen=8#einheiten-umrechnen): Rechne 700 mA in Ampere um. → Lösung: 0,7 A (erlaubte Abweichung: 0,0001 A)
    - ✗ 700: Das ist noch der Wert in Milliampere. Teile durch 1000, dann hast du Ampere.
    - ✗ 700000: Du hast mit 1000 multipliziert. Bei mA zu A teilst du durch 1000.
  - [Aufgabe Nr. 9](./?einheiten-umrechnen=9#einheiten-umrechnen): Rechne 900 mA in Ampere um. → Lösung: 0,9 A (erlaubte Abweichung: 0,0001 A)
    - ✗ 900: Das ist noch der Wert in Milliampere. Teile durch 1000, dann hast du Ampere.
    - ✗ 900000: Du hast mit 1000 multipliziert. Bei mA zu A teilst du durch 1000.

### kilovolt-umrechnen (generated, number)

- Link: [./#kilovolt-umrechnen](./#kilovolt-umrechnen), im Abschnitt „Übung“
- Antwortformat: eine Zahl eintippen (V)
- Tipp, den die App zeigt (Vorlage: {{…}} sind die Werte der Aufgabe): 1 kV sind 1000 V.
- Lösungsweg (Vorlage: {{…}} sind die Werte der Aufgabe):
  - $1\,\text{kV} = 1000\,\text{V}$
  - ${{kV}}\,\text{kV} \cdot 1000 = {{answer}}\,\text{V}$
- Aufgaben nach Nummer, 1 bis 4: jede eine andere (die App zeigt „Aufgabe Nr. …“):
  - [Aufgabe Nr. 1](./?kilovolt-umrechnen=1#kilovolt-umrechnen): Rechne 10 kV in Volt um. → Lösung: 10.000 V
    - ✗ 10: Das ist noch der Wert in Kilovolt. Multipliziere mit 1000, dann hast du Volt.
    - ✗ 0,01: Du hast durch 1000 geteilt. Bei kV zu V multiplizierst du mit 1000.
  - [Aufgabe Nr. 2](./?kilovolt-umrechnen=2#kilovolt-umrechnen): Rechne 4,5 kV in Volt um. → Lösung: 4.500 V
    - ✗ 4,5: Das ist noch der Wert in Kilovolt. Multipliziere mit 1000, dann hast du Volt.
    - ✗ 0,0045: Du hast durch 1000 geteilt. Bei kV zu V multiplizierst du mit 1000.
  - [Aufgabe Nr. 3](./?kilovolt-umrechnen=3#kilovolt-umrechnen): Rechne 2 kV in Volt um. → Lösung: 2.000 V
    - ✗ 2: Das ist noch der Wert in Kilovolt. Multipliziere mit 1000, dann hast du Volt.
    - ✗ 0,002: Du hast durch 1000 geteilt. Bei kV zu V multiplizierst du mit 1000.
  - [Aufgabe Nr. 4](./?kilovolt-umrechnen=4#kilovolt-umrechnen): Rechne 1 kV in Volt um. → Lösung: 1.000 V
    - ✗ 1: Das ist noch der Wert in Kilovolt. Multipliziere mit 1000, dann hast du Volt.
    - ✗ 0,001: Du hast durch 1000 geteilt. Bei kV zu V multiplizierst du mit 1000.
