const express = require('express');
const { db_get, db_run, db_all } = require('../utils/db/dbUtils');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../logger');
const { checkPermissions, authenticateAndAuthorize, authenticateToken } = require('../middlewares/authMiddleware');
const router = express.Router();
const { ErrorMsg, RoleTypes, EventTypes } = require('../constants');
const { sendActivationEmail } = require('../utils/emailUtils');
const hackingEventBus = require('../middlewares/hackathonEventBus');

const createUser = (dbRow) => {
  return {
    id: dbRow?.id ?? null,
    name: dbRow?.name ?? '',
    email: dbRow?.email ?? '',
    is_private_email: dbRow?.is_private_email ?? false,
    telephone: dbRow?.telephone ?? '',
    is_private_telephone: dbRow?.is_private_telephone ?? false,
    role_id: dbRow?.role_id ?? RoleTypes.NEW,
    avatar_url: dbRow?.avatar_url ?? '/assets/avatars/avatar_1.png',
    participate: [],
    initiate: []
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

const createInitiate = (dbRow) => {
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

// *** POST /api/user/activate *************************************************
router.post('/activate', async (req, res) => {
  const { email, ac } = req.query;
  logger.debug(`API: POST /api/user/activate -> Activate User: ${email}`);

  if (!email || !ac) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  // Überprüfen, ob der Benutzer existiert und der Aktivierungscode korrekt ist
  let result = await db_get('SELECT * FROM User WHERE LOWER(email) = LOWER(?)', [email.toLowerCase()]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);
  if (result.row.role_id !== RoleTypes.NEW) {
    return res.status(409).send(ErrorMsg.VALIDATION.ALREADY_ACTIVE);
  }
  if (result.row.activation_code !== ac) {
    return res.status(400).send(ErrorMsg.AUTH.INVALID_ACTIVATION_CODE);
  }

  const user = createUser(result.row);

  // Benutzerrolle basierend auf der E-Mail-Domain setzen
  const emailDomain = email.split('@')[1];
  const allowedDomains = config.allowedDomains || [];
  if (allowedDomains.includes(emailDomain)) {
    user.role_id = RoleTypes.USER; // Interne Benutzer
  } else {
    user.role_id = RoleTypes.GUEST; // Externe Benutzer
  }

  // Aktivierungscode entfernen und Rolle aktualisieren
  const updateResult = await db_run('UPDATE User SET role_id = ?, activation_code = NULL WHERE id = ?', [user.role_id, user.id]);
  if (updateResult.err || updateResult.changes === 0) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  logger.debug(`User ${email} activated successfully with role ${user.role_id}`);
  res.status(200).json({ message: 'User activated successfully', role: user.role_id });
});

// *** GET /api/user/list *****************************************************
router.get('/list', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  logger.debug(`API: GET  /api/user/list`);

  const result = await db_all(`SELECT User.* FROM User`);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);
  }

  // Wandle jedes DB-Row-Objekt in ein User-Objekt mit createUser()
  let users = result.row.map(createUser);

  // Filtere die privaten Felder basierend auf den Einstellungen
  users = users.map((user) => privacyFilter(user, req.user.role));

  res.json(users);
});

// *** POST /api/user/participate *********************************************************
router.post('/:id/participate', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  const { id } = req.params;
  const { project_id } = req.body;
  logger.debug(`API: POST /api/user/${id}/participate`);

  if (!checkPermissions(req.user.role, RoleTypes.MANAGER) && req.user.role === RoleTypes.USER && req.user.id !== parseInt(id)) {
    return res.status(403).send(ErrorMsg.AUTH.NO_PERMISSION);
  }
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
  notifyParticipantChange();
  res.status(201).json(participant);
});

// *** GET /api/user/participate *********************************************************
router.get('/:id/participate', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
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
router.delete('/:id/participate', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  const { id } = req.params;
  const { project_id } = req.body;
  logger.debug(`API: DEL  /api/user/${id}/participate`);

  if (!checkPermissions(req.user.role, RoleTypes.MANAGER) && req.user.role === RoleTypes.USER && req.user.id !== parseInt(id)) {
    return res.status(403).send(ErrorMsg.AUTH.NO_PERMISSION);
  }

  result = await db_run('DELETE FROM Participant WHERE project_id = ? AND user_id = ?', [project_id, id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);
  }

  notifyParticipantChange();
  res.status(200).send('Participation deleted successfully');
});

// *** USER *******************************************************************
// *** POST /api/user *********************************************************
router.post('/', async (req, res) => {
  let { name, email, is_private_email, telephone, is_private_telephone, password, avatar_url } = req.body;
  logger.debug(`API: POST /api/user -> Create User: ${name}`);

  if (!name || !email) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }
  if (password && password.length < 8) {
    return res.status(400).send(ErrorMsg.VALIDATION.PASSWORD_TOO_SHORT);
  }

  const newUser = createUser({
    name,
    email,
    is_private_email,
    telephone,
    is_private_telephone,
    avatar_url
  });
  newUser.activation_code = Math.random().toString(36).substring(2, 15); // Aktivierungscode generieren

  let result = await db_get('SELECT * FROM User WHERE LOWER(email) = LOWER(?)', [email]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.row) {
    if (result.row.role_id != RoleTypes.DUMMY) return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);
    newUser.id = result.row.id;
  }

  if (!password) password = 'welcome!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const sqlStr = newUser.id
    ? 'UPDATE User SET name = ?, email = ?, telephone = ?, password = ?, role_id = ?, is_private_email = ?, is_private_telephone = ?, avatar_url = ?, activation_code = ? WHERE id = ?'
    : 'INSERT INTO User (name, email, telephone, password, role_id, is_private_email, is_private_telephone, avatar_url, activation_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';

  const params = newUser.id
    ? [newUser.name, newUser.email, newUser.telephone, hashedPassword, newUser.role_id, newUser.is_private_email, newUser.is_private_telephone, newUser.avatar_url, newUser.activation_code, newUser.id]
    : [newUser.name, newUser.email, newUser.telephone, hashedPassword, newUser.role_id, newUser.is_private_email, newUser.is_private_telephone, newUser.avatar_url, newUser.activation_code];

  result = await db_run(sqlStr, params);
  if (result.err || result.changes === 0) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  try {
    await sendActivationEmail(newUser);
  } catch (err) {
    logger.error(`Error sending activation email for user ${newUser.email}: ${err.message}`);
  }
  newUser.id = newUser.id ? newUser.id : result.lastID;

  notifyUserChangge();

  res.status(201).json(newUser);
});

// *** PUT /api/user *********************************************************
router.put('/:id', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  const { id } = req.params;
  let { name, email, is_private_email, telephone, is_private_telephone, role_id, avatar_url } = req.body;
  logger.debug(`API: PUT  /api/user/${id} -> Update User: ${name}`);

  if (!checkPermissions(req.user.role, RoleTypes.MANAGER) && req.user.role === RoleTypes.USER && req.user.id !== parseInt(id)) {
    return res.status(403).send(ErrorMsg.AUTH.NO_PERMISSION);
  }

  if (!name || !email) {
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
  user.participate = [];

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

  notifyUserChangge();

  res.status(200).json(user);
});

// *** GET /api/user *********************************************************
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API: GET  /api/user/${id}`);

  if (!checkPermissions(req.user.role, RoleTypes.USER)) {
    if (req.user.id !== parseInt(id)) {
      logger.debug(`User ${req.user.id} with role ${req.user.role} does not have permission for ${RoleTypes.USER}`);
      return res.status(403).send(ErrorMsg.AUTH.NO_PERMISSION);
    }
  }

  const result = await db_get(`SELECT * FROM User WHERE User.id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);

  let user = createUser(result.row);

  // Anwenden des Privatsphäre-Filters
  if (!checkPermissions(req.user.role, RoleTypes.MANAGER) && req.user.role === RoleTypes.USER && req.user.id !== parseInt(id)) {
    user = privacyFilter(user);
  }

  try {
    user.participate = await getUserParticipationList(id);
  } catch (err) {
    logger.error(`Error fetching participation for user ${id}: ${err.message}`);
    user.participate = [];
  }
  try {
    user.initiate = await getUserInitiatorList(id);
  } catch (err) {
    logger.error(`Error fetching initiations for user ${id}: ${err.message}`);
    user.initiate = [];
  }

  res.json(user);
});

// *** DELETE /api/user *********************************************************
router.delete('/:id', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  const { id } = req.params;
  logger.debug(`API: DEL  /api/user/${id}`);

  if (!checkPermissions(req.user.role, RoleTypes.MANAGER) && req.user.role === RoleTypes.USER && req.user.id !== parseInt(id)) {
    return res.status(403).send(ErrorMsg.AUTH.NO_PERMISSION);
  }

  // Delete User
  result = await db_run('DELETE FROM User WHERE id = ?', [id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);
  }

  notifyUserChangge();

  res.status(200).send('User deleted successfully');
});

router.post('/pwreset', authenticateAndAuthorize(RoleTypes.ADMIN), async (req, res) => {
  let { id, email, password, secret } = req.body;
  logger.debug(`API: POST /api/user -> Password Reset for User ID: ${id}`);

  if (secret !== '***REMOVED***') {
    return res.status(403).send(ErrorMsg.AUTH.NO_PERMISSION);
  }

  if (!id || !password || !secret || !email) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }
  if (password && password.length < 8) {
    return res.status(400).send(ErrorMsg.VALIDATION.PASSWORD_TOO_SHORT);
  }

  let result = await db_get('SELECT * FROM User WHERE id = ?', [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);
  const user = createUser(result.row);
  if (user.email !== email) {
    return res.status(400).send(ErrorMsg.VALIDATION.WRONG_USER);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  result = await db_run('UPDATE User SET password = ? WHERE id = ? and email = ?', [hashedPassword, id, email]);
  if (result.err || result.changes === 0) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  res.status(201).json(user);
});

module.exports = router;

// *** Helper Functions******************************************************
// *** PARTICPATION *********************************************************
const getUserParticipation = async (userId, project_id) => {
  const result = await db_get(
    `SELECT Participant.*, Project.idea, Project.event_id, Event.name FROM Participant 
    JOIN Project ON Project.id = Participant.project_id 
    JOIN Event ON Event.id = Project.event_id
    WHERE Participant.user_id = ? AND Participant.project_id = ?`,
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
const getUserInitiatorList = async (userId) => {
  const result = await db_all(
    `SELECT Initiator.*, Project.idea, Project.event_id, Event.name FROM Initiator 
    JOIN Project ON Project.id = Initiator.project_id 
    JOIN Event ON Event.id = Project.event_id
    WHERE Initiator.user_id = ?`,
    [userId]
  );
  if (result.err) throw new Error(ErrorMsg.SERVER.ERROR);
  if (!result.row) throw new Error(ErrorMsg.NOT_FOUND.NO_INITIATOR);
  return result.row.map(createInitiate);
};

const privacyFilter = (user, requesterRole) => {
  if (!checkPermissions(requesterRole, RoleTypes.MANAGER)) {
    if (user.is_private_email) {
      user.email = '';
    }
    if (user.is_private_telephone) {
      user.telephone = '';
    }
  }
  return user;
};

async function notifyUserChangge() {
  logger.info(`EVENT is raised: ${EventTypes.USER_CHANGE} `);
  hackingEventBus.emit(EventTypes.USER_CHANGE);
}
async function notifyParticipantChange() {
  logger.info(`EVENT is raised: ${EventTypes.PARTICIPANT_CHANGE} `);
  hackingEventBus.emit(EventTypes.PARTICIPANT_CHANGE);
}
