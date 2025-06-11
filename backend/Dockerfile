# Verwende ein Node.js-Image
FROM node:21

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

# Setze das Arbeitsverzeichnis
WORKDIR /usr/src/app

# Installiere Postfix, mailutils und msmtp
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
        mailutils \
        msmtp && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Lege die /etc/msmtprc Konfigurationsdatei an
RUN echo "defaults" > /etc/msmtprc && \
    echo "auth           off" >> /etc/msmtprc && \
    echo "tls            off" >> /etc/msmtprc && \
    echo "logfile        /tmp/msmtp.log" >> /etc/msmtprc && \
    echo "" >> /etc/msmtprc && \
    echo "account default" >> /etc/msmtprc && \
    echo "host           172.17.0.1" >> /etc/msmtprc && \
    echo "port           25" >> /etc/msmtprc && \
    echo "from           hackathon@thalia.de" >> /etc/msmtprc && \
    chmod 644 /etc/msmtprc

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