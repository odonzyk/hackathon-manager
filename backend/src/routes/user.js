const express = require('express');
const { db_get, db_run, db_all } = require('../utils/db/dbUtils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../logger');

const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();
const { ErrorMsg } = require('../constants');

const createUser = (dbRow) => {
  return {
    id: dbRow?.id ?? null,
    name: dbRow?.name ?? '',
    email: dbRow?.email ?? '',
    is_private_email: dbRow?.is_private_email ?? false,
    telephone: dbRow?.telephone ?? '',
    is_private_telephone: dbRow?.is_private_telephone ?? false,
    role_id: dbRow?.role_id ?? 2,
    avatar_url: dbRow?.avatar_url ?? '/assets/avatars/avatar_1.png',
    participate: null
  };
};

const createParticipate = (dbRow) => {
  return {
    id: dbRow?.id ?? null,
    user_id: dbRow?.user_id ?? null,
    project_id: dbRow?.project_id ?? null,
    idea: dbRow?.idea ?? '',
    event_id: dbRow?.event_id ?? null,
    event_name: dbRow?.name ?? ''
  };
};

// *** GET /api/user/login ****************************************************
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  logger.debug(`API: POST /api/user/login -> Login User: ${email}`);

  if (!email || !password) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  const result = await db_get('SELECT * FROM User WHERE email = ?', [email.toLowerCase()]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);

  const { id, name, password: hash, role_id } = result.row;
  if (!hash) {
    return res.status(400).send(ErrorMsg.SERVER.NO_PASSWORD);
  }

  const validPassword = await bcrypt.compare(password, hash);
  if (!validPassword) {
    logger.debug(`Wrong password for user ${email}`);
    return res.status(401).send(ErrorMsg.AUTH.INVALID_CREDENTIALS);
  }

  const token = jwt.sign({ id: id, name: name, email: email, role: role_id }, config.jwtSecret, {
    expiresIn: '2h'
  });

  res.json({ token });
});

// *** GET /api/user/list *****************************************************
router.get('/list', authenticateToken, async (req, res) => {
  logger.debug(`API: GET  /api/user/list`);
  const result = await db_all(`SELECT User.* FROM User`);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);
  }

  // Wandle jedes DB-Row-Objekt in ein User-Objekt mit createUser()
  const users = result.row.map(createUser);
  res.json(users);
});

// *** PARTICPATION *********************************************************
const getUserParticipation = async (userId, project_id) => {
  const result = await db_get(
    `SELECT Participant.*, Project.idea, Project.event_id, Event.name FROM Participant 
    JOIN Project ON Project.id = Participant.project_id 
    JOIN Event ON Event.id = Project.event_id
    WHERE Participant.user_id = ? AND Project.id = ?`,
    [userId, project_id]
  );
  if (result.err) throw new Error(ErrorMsg.SERVER.ERROR);
  if (!result.row) throw new Error(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);
  return createParticipate(result.row);
};
const getUserParticipationList = async (userId) => {
  const result = await db_all(
    `SELECT Participant.*, Project.idea, Project.event_id, Event.name FROM Participant 
    JOIN Project ON Project.id = Participant.project_id 
    JOIN Event ON Event.id = Project.event_id
    WHERE Participant.user_id = ?`,
    [userId]
  );
  if (result.err) throw new Error(ErrorMsg.SERVER.ERROR);
  if (!result.row) throw new Error(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);
  return result.row.map(createParticipate);
};

// *** POST /api/user/participate *********************************************************
router.post('/:id/participate', async (req, res) => {
  const { id } = req.params;
  const { project_id } = req.body;
  logger.debug(`API: POST /api/user/${id}/participate`);

  if (!project_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  const resultChk = await db_all(
    `SELECT Participant.id FROM Participant 
    JOIN Project ON Participant.project_id = Project.id 
    WHERE Participant.user_id = ? AND Project.event_id = (SELECT event_id FROM Project WHERE id = ?)`,
    [id, project_id]
  );
  if (resultChk.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (resultChk.row?.length > 0) {
    return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);
  }

  const result = await db_run('INSERT INTO Participant (user_id, project_id) VALUES (?, ?)', [id, project_id]);
  if (result.err || result.changes === 0) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  const participant = await getUserParticipation(id, project_id);
  res.status(201).json(participant);
});

// *** GET /api/user/participate *********************************************************
router.get('/:id/participate', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API: GET  /api/user/${id}/participate`);

  try {
    const projectList = await getUserParticipationList(id);
    res.json(projectList);
  } catch (error) {
    logger.error(`Error fetching participation list for user ${id}: ${error.message}`);
    res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
});

// *** DELETE /api/user/paticipate *********************************************************
router.delete('/:id/participate', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { project_id } = req.body;
  logger.debug(`API: DEL  /api/user/${id}/participate`);

  result = await db_run('DELETE FROM Participant WHERE project_id = ? AND user_id = ?', [project_id, id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);
  }
  res.status(200).send('Participation deleted successfully');
});

// *** USER *******************************************************************
// *** POST /api/user *********************************************************
router.post('/', async (req, res) => {
  let { name, email, is_private_email, telephone, is_private_telephone, password, role_id, avatar_url } = req.body;
  logger.debug(`API: POST /api/user -> Create User: ${name}`);

  //TODO: Set Passwort by Frontend
  if (!password) password = 'welcome!';
  if (!role_id) role_id = 2;

  if (!name || !email) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  email = email.toLowerCase();
  let result = await db_get('SELECT * FROM User WHERE email = ?', [email]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.row) return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);

  const hashedPassword = await bcrypt.hash(password, 10);

  result = await db_run('INSERT INTO User (name, email, telephone, password, role_id, is_private_email, is_private_telephone, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?,?)', [
    name,
    email,
    telephone,
    hashedPassword,
    role_id,
    is_private_email || false,
    is_private_telephone || false,
    avatar_url || '/assets/avatars/avatar_1.png'
  ]);
  const user_id = result.lastID;
  if (result.err || result.changes === 0) {
    return res.status(500).send(`Server error`);
  }

  res.status(201).json({
    id: user_id,
    name,
    email,
    telephone,
    role_id,
    is_private_email: is_private_email || false,
    is_private_telephone: is_private_telephone || false,
    avatar_url: avatar_url || '/assets/avatars/avatar_1.png'
  });
});

// *** PUT /api/user *********************************************************
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  let { name, email, is_private_email, telephone, is_private_telephone, role_id, avatar_url } = req.body;
  logger.debug(`API: PUT  /api/user/${id} -> Update User: ${name}`);

  if (!name || !email || !telephone) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  //Load existing data
  result = await db_get(`SELECT * FROM User WHERE User.id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);

  let user = createUser(result.row);

  // Check if email is used by someone already
  if (user.email != email) {
    let result = await db_get('SELECT * FROM User WHERE email = ? AND id != ?', [email, id]);
    if (result.err) {
      return res.status(500).send(ErrorMsg.SERVER.ERROR);
    }
    if (result.row) {
      return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);
    }
  }
  user.name = name ?? user.name;
  user.email = email ?? user.email.toLowerCase();
  user.is_private_email = is_private_email ?? user.is_private_email;
  user.telephone = telephone ?? user.telephone;
  user.is_private_telephone = is_private_telephone ?? user.is_private_telephone;
  user.role_id = role_id ?? user.role_id;
  user.avatar_url = avatar_url ?? user.avatar_url;

  // Update User
  result = await db_run('Update User SET name=?, email=?, telephone=?, role_id=?, is_private_email=?, is_private_telephone=?, avatar_url=? where id = ?', [
    user.name,
    user.email,
    user.telephone,
    user.role_id,
    user.is_private_email,
    user.is_private_telephone,
    user.avatar_url,
    id
  ]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  res.status(200).json(user);
});

// *** GET /api/user *********************************************************
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API: GET  /api/user/${id}`);

  const result = await db_get(`SELECT * FROM User WHERE User.id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);
  const user = createUser(result.row);
  user.participate = await getUserParticipationList(id).catch((err) => {
    logger.error(`Error fetching participation for user ${id}: ${err.message}`);
    return [];
  });
  res.json(user);
});

// *** DELETE /api/user *********************************************************
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API: DEL  /api/user/${id}`);

  // Delete User
  result = await db_run('DELETE FROM User WHERE id = ?', [id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);
  }
  res.status(200).send('User deleted successfully');
});

module.exports = router;
