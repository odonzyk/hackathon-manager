const logger = require('../../logger');
const bcrypt = require('bcrypt');
const { db_get, db_run } = require('./dbUtils');
const { time2ts } = require('../utils');
const { defaultProjects } = require('../../../volumes/data/Projects');
const { defaultUsers } = require('../../../volumes/data/User');
const { defaultTeams } = require('../../../volumes/data/Teams');
const config = require('../../config'); // Importiere die Konfiguration
const { RoleTypes } = require('../../constants');

const DEFAULT_PASSWORD = 'welcome!';

async function insertUserAdmin() {
  let count = 0;
  let result = await db_get(`SELECT * FROM User WHERE role_id = ${RoleTypes.ADMIN}`);
  if (!result.row) {
    await createUser('Admin', 'hackathon@thalia.de', '+49 30 12345678', DEFAULT_PASSWORD, RoleTypes.ADMIN);
    count++;
  }
  logger.info(`... DB Insert: ${count} admin user inserted.`);
}

async function insertEvents() {
  let count = 0;
  let result = await db_get('SELECT * FROM Event');
  if (!result.row) {
    await createEvent(1, 'Innovation Days 2024', '2024-10-01 09:00:00', '2024-10-02 18:00:00');
    count++;
    await createEvent(2, 'Innovation Days 2025', '2025-06-25 09:00:00', '2025-06-26 18:00:00');
    count++;
  }
  logger.info(`... DB Insert: ${count} events inserted.`);
}

async function insertProjects() {
  let result = null;
  let count = 0;

  for (const project of defaultProjects) {
    result = await db_get('SELECT * FROM Project WHERE LOWER(idea) = LOWER(?) AND event_id = ?', [project.idea, project.event_id]);
    if (!result.err && !result.row) {
      await createProject(project.event_id, project.status_id, project.idea, project.description, project.team_name, project.team_avatar_url, project.goal, project.components, project.skills);
      count++;
    }
  }
  logger.info(`... DB Insert: ${count} projects inserted.`);
}

async function insertUser() {
  let result = null;
  let count = 0;

  const currentEnv = config.node_env || 'dev'; // Laufzeitumgebung aus der Konfiguration

  for (const user of defaultUsers) {
    if (config.node_env === 'prod' && user.env !== 'prod') continue;

    result = await db_get('SELECT * FROM User WHERE LOWER(email) = LOWER(?)', [user.email]);
    if (!result.err && !result.row) {
      await createUser(user.name, user.email, user.telephone, DEFAULT_PASSWORD, user.role_id);
      count++;
    }
  }
  logger.info(`... DB Insert: ${count} users inserted.`);
}

function getProjectById(id) {
  return defaultProjects.find((project) => project.id === id) || null;
}
async function insertInitiator() {
  let result = null;
  let count = 0;

  for (const team of defaultTeams) {
    const project = getProjectById(team.project_id);
    if (!project) continue;
    result = await db_get('SELECT * FROM Project WHERE LOWER(project.idea) = LOWER(?)', [project.idea]);
    const project_id = result.row.id;
    for (const initiator of team.initiator) {
      result = await db_get('SELECT * FROM User WHERE LOWER(name) = LOWER(?)', [initiator]);
      if (result.err || !!result.row) {
        const user_id = result.row.id;
        result = await db_get('SELECT * FROM Initiator WHERE user_id = ? AND project_id = ?', [user_id, project_id]);
        if (!result.err && !!result.row) continue;

        await createInitiator(project_id, user_id);
        count++;
      }
    }
  }
  logger.info(`... DB Insert: ${count} initiators inserted.`);
}
async function insertParticipants() {
  let result = null;
  let count = 0;

  for (const team of defaultTeams) {
    const project = getProjectById(team.project_id);
    if (!project) continue;
    if (team.members.length === 0) continue;
    result = await db_get('SELECT * FROM Project WHERE LOWER(project.idea) = LOWER(?)', [project.idea]);
    const project_id = result.row.id;
    for (const member of team.members) {
      result = await db_get('SELECT * FROM User WHERE LOWER(name) = LOWER(?)', [member]);
      if (result.err || !!result.row) {
        const user_id = result.row.id;
        result = await db_get('SELECT * FROM Participant WHERE user_id = ? AND project_id = ?', [user_id, project_id]);
        if (!result.err && !!result.row) continue;

        await createParticipant(project_id, user_id);
        count++;
      }
    }
  }
  logger.info(`... DB Insert: ${count} participants inserted.`);
}

// ** Helper function to create the table *******************************
async function createUser(name, email, telephone, password, role_id) {
  const hash = await bcrypt.hash(password, 10);
  const result = await db_run(
    `INSERT 
            INTO User (name, email, telephone, password, role_id) 
            VALUES (?, ?, ?, ?, ?)`,
    [name, email, telephone, hash, role_id]
  );
  if (result.err || result.changes === 0) throw new Error('Could not create User: ' + name);
}

async function createEvent(id, name, start_time, end_time) {
  const result = await db_run(
    `INSERT 
            INTO Event (id, name, start_time, end_time) 
            VALUES (?, ?, ?, ?)`,
    [id, name, time2ts(start_time), time2ts(end_time)]
  );
  if (result.err || result.changes === 0) throw new Error('Could not create Event : ' + name);
}

async function createProject(event_id, status_id, idea, description, team_name, team_avatar_url, goal, components, skills) {
  const result = await db_run(
    `INSERT 
            INTO Project (event_id, status_id, idea, description, team_name, team_avatar_url, goal, components, skills)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [event_id, status_id, idea, description, team_name, team_avatar_url, goal, components, skills]
  );
  if (result.err || result.changes === 0) throw new Error('Could not create Project : ' + event_id + ' - ' + idea);
}

async function createInitiator(project_id, user_id) {
  const result = await db_run(`INSERT INTO Initiator (project_id, user_id) VALUES (?, ?)`, [project_id, user_id]);
  if (result.err || result.changes === 0) throw new Error('Could not create Initiator: ' + project_id + ' - ' + user_id);
}
async function createParticipant(project_id, user_id) {
  const result = await db_run(`INSERT INTO Participant (project_id, user_id) VALUES (?, ?)`, [project_id, user_id]);
  if (result.err || result.changes === 0) throw new Error('Could not create Participant: ' + project_id + ' - ' + user_id);
}

module.exports = { insertUserAdmin, insertEvents, insertProjects, insertUser, insertInitiator, insertParticipants };
