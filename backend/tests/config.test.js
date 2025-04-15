const path = require('path');

jest.mock('dotenv', () => ({
  config: jest.fn(),
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
      path: path.resolve(__dirname, '../backend/.env.prod'),
    });
  });

  it('should load dev .env when NODE_ENV=dev', () => {
    process.env.NODE_ENV = 'dev';
    const config = require('../src/config'); // Modul neu laden
    expect(dotenv.config).toHaveBeenCalledWith({
      path: path.resolve(__dirname, '../backend/.env.dev'),
    });
  });

  it('should load stage .env when NODE_ENV is not set', () => {
    delete process.env.NODE_ENV; // NODE_ENV entfernen
    const config = require('../src/config'); // Modul neu laden
    expect(dotenv.config).toHaveBeenCalledWith({
      path: path.resolve(__dirname, '../backend/.env.stage'),
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
    expect(config).toHaveProperty('apiUrl');
    expect(config).toHaveProperty('apiPort');
    expect(config).toHaveProperty('dbPath');
    expect(config).toHaveProperty('jwtSecret');
    expect(config).toHaveProperty('oneSignalApi');
    expect(config).toHaveProperty('appID');
  });
});
