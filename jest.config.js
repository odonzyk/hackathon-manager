module.exports = {
    testEnvironment: 'node', // Nutze die Node-Umgebung für Tests
    verbose: true, // Zeige detaillierte Testausgaben
    collectCoverage: true, // Coverage-Bericht aktivieren
    collectCoverageFrom: ['src/**/*.js'], // Coverage nur für Dateien im src-Ordner
    coverageDirectory: 'coverage', // Speicherort für Coverage-Berichte
    moduleNameMapper: {
      '^@utils/(.*)$': '<rootDir>/src/utils/$1', // Alias für Module
    },
  };