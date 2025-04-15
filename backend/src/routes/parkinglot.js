const express = require('express');
const { db_run, db_get, db_all } = require('../database');
const logger = require('../logger');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();
const { ErrorMsg } = require("../constants");

const createParkingLot = (dbRow) => {
  return {
    id: dbRow?.id ?? null,
    name: dbRow?.name ?? '',
    owner_id: dbRow?.owner_id ?? null,
    map_path: dbRow?.map_path ?? '',
  };
};
const createSlot = (dbRow) => {
  return {
    id: dbRow?.id ?? null,
    name: dbRow?.name ?? '',
    type_id: dbRow?.type_id ?? 1,
    parkinglot_id: dbRow?.parkinglot_id ?? null,
    position: {
      id: dbRow?.pos_id ?? 0,
      x: dbRow?.x ?? 0,
      y: dbRow?.y ?? 0,
      width: dbRow?.width ?? 0,
      height: dbRow?.height ?? 0,
      rotation: dbRow?.rotation ?? 0,
    },
    booking: {
      user_id: dbRow?.user_id ?? null,
      user_name: dbRow?.user_name ?? '',
      booking_id: dbRow?.booking_id ?? null,
    },
  };
};
// *** GET /api/parkinglot/list ***************************************************
// API-Endpunkt zum Auflisten der Parkflächen
router.get('/list', authenticateToken, async (req, res) => {
  logger.debug('API ParkingLot -> List parkinglots');
  const result = await db_all('SELECT * FROM ParkingLot');

  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PARKINGLOT);
  }
  const parkinglots = result.row.map(createParkingLot);
  res.json(parkinglots);
});

// *** POST /api/parkinglot/ ******************************************************
// API-Endpunkt zum Erstellen der Parkfläche
router.post('/', authenticateToken, async (req, res) => {
  const { name, owner_id, map_path, slots } = req.body;
  logger.debug(
    `API ParkingLot -> Create ParkingLot with Name: ${name} Owner_id: ${owner_id} Slots ${(slots || []).length}`,
  );

  if (!name || !owner_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }
  let result = await db_get('SELECT * FROM ParkingLot WHERE name = ?', [name]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.row) return res.status(409).send(ErrorMsg.VALIDATION.CONFLICT);

  result = await db_run('INSERT INTO ParkingLot (name, owner_id, map_path) VALUES (?, ?, ?)', [
    name,
    owner_id,
    map_path,
  ]);
  if (result.err || result.changes === 0) {
    return res.status(500).send(`Can't create the parkinglot: ${name}`);
  }
  const id = result.lastID;

  if (slots) {
    result = createSlots(id, slots);
    if (result.err) {
      return res.status(500).send('Can´t create all slots');
    }
  }
  res.json({
    id,
    name,
    owner_id,
    map_path,
  });
});

// *** PUT /api/parkinglot/:id ****************************************************
// API-Endpunkt zum Bearbeiten der Parkfläche
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, owner_id, map_path } = req.body;
  logger.debug(`API ParkingLot -> Edit ParkingLot: ${id} with ${name}`);

  if (!name) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  //Load existing data
  let result = await db_get(`SELECT * FROM ParkingLot WHERE id = ?`, [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PARKINGLOT);
  let parkinglot = createParkingLot(result.row);

  parkinglot.name = name ?? parkinglot.name;
  parkinglot.owner_id = owner_id ?? parkinglot.owner_id;
  parkinglot.map_path = map_path ?? parkinglot.map_path;

  result = await db_run('UPDATE ParkingLot SET name = ?, owner_id=?, map_path=? WHERE id = ?', [
    parkinglot.name,
    parkinglot.owner_id,
    parkinglot.map_path,
    id,
  ]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.changes === 0) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PARKINGLOT);

  res.json(parkinglot);
});

// *** GET /api/parkinglot/:id ****************************************************
// API-Endpunkt zum Abrufen der Parkflächen
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API ParkingLot -> Get ParkingLot: ${id}`);

  const result = await db_get('SELECT * FROM ParkingLot WHERE id = ?', [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PARKINGLOT);

  const parkinglot = createParkingLot(result.row);
  res.json(parkinglot);
});

// *** DELETE /api/parkinglot/:id *************************************************
// API-Endpunkt zum Löschen der Parkfläche
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API ParkingLot -> Remove GrouParkingLotd: ${id}`);

  const result = await db_run('DELETE FROM ParkingLot WHERE id = ?', [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.changes === 0) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_PARKINGLOT);

  res.status(200).send('ParkingLot deleted successfully');
});

// *** GET /api/parkinglot/:id/list ***********************************************
// API-Endpunkt zum Auflisten der Parkplätze auf ein Parkfläche
router.get('/:id/list', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const currentTS = Math.floor(new Date().getTime() / 1000);
  const sqlStr = `SELECT 
          slot.id, slot.name, slot.type_id, slot.pos_id, slot.parkinglot_id, 
          x,	y,	width, height, rotation, 
          user_id, user.name as user_name, booking.id as booking_id FROM 
        Slot
        Left Outer join SlotPos on slot.pos_id = slotpos.id
        Left Outer join Booking on booking.slot_id = slot.id AND (start_time is null or ${currentTS} BETWEEN start_time and end_time)
        Left Outer join User on booking.user_id = user.id
    WHERE 
        parkinglot_id = ${id}`;

  logger.debug(`API ParkingLot -> List Slots on parkinglot ${id} @TS: ${currentTS} `);
  const result = await db_all(sqlStr);

  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_SLOT);
  }
  
  const slots = result.row.map(createSlot);
  res.json(slots);
});

// *** GET /api/parkinglot/:id/:id ************************************************
// API-Endpunkt zum Abrufen eines parkplatzes
router.get('/:id/:slot_id', authenticateToken, async (req, res) => {
  const { id, slot_id } = req.params;
  const currentTS = Math.floor(new Date().getTime() / 1000);
  const sqlStr = `SELECT 
          slot.id, slot.name, slot.type_id, slot.pos_id, slot.parkinglot_id, 
          x,	y,	width, height, rotation, 
          user_id, user.name as user_name, booking.id as booking_id FROM 
        Slot 
        Left Outer join SlotPos on slot.pos_id = slotpos.id
        Left Outer join Booking on booking.slot_id = slot.id AND (start_time is null or ${currentTS} BETWEEN start_time and end_time)
        Left Outer join User on booking.user_id = user.id
    WHERE 
        slot.id = ? AND parkinglot_id = ?`;

  logger.debug(`API ParkingLot -> Get Slots: ${slot_id} on ParkingLot ${id}`);
  const result = await db_get(sqlStr, [slot_id, id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_SLOT);

  const slot = createSlot(result.row);
  res.json(slot);
});

// *** Helper functions *******************************************************
async function createSlots(id, slots = []) {
  for await (const slot of slots) {
    let pos_id = null;
    if (slot.position) {
      const { x, y, width, height, rotation } = slot.position ?? {};
      let result = await db_run(
        'INSERT INTO SlotPos (x, y, width, height, rotation) VALUES (?, ?, ?, ?, ?)',
        [x, y, width, height, rotation],
      );
      if (result.err) return result;
      pos_id = result.lastID;
    }
    result = await db_run(
      'INSERT INTO Slot (name, type_id, pos_id, parkinglot_id) VALUES (?, ?, ?, ?)',
      [slot.name, slot.type_id, pos_id, id],
    );
    if (result.err) return result;
  }
}

module.exports = router;
