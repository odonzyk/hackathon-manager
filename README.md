# Hackathon Manager

Der Hackathon Manager ist eine Webanwendung zur Organisation und Durchführung von Hackathons.  
Er bietet Funktionen zur Verwaltung von Projekten, Teams und Teilnehmern sowie zur Kommunikation und Zusammenarbeit während des Events.

## Inhalt

- [Motivation](#motivation)
  - [Funktionen](#funktionen)
- [Implementierung](#implementierung)
  - [Frontend](#frontend)
  - [Backend](#backend)
- [Schnellstart mit Docker-Compose auf dem eigenen lokalen Rechner](#Schnellstart mit Docker-Compose auf dem eigenen lokalen Rechner)
- [Entwicklung](#entwicklung)
- [Autoren](#autoren)
- [Build- und Test-Badges](#build-und-test-badges)

## Motivation

Der Hackathon Manager dient der Organisation und Durchführung eines Hackathons.

### Funktionen
- **Projektmanagement**: Erstelle und verwalte Projekte
- **Teamverwaltung**: Organisiere Teilnehmer in Teams für die einzelnene Projekte
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

## Schnellstart mit Docker-Compose auf dem eigenen lokalen Rechner

[![Readme Docker-Compose lokaler start](https://github.com/odonzyk/hackathon-manager/blob/develop/localhost/README.md)

## Entwicklung

Möchtest du als Entwickler beitragen? Schau dir die [Entwicklerdokumentation](docs/developing.md) an, um loszulegen!

## Autoren

Du kannst uns fragen, wenn es irgendwelche Fragen gibt!

- J.Zech
- O.Donzyk (Initialentwurf)

## Build- und Test-Badges

[![Build Status](https://gitlab-ext.drsbln.de/hackathon/hackathon-manager/badges/main/pipeline.svg)](https://gitlab-ext.drsbln.de/hackathon/hackathon-manager/-/commits/main)
