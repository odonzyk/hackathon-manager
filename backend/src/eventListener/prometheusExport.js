const config = require('../config');
const logger = require('../logger');
const hackEventBus = require('../middlewares/hackathonEventBus');
const { EventTypes } = require('../constants');
const promClient = require('prom-client');
const { db_all } = require('../utils/db/dbUtils');

// Definiere globale Labels
const globalLabels = {
  environment: config.node_env
};

// Define Prometheus metrics
const kpi_registeredUsers = new promClient.Gauge({
  name: 'kpi_hackathon_user',
  help: 'Total number of registered users in the hackathon',
  labelNames: ['environment', 'role']
});

const kpi_commitedProjects = new promClient.Gauge({
  name: 'kpi_hackathon_projects',
  help: 'Number of registered projects',
  labelNames: ['environment', 'event']
});

const kpi_project_paricipants = new promClient.Gauge({
  name: 'kpi_hackathon_participants',
  help: 'Number of participants in the hackathon projects',
  labelNames: ['environment', 'event', 'project', 'type']
});

// checkParticipantCounts().then(participantCounts => {
//   console.log(participantCounts);
// });

// **  *************************************
async function exportUserCount(userCounts) {
  if (!userCounts) return;

  logger.debug(`exportUserCount -> UserCounts: ${JSON.stringify(userCounts)}`);

  // Iteriere über die Rollen und sende die Werte als Prometheus-Metriken mit Labels
  Object.keys(userCounts).forEach((role) => {
    kpi_registeredUsers.labels({ ...globalLabels, role }).set(userCounts[role]);
  });
}

async function exportProjectCount(projectCounts) {
  if (!projectCounts) return;

  logger.debug(`exportProjectCount -> ProjectCounts: ${JSON.stringify(projectCounts)}`);

  // Iteriere über die Events und sende die Werte als Prometheus-Metriken mit Labels
  Object.keys(projectCounts).forEach((event) => {
    kpi_commitedProjects.labels({ ...globalLabels, event }).set(projectCounts[event]);
  });
}

async function exportParticipantCount(participantCounts) {
  if (!participantCounts) return;

  //logger.debug(`exportParticipantCount -> ParticipantCounts: ${JSON.stringify(participantCounts)}`);

  // Iteriere über die Events und sende die Werte als Prometheus-Metriken mit Labels
  Object.keys(participantCounts).forEach((event) => {
    kpi_project_paricipants.labels({ ...globalLabels, event: participantCounts[event].event, project: participantCounts[event].project, type: 'count' }).set(participantCounts[event].count);
    kpi_project_paricipants.labels({ ...globalLabels, event: participantCounts[event].event, project: participantCounts[event].project, type: 'max' }).set(participantCounts[event].max);
  });
}

// ** Handle Eventbus notification ********************************************
hackEventBus.on(EventTypes.USER_CHANGE, async (event_id) => {
  logger.debug(`PrometheusExport -> EVENT is received: ${EventTypes.USER_CHANGE}`);

  try {
    const userCounts = await checkUserCounts();
    exportUserCount(userCounts);
  } catch (err) {
    logger.error('Error during PrometheusExport', err);
  }
});

hackEventBus.on(EventTypes.PROJECT_CHANGE, async (event_id) => {
  logger.debug(`PrometheusExport -> EVENT is received: ${EventTypes.PROJECT_CHANGE}`);

  try {
    const projectCounts = await checkProjectsCounts();
    exportProjectCount(projectCounts);
  } catch (err) {
    logger.error('Error during PrometheusExport', err);
  }
});

hackEventBus.on(EventTypes.PARTICIPANT_CHANGE, async (event_id) => {
  logger.debug(`PrometheusExport -> EVENT is received: ${EventTypes.PARTICIPANT_CHANGE}`);

  try {
    const participantCounts = await checkParticipantCounts();
    exportParticipantCount(participantCounts);
  } catch (err) {
    logger.error('Error during PrometheusExport', err);
  }
});

// ** Notification logic ******************************************************
async function checkUserCounts() {
  try {
    const result = await db_all(
      `SELECT Role.name, COUNT(*) as total_users 
       FROM User 
       JOIN Role ON User.role_id = Role.id 
       GROUP BY Role.name`
    );

    if (result.err) {
      throw new Error('Error occurred while fetching user counts');
    }

    // Transformiere die Ergebnisse in ein Objekt
    const userCounts = result.row.reduce((acc, row) => {
      acc[row.name] = row.total_users;
      return acc;
    }, {});

    return userCounts;
  } catch (error) {
    logger.error(error.message);
    return {};
  }
}

async function checkProjectsCounts() {
  try {
    const result = await db_all(
      `SELECT Event.name, COUNT(*) as total_projects 
       FROM Project
        JOIN Event ON Project.event_id = Event.id
        GROUP BY Event.name`
    );

    if (result.err) {
      throw new Error('Error occurred while fetching project counts');
    }

    // Transformiere die Ergebnisse in ein Objekt
    const projectCounts = result.row.reduce((acc, row) => {
      acc[row.name] = row.total_projects;
      return acc;
    }, {});

    return projectCounts;
  } catch (error) {
    logger.error(error.message);
    return {};
  }
}

async function checkParticipantCounts() {
  try {
    const result = await db_all(
      `SELECT Project.id, Event.name, Project.idea, 
        (select count(*) from Participant where project_id = Project.id) + 
        (select count(*) from Initiator where project_id = Project.id) as count,
        MAX(Project.max_team_size) as max_team_size
      FROM Project
      JOIN Event ON Project.event_id = Event.id 
      GROUP BY Event.name, Project.idea`
    );

    if (result.err) {
      throw new Error('Error occurred while fetching participant counts');
    }

    // Transformiere die Ergebnisse in ein Objekt
    const participantCounts = result.row.reduce((acc, row) => {
      acc[row.id] = {
        count: row.count,
        max: row.max_team_size,
        event: row.name,
        project: row.idea
      };
      return acc;
    }, {});

    return participantCounts;
  } catch (error) {
    logger.error(error.message);
    return {};
  }
}

module.exports = {};
