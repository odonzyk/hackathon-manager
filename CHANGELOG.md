# 📦 Changelog

## Version 0.2.5
**Release Date:** 2025-06-04

### ✨ Neue Features

**🏠 Dashboard**
- **Dynamische Teilnehmeranzahl im Dashboard**  
  Die Teilnehmeranzahl im Dashboard wird jetzt als Summe der Initiatoren und Teilnehmer aller Projekte des aktuellen Events angezeigt.

**📋 ProjektListe**
- **Begrenzte Beschreibung in der Projektliste**  
  Projektbeschreibungen in der Projektliste werden jetzt auf drei Zeilen begrenzt, um die Übersichtlichkeit zu verbessern.

**📄 ProjektDetailseite**
- **Teilnehmer-Übersicht in der Projekt-Detailansicht**  
  Teilnehmer und Initiatoren werden jetzt in der Projekt-Detailansicht übersichtlich mit Icons dargestellt. 
- **Anpassung des JoinProject-Buttons an den Projekt-Workflow**  
  - Alle Buttons (z. B. "Projekt abgeschlossen", "Projekt abgebrochen", "Projekt beitreten") wurden mit passenden Icons versehen, um die Benutzerfreundlichkeit zu erhöhen.
  - Der Button ist dynamisch deaktiviert, wenn der Benutzer bereits einem Projekt des Events zugeordnet ist.
- **Responsive Design**  
  Die Teilnehmerliste in der Projekt-Detailansicht passt sich jetzt dynamisch an die Bildschirmgröße an und wird bei kleineren Auflösungen unterhalb der Projektdetails angezeigt.

**🛠️ Backend**
- Neue Schnittstellen für das Bearbeiten von Initiatoren und Teilnehmern.
- Erweiterung des Benutzerprofils um eine Liste aller beigetretenen Projekte.
- Erweiterung der Projektliste um eine Liste aller Initiatoren und Teilnehmer.
- Aktualisierung der Swagger-Dokumentation.

### 🐞 Bug fixes & Verbesserungen
- **Stabilitätsverbesserungen**  
  Kleinere Fehler wurden behoben, um die allgemeine Stabilität und Performance der Anwendung zu verbessern.

## Version 0.2.4
**Release Date:** 2025-05-27

### ✨ Neue Features
- 🔄 **Wechsel zwischen Innovation Day 2024 & 2025**  
  Im Header kann nun dynamisch zwischen den beiden Jahren gewechselt werden – inklusive kontextbezogener Anzeige der zugehörigen Projekte.

- ➕ **Projekt-Erstellung direkt aus der Projektliste**  
  Benutzer können neue Projekte direkt über die Projektübersicht anlegen – einfache UX für schnelles Setup.

- 🔍 **Projekt-Detailansicht**  
  Durch Klick auf ein Projekt in der Übersicht öffnet sich eine eigene Detailseite mit allen Infos zum Projekt.

- ✏️ **Projekt bearbeiten**  
  Eigene Projekte können nun direkt über die Detailansicht editiert werden (z. B. Beschreibung, Team, Tags).

- 🧪 **Demo-Daten für 2025**  
  Es wurden die ersten sechs Projekte für den Innovation Day 2025 vorab eingespielt.

### 🐞 Bug fixes & Verbesserungen
- **Stabilitätsverbesserungen**  
  Kleinere Fehler wurden behoben, um die allgemeine Stabilität und Performance der Anwendung zu verbessern.