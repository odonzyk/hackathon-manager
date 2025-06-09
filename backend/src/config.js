// be aware that backend is not using vite.env from frontend application, because backend run as seperate application process
// vite frontend variables are public so a security issue to don´t use it together in one .env!

const { log } = require('console');
const dotenv = require('dotenv');
const path = require('path');

const envMap = {
  production: 'prod',
  prod: 'prod',
  development: 'dev',
  dev: 'dev',
  staging: 'stage',
  stage: 'stage'
};

// Wähle das richtige .env-File basierend auf NODE_ENV
const envFile = '.env.' + (envMap[process.env.NODE_ENV?.toLowerCase()] || 'stage');

dotenv.config({ path: path.resolve(__dirname, `../backend/${envFile}`) });

// Rufe die Logging-Funktion auf
logEnvironmentVariables();

module.exports = {
  name: require('../package.json').name,
  version: require('../package.json').version,
  node_env: envMap[process.env.NODE_ENV?.toLowerCase()] || 'dev',
  config_name: check(process.env.CONFIG_NAME, 'default'),
  logLevel: check(process.env.LOG_LEVEL, 'info'),
  apiUrl: check(process.env.API_URL, 'http://localhost'),
  hostUrl: check(process.env.HOST_URL, 'http://localhost'),
  hostPort: check(process.env.HOST_PORT, '8100'),
  apiPort: check(process.env.API_PORT, '3000'),
  dbPath: check(process.env.DB_PATH, './hackathon.db'),
  mysqlHost: check(process.env.MYSQL_HOST, 'localhost'),
  mysqlPort: check(process.env.MYSQL_PORT, 3306),
  mysqlUser: check(process.env.MYSQL_USER, 'root'),
  mysqlPassword: check(process.env.MYSQL_PASSWORD, 'password'),
  mysqlDb: check(process.env.MYSQL_DB, 'hackathon'),
  mysqlConnectionLimit: check(process.env.MYSQL_CONNECTION_LIMIT, 10),
  mysqlQueueLimit: check(process.env.MYSQL_QUEUE_LIMIT, 0),
  jwtSecret: check(process.env.JWT_SECRET, 'your-secret-key'),
  allowedDomains: check(process.env.ALLOWED_DOMAINS, 'dummy.de'),
  activationUrl: check(process.env.ACTIVATION_URL, 'http://localhost:3000/api/user/activate'),
  smtpHost: check(process.env.SMTP_HOST, 'localhost'),
  smtpPort: check(process.env.SMTP_PORT, 587),
  smtpSecure: check(process.env.SMTP_SECURE, false),
  smtpUser: check(process.env.SMTP_USER, ''),
  smtpPassword: check(process.env.SMTP_PASSWORD, ''),
  smtpFrom: check(process.env.SMTP_FROM, ''),
  check,
  logEnvironmentVariables
};

function check(value, defaultValue) {
  if (typeof value === 'undefined' || value === null) {
    return defaultValue;
  }
  if (typeof defaultValue === 'number') {
    return isNaN(Number(value)) ? defaultValue : Number(value);
  }
  if (typeof defaultValue === 'boolean') {
    return value === 'true' || value === true;
  }
  return value;
}

// Externe Logging-Funktion
function logEnvironmentVariables() {
  // Printout only in debug mode
  if (process.env.LOG_LEVEL !== 'debug') return;

  // Use console.log, because logger is not available at start time
  console.log('### Config Printout #########################################');
  console.log('Aktuelles Arbeitsverzeichnis:', process.cwd());
  console.log('Verzeichnis der Datei:', __dirname);

  console.log('CONFIG_NAME:', process.env.CONFIG_NAME);
  console.log('LOG_LEVEL:', process.env.LOG_LEVEL);
  console.log('API_URL:', process.env.API_URL);
  console.log('API_PORT:', process.env.API_PORT);
  console.log('HOST_URL:', process.env.HOST_URL);
  console.log('HOST_PORT:', process.env.HOST_PORT);
  console.log('SMTP_HOST:', process.env.SMTP_HOST);
  console.log('SMTP_PORT:', process.env.SMTP_PORT);
  console.log('SMTP_SECURE:', process.env.SMTP_SECURE);
  console.log('SMTP_USER:', process.env.SMTP_USER);

  console.log('Aktueller Modus (NODE_ENV):', process.env.NODE_ENV || 'nicht gesetzt');
  console.log('Geladene .env-Datei:', envFile);
  console.log('#############################################################');
}
