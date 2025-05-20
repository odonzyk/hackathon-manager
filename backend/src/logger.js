const winston = require('winston');
const { combine, timestamp, printf } = winston.format;

const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const level = process.env.LOG_LEVEL || 'info';
const logDir = process.env.LOG_DIR || 'log';

const logger = winston.createLogger({
  level: level,
  //format: winston.format.json(), // JSON format
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.Console(), // Logs to console
    new winston.transports.File({
      filename: `${logDir}/error.log`,
      level: 'error',
    }),
    new winston.transports.File({ filename: `${logDir}/combined.log` }),
  ],
});

module.exports = logger;
