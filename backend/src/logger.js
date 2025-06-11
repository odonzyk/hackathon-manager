const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

// Funktion für Padding des Levels
const padLevel = (level) => {
  const maxLength = 7; // Maximale Länge des Levels (z. B. "warning")
  return level.toUpperCase().padEnd(maxLength, ' ');
};

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${padLevel(level)}]: ${message}`;
});

const level = process.env.LOG_LEVEL || 'info';
const logDir = process.env.LOG_DIR || 'logs';

const logger = winston.createLogger({
  level: level,
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.Console(), // Logs to console
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: 'error'
    }),
    new winston.transports.File({ filename: `${logDir}/combined.log` })
  ]
});

module.exports = logger;
