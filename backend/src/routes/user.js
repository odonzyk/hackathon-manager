const express = require("express");
const { db_get, db_run, db_all } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config");
const logger = require("../logger");

const authenticateToken = require("../middlewares/authMiddleware");
const router = express.Router();
const { ErrorMsg } = require("../constants");

const createUser = (dbRow) => {
  const vehicles = dbRow?.vehicles
    ? dbRow.vehicles.split(",").map((vehicle) => {
        const [vehicle_id, vehicle_type_id, licence_plate] = vehicle.split(":");
        return {
          id: vehicle_id,
          vehicle_type_id: parseInt(vehicle_type_id, 10),
          licence_plate,
        };
      })
    : [];

  return {
    id: dbRow?.id ?? null,
    name: dbRow?.name ?? "",
    email: dbRow?.email ?? "",
    is_private_email: dbRow?.is_private_email ?? false,
    telephone: dbRow?.telephone ?? "",
    is_private_telephone: dbRow?.is_private_telephone ?? false,
    role_id: dbRow?.role_id ?? 2,
    avatar_url: dbRow?.avatar_url ?? "/assets/avatars/avatar_1.png",
    vehicles: vehicles,
  };
};

// *** GET /api/user/login ****************************************************
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  logger.debug(`API User -> Login User: ${email}`);

  if (!email || !password) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  const result = await db_get("SELECT * FROM User WHERE email = ?", [
    email.toLowerCase(),
  ]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);

  const { id, name, password: hash, role_id } = result.row;
  if (!hash) {
    return res.status(400).send("No password is set");
  }

  const validPassword = await bcrypt.compare(password, hash);
  if (!validPassword) {
    logger.debug(`Wrong password for user ${email}`);
    return res.status(401).send(ErrorMsg.AUTH.INVALID_CREDENTIALS);
  }

  const token = jwt.sign(
    { id: id, name: name, email: email, role: role_id, parkinglots: [1] },
    config.jwtSecret,
    {
      expiresIn: "2h",
    },
  );

  res.json({ token });
});

// *** GET /api/user/list *****************************************************
router.get("/list", authenticateToken, async (req, res) => {
  logger.debug(`API User -> List User`);
  const result = await db_all(
    `SELECT User.*,
    COALESCE(GROUP_CONCAT(Vehicle.id || ':' || Vehicle.vehicle_type_id || ':' || Vehicle.licence_plate), '') AS vehicles
    FROM User
    LEFT OUTER JOIN Vehicle ON Vehicle.user_id = User.id
    GROUP BY User.id, User.name, User.email, User.telephone, User.role_id`,
  );
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);
  }

  // Wandle jedes DB-Row-Objekt in ein User-Objekt mit createUser()
  const users = result.row.map(createUser);
  res.json(users);
});

// *** POST /api/user *********************************************************
router.post("/", async (req, res) => {
  let {
    name,
    email,
    is_private_email,
    telephone,
    is_private_telephone,
    password,
    role_id,
    avatar_url,
    vehicle_type_id,
    licence_plate,
  } = req.body;
  logger.debug(`API User -> Register User: ${name}`);

  //TODO: Set Passwort by Frontend
  if (!password) password = "welcome!";
  if (!role_id) role_id = 2;
  if (!vehicle_type_id) vehicle_type_id = 1;
  if (!licence_plate) licence_plate = "X-XX";

  if (!name || !email) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  email = email.toLowerCase();
  let result = await db_get("SELECT * FROM User WHERE email = ?", [email]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.row) return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);

  const hashedPassword = await bcrypt.hash(password, 10);

  result = await db_run(
    "INSERT INTO User (name, email, telephone, password, role_id, is_private_email, is_private_telephone, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?,?)",
    [
      name,
      email,
      telephone,
      hashedPassword,
      role_id,
      is_private_email || false,
      is_private_telephone || false,
      avatar_url || "/assets/avatars/avatar_1.png",
    ],
  );
  const user_id = result.lastID;
  if (result.err || result.changes === 0) {
    return res.status(500).send(`Server error`);
  }
  result = await db_run(
    "INSERT INTO Vehicle (user_id, vehicle_type_id, licence_plate) VALUES (?, ?, ?)",
    [user_id, vehicle_type_id, licence_plate],
  );
  if (result.err || result.changes === 0) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  res.status(201).json({
    id: user_id,
    name,
    email,
    telephone,
    role_id,
    is_private_email: is_private_email || false,
    is_private_telephone: is_private_telephone || false,
    avatar_url: avatar_url || "/assets/avatars/avatar_1.png",
    vehicles: [
      {
        id: result.lastID,
        vehicle_type_id,
        licence_plate,
      },
    ],
  });
});

// *** PUT /api/user *********************************************************
router.put("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  let {
    name,
    email,
    is_private_email,
    telephone,
    is_private_telephone,
    role_id,
    avatar_url,
  } = req.body;
  logger.debug(`API User -> Update User: ${name}`);

  if (!name || !email || !telephone) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  //Load existing data
  result = await db_get(
    `SELECT User.id, User.name, User.email, User.telephone, User.is_private_email, User.is_private_telephone, User.role_id, User.avatar_url, 
      GROUP_CONCAT(Vehicle.id || ':' || Vehicle.vehicle_type_id || ':' || Vehicle.licence_plate) AS vehicles
    FROM User
    LEFT OUTER JOIN Vehicle ON Vehicle.user_id = User.id
    WHERE User.id = ?`,
    [id],
  );
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);

  let user = createUser(result.row);

  // Check if email is used by someone already
  if (user.email != email) {
    let result = await db_get(
      "SELECT * FROM User WHERE email = ? AND id != ?",
      [email, id],
    );
    if (result.err) {
      return res.status(500).send(ErrorMsg.SERVER.ERROR);
    }
    if (result.row) {
      return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);
    }
  }
  user.name = name ?? user.name;
  user.email = email ?? user.email.toLowerCase();
  user.is_private_email = is_private_email ?? user.is_private_email;
  user.telephone = telephone ?? user.telephone;
  user.is_private_telephone = is_private_telephone ?? user.is_private_telephone;
  user.role_id = role_id ?? user.role_id;
  user.avatar_url = avatar_url ?? user.avatar_url;

  //  if (password) {
  //    logger.debug('Reset passwort');
  //    user.password = await bcrypt.hash(password, 10);
  //  }

  // Update User
  result = await db_run(
    "Update User SET name=?, email=?, telephone=?, role_id=?, is_private_email=?, is_private_telephone=?, avatar_url=? where id = ?",
    [
      user.name,
      user.email,
      user.telephone,
      user.role_id,
      user.is_private_email,
      user.is_private_telephone,
      user.avatar_url,
      id,
    ],
  );
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  res.status(200).json(user);
});

// *** GET /api/user *********************************************************
router.get("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API User -> Get User (id): ${id}`);

  const result = await db_get(
    `SELECT User.id, User.name, User.email, User.telephone, User.role_id, User.avatar_url, 
      GROUP_CONCAT(Vehicle.id || ':' || Vehicle.vehicle_type_id || ':' || Vehicle.licence_plate) AS vehicles
    FROM User
    LEFT OUTER JOIN vehicle ON vehicle.user_id = User.id
    WHERE User.id = ?`,
    [id],
  );
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);
  const user = createUser(result.row);
  res.json(user);
});

// *** DELETE /api/user *********************************************************
router.delete("/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API User -> Delete User (id): ${id}`);

  // Delete Bookings
  let result = await db_run("DELETE FROM Booking WHERE user_id = ?", [id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  // Delete vehicle
  result = await db_run("DELETE FROM vehicle WHERE user_id = ?", [id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  // Delete User
  result = await db_run("DELETE FROM User WHERE id = ?", [id]);
  if (result.err) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_USER);
  }
  res.status(200).send("User deleted successfully");
});

// *** GET /user/vehicle/:userId ************************************************
router.get("/vehicle/:userId", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  logger.debug(`API User -> Get Vehicles for User (id): ${userId}`);

  const result = await db_all(
    `SELECT id, licence_plate, vehicle_type_id FROM Vehicle WHERE user_id = ?`,
    [userId],
  );

  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_VEHICLE);

  res.json(result.row || []);
});

// *** POST /user/vehicle *******************************************************
router.post("/vehicle", authenticateToken, async (req, res) => {
  const { user_id, licence_plate, vehicle_type_id } = req.body;
  logger.debug(`API User -> Add Vehicle for User (id): ${user_id}`);

  if (!user_id || !licence_plate || !vehicle_type_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  const result = await db_run(
    `INSERT INTO Vehicle (user_id, licence_plate, vehicle_type_id) VALUES (?, ?, ?)`,
    [user_id, licence_plate, vehicle_type_id],
  );

  if (result.err || result.changes === 0) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }

  res.status(201).json({
    id: result.lastID,
    user_id,
    licence_plate,
    vehicle_type_id,
  });
});

// *** PUT /user/vehicle/:id ****************************************************
router.put("/vehicle/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { licence_plate, vehicle_type_id } = req.body;
  logger.debug(`API User -> Update Vehicle (id): ${id}`);

  if (!licence_plate || !vehicle_type_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  const vehicleResult = await db_get(`SELECT * FROM Vehicle WHERE id = ?`, [
    id,
  ]);
  if (vehicleResult.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!vehicleResult.row)
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_VEHICLE);
  let vehicle = vehicleResult.row;
  vehicle.licence_plate = licence_plate;
  vehicle.vehicle_type_id = vehicle_type_id;

  const result = await db_run(
    `UPDATE Vehicle SET licence_plate = ?, vehicle_type_id = ? WHERE id = ?`,
    [licence_plate, vehicle_type_id, id],
  );

  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_VEHICLE);
  }

  res.status(200).json(vehicle);
});

// *** DELETE /user/vehicle/:id *************************************************
router.delete("/vehicle/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API User -> Delete Vehicle (id): ${id}`);

  const result = await db_run(`DELETE FROM Vehicle WHERE id = ?`, [id]);

  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.changes === 0) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_VEHICLE);
  }

  res.status(200).send("Vehicle deleted successfully");
});

module.exports = router;
