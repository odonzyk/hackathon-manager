const express = require('express');
const router = express.Router();
const logger = require('../logger');
const { db_run } = require('../utils/db/dbUtils');
const { dbCreate } = require('../utils/db/dbInit');
const authenticateToken = require('../middlewares/authMiddleware');

const tables = [
  'Participant',
  'Project',
  'Event',
  'User',
  'Role',
  'ProjectStatus'
];

// *** GET /api/health/config *************************************************
router.get('/dbReset', authenticateToken, async (req, res) => {
  logger.debug(`API Admin -> dbReset`);
  
  try {

    // Lösche jede Tabelle
    for (const table of tables) {
      logger.debug(`API Admin -> dbReset: Lösche Tabelle: ${table}`);
      await db_run(`DROP TABLE IF EXISTS ${table};`);
    }

  } catch (error) {
    logger.error(`Fehler beim Zurücksetzen der Datenbank: ${error.message}`);
    res.status(500).json({ error: 'Fehler beim Zurücksetzen der Datenbank.' });
  }

  dbCreate();
  res.status(200).json({ message: 'Database has been reset successfully.' });
});

module.exports = router;
