const logger = require("../../logger");
const bcrypt = require("bcrypt");
const { createTable, fillTable, db_get, db_run, db_exec } = require("./dbUtils");
const { insertUserAdmin, insertEvents, insertProjects } = require("./dbInsertData");


// *** DB Creation ************************************************************

async function dbCreate() {
  // Table for ProjectStatus
  // - id: id of the type
  // - name: name of the type
  await createTable(
    `CREATE TABLE IF NOT EXISTS ProjectStatus (
    id integer PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`,
  ).then(async function () {
    let result = await db_get("SELECT * FROM ProjectStatus");
    if (result.err || !!result.row) return;

    fillTable(
      "ProjectStatus",
      ["id", "name"],
      [
        [1, "'pitching'"],
        [2, "'active'"],
        [3, "'ended'"],
        [4, "'canceled'"],
        [5, "'archived'"],
      ],
    );
  });

  // Table for Role
  // - id: id of the type
  // - name: name of the type
  await createTable(
    `CREATE TABLE IF NOT EXISTS Role (
    id integer PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`,
  ).then(async function () {
    let result = await db_get("SELECT * FROM Role");
    if (result.err || !!result.row) return;

    fillTable(
      "Role",
      ["id", "name"],
      [
        [1, "'admin'"],
        [2, "'user'"],
      ],
    );
  });

  // Table for Users
  // - id: id of the user
  // - name: name of the user
  // - email: email of the user
  // - telephone: telephone number of the user
  // - password: password of the user (hash)
  // - role_id: role of the user (normal/guest/vip/admin/etc)
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
    FOREIGN KEY (role_id) REFERENCES Role(id)
  )`,
  );

  await createTable(
    `CREATE TABLE IF NOT EXISTS Event (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            start_time timestamp,
            end_time timestamp
      )`,
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
            initiator_id INTEGER NOT NULL,
            goal TEXT,
            components TEXT,
            skills TEXT,
            FOREIGN KEY (event_id) REFERENCES Event(id),
            FOREIGN KEY (status_id) REFERENCES ProjectStatus(id),
            FOREIGN KEY (initiator_id) REFERENCES User(id)
        )`,
  );

  await createTable(
    `CREATE TABLE IF NOT EXISTS Participant (
            id INTEGER PRIMARY KEY AUTOINCREMENT,           
            user_id INTEGER NOT NULL,
            project_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id),
            FOREIGN KEY (project_id) REFERENCES Project(id) 
        )`,
  );

  db_exec("PRAGMA foreign_keys=1;");

  await insertUserAdmin();
  await insertEvents();
  await insertProjects();
  logger.info("DB Init: DB created");
}

module.exports = { dbCreate };
