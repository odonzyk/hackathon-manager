# 📦 Changelog

## Version 0.2.6
**Release Date:** 2025-06-06

### ✨ Neue Funktionen
- **Neue Seite: Teilnehmerliste**  
  - Die neue Seite zeigt eine Alphabetische Übersicht aller Teilnehmer
  - Eine Suchfunktion ermöglicht das schnelle Filtern nach Namen.
  - Zusätzlich können Teilnehmer basierend auf Events, an dehnen sie teilgenommen haben, gefiltert werden.
- **Neue Seite: Über uns**  
  - Eine neue Seite mit Informationen über die Anwendung und das Team wurde hinzugefügt.
- **Registrierung neuer Nutzer**  
  - **Wiedererkennung neuer Nutzer**: Bereits initial angelegte Teilnehmer werden erkannt. Dadurch sind vergangene Projekte automatisch den neuen Nutzern zugeordnet
  - **Aktivierungs-E-Mail**: Nach der Registrierung wird eine E-Mail mit einem Aktivierungslink versendet, um die E-Mail-Adresse zu bestätigen.  
  - **Neue Registrierungsseite**: Die Benutzerführung wurde optimiert, um den Registrierungsprozess einfacher und intuitiver zu gestalten.  
  - **Tabbar-Ausblendung**: Die Navigationsleiste wird automatisch ausgeblendet, wenn der Benutzer nicht eingeloggt ist.
  - **Demo Modus**: Solange ein Teilnehmer nicht vollständig freigeschaltet ist, läuft der Hackathon Manager im Demo Modus. Dort sind keine echten Projekte oder Teilnehmerdaten abrufbar.

### 🛠️ Backend-Verbesserungen
- **Rollen- und Berechtigungsprüfung**  
  - Alle relevanten Endpunkte prüfen jetzt die Benutzerrolle, um sicherzustellen, dass nur berechtigte Nutzer Zugriff haben.
- **Privatsphäre-Einstellungen**  
  - Die Privatsphäre-Einstellungen der Benutzer werden jetzt bei allen Datenbankabfragen berücksichtigt.
- **E-Mail-Versand**  
  - Integration von Nodemailer für den Versand von E-Mails über SMTP.
  - Automatischer Versand einer Aktivierungs-E-Mail nach der Registrierung.
- **Unit-Tests**  
  - Die Testabdeckung wurde erweitert, um die neuen Backend-Funktionen abzudecken.

### 🐞 Fehlerbehebungen & Verbesserungen
- **Design-Optimierungen im Header**  
  - Elemente im Header sind jetzt vertikal zentriert.
  - Bei kleineren Bildschirmen wird die Event-Auswahl in die nächste Zeile verschoben, um die Lesbarkeit zu verbessern.
- **Teilnehmer-Logik**  
  - Die Handhabung von leeren Teilnehmerlisten wurde verbessert, um Fehler zu vermeiden.
- **Projekt beitritt fälschlich möglich**  
  - Trotz eines eigenen initierten Projekts war der Beitritt zu anderen Projekten möglich.
- **Stabilitätsverbesserungen**  
  - Kleinere Fehler wurden behoben, um die allgemeine Stabilität und Performance der Anwendung zu erhöhen.

## Version 0.2.5
**Release Date:** 2025-06-04

### ✨ Neue Features
**🏠 Dashboard**
- **Dynamische Teilnehmeranzahl im Dashboard**  
  Die Teilnehmeranzahl im Dashboard wird jetzt als Summe der Initiatoren und Teilnehmer aller Projekte des aktuellen Events angezeigt.
- **Aktuelles Projekt anzeigen**  
  Der Bereich "Dein aktuelles Projekt" zeigt das Projekt des aktuellen Events an, an dem der Benutzer Teilnehmer ist. Falls kein Projekt ausgewählt ist, wird ein Hinweis angezeigt.

**🗂️ Projekt Liste**
- **Begrenzte Beschreibung in der Projektliste**  
  Projektbeschreibungen in der Projektliste werden jetzt auf drei Zeilen begrenzt, um die Übersichtlichkeit zu verbessern. Längere Texte werden automatisch abgeschnitten und mit "..." dargestellt.


**📝 Projekt Detailseite**
- **Teilnehmer-Übersicht in der Projekt-Detailansicht**  
  Teilnehmer und Initiatoren werden jetzt in der Projekt-Detailansicht übersichtlich mit Icons dargestellt. 
- **Badge für Teilnehmer**  
  Wenn der Nutzer Initiator oder Teilnehmer des Projektes ist, wird ihm das durch ein Banner in der rechten Ecke angezeigt.
- **Anpassung des JoinProject-Buttons an den Projekt-Workflow**  
  - Alle Buttons (z. B. "Projekt abgeschlossen", "Projekt abgebrochen", "Projekt beitreten") wurden mit passenden Icons versehen, um die Benutzerfreundlichkeit zu erhöhen.
  - Der Benutzer kann einem Projekt beitreten oder seine Teilname zurückziehen
  - Das Beitreten ist nur möglich, wenn nicht bereits ein anderes Projekt als Teilnehmer oder Initiator unterstützt wird.
- **Responsive Design**  
  Die Teilnehmerliste in der Projekt-Detailansicht passt sich jetzt dynamisch an die Bildschirmgröße an und wird bei kleineren Auflösungen unterhalb der Projektdetails angezeigt.

**👥 Team Liste**
- **Anbindung ans Backend**  
  Es werden nun die echten Teamdaten angezeigt, einschließlich aller Initiatoren und Teilnehmer
- **Verbesserte Darstellung der TeamCards**  
  Die TeamCards wurden optimiert, um die Übersichtlichkeit und Benutzerfreundlichkeit zu verbessern.

**🛠️ Backend**
- **Neue Schnittstellen** 
  - Neue Schnittstellen für das Bearbeiten von Initiatoren und Teilnehmern.
  - Erweiterung des Benutzerprofils um eine Liste aller beigetretenen Projekte.
  - Die Projektliste enthält jetzt eine vollständige Übersicht aller Initiatoren und Teilnehmer.
- **Swagger-Dokumentation aktualisiert**  
  Die API-Dokumentation wurde erweitert, um die neuen Schnittstellen und Änderungen abzubilden.

### 🐞 Bug fixes & Verbesserungen
- **Stabilitätsverbesserungen**  
  Kleinere Fehler wurden behoben, um die allgemeine Stabilität und Performance der Anwendung zu verbessern.
- **Fehler bei leerem participants-Array behoben**  
  Die Logik für die Überprüfung von Teilnehmern wurde angepasst, um sicherzustellen, dass leere Arrays korrekt behandelt werden.

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