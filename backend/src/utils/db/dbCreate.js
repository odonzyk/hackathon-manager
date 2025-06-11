const logger = require('../../logger');
const { createTable, fillTable, db_get, db_exec, isTableEmpty } = require('./dbUtils');

// *** DB Creation ************************************************************
async function dbCreate() {
  await createTable(
    `CREATE TABLE IF NOT EXISTS ProjectStatus (
      id integer PRIMARY KEY AUTOINCREMENT,
      name TEXT
    )`
  );

  await createTable(
    `CREATE TABLE IF NOT EXISTS Role (
      id integer PRIMARY KEY AUTOINCREMENT,
      name TEXT
    )`
  );

  await createTable(
    `CREATE TABLE IF NOT EXISTS User (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT UNIQUE,
          is_private_email INTEGER NOT NULL DEFAULT 0,
          telephone TEXT,
          is_private_telephone INTEGER NOT NULL DEFAULT 0,
          password TEXT,
          role_id integer NOT NULL DEFAULT 1,
          avatar_url TEXT DEFAULT '/assets/avatars/avatar_1.png',
          activation_code TEXT,
      FOREIGN KEY (role_id) REFERENCES Role(id)
    )`
  );

  await createTable(
    `CREATE TABLE IF NOT EXISTS Event (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT,
              start_time timestamp,
              end_time timestamp
        )`
  );

  await createTable(
    `CREATE TABLE IF NOT EXISTS Project (
              event_id INTEGER NOT NULL,
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              status_id INTEGER NOT NULL DEFAULT 1,
              idea TEXT,     
              description TEXT,
              team_name TEXT,
              team_avatar_url TEXT,
              goal TEXT,
              components TEXT,
              skills TEXT,
              FOREIGN KEY (event_id) REFERENCES Event(id),
              FOREIGN KEY (status_id) REFERENCES ProjectStatus(id)
          )`
  );

  await createTable(
    `CREATE TABLE IF NOT EXISTS Initiator (
              id INTEGER PRIMARY KEY AUTOINCREMENT,           
              user_id INTEGER NOT NULL,
              project_id INTEGER NOT NULL,
              FOREIGN KEY (user_id) REFERENCES User(id),
              FOREIGN KEY (project_id) REFERENCES Project(id) 
          )`
  );

  await createTable(
    `CREATE TABLE IF NOT EXISTS Participant (
              id INTEGER PRIMARY KEY AUTOINCREMENT,           
              user_id INTEGER NOT NULL,
              project_id INTEGER NOT NULL,
              FOREIGN KEY (user_id) REFERENCES User(id),
              FOREIGN KEY (project_id) REFERENCES Project(id) 
          )`
  );

  db_exec('PRAGMA foreign_keys=1;');
}

// *** initial DB ************************************************************

async function dbFillKeyTables() {
  let count = 0;

  if (await isTableEmpty('ProjectStatus')) {
    await fillTable(
      'ProjectStatus',
      ['id', 'name'],
      [
        [1, "'pitching'"],
        [2, "'active'"],
        [3, "'ended'"],
        [4, "'canceled'"],
        [5, "'archived'"]
      ]
    );
    count++;
  }

  if (await isTableEmpty('Role')) {
    fillTable(
      'Role',
      ['id', 'name'],
      [
        [1, "'admin'"],
        [2, "'organiser'"],
        [3, "'user'"],
        [4, "'guest'"],
        [5, "'new'"],
        [6, "'dummy'"]
      ]
    );
    count++;
  }

  logger.info(`... initialDb: ${count} tables filled with initial data.`);
}

module.exports = { dbCreate, dbFillKeyTables };
