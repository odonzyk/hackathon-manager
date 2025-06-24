const express = require('express');
const { db_get, db_run, db_all } = require('../utils/db/dbUtils');
const logger = require('../logger');

const { authenticateAndAuthorize, checkPermissions } = require('../middlewares/authMiddleware');
const router = express.Router();
const { ErrorMsg, RoleTypes, EventTypes } = require('../constants');
const hackingEventBus = require('../middlewares/hackathonEventBus');

const createProject = (dbRow) => {
  return {
    event_id: dbRow?.event_id ?? null,
    id: dbRow?.id ?? null,
    status_id: dbRow?.status_id ?? 1,
    idea: dbRow?.idea ?? '',
    description: dbRow?.description ?? '',
    team_name: dbRow?.team_name ?? '',
    team_avatar_url: dbRow?.team_avatar_url ?? '',
    goal: dbRow?.goal ?? '',
    components: dbRow?.components ?? '',
    skills: dbRow?.skills ?? '',
    max_team_size: dbRow?.max_team_size ?? 20,
    teams_channel_id: dbRow?.teams_channel_id ?? '',
    location: dbRow?.location ?? '',
    initiators: null,
    participants: null
  };
};

const createInitiator = (dbRow, requesterRole) => {
  return {
    id: dbRow?.id ?? null,
    user_id: dbRow?.user_id ?? null,
    name: dbRow?.name ?? '',
    email: !dbRow.is_private_email || checkPermissions(requesterRole, RoleTypes.MANAGER) ? dbRow.email : '',
    avatar_url: dbRow?.avatar_url ?? ''
  };
};

const createParticipant = (dbRow, requesterRole) => {
  return {
    id: dbRow?.id ?? null,
    user_id: dbRow?.user_id ?? null,
    name: dbRow?.name ?? '',
    email: !dbRow.is_private_email || checkPermissions(requesterRole, RoleTypes.MANAGER) ? dbRow.email : '',
    avatar_url: dbRow?.avatar_url ?? ''
  };
};

// *** GET /api/project/list/:id *****************************************************
router.get('/list/:event_id', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  const { event_id } = req.params;
  logger.debug(`API: GET  /api/project/list/${event_id}`);
  if (!event_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }
  const result = await db_all(`SELECT Project.* FROM Project where event_id = ?`, [event_id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PROJECT);
  }
  // Wandle jedes DB-Row-Objekt in ein Project-Objekt mit createProject()
  const projects = result.row.map(createProject);

  // Füge die Initiatoren zu jedem Projekt hinzu
  for (const project of projects) {
    project.initiators = await getInitiators(project.id, req.user.role_id);
    project.participants = await getParticipants(project.id, req.user.role_id);
  }

  res.json(projects);
});

// *** GET /api/project/list *****************************************************
router.get('/list', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  logger.debug(`API: GET  /api/project/list`);
  const result = await db_all(`SELECT Project.* FROM Project`);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PROJECT);
  }
  // Wandle jedes DB-Row-Objekt in ein Project-Objekt mit createProject()
  const projects = result.row.map(createProject);

  // Füge die Initiatoren zu jedem Projekt hinzu
  for (const project of projects) {
    project.initiators = await getInitiators(project.id, req.user.role_id);
    project.participants = await getParticipants(project.id, req.user.role_id);
  }

  res.json(projects);
});

// *** GET /api/project/listByUser/:id **********************************************
router.get('/listByUser/:id', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  const { id } = req.params;
  logger.debug(`API: GET  /api/project/listByUser/${id}`);
  if (!id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }
  const result = await db_all(`SELECT Project.* FROM Project JOIN Participant ON Project.id = Participant.project_id WHERE Participant.user_id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PROJECT);
  }
  // Wandle jedes DB-Row-Objekt in ein Project-Objekt mit createProject()
  const projects = result.row.map(createProject);

  // Füge die Initiatoren zu jedem Projekt hinzu
  for (const project of projects) {
    project.initiators = await getInitiators(project.id);
  }

  res.json(projects);
});

// *** POST /api/project *********************************************************
router.post('/', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  let { event_id, status_id, idea, description, team_name, team_avatar_url, initiators, goal, components, skills, max_team_size, teams_channel_id, location } = req.body;
  logger.debug(`API: POST /api/project - ${idea}`);
  if (!event_id || !idea || !description || !initiators[0]?.id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  let result = await db_get('SELECT * FROM Project WHERE LOWER(idea) = LOWER(?) AND event_id= ?', [idea, event_id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.row) return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);

  max_team_size = max_team_size || 20;
  result = await db_run(
    'INSERT INTO Project (event_id, status_id, idea, description, team_name, team_avatar_url, goal, components, skills, max_team_size, teams_channel_id, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [event_id, status_id, idea, description, team_name, team_avatar_url, goal, components, skills, max_team_size, teams_channel_id, location]
  );
  const project_id = result.lastID;
  if (result.err || result.changes === 0) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  for (const initiator of initiators) {
    if (!initiator.id) {
      return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
    }
    result = await db_run('INSERT INTO Initiator (project_id, user_id) VALUES (?, ?)', [project_id, initiator.id]);
    if (result.err || result.changes === 0) {
      return res.status(500).send(ErrorMsg.SERVER.ERROR);
    }
  }

  const initiatorslist = await getInitiators(project_id, req.user.role_id);
  const participantslist = await getParticipants(project_id, req.user.role_id);

  notifyProjectChange();
  res.status(201).json({
    event_id,
    id: project_id,
    status_id,
    idea,
    description,
    team_name,
    team_avatar_url,
    goal,
    components,
    skills,
    max_team_size,
    teams_channel_id,
    location,
    initiators: initiatorslist || [],
    participants: participantslist || []
  });
});

// *** PUT /api/project *********************************************************
router.put('/:id', authenticateAndAuthorize(RoleTypes.MANAGER), async (req, res) => {
  const { id } = req.params;
  let { event_id, status_id, idea, description, team_name, team_avatar_url, goal, components, skills, max_team_size, teams_channel_id, location } = req.body;
  logger.debug(`API: PUT  /api/project/${id} - ${idea}`);

  if (!event_id || !idea || !description) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  //Load existing data
  result = await db_get(`SELECT * FROM Project WHERE Project.id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PROJECT);

  let project = createProject(result.row);

  // Check if event name is used by someone already
  if (project.idea != idea) {
    let result = await db_get('SELECT * FROM Project WHERE LOWER(idea) = LOWER(?) AND id != ? AND event_id = ?', [idea, id, event_id]);
    if (result.err) {
      return res.status(500).send(ErrorMsg.SERVER.ERROR);
    }
    if (result.row) {
      return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);
    }
  }
  project.event_id = event_id ?? project.event_id;
  project.status_id = status_id ?? project.status_id;
  project.idea = idea ?? project.idea;
  project.description = description ?? project.description;
  project.team_name = team_name ?? project.team_name;
  project.team_avatar_url = team_avatar_url ?? project.team_avatar_url;
  project.goal = goal ?? project.goal;
  project.components = components ?? project.components;
  project.skills = skills ?? project.skills;
  project.max_team_size = max_team_size ?? project.max_team_size;
  project.teams_channel_id = teams_channel_id ?? project.teams_channel_id;
  project.location = location ?? project.location;

  // Update Project
  result = await db_run(
    'UPDATE Project SET event_id=?, status_id=?, idea=?, description=?, team_name=?, team_avatar_url=?, goal=?, components=?, skills=?, max_team_size=?, teams_channel_id=?, location=? WHERE id = ?',
    [
      project.event_id,
      project.status_id,
      project.idea,
      project.description,
      project.team_name,
      project.team_avatar_url,
      project.goal,
      project.components,
      project.skills,
      project.max_team_size,
      project.teams_channel_id,
      project.location,
      id
    ]
  );
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  notifyProjectChange();
  res.status(200).json(project);
});

// *** GET /api/project *********************************************************
router.get('/:id', authenticateAndAuthorize(RoleTypes.USER), async (req, res) => {
  const { id } = req.params;
  logger.debug(`API: GET  /api/project/${id}`);

  const result = await db_get(`SELECT * FROM Project WHERE Project.id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PROJECT);
  const project = createProject(result.row);

  // Füge die Initiatoren zu dem Projekt hinzu
  project.initiators = await getInitiators(project.id, req.user.role_id);
  project.participants = await getParticipants(project.id, req.user.role_id);

  res.json(project);
});

// *** DELETE /api/project *********************************************************
router.delete('/:id', authenticateAndAuthorize(RoleTypes.ADMIN), async (req, res) => {
  const { id } = req.params;
  logger.debug(`API: DEL  /api/project/${id}`);

  result = await db_run('DELETE FROM Project WHERE id = ?', [id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PROJECT);
  }

  notifyProjectChange();
  res.status(200).send('Project deleted successfully');
});

// ** Helper Functions *****************************************************
const getInitiators = async (projectId, requesterRole) => {
  const result = await db_all(
    `SELECT Initiator.id, Initiator.user_id, User.name, User.avatar_url, User.email, User.is_private_email 
    FROM User JOIN Initiator ON User.id = Initiator.user_id WHERE Initiator.project_id = ?`,
    [projectId]
  );
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return [];
  }
  // Wandle jedes DB-Row-Objekt in ein Project-Objekt mit createProject()
  const initiators = result.row.map((dbRow) => createInitiator(dbRow, requesterRole));
  return initiators;
};

const getParticipants = async (projectId, requesterRole) => {
  const result = await db_all(
    `SELECT Participant.id, Participant.user_id, User.name, User.avatar_url, User.email, User.is_private_email 
    FROM User JOIN Participant ON User.id = Participant.user_id WHERE Participant.project_id = ?`,
    [projectId]
  );
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return [];
  }
  // Wandle jedes DB-Row-Objekt in ein Participant-Objekt mit createParticipant()
  const participants = result.row.map((dbRow) => createParticipant(dbRow, requesterRole));

  return participants;
};

async function notifyProjectChange() {
  logger.info(`EVENT is raised: ${EventTypes.PROJECT_CHANGE} `);
  hackingEventBus.emit(EventTypes.PROJECT_CHANGE);
}

module.exports = router;
