# 📦 Changelog

## Version 0.3.1
**Release Date:** 2025-10-22

### ✨ Neue Funktionen
- **Daten Update**  
  - Neue Projekte wurde hinzugefügt
  - Initiatoren wurden angepasst
- **Profile Seite** 
  - Die Profile Seite mit der Anzeige des eigenen Profils & der initiierten Projekten wurde hinzugefügt.
  - Das Ändern der eigenen Daten ist nun direkt über die Profilseite möglich.
  - Avatar Bilder hinzugefügt
  - **Passwort zurücksetzen für Organisatoren**  
    - Organisatoren können das Passwort eines Benutzers direkt über die Profilseite zurücksetzen.
    - Das neue Passwort wird zufällig generiert und per E-Mail an den Benutzer gesendet.
- **Teilnehmer Seite**  
  - Die Teilnehmer sind klickbar und es wird das jeweilige Profil geöffnet.
  - Organisatoren können dort auch die Profildaten direkt bearbeiten.
  - Organisatoren können auch die Rolle eines Profils verändern.
  - Legende mit Erläuterung des Farbschema hinzugefügt
- **Projekt Detail Seite**  
  - Organisatoren können Teilnehmer und Initiatoren vom Projekte entfernen.
  - Organisatoren können Nutzer als Teilnehmer o. Initiator zum Projekt hinzufügen.
  - Ein neues Teilnehmer Auswahl Modal unterstützt bei der Suche nach Teilnehmern.


### 🐞 Fehlerbehebungen & Verbesserungen

- **Verbesserte Darstellung der Buttons auf der Profilseite**  
  - Die Buttons "Anrufen" und "Kontakt teilen" auf der Profil Seite wurden optisch angepasst (runde Buttons, weniger prominent).
  - Die Buttons "Mail Adressen Export" und "MS Teams öffnen" auf der Projekt Detail Seite wurden optisch angepasst (runde Buttons, weniger prominent).
  - Hover-Effekte und einheitliches Design für die Buttons hinzugefügt.

## Version 0.3.0
**Release Date:** 2025-10-16

### ✨ Neue Funktionen

- **Stable Hackathon Release**
  - Feature completed MVP
- **Realtime Monitoring per Grafana**
  - Teamgröße pro Projekt
  - Anzahl der Projekte pro Event
  - Registrierte Nutzer insgesamt

### 🐞 Fehlerbehebungen & Verbesserungen
- Eventliste ist nun Klickbar und wechselt das aktuell angezeigte Event
- Status Badge auch auf der Projektliste (Teilnehmer, Initiator, Projekt abgebrochen)
- Teilnehmer & Inititatoren (bei mehr als einem) können nun direkt über das Frontend von Organisatoren gelöscht werden.


## Version 0.2.9
**Release Date:** 2025-10-16

### ✨ Neue Funktionen

- **Teilnehmer Liste**  
  - Farbliche Markierung von Gast & Orga Accounts
- **Backend**  
  - PW Reset Funktion implementiert
  - Absender Mail Adresse freischalten lassen um lange SPAM Filter Zeiten zu reduzieren

### 🐞 Fehlerbehebungen & Verbesserungen
- User konnten keine neuen Projekte anlegnen
- Initiatoren konnten ihre eigenen Projekte nicht editieren
- Erweitertes Prometheus Monitoring 


## Version 0.2.8
**Release Date:** 2025-10-15

### ✨ Neue Funktionen

- **Einstellbare Projekt Teamgröße**  
  - Anpassung der Projektliste mit  Anzeige der max. Teamgröße, basierend auf den individuellen Projekteinstellungen.
  - Anpassung der Projekt Detail Seite mit Anzeige der max. Teamgröße
  - Projekt Edit / Anlegen Seite ermöglicht das Bearbeiten der individuellen Teamgröße
  - Erweiterung der Backend APIs & Datenbank um die Projekt Teamgröße
- **MS Teams Link auf Projektseite**  
  - In der Kopfzeile des Projekts ist ein Button der direkt zum MS Teams Kanal weiterleitet.
  - Projekt Edit / Anlegen Seite ermöglicht das Bearbeiten der MS Teams Chanel ID
  - Erweiterung der Backend APIs & Datenbank um die MS Teams ID
- **Organisator Berechtigung**  
  - Auch Organisatoren dürfen ein Projekt bearbeiten
- **Mail Adressen Export**  
  - Organisatoren haben einen zusätzlichen Button in der Projekt Kopfzeile zum Exportieren aller Teilnehmer Mail Adressen.

### 🐞 Fehlerbehebungen & Verbesserungen
- **Filter auf Projektliste & Teilnehmer liste nicht einheitlich**  
  - Das Design der Elemente ist nun einheitlich
  - Beide Seiten filtern nun direkt beim tippen
  - Auch nach Namen der Initiatoren & Teilnehmern wird wieder gefiltert
- **Monitoring**  
  - Auslesen des Monitoring Backends per Prometheus
  - Aufsetzen eines Grafana Dashbord

## Version 0.2.7
**Release Date:** 2025-10-06

### ✨ Neue Funktionen
- **Neues Design**
  - Ein neues helleres Design das stärker an die Farben und Elemente von Thalia angepasst ist
  - verbesserter Kontrast

## Version 0.2.6
**Release Date:** 2025-09-06

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
- **Prepare Production Release**  
  - Neue Config für die Produktion Umbgebung angelegt
  - Die Deployment Pipelines angepasst um Test & Produktivumgebung zu behandeln.

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