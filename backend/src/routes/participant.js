const express = require('express');
const { db_get, db_run } = require('../utils/db/dbUtils');
const logger = require('../logger');

const { checkPermissions, authenticateAndAuthorize } = require('../middlewares/authMiddleware');
const router = express.Router();
const { ErrorMsg, RoleTypes, EventTypes } = require('../constants');
const hackingEventBus = require('../middlewares/hackathonEventBus');

const createParticipant = (dbRow) => {
  return {
    id: dbRow?.id ?? null,
    project_id: dbRow?.project_id ?? null,
    user_id: dbRow?.user_id ?? null
  };
};

// *** POST /api/Participant *********************************************************
router.post('/', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  const { project_id, user_id } = req.body;
  logger.debug(`API: POST /api/participant -> Project ID: ${project_id}, User ID: ${user_id}`);

  if (!project_id || !user_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }
  if (!checkPermissions(req.user.role, RoleTypes.MANAGER) && req.user.role === RoleTypes.USER && req.user.id !== parseInt(user_id)) {
    return res.status(403).send(ErrorMsg.AUTH.NO_PERMISSION);
  }

  let result = await db_get('SELECT * FROM Participant WHERE project_id = ? AND user_id = ?', [project_id, user_id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.row) return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);

  result = await db_run('INSERT INTO Participant (project_id, user_id) VALUES (?, ?)', [project_id, user_id]);
  const participant_id = result.lastID;
  if (result.err || result.changes === 0) {
    return res.status(500).send(`Server error`);
  }

  notifyParticipantChange();
  res.status(201).json({
    id: participant_id,
    project_id,
    user_id
  });
});

// *** PUT /api/Participant/:project_id/user/:user_id ************************
router.put('/:id', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  const { project_id, user_id } = req.body;
  const { id } = req.params;
  logger.debug(`API: PUT  /api/participant/${id} -> Project ID: ${project_id}, User ID: ${user_id}`);

  if (!checkPermissions(req.user.role, RoleTypes.MANAGER) && req.user.role === RoleTypes.USER && req.user.id !== parseInt(id)) {
    return res.status(403).send(ErrorMsg.AUTH.NO_PERMISSION);
  }
  if (!project_id || !user_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  //Load existing data
  result = await db_get(`SELECT * FROM Participant WHERE Participant.id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);

  let participant = createParticipant(result.row);

  participant.project_id = project_id;
  participant.user_id = user_id;

  // Update Participation
  result = await db_run('UPDATE Participant SET project_id=?, user_id=? WHERE id = ?', [participant.project_id, participant.user_id, req.params.id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  notifyParticipantChange();
  res.status(200).json(participant);
});

// *** GET /api/Participant *********************************************************
router.get('/:id', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  const { id } = req.params;
  logger.debug(`API: GET  /api/participant/${id}`);

  const result = await db_get(`SELECT * FROM Participant WHERE Participant.id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);
  const participant = createParticipant(result.row);
  res.json(participant);
});

// *** DELETE /api/Participant *********************************************************
router.delete('/:id', authenticateAndAuthorize(RoleTypes.ADMIN), async (req, res) => {
  const { id } = req.params;
  logger.debug(`API: DEL  /api/participant/${id}`);

  result = await db_run('DELETE FROM Participant WHERE id = ?', [id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);
  }
  notifyParticipantChange();
  res.status(200).send('Participant deleted successfully');
});

// *** DELETE /api/Participant *********************************************************
router.delete('/', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  const { project_id, user_id } = req.body;
  logger.debug(`API: DEL  /api/participant -> Project ID: ${project_id}, User ID: ${user_id}`);

  if (!project_id || !user_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }
  if (!checkPermissions(req.user.role, RoleTypes.MANAGER) && req.user.role === RoleTypes.USER && req.user.id !== user_id) {
    return res.status(403).send(ErrorMsg.AUTH.NO_PERMISSION);
  }

  result = await db_run('DELETE FROM Participant WHERE project_id = ? AND user_id = ?', [project_id, user_id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);
  }
  notifyParticipantChange();
  res.status(200).send('Participant deleted successfully');
});

async function notifyParticipantChange() {
  logger.info(`EVENT is raised: ${EventTypes.PARTICIPANT_CHANGE} `);
  hackingEventBus.emit(EventTypes.PARTICIPANT_CHANGE);
}

module.exports = router;
