const express = require('express');
const os = require('os');
const config = require('../config'); // Import der Konfiguration

const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();
const logger = require('../logger');

// *** GET /api/health ********************************************************
router.get('/forecast/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API Statistic -> Get Forecast (id): ${id}`);
  
  res.json({
    maxSlots: 3, 
    data: [3,3,2,2,2,1,0,0],   
  });
});


module.exports = router;
