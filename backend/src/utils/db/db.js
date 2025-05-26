const logger = require('../../logger');
const { insertUserAdmin, insertEvents, insertProjects, insertUser, insertInitiator } = require('./dbInsertData');
const { dbCreate, dbFillKeyTables } = require('./dbCreate');


async function dbInitialisation() {
  logger.info('DB Init: DB creation started');
  await dbCreate();
  await dbFillKeyTables();

  await insertUserAdmin();
  await insertEvents();
  await insertProjects();
  await insertUser();
  await insertInitiator();
  logger.info('DB Init: DB created');
}

module.exports = { dbInitialisation };
