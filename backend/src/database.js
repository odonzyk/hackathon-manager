const sqlite3 = require("sqlite3").verbose();
const config = require("./config");
const logger = require("./logger");
const bcrypt = require("bcrypt");

const DEFAULT_PASSWORD = "welcome!";

logger.debug(`Open DB ${config.dbPath}`);

const db = new sqlite3.Database(config.dbPath, (err) => {
  if (err) {
    logger.error("Can't initialize the database: " + err.message);
  } else {
    logger.info("Initialized Database");
  }
});

// promisified Db functions for minizing callbacks
// Even though callbacks are currently support for backwards compatibility!
function db_run(statement, params = [], callback) {
  return execute_on_db("run", statement, params, callback);
}

function db_get(statement, params = [], callback) {
  return execute_on_db("get", statement, params, callback);
}

function db_all(statement, params = [], callback) {
  return execute_on_db("all", statement, params, callback);
}

function execute_on_db(method, statement, params, callback) {
  return new Promise((resolve) => {
    try {
      db[method](statement, params, function (err, rows) {
        if (typeof callback === "function")
          return callback.call(this, err, rows);
        if (err) {
          logger.error(err);
          return resolve({ err: err });
        }
        resolve({
          row: rows,
          stmt: this.stmt,
          lastID: this.lastID,
          changes: this.changes,
        });
      });
    } catch (err) {
      logger.error(err);
      resolve({ err: err });
    }
  });
}

// *** Helper FUnction ********************************************************

function createTable(query) {
  return new Promise(function (resolve, reject) {
    db.run(query, function (err) {
      if (err) {
        logger.error(`Can't create the Table because: ${err}`);
        reject(err);
      }
      resolve();
    });
  });
}

async function fillTable(table, structure, values) {
  if (
    typeof table !== "string" ||
    !Array.isArray(structure) ||
    !Array.isArray(values)
  ) {
    throw new Error(`Could not fill Table: ${table}`);
  }
  const result = await db_get(`SELECT * FROM ${table}`);
  if (result.err || !!result.row) return;

  structure = structure.join(", ");
  for (const elem of values) {
    db_run(`INSERT INTO ${table} (${structure}) VALUES (${elem.join(", ")})`);
  }
}

// *** DB Creation ************************************************************

function dbCreate() {
  // Table for ProjectStatus
  // - id: id of the type
  // - name: name of the type
  createTable(
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
  createTable(
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
  createTable(
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
  ).then(async function () {
    // Create Admin - password: 1234
    let result = await db_get("SELECT * FROM User WHERE role_id = 1");
    if (result.err || !!result.row) return;

    logger.info("DB Init: Create Admin User");
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    result = await db_run(
      "INSERT INTO User (name, email, telephone, password, role_id) VALUES ('Admin', 'hackathon@thalia.de', '+49 30 12345678', '" +
        hash +
        "', 1)",
    );
    if (result.err || result.changes === 0)
      throw new Error("Could not create Admin");
  });

  createTable(
    `CREATE TABLE IF NOT EXISTS Event (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            start_date timestamp,
            end_date timestamp
      )`,
  ).then(async function () {
    let result = await db_get("SELECT * FROM Event");
    if (result.err || !!result.row) return;

    fillTable(
      "Event",
      ["id", "name", "start_date", "end_date"],
      [
        [
          1,
          "'Innovation Days 2024'",
          "'2024-09-20 08:00:00'",
          "'2024-09-21 18:00:00'",
        ],
        [
          2,
          "'Innovation Days 2025'",
          "'2025-06-25 08:00:00'",
          "'2025-06-02 18:00:00'",
        ],
      ],
    );
  });

  createTable(
    `CREATE TABLE IF NOT EXISTS Project (
            event_id INTEGER NOT NULL,
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            status_id INTEGER NOT NULL DEFAULT 1,
            idea TEXT,     
            description TEXT,
            team_name TEXT,
            team_avatar_url TEXT,
            iniator_id INTEGER NOT NULL,
            goal TEXT,
            components TEXT,
            skills TEXT,
            FOREIGN KEY (event_id) REFERENCES Event(id),
            FOREIGN KEY (status_id) REFERENCES ProjectStatus(id),
            FOREIGN KEY (iniator_id) REFERENCES User(id)
        )`,
  ).then(async function () {
    let result = await db_get("SELECT * FROM Project");
    if (result.err || !!result.row) return;

    fillTable(
      "Project",
      [
        "event_id",
        "id",
        "status_id",
        "idea",
        "description",
        "team_name",
        "team_avatar_url",
        "iniator_id",
        "goal",
        "components",
        "skills",
      ],
      [
        [
          1,
          1,
          3,
          "'Hackathon App'",
          "'An app to manage the hackathon'",
          "'Team 1'",
          "'/assets/avatars/avatar_1.png'",
          1,
          "'Goal 1'",
          "'Component 1'",
          "'Skill 1'",
        ],
        [
          2,
          2,
          1,
          "'Hackathon App 2'",
          "'An app to manage the hackathon 2'",
          "'Team 2'",
          "'/assets/avatars/avatar_2.png'",
          2,
          "'Goal 2'",
          "'Component 2'",
          "'Skill 2'",
        ],
      ],
    );
  });

  createTable(
    `CREATE TABLE IF NOT EXISTS Participant (
            id INTEGER PRIMARY KEY AUTOINCREMENT,           
            user_id INTEGER NOT NULL,
            project_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES User(id),
            FOREIGN KEY (project_id) REFERENCES Project(id) 
        )`,
  );

  db.exec("PRAGMA foreign_keys=1;");
}

module.exports = { db, db_run, db_get, db_all, dbCreate };
