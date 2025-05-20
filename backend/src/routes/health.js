const express = require('express');
const os = require('os');
const config = require('../config'); // Import der Konfiguration
const router = express.Router();
const logger = require('../logger');
const packageJson = require('../../package.json');

// *** GET /api/health ********************************************************
router.get('/', (req, res) => {
  logger.debug(`API Health -> health`);
  res.json({
    project: packageJson.name,
    version: packageJson.version,
    status: 'OK',
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuLoad: os.loadavg(),
    timestamp: new Date().toISOString(),
  });
});

// *** GET /api/health/config *************************************************
router.get('/config', (req, res) => {
  logger.debug(`API Health -> config`);
  const safeConfig = { ...config };

  // Verhindert die Rückgabe sensibler Daten wie Passwörter oder API-Schlüssel
  const sensitiveKeys = ['jwtSecret'];
  sensitiveKeys.forEach((key) => delete safeConfig[key]);

  res.json(safeConfig);
});

module.exports = router;
