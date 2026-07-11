# MatchVault

MatchVault ist ein Nuxt-basiertes Tool zum Speichern, Analysieren und Auswerten von Pokémon TCG Live Kampflogs.

Mit MatchVault kannst du:

- Pokémon TCG Live Kampflogs einfügen
- Kampflogs automatisch auswerten lassen
- eigene Decks verwalten
- ein Main-Deck festlegen
- Matchups nach Deck, Gegner, Pokémon, Format, Datum und Startposition filtern
- Tageslogs direkt im Dashboard sehen
- Matchup-Statistiken für eigene und gegnerische Decks auswerten

## Tech Stack

Das Projekt nutzt:

- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS
- Supabase
- npm

## Voraussetzungen

Installiert sein sollten:

- Node.js
- npm
- ein Supabase-Projekt mit den benötigten Tabellen und Policies

## Projektstruktur

Wichtige Ordner und Dateien:

- components/ Wiederverwendbare Vue-Komponenten
- composables/ Wiederverwendbare Logik
- data/ JSON-Daten wie Pokémon und Formate
- middleware/ Nuxt Middleware
- pages/ Seiten und Routen
- types/ TypeScript-Typen
- utils/ Parser, Formatter und Helper
- scripts/ generate-pokemon-data.mjs

## Supabase

Die App nutzt Supabase für:

- Authentifizierung
- Profile
- Decks
- Kampflogs

Benötigte Tabellen sind unter anderem:

- `profiles`
- `decks`
- `battle_logs`

Die Tabellen sollten Row Level Security verwenden, sodass User nur ihre eigenen Daten lesen und schreiben können.


## Projekt installieren
```
npm install
```

## Entwicklungsserver starten
```
npm run dev
```
Die App läuft danach standardmäßig unter:
http://localhost:3000

## Produktionsbuild erstellen
```
npm run build
```

## Produktionsbuild lokal testen
```
npm run preview
```

## Pokémon-Daten neu generieren
```
npm run generate:pokemon
```

Das Script lädt die Pokémon-Daten neu, formatiert sie und speichert sie lokal im Projekt.

## Tests

Das Projekt nutzt Vitest für einfache Unit-Tests der zentralen Funktionen.

Die Tests liegen im Ordner:
tests/unit

Aktuell werden unter anderem folgende Bereiche getestet:

- Formatierung von Kampflog-Daten
- Parsing von Kampflogs
- Validierung von Kampflogs

Die Testdateien folgen dem Schema:
*.spec.ts

Beispiele:

- `tests/unit/battle-log-formatting.spec.ts`
- `tests/unit/battle-log-parser.spec.ts`
- `tests/unit/battle-log-validator.spec.ts`

### Tests im Watch-Modus starten
```
npm run test
```

### Tests einmalig ausführen
```
npm run test:run
```

Die Vitest-Konfiguration befindet sich in:
vitest.config.ts

Aktuell werden nur Unit-Tests aus folgendem Pfad ausgeführt:
tests/unit/**/*.spec.ts

## Format-Liste pflegen

Die auswählbaren Formate werden über diese Datei gepflegt:

app/data/formats.json

Beispiel:
```
{
    "label": "TEF-CRI",
    "value": "TEF-CRI"
}
```
Wenn ein neues Set dazukommt, muss nur diese JSON-Datei erweitert werden.

## Test-User

Zum Testen kann folgender Account verwendet werden:
```
E-Mail: test@example.com 
Passwort: 123456
```

## Live
Kann unter der URL https://afuhst.hoffmann-net.de/ eingesehen werden. Hier kann der Test-User genutzt werden um das Projekt live zu testen und anzuschauen.

## Grundlegender Ablauf

1. App starten
2. Mit dem Test-User einloggen
3. Im Profil den Pokémon TCG Live Spielernamen hinterlegen
4. Decks anlegen
5. Optional ein Main-Deck per Stern auf der Decks-Seite festlegen
6. Kampflog im Dashboard oder unter Logs einfügen
7. Kampflog prüfen und ergänzen
8. Format, eigenes Deck und gegnerisches Deck auswählen
9. Kampflog speichern
10. Matchups und Statistiken auswerten

## Beispiel-Kampflog

Das folgende Kampflog kann zum Testen eingefügt werden:

```
Vorbereitung
DxBxUTxN hat Zahl für den Münzwurf am Anfang gewählt.
Y2Andi hat den Münzwurf gewonnen.
Y2Andi möchte als Erster dran sein.
DxBxUTxN hat für die Starthand 7 Karten gezogen.
- 7 gezogene Karten
Y2Andi hat für die Starthand 7 Karten gezogen.
- 7 gezogene Karten
   • Poképad, Klarins Igelavar, Grolldra, Klarins Abenteuer, Reif der Tapferkeit, Klarins Abenteuer, Hyperball
DxBxUTxN hat einen Neustart gemacht.
- Enthüllte Karten vom Neustart: 1
   • Mega-Quajutsu-ex, Lotta, Team Rockets Lambda, Amphizel, Lillys Entschlossenheit, Luftballon, Mega-Quajutsu-ex
DxBxUTxN hat 2 Neustarts gemacht.
- Enthüllte Karten vom Neustart: 2
   • Lillys Entschlossenheit, Basis-Wasser-Energie, Lillys Entschlossenheit, Basis-Wasser-Energie, Hyperball, Mega-Quajutsu-ex, Energiesuche
Y2Andi hat 2 zusätzliche Karten gezogen, weil DxBxUTxN mindestens 1 Neustart hatte.
- Y2Andi hat 2 Karten gezogen.
   • Klarins Tornupto, Poképad
DxBxUTxN hat Sterndu in die Aktive Position gelegt.
Y2Andi hat Grolldra in die Aktive Position gelegt.

Zug von Y2Andi
Y2Andi hat Dicke-Freunde-Knursp gezogen.
Y2Andi hat Dicke-Freunde-Knursp gespielt.
- Y2Andi hat 2 Karten gezogen und auf die Bank gespielt.
   • Grolldra, Klarins Feurigel
- Y2Andi hat das eigene Deck gemischt.
Y2Andi hat Poképad gespielt.
- Y2Andi hat Shaymin gezogen.
- Y2Andi hat das eigene Deck gemischt.
Y2Andi hat Shaymin auf die Bank gelegt.
Y2Andi hat den eigenen Zug beendet.

Zug von DxBxUTxN
DxBxUTxN hat eine Karte gezogen.
DxBxUTxN hat Basis-Wasser-Energie an Sterndu in der Aktiven Position angelegt.
DxBxUTxN hat Lotta gespielt.
- DxBxUTxN hat 2 Karten gezogen.
   • Mega-Starmie-ex, Neo-Aufputsch-Energie
- DxBxUTxN hat das eigene Deck gemischt.
Sterndu von DxBxUTxN hat Aquaknarre gegen Grolldra von Y2Andi für 20 Schadenspunkte eingesetzt.

Zug von Y2Andi
Y2Andi hat Klarins Tornupto gezogen.
Y2Andi hat Klarins Feurigel auf der Bank zu Klarins Igelavar entwickelt.
Y2Andi hat Poképad gespielt.
- Y2Andi hat Phandra gezogen.
- Y2Andi hat das eigene Deck gemischt.
Y2Andi hat Grolldra auf der Bank zu Phandra entwickelt.
Klarins Igelavar von Y2Andi hat Reisen verbindet eingesetzt.
- Y2Andi hat Klarins Abenteuer gezogen.
- Y2Andi hat das eigene Deck gemischt.
Y2Andi hat Klarins Abenteuer gespielt.
- Y2Andi hat 3 Karten gezogen.
   • Basis-Feuer-Energie, Klarins Feurigel, Klarins Feurigel
- Y2Andi hat das eigene Deck gemischt.
Y2Andi hat Klarins Feurigel auf die Bank gelegt.
Phandra von Y2Andi hat Erkundungsbefehl eingesetzt.
- Y2Andi hat Dicke-Freunde-Knursp gezogen.
Y2Andi hat Dicke-Freunde-Knursp gespielt.
- Y2Andi hat Knospi gezogen und auf die Bank gelegt.
- Y2Andi hat das eigene Deck gemischt.
Y2Andi hat Basis-Feuer-Energie an Grolldra in der Aktiven Position angelegt.
Y2Andi hat Grolldra auf die Bank zurückgezogen.
- Grolldra von Y2Andi hat Basis-Feuer-Energie auf den Ablagestapel gelegt.
Knospi von Y2Andi ist jetzt in der Aktiven Position.
Knospi von Y2Andi hat Juckende Pollen gegen Sterndu von DxBxUTxN für 10 Schadenspunkte eingesetzt.

Zug von DxBxUTxN
DxBxUTxN hat eine Karte gezogen.
DxBxUTxN hat Sterndu in der Aktiven Position zu Mega-Starmie-ex entwickelt.
DxBxUTxN hat Basis-Wasser-Energie an Mega-Starmie-ex in der Aktiven Position angelegt.
Mega-Starmie-ex von DxBxUTxN hat Wasserschwall gegen Knospi von Y2Andi für 120 Schadenspunkte eingesetzt.
Shaymin von Y2Andi hat Blumenschleier eingesetzt.
- Schaden für Grolldra wurde verhindert.
Knospi von Y2Andi wurde kampfunfähig gemacht!
DxBxUTxN hat eine Preiskarte aufgenommen.
Eine Karte wurde zu der Hand von DxBxUTxN hinzugefügt.
Klarins Igelavar von Y2Andi ist jetzt in der Aktiven Position.

Zug von Y2Andi
Y2Andi hat Sonderbonbon gezogen.
Y2Andi hat Klarins Feurigel auf die Bank gelegt.
Klarins Igelavar von Y2Andi hat Reisen verbindet eingesetzt.
- Y2Andi hat Klarins Abenteuer gezogen.
- Y2Andi hat das eigene Deck gemischt.
Y2Andi hat Klarins Abenteuer gespielt.
- Y2Andi hat 3 Karten gezogen.
   • Basis-Feuer-Energie, Basis-Feuer-Energie, Klarins Igelavar
- Y2Andi hat das eigene Deck gemischt.
Y2Andi hat Klarins Igelavar in der Aktiven Position zu Klarins Tornupto entwickelt.
Y2Andi hat Reif der Tapferkeit an Klarins Tornupto in der Aktiven Position angelegt.
Y2Andi hat Basis-Feuer-Energie an Klarins Tornupto in der Aktiven Position angelegt.
Y2Andi hat Hyperball gespielt.
- Y2Andi hat 2 Karten auf den Ablagestapel gelegt.
   • Klarins Abenteuer, Klarins Abenteuer
- Y2Andi hat Phandra gezogen.
- Y2Andi hat das eigene Deck gemischt.
Y2Andi hat Grolldra auf der Bank zu Phandra entwickelt.
Y2Andi hat Sonderbonbon gespielt.
- Y2Andi hat Klarins Feurigel auf der Bank zu Klarins Tornupto entwickelt.
Phandra von Y2Andi hat Erkundungsbefehl eingesetzt.
- Y2Andi hat Befehl vom Boss gezogen.
Phandra von Y2Andi hat Erkundungsbefehl eingesetzt.
- Y2Andi hat Hyperball gezogen.
Klarins Tornupto von Y2Andi hat Kumpel-Explosion gegen Mega-Starmie-ex von DxBxUTxN für 310 Schadenspunkte eingesetzt.
- Schadensaufteilung:
   • Grundschaden: 40 Schadenspunkte
   • (Pokémon-Ausrüstung) Reif der Tapferkeit: 30 Schadenspunkte
   • (4) Karten im Ablagestapel: 240 Schadenspunkte
   • Gesamtschaden: 310 Schadenspunkte


Zug von DxBxUTxN
DxBxUTxN hat eine Karte gezogen.
DxBxUTxN hat Dicke-Freunde-Knursp gespielt.
- DxBxUTxN hat 2 Karten gezogen und auf die Bank gespielt.
   • Sterndu, Froxy
- DxBxUTxN hat das eigene Deck gemischt.
DxBxUTxN hat Dicke-Freunde-Knursp gespielt.
- DxBxUTxN hat 2 Karten gezogen und auf die Bank gespielt.
   • Froxy, Froxy
- DxBxUTxN hat das eigene Deck gemischt.
DxBxUTxN hat Neo-Aufputsch-Energie an Froxy auf der Bank angelegt.
Mega-Starmie-ex von DxBxUTxN hat Wasserschwall gegen Klarins Tornupto von Y2Andi für 240 Schadenspunkte eingesetzt. Klarins Tornupto von Y2Andi hat 120 Schadenspunkte mehr erhalten, weil es Schwäche gegen Wasser hat.
- Schadensaufteilung:
   • Grundschaden: 120 Schadenspunkte
   • Schwäche gegen Wasser: 120 Schadenspunkte
   • Gesamtschaden: 240 Schadenspunkte

Shaymin von Y2Andi hat Blumenschleier eingesetzt.
- Schaden für Shaymin wurde verhindert.
Klarins Tornupto von Y2Andi wurde kampfunfähig gemacht!
- 4 Karten wurden von Klarins Tornupto von Y2Andi auf den Ablagestapel gelegt.
   • Basis-Feuer-Energie, Klarins Igelavar, Klarins Feurigel, Reif der Tapferkeit
DxBxUTxN hat eine Preiskarte aufgenommen.
Eine Karte wurde zu der Hand von DxBxUTxN hinzugefügt.
Klarins Tornupto von Y2Andi ist jetzt in der Aktiven Position.

Zug von Y2Andi
Y2Andi hat Victini gezogen.
Y2Andi hat Klarins Feurigel auf der Bank zu Klarins Igelavar entwickelt.
Y2Andi hat Basis-Feuer-Energie an Klarins Tornupto in der Aktiven Position angelegt.
Phandra von Y2Andi hat Erkundungsbefehl eingesetzt.
- Y2Andi hat Basis-Feuer-Energie gezogen.
Phandra von Y2Andi hat Erkundungsbefehl eingesetzt.
- Y2Andi hat Dicke-Freunde-Knursp gezogen.
Y2Andi hat Dicke-Freunde-Knursp gespielt.
- Y2Andi hat das eigene Deck gemischt.
Y2Andi hat Befehl vom Boss gespielt.
- Froxy von DxBxUTxN wurde mit Mega-Starmie-ex von DxBxUTxN ausgetauscht, um das Aktive Pokémon zu sein.
Froxy von DxBxUTxN ist jetzt in der Aktiven Position.
Klarins Tornupto von Y2Andi hat Kumpel-Explosion gegen Froxy von DxBxUTxN für 280 Schadenspunkte eingesetzt.
- Schadensaufteilung:
   • Grundschaden: 40 Schadenspunkte
   • (4) Karten im Ablagestapel: 240 Schadenspunkte
   • Gesamtschaden: 280 Schadenspunkte

Froxy von DxBxUTxN wurde kampfunfähig gemacht!
Froxy von DxBxUTxN hat Neo-Aufputsch-Energie auf den Ablagestapel gelegt.
Y2Andi hat eine Preiskarte aufgenommen.
Hyperball wurde zu der Hand von Y2Andi hinzugefügt.
Mega-Starmie-ex von DxBxUTxN ist jetzt in der Aktiven Position.

Zug von DxBxUTxN
DxBxUTxN hat eine Karte gezogen.
DxBxUTxN hat Froxy auf der Bank zu Amphizel entwickelt.
DxBxUTxN hat Surfstrand auf das Stadion-Feld gespielt.
DxBxUTxN hat Luftballon an Amphizel auf der Bank angelegt.
Mega-Starmie-ex von DxBxUTxN hat Wasserschwall gegen Klarins Tornupto von Y2Andi für 240 Schadenspunkte eingesetzt. Klarins Tornupto von Y2Andi hat 120 Schadenspunkte mehr erhalten, weil es Schwäche gegen Wasser hat.
- Schadensaufteilung:
   • Grundschaden: 120 Schadenspunkte
   • Schwäche gegen Wasser: 120 Schadenspunkte
   • Gesamtschaden: 240 Schadenspunkte

Shaymin von Y2Andi hat Blumenschleier eingesetzt.
- Schaden für Phandra wurde verhindert.
Klarins Tornupto von Y2Andi wurde kampfunfähig gemacht!
- 2 Karten wurden von Klarins Tornupto von Y2Andi auf den Ablagestapel gelegt.
   • Basis-Feuer-Energie, Klarins Feurigel
DxBxUTxN hat eine Preiskarte aufgenommen.
Eine Karte wurde zu der Hand von DxBxUTxN hinzugefügt.
Klarins Igelavar von Y2Andi ist jetzt in der Aktiven Position.

Zug von Y2Andi
Y2Andi hat Schwarzgurt-Training gezogen.
Y2Andi hat Basis-Feuer-Energie an Klarins Igelavar in der Aktiven Position angelegt.
Phandra von Y2Andi hat Erkundungsbefehl eingesetzt.
- Y2Andi hat Kampfkäfig gezogen.
Phandra von Y2Andi hat Erkundungsbefehl eingesetzt.
- Y2Andi hat Spezielle Rote Karte gezogen.
Y2Andi hat Kampfkäfig auf das Stadion-Feld gespielt.
- Y2Andi hat Surfstrand auf den Ablagestapel gelegt.
Y2Andi hat Spezielle Rote Karte gespielt.
- DxBxUTxN hat die eigenen Handkarten gemischt.
- Y2Andi hat 5 Karten unter das eigene Deck gelegt.
- Y2Andi hat 3 Karten gezogen.
Y2Andi hat Hyperball gespielt.
- Y2Andi hat 2 Karten auf den Ablagestapel gelegt.
   • Victini, Hyperball
- Y2Andi hat Klarins Tornupto gezogen.
- Y2Andi hat das eigene Deck gemischt.
Y2Andi hat Klarins Igelavar in der Aktiven Position zu Klarins Tornupto entwickelt.
Klarins Tornupto von Y2Andi hat Kumpel-Explosion gegen Mega-Starmie-ex von DxBxUTxN für 280 Schadenspunkte eingesetzt.
- Schadensaufteilung:
   • Grundschaden: 40 Schadenspunkte
   • (4) Karten im Ablagestapel: 240 Schadenspunkte
   • Gesamtschaden: 280 Schadenspunkte

Mega-Starmie-ex von DxBxUTxN wurde kampfunfähig gemacht!
- 3 Karten wurden von Mega-Starmie-ex von DxBxUTxN auf den Ablagestapel gelegt.
   • Basis-Wasser-Energie, Basis-Wasser-Energie, Sterndu
Y2Andi hat 3 Preiskarten aufgenommen.
Klarins Feurigel wurde zu der Hand von Y2Andi hinzugefügt.
Nachttrage wurde zu der Hand von Y2Andi hinzugefügt.
Lillys Entschlossenheit wurde zu der Hand von Y2Andi hinzugefügt.
Amphizel von DxBxUTxN ist jetzt in der Aktiven Position.

Zug von DxBxUTxN
DxBxUTxN hat eine Karte gezogen.
DxBxUTxN hat Dicke-Freunde-Knursp gespielt.
- DxBxUTxN hat das eigene Deck gemischt.
DxBxUTxN hat Sterndu auf der Bank zu Mega-Starmie-ex entwickelt.
DxBxUTxN hat Befehl vom Boss gespielt.
- Shaymin von Y2Andi wurde mit Klarins Tornupto von Y2Andi ausgetauscht, um das Aktive Pokémon zu sein.
Shaymin von Y2Andi ist jetzt in der Aktiven Position.
DxBxUTxN hat Luftballon an Mega-Starmie-ex auf der Bank angelegt.
DxBxUTxN hat Amphizel auf die Bank zurückgezogen.
Mega-Starmie-ex von DxBxUTxN ist jetzt in der Aktiven Position.
DxBxUTxN hat den eigenen Zug beendet.

Zug von Y2Andi
Y2Andi hat Enton gezogen.
Y2Andi hat Klarins Feurigel auf die Bank gelegt.
Phandra von Y2Andi hat Erkundungsbefehl eingesetzt.
- Y2Andi hat Tracys Unterstützung gezogen.
Phandra von Y2Andi hat Erkundungsbefehl eingesetzt.
- Y2Andi hat Reif der Tapferkeit gezogen.
Y2Andi hat Nachttrage gespielt.
- Y2Andi hat Basis-Feuer-Energie von Y2Andi auf die Hand von Y2Andi gegeben.
Y2Andi hat Basis-Feuer-Energie an Shaymin in der Aktiven Position angelegt.
Y2Andi hat Shaymin auf die Bank zurückgezogen.
- Shaymin von Y2Andi hat Basis-Feuer-Energie auf den Ablagestapel gelegt.
Klarins Tornupto von Y2Andi ist jetzt in der Aktiven Position.
Y2Andi hat Reif der Tapferkeit an Klarins Tornupto in der Aktiven Position angelegt.
Y2Andi hat Schwarzgurt-Training gespielt.
Klarins Tornupto von Y2Andi hat Kumpel-Explosion gegen Mega-Starmie-ex von DxBxUTxN für 350 Schadenspunkte eingesetzt.
- Schadensaufteilung:
   • Grundschaden: 40 Schadenspunkte
   • (Pokémon-Ausrüstung) Reif der Tapferkeit: 30 Schadenspunkte
   • (Unterstützer) Schwarzgurt-Training: 40 Schadenspunkte
   • (4) Karten im Ablagestapel: 240 Schadenspunkte
   • Gesamtschaden: 350 Schadenspunkte

Mega-Starmie-ex von DxBxUTxN wurde kampfunfähig gemacht!
- 2 Karten wurden von Mega-Starmie-ex von DxBxUTxN auf den Ablagestapel gelegt.
   • Sterndu, Luftballon
Y2Andi hat 2 Preiskarten aufgenommen.
Lillys Entschlossenheit wurde zu der Hand von Y2Andi hinzugefügt.
Ausrüstungsentsorger wurde zu der Hand von Y2Andi hinzugefügt.
Alle Preiskarten genommen. Y2Andi hat gewonnen.
```

## Wichtige Features

### Dashboard

Das Dashboard zeigt:

- Profilinformationen
- Formular zum Einfügen eines Kampflogs
- heutige Kampflogs

### Decks

Auf der Decks-Seite kannst du:

- neue Decks erstellen
- Pokémon pro Deck auswählen
- Decks löschen
- ein Main-Deck per Stern festlegen

Das Main-Deck wird im Profil als Standard-Deck gespeichert.

### Profil

Im Profil kannst du:

- deinen Pokémon TCG Live Spielernamen speichern
- einen Anzeigenamen setzen
- dein Standard-/Main-Deck auswählen

Der Spielername ist wichtig, damit die App im Kampflog erkennt, welcher Spieler du bist.

### Kampflogs

Beim Einfügen eines Kampflogs wird versucht:

- Spielername zu erkennen
- Gegner zu erkennen
- Ergebnis zu erkennen
- Startposition zu erkennen
- relevante Informationen für die Matchup-Auswertung zu speichern

### Matchups

Die Matchup-Seiten ermöglichen Auswertungen nach:

- eigenem Deck
- gegnerischem Deck
- Pokémon
- Format
- Zeitraum
- Startposition
- Ergebnis

## Lizenz

Dieses Projekt ist privat und aktuell nicht für eine öffentliche Distribution vorbereitet.