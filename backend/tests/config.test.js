const path = require('path');

jest.mock('dotenv', () => ({
  config: jest.fn()
}));

describe('Environment Config', () => {
  let dotenv;

  beforeEach(() => {
    jest.resetModules(); // Module-Cache leeren, um require() zu erzwingen
    jest.clearAllMocks(); // Aufrufhistorie aller Mocks zurücksetzen
    dotenv = require('dotenv');
  });

  it('should load production .env when NODE_ENV=production', () => {
    process.env.NODE_ENV = 'production';
    const config = require('../src/config'); // Modul neu laden
    expect(dotenv.config).toHaveBeenCalledWith({
      path: path.resolve(__dirname, '../backend/.env.prod')
    });
  });

  it('should load dev .env when NODE_ENV=dev', () => {
    process.env.NODE_ENV = 'dev';
    const config = require('../src/config'); // Modul neu laden
    expect(dotenv.config).toHaveBeenCalledWith({
      path: path.resolve(__dirname, '../backend/.env.dev')
    });
  });

  it('should load stage .env when NODE_ENV is not set', () => {
    delete process.env.NODE_ENV; // NODE_ENV entfernen
    const config = require('../src/config'); // Modul neu laden
    expect(dotenv.config).toHaveBeenCalledWith({
      path: path.resolve(__dirname, '../backend/.env.stage')
    });
  });
});

/** Testet die `check()`-Funktion **/
describe('check() function', () => {
  // Funktion `check()` aus der Konfigurationsdatei extrahieren
  const { check } = require('../src/config');

  it('should return the given value if defined', () => {
    expect(check('test-value', 'default')).toBe('test-value');
  });

  it('should return the default value if value is undefined', () => {
    expect(check(undefined, 'default')).toBe('default');
  });

  it('should return the default value if value is null', () => {
    expect(check(null, 'default')).toBe('default');
  });

  it('should convert numeric values correctly', () => {
    expect(check('42', 10)).toBe(42);
    expect(check('abc', 10)).toBe(10); // Ungültige Zahl → default zurückgeben
  });
});

/** Testet Properties **/
describe('Environment Config properties', () => {
  /** Testet, ob die Konfiguration korrekt exportiert wurde **/
  const config = require('../src/config'); // Modul neu laden

  it('should export the correct configuration values', () => {
    expect(config).toHaveProperty('name');
    expect(config).toHaveProperty('version');
    expect(config).toHaveProperty('node_env');
    expect(config).toHaveProperty('logLevel');
    expect(config).toHaveProperty('apiUrl');
    expect(config).toHaveProperty('apiPort');
    expect(config).toHaveProperty('dbPath');
    expect(config).toHaveProperty('jwtSecret');
  });
});

describe('logEnvironmentVariables', () => {
  let originalLog;

  beforeEach(() => {
    jest.resetModules(); // Module-Cache leeren, um require() zu erzwingen
    jest.clearAllMocks(); // Aufrufhistorie aller Mocks zurücksetzen
    originalLog = console.log;
    console.log = jest.fn();
    dotenv = require('dotenv');
  });

  afterEach(() => {
    // Restore original console.log
    console.log = originalLog;
  });

  it('should log environment variables in debug mode', () => {
    // Simuliere Umgebungsvariablen
    process.env.LOG_LEVEL = 'debug';
    process.env.CONFIG_NAME = 'test-config';
    process.env.API_URL = 'http://localhost';
    process.env.API_PORT = '3000';
    process.env.HOST_URL = 'http://localhost';
    process.env.HOST_PORT = '8100';
    process.env.NODE_ENV = 'development';

    const config = require('../src/config'); // Modul neu laden
    config.logEnvironmentVariables();

    // Überprüfe, ob die erwarteten Werte geloggt wurden
    expect(console.log).toHaveBeenCalledWith('### Config Printout #########################################');
    expect(console.log).toHaveBeenCalledWith('Aktuelles Arbeitsverzeichnis:', process.cwd());
    expect(console.log).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('CONFIG_NAME:', 'test-config');
    expect(console.log).toHaveBeenCalledWith('LOG_LEVEL:', 'debug');
    expect(console.log).toHaveBeenCalledWith('API_URL:', 'http://localhost');
    expect(console.log).toHaveBeenCalledWith('API_PORT:', '3000');
    expect(console.log).toHaveBeenCalledWith('HOST_URL:', 'http://localhost');
    expect(console.log).toHaveBeenCalledWith('HOST_PORT:', '8100');
    expect(console.log).toHaveBeenCalledWith('Aktueller Modus (NODE_ENV):', 'development');
    expect(console.log).toHaveBeenCalledWith('Geladene .env-Datei:', '.env.dev');
    expect(console.log).toHaveBeenCalledWith('#############################################################');
  });

  it('should not log anything if LOG_LEVEL is not debug', () => {
    // Simuliere Umgebungsvariablen
    process.env.LOG_LEVEL = 'info';
    const { logEnvironmentVariables } = require('../src/config');
    // Rufe die Methode auf
    logEnvironmentVariables();

    // Überprüfe, dass console.log nicht aufgerufen wurde
    expect(console.log).not.toHaveBeenCalled();
  });
});
