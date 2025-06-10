# Verwende ein Node.js-Image
FROM node:21

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

# Setze das Arbeitsverzeichnis
WORKDIR /usr/src/app

# Installiere Postfix und andere benötigte Pakete
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y postfix mailutils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Kopiere package.json und package-lock.json (falls vorhanden)
COPY ./package*.json ./

# Installiere Node.js-Abhängigkeiten
RUN npm install

# Kopiere den Rest der Anwendung
COPY . .

# Exponiere den Port, auf dem der Node.js-Server läuft
EXPOSE 3005

# Starte den Node.js-Server
CMD ["npm", "run", "start"]