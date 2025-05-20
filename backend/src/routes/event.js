const express = require('express');
const { db_get, db_run, db_all } = require('../utils/db/dbUtils');
const logger = require('../logger');

const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();
const { ErrorMsg } = require('../constants');

const createEvent = (dbRow) => {
  return {
    id: dbRow?.id ?? null,
    name: dbRow?.name ?? '',
    start_time: dbRow?.start_time ?? null,
    end_time: dbRow?.end_time ?? null
  };
};

// *** GET /api/event/list *****************************************************
router.get('/list', authenticateToken, async (req, res) => {
  logger.debug(`API Event -> List Events`);
  const result = await db_all(`SELECT Event.* FROM Event`);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_EVENT);
  }
  // Wandle jedes DB-Row-Objekt in ein Event-Objekt mit createEvent()
  const events = result.row.map(createEvent);
  res.json(events);
});

// *** POST /api/event *********************************************************
router.post('/', async (req, res) => {
  let { name, start_time, end_time } = req.body;
  logger.debug(`API Event -> Register Event: ${name}`);
  if (!name || !start_time || !end_time) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  let result = await db_get('SELECT * FROM Event WHERE LOWER(name) = LOWER(?)', [name]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.row) return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);

  result = await db_run('INSERT INTO Event (name, start_time, end_time) VALUES (?, ?, ?)', [name, start_time, end_time]);
  const event_id = result.lastID;
  if (result.err || result.changes === 0) {
    return res.status(500).send(`Server error`);
  }

  res.status(201).json({
    id: event_id,
    name,
    start_time,
    end_time
  });
});

// *** PUT /api/event *********************************************************
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  let { name, start_time, end_time } = req.body;
  logger.debug(`API Event -> Update Event: ${name}`);

  if (!name || !start_time || !end_time) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  //Load existing data
  result = await db_get(`SELECT * FROM Event WHERE Event.id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_EVENT);

  let event = createEvent(result.row);

  // Check if event name is used by someone already
  if (event.name != name) {
    let result = await db_get('SELECT * FROM Event WHERE LOWER(name) = LOWER(?) AND id != ?', [name, id]);
    if (result.err) {
      return res.status(500).send(ErrorMsg.SERVER.ERROR);
    }
    if (result.row) {
      return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);
    }
  }
  event.name = name ?? event.name;
  event.start_time = start_time ?? event.start_time;
  event.end_time = end_time ?? event.end_time;

  // Update Event
  result = await db_run('Update Event SET name=?, start_time=?, end_time=? where id = ?', [event.name, event.start_time, event.end_time]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  res.status(200).json(event);
});

// *** GET /api/event *********************************************************
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API Event -> Get Event (id): ${id}`);

  const result = await db_get(`SELECT * FROM Event WHERE Event.id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_EVENT);
  const event = createEvent(result.row);
  res.json(event);
});

// *** DELETE /api/event *********************************************************
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API Event -> Delete Event (id): ${id}`);

  result = await db_run('DELETE FROM Event WHERE id = ?', [id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_EVENT);
  }
  res.status(200).send('Event deleted successfully');
});

module.exports = router;
