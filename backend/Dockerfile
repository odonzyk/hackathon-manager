# Verwende ein Node.js-Image
FROM node:21

ENV CONFIG_NAME=Production
ENV LOG_LEVEL=debug

# Setze das Arbeitsverzeichnis
WORKDIR /usr/src/app

# Kopiere package.json und package-lock.json (falls vorhanden)
COPY ./package*.json ./

# Installiere Abhängigkeiten
RUN npm install

# Kopiere den Rest der Anwendung
COPY . .

# Exponiere den Port, auf dem der Node.js-Server läuft (z.B. Port 5000)
EXPOSE 3005

# Starte den Server
CMD ["npm", "run start-dev"]