const mysql = require('mysql2/promise');
const config = require('../../config');
const logger = require('../../logger');

logger.debug(`Connecting to MySQL database at ${config.mysqlHost}:${config.mysqlPort}`);

// MySQL-Datenbankverbindung erstellen
const db = mysql.createPool({
  host: config.mysqlHost,
  port: config.mysqlPort,
  user: config.mysqlUser,
  password: config.mysqlPassword,
  database: config.mysqlDb,
  waitForConnections: true,
  connectionLimit: config.mysqlConnectionLimit,
  queueLimit: config.mysqlQueueLimit,
});
/*
function db_run(statement, params = [], callback) {
  return execute_on_db('run', statement, params, callback);
}

function db_get(statement, params = [], callback) {
  return execute_on_db('get', statement, params, callback);
}

function db_all(statement, params = [], callback) {
  return execute_on_db('all', statement, params, callback);  
}
*/


async function db_run(statement, params = []) {
  try {
    const [result, fields] = await db.query(statement, params);
    return {
      changes: result.affectedRows,
      lastID: result.insertId,
    };
  } catch (err) {
    logger.error(`db_run: ${err.message}`);
    return { err };
  }
}

async function db_get(statement, params = []) {
  try {
    const [rows, fields] = await db.query(statement, params);
    return { row: rows[0] || null };
  } catch (err) {
    logger.error(`db_get: ${err.message}`);
    return { err };
  }
}

async function db_all(statement, params = []) {
  try {
    const [rows, fields] = await db.query(statement, params);
    return { rows };
  } catch (err) {
    logger.error(`db_all: ${err.message}`);
    return { err };
  }
}


function execute_on_db(method, statement, params, callback) {
  return new Promise((resolve) => {
    try {
      db[method](statement, params, function (err, rows) {
        if (typeof callback === 'function') return callback.call(this, err, rows);
        if (err) {
          logger.error(err);
          return resolve({ err: err });
        }
        resolve({
          row: rows,
          stmt: this.stmt,
          lastID: this.lastID,
          changes: this.changes
        });
      });
    } catch (err) {
      logger.error(err);
      resolve({ err: err });
    }
  });
}
/*
function db_exec(command) {
  return new Promise((resolve, reject) => {
    db.exec(command, (err) => {
      if (err) {
        logger.error(err);
        reject(err);
      }
      resolve();
    });
  });
}*/


async function db_exec(command) {
  try {
    await db.query(command);
    return { success: true };
  } catch (err) {
    logger.error(`db_exec: ${err.message}`);
    return { err };
  }
}

// *** Helper Function ********************************************************

async function createTable(query) {
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
  if (typeof table !== 'string' || !Array.isArray(structure) || !Array.isArray(values)) {
    throw new Error(`Could not fill Table: ${table}`);
  }
  const result = await db_get(`SELECT * FROM ${table}`);
  if (result.err || !!result.row) return;

  structure = structure.join(', ');
  for (const elem of values) {
    db_run(`INSERT INTO ${table} (${structure}) VALUES (${elem.join(', ')})`);
  }
}


async function isTableEmpty(tablename) {
  const result = await db_get(`SELECT COUNT(*) as count FROM ${tablename}`);
  if (result.err) {
    logger.error(`isTableEmpty: Error checking table ${tablename}: ${result.err.message}`);
    return false;
  }
  return result.row.count === 0;
}

async function existTableEntry(tablename, checkColumn, checkValue) {  
  const result = await db_get(`SELECT COUNT(*) as count FROM ${tablename} WHERE ${checkColumn} = ?`, [checkValue]);
  if (result.err) {
    logger.error(`existTableEntry: Error checking table ${tablename}: ${result.err.message}`);
    return false;
  }
  return result.row.count > 0;
}

module.exports = {
  db,
  db_run,
  db_get,
  db_all,
  db_exec,
  createTable,
  fillTable,
  isTableEmpty,
  existTableEntry
};
