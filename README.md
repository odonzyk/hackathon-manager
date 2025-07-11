# Hackathon Manager

Der Hackathon Manager ist eine Webanwendung zur Organisation und Durchführung von Hackathons.  
Er bietet Funktionen zur Verwaltung von Projekten, Teams und Teilnehmern sowie zur Kommunikation und Zusammenarbeit während des Events.

## Inhalt

- [Motivation](#motivation)
  - [Funktionen](#funktionen)
- [Implementierung](#implementierung)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Howto: Wie starte ich mein Projekt](#howto-wie-starte-ich-mein-projekt)
- [Autoren](#autoren)
- [Build- und Test-Badges](#build-und-test-badges)
- [Lizenz](#lizenz)
- [Code of Conduct](#code-of-conduct)
- [Beitragshinweise](#beitragshinweise)

## Motivation

Der Hackathon Manager dient der Organisation und Durchführung eines Hackathons.

### Funktionen
- **Projektmanagement**: Erstelle und verwalte Projekte
- **Teamverwaltung**: Organisiere Teilnehmer in Teams für die einzelnen Projekte
- **Responsive Design**: Optimiert für Desktop, Tablet und mobile Geräte.

## Implementierung

### Frontend
Das Frontend wurde mit **React (Ionic)** entwickelt und verwendet **Vite** als Build-Tool.  
Es befindet sich im Verzeichnis `/frontend`.

#### Wichtige Technologien:
- **React 18** mit **Ionic 8** für UI-Komponenten
- **Vite** für schnelle Builds und Hot Module Replacement
- **Axios** für API-Anfragen
- **Prettier & ESLint** für Code-Formatierung und Linting
- **Vitest & Cypress** für Tests

### Backend
Das Backend ist eine Node.js (Express) API mit einer SQLLite-Datenbank.  
Es befindet sich im Verzeichnis `/backend`.

#### Wichtige Technologien:
- **Node.js** (Express) als Web-Framework
- **SQLLite** als Datenbank
- **Swagger** für API-Dokumentation
- **JWT** für Authentifizierung
- **Dotenv** für die Verwaltung von Umgebungsvariablen
- **Docker** & **Docker Compose** für containerisierte Bereitstellungen

## Howto: Wie starte ich mein Projekt
Erstelle ein neues unabhängiges Projekt / Verzeichnis!  
Lege dort folgende Verzeichnisse an:

- `./backend/volumes/config`
- `./backend/volumes/data`
- `./backend/volumes/database`
- `./frontend/volumes/config`

Kopiere die `backend/env.example` und die `frontend/env.example` aus diesem Projekt ins neue Projekt:  
```bash
cp this/backend/env.example new/backend/config/env.stage
cp this/backend/env.example new/backend/config/env.prod
cp this/frontend/env.example new/frontend/config/env.stage
cp this/frontend/env.example new/frontend/config/env.prod
```

## Autoren

Du kannst uns fragen, wenn es irgendwelche Fragen gibt!

- J.Zech
- O.Donzyk

## Lizenz
Dieses Projekt steht unter der MIT-Lizenz. Weitere Informationen findest du in der Datei LICENSE.md.

## Code of Conduct
Wir erwarten von allen Mitwirkenden, dass sie sich an unseren [Code of Conduct](CODE_OF_CONDUCT.md) halten, um eine respektvolle und freundliche Community zu fördern.

## Beitragshinweise
Wenn du zum Projekt beitragen möchtest, lies bitte die [Beitragshinweise](CONTRIBUTING.md). 
Dort findest du alle Informationen, wie du Änderungen vorschlagen und Pull Requests einreichen kannst. 

Für eine ausführlichere anleitung zur Einrichtung der Entwicklungsumgebung shau dir die [Entwicklerdokumentation](docs/developing.md) an!

## Build- und Test-Badges

[![Build Status](https://gitlab-ext.drsbln.de/hackathon/hackathon-manager/badges/main/pipeline.svg)](https://gitlab-ext.drsbln.de/hackathon/hackathon-manager/-/commits/main)
