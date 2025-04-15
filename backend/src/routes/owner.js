const express = require('express');
const { db_run, db_get, db_all } = require('../database');
const logger = require('../logger');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();
const { ErrorMsg } = require("../constants");


const createOwner = (dbRow) => {
  return {
    id: dbRow?.id ?? null,
    name: dbRow?.name ?? '',
  };
};

// *** GET /api/owner/list ****************************************************
router.get('/list', authenticateToken, async (req, res) => {
  logger.debug('API Owner -> List Owners');

  const result = await db_all('SELECT * FROM Owner');
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_OWNER);
  }

  const owners = result.row.map(createOwner);
  res.json(owners);
});

// *** POST /api/owner/ *******************************************************
router.post('/', authenticateToken, async (req, res) => {
  const { name } = req.body;
  logger.debug(`API Owner -> Create Owner: ${name}`);

  if (!name) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  const result = await db_run('INSERT INTO Owner (name) VALUES (?)', [name]);
  if (result.err || result.changes === 0) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  res.json({ owner_id: result.lastID, owner_name: name });
});

// *** PUT /api/owner/:id *****************************************************
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  logger.debug(`API Owner -> Edit Owner: ${id} with ${{ name }}`);

  if (!name) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  const result = await db_run('UPDATE Owner SET name = ? WHERE id = ?', [name, id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.changes === 0) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_OWNER);

  res.json({ id, name });
});

// *** GET /api/owner/:id *****************************************************
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API Owner -> Get Owner: ${id}`);

  const result = await db_get('SELECT * FROM Owner WHERE id = ?', [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_OWNER);
  const owner = createOwner(result.row);

  res.json(owner);
});

// *** DELETE /api/owner/:id **************************************************
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API Owner -> Delete Owner: ${id}`);

  const result = await db_run('DELETE FROM Owner WHERE id = ?', [id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_OWNER);
  }
  res.status(200).send('Owner deleted successfully');
});

module.exports = router;
