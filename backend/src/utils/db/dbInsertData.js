const logger = require('../../logger');
const bcrypt = require('bcrypt');
const { db_get, db_run } = require('./dbUtils');
const { time2ts } = require('../utils');
const fs = require('fs');
const path = require('path');
const { defaultProjects } = require('./data/Projects');

const DEFAULT_PASSWORD = 'welcome!';

async function insertUserAdmin() {
  let result = await db_get('SELECT * FROM User WHERE role_id = 1');
  if (result.err || !!result.row) return;

  logger.info('DB Insert: Create Admin User');
  await createUser('Admin', 'hackathon@thalia.de', '+49 30 12345678', DEFAULT_PASSWORD, 1);
}

async function insertEvents() {
  let result = await db_get('SELECT * FROM Event');
  if (result.err || !!result.row) return;

  logger.info('DB Insert: Create Events');
  await createEvent(1, 'Innovation Days 2024', '2024-10-01 09:00:00', '2024-10-02 18:00:00');
  await createEvent(2, 'Innovation Days 2025', '2025-06-25 09:00:00', '2025-06-26 18:00:00');
}

async function insertProjects() {
  let result = await db_get('SELECT * FROM Project');
  if (result.err || !!result.row) return;

  logger.info('DB Insert: Create Projects');

  for (const project of defaultProjects) {
    await createProject(
      project.event_id,
      project.status_id,
      project.idea,
      project.description,
      project.team_name,
      project.team_avatar_url,
      project.initiator_id,
      project.goal,
      project.components,
      project.skills
    );
  }
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

async function createProject(event_id, status_id, idea, description, team_name, team_avatar_url, iniator_id, goal, components, skills) {
  const result = await db_run(
    `INSERT 
            INTO Project (event_id, status_id, idea, description, team_name, team_avatar_url, initiator_id, goal, components, skills)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [event_id, status_id, idea, description, team_name, team_avatar_url, iniator_id, goal, components, skills]
  );
  if (result.err || result.changes === 0) throw new Error('Could not create Project : ' + event_id + ' - ' + idea);
}

module.exports = { insertUserAdmin, insertEvents, insertProjects };
