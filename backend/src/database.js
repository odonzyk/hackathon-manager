const sqlite3 = require('sqlite3').verbose();
const config = require('./config');
const logger = require('./logger');

logger.debug(`Open DB ${config.dbPath}`);

const db = new sqlite3.Database(config.dbPath, (err) => {
  if (err) {
    logger.error("Can't initialize the database: " + err.message);
  } else {
    logger.info('Initialized Database');
  }
});

// promisified Db functions for minizing callbacks
// Even though callbacks are currently support for backwards compatibility!
function db_run(statement, params = [], callback) {
  return execute_on_db('run', statement, params, callback);
}

function db_get(statement, params = [], callback) {
  return execute_on_db('get', statement, params, callback);
}

function db_all(statement, params = [], callback) {
  return execute_on_db('all', statement, params, callback);
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

// *** DB Creation ************************************************************

function dbCreate() {
  // Table for Slot
  // - id: id of the slot
  // - type_id: type of the slot
  createTable(
    `CREATE TABLE IF NOT EXISTS Slot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    type_id INTEGER,
    pos_id integer,
    parkinglot_id INTEGER NOT NULL,
    FOREIGN KEY (parkinglot_id) REFERENCES ParkingLot(id),
    FOREIGN KEY (type_id) REFERENCES Slot_Type(id),
    FOREIGN KEY (pos_id) REFERENCES SlotPos(id)
  )`,
  );

  // Table for Booking
  // - id: id of the booking entry
  // - type_id: type of the booking
  // - status_id: status of the booking
  // - slot_id: id of the slot
  // - user_id: id of the user
  // - start_time: booked start time
  // - end_time: booked end time
  createTable(
    `CREATE TABLE IF NOT EXISTS Booking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id integer,
    status_id integer,
    slot_id INTEGER,
    user_id INTEGER,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    FOREIGN KEY (slot_id) REFERENCES Slot(id),
    FOREIGN KEY (user_id) REFERENCES User(id),
    FOREIGN KEY (status_id) REFERENCES Status(id),
    FOREIGN KEY (type_id) REFERENCES Booking_Type(id)
  )`,
  );

  // Table for Vehicle
  // - id: id of the vehicle
  // - user_id: id of the user
  // - vehicle_type_id: Type/Model of a vehicle
  // - licence_plate: vehicle license plate of the vehicle
  createTable(
    `CREATE TABLE IF NOT EXISTS Vehicle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    vehicle_type_id INTEGER NOT NULL,
    licence_plate TEXT, 
    FOREIGN KEY (user_id) REFERENCES User(id)
    FOREIGN KEY (vehicle_type_id) REFERENCES Vehicle_Type(id)
  )`,
  );

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
    role_id integer,
    avatar_url TEXT DEFAULT '/assets/avatars/avatar_1.png',
    FOREIGN KEY (role_id) REFERENCES Role(id)
  )`,
  ).then(async function () {
    // Create Admin - password: 1234
    let result = await db_get('SELECT * FROM User WHERE role_id = 1');
    if (result.err || !!result.row) return;

    logger.info('DB Init: Create Admin User');
    result = await db_run(
      "INSERT INTO User (name, email, telephone, password, role_id) VALUES ('Admin', 'admin@parking.de', '1234', '$2b$10$qLVKNVRQvXESuHMoxOD9.uMevvbNmjNKcTP6f4ZIPRcuACuBn7l5G', 1)",
    );
    if (result.err || result.changes === 0) throw new Error('Could not create Admin');

    result = await db_run(
      "INSERT INTO Vehicle (user_id, vehicle_type_id, licence_plate) VALUES (?, 1,'A-lpha')",
      [result.lastID],
    );
    if (result.err || result.changes === 0) throw new Error('Could not create Admin');
  });

  // Table for Owner
  // - id: id of the owner
  // - name: name of the owner
  createTable(
    `CREATE TABLE IF NOT EXISTS Owner (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`,
  ).then(async function () {
    // Create Admin - password: 1234
    let result = await db_get('SELECT * FROM Owner WHERE id = 1');
    if (result.err || !!result.row) return;

    logger.info('DB Init: Create Thalia Owner');
    result = await db_run("INSERT INTO Owner (name) VALUES ('Thalia')");
    if (result.err || result.changes === 0) throw new Error('Could not create Owner');
  });

  // Table for an entire Parking Lot
  // - id: id of the parking lot
  // - name: name of the parking lot
  // - owner: owner of the parking lot
  // - map_path: path to map image
  createTable(
    `CREATE TABLE IF NOT EXISTS ParkingLot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    owner_id INTEGER,
    map_path TEXT,
    FOREIGN KEY (owner_id) REFERENCES Owner(id)
  )`,
  ).then(async function () {
    // Create Admin - password: 1234
    let result = await db_get('SELECT * FROM ParkingLot WHERE id = 1');
    if (result.err || !!result.row) return;

    logger.info('DB Init: Create ParkingLot');
    result = await db_run("INSERT INTO ParkingLot (name, owner_id) VALUES ('Mehringdamm 55', 1)");
    if (result.err || result.changes === 0) throw new Error('Could not create ParkingLot');
    let plot_id = result.lastID;

    result = await db_run(
      'INSERT INTO SlotPos (x, y, width, height, rotation) VALUES (?, ?, ?, ?, ?)',
      [0, 0, 30, 30, 0],
    );
    result = await db_run(
      'INSERT INTO Slot (name, parkinglot_id, type_id, pos_id) VALUES (?, ?, ?, ?)',
      ['Parkplatz 1', plot_id, result.lastID],
    );

    result = await db_run(
      'INSERT INTO SlotPos (x, y, width, height, rotation) VALUES (?, ?, ?, ?, ?)',
      [0, 0, 30, 30, 0],
    );
    result = await db_run(
      'INSERT INTO Slot (name, parkinglot_id, type_id, pos_id) VALUES (?, ?, ?, ?)',
      ['Parkplatz 2', plot_id, result.lastID],
    );

    result = await db_run(
      'INSERT INTO SlotPos (x, y, width, height, rotation) VALUES (?, ?, ?, ?, ?)',
      [0, 0, 30, 30, 0],
    );
    result = await db_run(
      'INSERT INTO Slot (name, parkinglot_id, type_id, pos_id) VALUES (?, ?, ?, ?)',
      ['Parkplatz 3', plot_id, result.lastID],
    );
  });

  // Table for Allowed Users (of a specific parking lot)
  // - parkinglot_id: id of the parking lot
  // - user_id: id of the user
  createTable(
    `CREATE TABLE IF NOT EXISTS Allowed_user (
    parkinglot_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (parkinglot_id) REFERENCES ParkingLot(id),
    FOREIGN KEY (user_id) REFERENCES User(id)
  )`,
  );

  // Table for Booking Type
  // - id: id of the type
  // - name: name of the type
  createTable(
    `CREATE TABLE IF NOT EXISTS Booking_Type (
    id integer PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`,
  ).then(async function () {
    fillTable(
      'Booking_Type',
      ['id', 'name'],
      [
        [1, "'direct'"],
        [2, "'reserved'"],
        [3, "'waiting'"],
      ],
    );
  });

  // Table for Status
  // - id: id of the type
  // - name: name of the type
  createTable(
    `CREATE TABLE IF NOT EXISTS Status (
    id integer PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`,
  ).then(async function () {
    fillTable(
      'Status',
      ['id', 'name'],
      [
        [1, "'inactive'"], // reserved
        [2, "'active'"],
        [3, "'ended'"], // user is still clearing the slot
        [4, "'completed'"],
        [5, "'cancelled'"],
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
    fillTable(
      'Role',
      ['id', 'name'],
      [
        [0, "'admin'"],
        [1, "'owner'"],
        [2, "'vip'"],
        [3, "'user'"],
        [4, "'guest'"],
        [5, "'new'"],
      ],
    );
  });

  // Table for Position of the Slots
  // - id: id of position row
  // - x: x coord of the slot
  // - y: y coord of the slot
  // - width: width of the slot
  // - height: height of the slot
  // - rotation: rotation of the slot
  createTable(
    `CREATE TABLE IF NOT EXISTS SlotPos (
    id integer PRIMARY KEY AUTOINCREMENT,
    x integer,
    y integer,
    width integer,
    height integer,
    rotation integer
  )`,
  );

  // Table for Slot_Type
  // - id: id of the type
  // - name: name of the type
  createTable(
    `CREATE TABLE IF NOT EXISTS Slot_Type (
    id integer PRIMARY KEY AUTOINCREMENT,
    name TEXT
  )`,
  ).then(async function () {
    fillTable(
      'Slot_Type',
      ['id', 'name'],
      [
        [1, "'for-all'"],
        [2, "'for-woman'"],
        [3, "'for-disabled'"],
      ],
    );
  });

  // Table for Vehicle_Type
  // - id: id of the type
  // - type: type of the vehicle
  createTable(
    `CREATE TABLE IF NOT EXISTS Vehicle_Type (
    id integer PRIMARY KEY AUTOINCREMENT,
    type TEXT
  )`,
  ).then(async function () {
    fillTable(
      'Vehicle_Type',
      ['id', 'type'],
      [
        [1, "'car'"],
        [2, "'motorcycle'"],
        [3, "'pickup'"],
        [4, "'mini-van'"],
        [5, "'truck'"],
        [6, "'scootor'"],
        [7, "'bicycle'"],
      ],
    );
  });

  db.exec('PRAGMA foreign_keys=1;');

  createStatisticTestData();
}

// *** Testdaten-Funktion ******************************************************
async function createStatisticTestData() {
  try {
    if (["prod", "production"].includes(config.node_env?.toLowerCase())) return;

    // Prüfen, ob bereits Buchungen existieren
    const bookingCheck = await db_get("SELECT count(id) as count FROM booking");
    if (bookingCheck.err || !bookingCheck.row || bookingCheck.row.count !== 0) return;

    logger.debug("DB Init: ... Creating statistic test users");

    const TEST_USERS = [
      "TestUser1", "TestUser2", "TestUser3", "TestUser4",
      "TestUser5", "TestUser6", "TestUser7", "TestUser8"
    ].map((name, i) => ({
      name,
      email: `test${i + 1}@parking.de`,
      telephone: `12345678${i}`
    }));

    // Testnutzer erstellen (falls nicht vorhanden)
    for (const user of TEST_USERS) {
      await db_run(
        `INSERT INTO User (name, email, telephone, password, role_id) 
         VALUES (?, ?, ?, ?, 2) ON CONFLICT(email) DO NOTHING`,
        [user.name, user.email, user.telephone, "password"]
      );
    }
    logger.debug("DB Init: ... Test users created");

    // Alle Slots abrufen
    const slotsResult = await db_all("SELECT id FROM Slot");
    if (slotsResult.err || !Array.isArray(slotsResult.row) || slotsResult.row.length === 0) {
      logger.error("DB Init: ... No existing slots");
      return;
    }
    const slots = slotsResult.row;

    // Alle Testuser abrufen
    const usersResult = await db_all("SELECT id FROM User WHERE email LIKE 'test%@parking.de'");
    if (usersResult.err || !Array.isArray(usersResult.row) || usersResult.row.length === 0) {
      logger.error("DB Init: ... No test users found");
      return;
    }
    const users = usersResult.row;

    logger.debug("DB Init: ... Creating statistic booking data");

    // Buchungen für die letzten 15 Wochen generieren
    const today = new Date();
    for (let iday = 0; iday < 15 * 7; iday++) {
      const bookingDate = new Date(today);
      bookingDate.setDate(today.getDate() - iday);
      if ([0, 6].includes(bookingDate.getDay())) continue; // Keine Wochenenden

      const numBookings = Math.random() < 0.2 ? 1 : Math.random() < 0.7 ? 2 : 3; // 20%:1, 50%:2, 30%:3 Buchungen
      const availableSlots = [...slots].sort(() => Math.random() - 0.5).slice(0, numBookings);
      const availableUsers = [...users].sort(() => Math.random() - 0.5).slice(0, numBookings * 2);

      for (const slot of availableSlots) {
        const numPerSlot = Math.random() > 0.8 ? 2 : 1; // 80%:1, 20%:2 Buchungen pro Slot

        for (let i = 0; i < numPerSlot; i++) {
          const user = availableUsers.pop();
          if (!user) continue;

          const startHour = 8 + Math.floor(Math.random() * 3) + i * 4; // Start zwischen 8-10 Uhr
          const duration = numPerSlot === 1 ? Math.floor(Math.random() * 4) + 5 : Math.floor(Math.random() * 4) + 1;
          const startTime = new Date(bookingDate);
          startTime.setHours(startHour, Math.floor(Math.random() * 60), 0, 0);
          const endTime = new Date(startTime);
          endTime.setHours(startHour + duration);

          await db_run(
            `INSERT INTO Booking (type_id, status_id, slot_id, user_id, start_time, end_time) 
             VALUES (1, 4, ?, ?, ?, ?)`,
            [slot.id, user.id, Math.floor(startTime.getTime() / 1000), Math.floor(endTime.getTime() / 1000)]
          );
        }
      }
    }
    logger.debug("DB Init: ... Bookings finished");
  } catch (error) {
    logger.error("DB Init: ... Error on test data generation", error);
  }
}

module.exports = { db, db_run, db_get, db_all, dbCreate };
