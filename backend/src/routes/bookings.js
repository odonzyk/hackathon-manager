const express = require('express');
const { db_run, db_get, db_all } = require('../database');
const logger = require('../logger')
const bookingEventBus = require("../middlewares/bookingEventBus");;
const authenticateToken = require('../middlewares/authMiddleware');
const { ErrorMsg, EventTypes } = require("../../src/constants");
const { isValidISODate, time2ts, ts2time } = require('../utils/utils');

const router = express.Router();

const createBooking = (dbRow) => {
  return {
    id: dbRow?.id ?? null,
    type_id: dbRow?.type_id ?? 1,
    status_id: dbRow?.status_id ?? 2,
    slot_id: dbRow?.slot_id ?? null,
    user_id: dbRow?.user_id ?? null,
    start_timeTS: dbRow?.start_time ?? null,
    end_timeTS: dbRow?.end_time ?? null,
    start_time: ts2time(dbRow?.start_time),
    end_time: ts2time(dbRow?.end_time),
  };
};

const FINAL_HOUR = 18;


// *** GET /api/bookings/user/:id**********************************************
// API-Endpunkt zum Abrufen der Buchungen eines Benutzers
router.get('/user/:user_id/last', authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  logger.debug('API Booking -> Retrieve Last Booking for User: ' + user_id);

  // Alle Buchungen des Benutzers abrufen
  const result = await db_get('SELECT * FROM Booking WHERE user_id = ? ORDER BY start_time DESC LIMIT 1', [user_id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_BOOKING);

  const bookings = createBooking(result.row);
  res.json(bookings);
});


// *** GET /api/bookings/list *************************************************
// API-Endpunkt zu Auflisten der Buchungen
router.get('/list', authenticateToken, async (req, res) => {
  logger.debug('API Booking -> Retrieve Bookings');

  const result = await db_all('SELECT * FROM Booking');
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_BOOKING);
  }

  const bookings = result.row.map(createBooking);
  res.json(bookings);
});

// *** GET /api/bookings/user/:id**********************************************
// API-Endpunkt zum Abrufen der Buchungen eines Benutzers
router.get('/user/:user_id', authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  logger.debug('API Booking -> Retrieve Bookings for User: ' + user_id);

  // Alle Buchungen des Benutzers abrufen
  const result = await db_all('SELECT * FROM Booking WHERE user_id = ?', [user_id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row || (Array.isArray(result.row) && result.row.length === 0)) {
    return res.status(404).send(ErrorMsg.NOT_FOUND.NO_BOOKING);
  }

  const bookings = result.row.map(createBooking);
  res.json(bookings);
});

// *** DELETE /api/bookings/user/:id*******************************************
// API-Endpunkt zum Löschen der Buchungen eines Benutzers
router.delete('/user/:user_id', authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  logger.debug('API Booking -> Release Bookings for User: ' + user_id);

  const end_timeTS = time2ts(new Date());

  const result = await db_run('UPDATE Booking SET end_time = ?, status_id = 4 WHERE user_id = ?', [
    end_timeTS,
    user_id,
  ]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.changes === 0) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_BOOKING);

  res.status(200).send(`${result.changes} bookings deleted successfully`);
});

// *** POST /api/bookings/ ****************************************************
// API-Endpunkt zum Reservieren eines Parkplatzes
router.post('/', authenticateToken, async (req, res) => {
  let { type_id, status_id, slot_id, user_id, start_time, end_time } = req.body;
  logger.debug(`API Booking -> Reserve Slot: ${slot_id} User: ${user_id}`);


  if (!slot_id || !user_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  start_time = start_time ? new Date(start_time) : new Date();
  if (!end_time) {
    end_time = new Date();
    const currentHour = start_time.getHours();
    if (currentHour < FINAL_HOUR) {
      end_time.setHours(18, 0, 0, 0);
    } else {
      end_time.setHours(currentHour + 1, 0, 0, 0);
    }
  }
  if (!status_id) status_id = 2;
  if (!type_id) type_id = 1;
  const start_timeTS = time2ts(start_time);
  const end_timeTS = time2ts(end_time);

  const result = await db_run(
    'INSERT INTO Booking (type_id, slot_id, user_id, start_time, end_time, status_id) VALUES (?, ?, ?, ?, ?, ?)',
    [type_id, slot_id, user_id, start_timeTS, end_timeTS, status_id],
  );
  if (result.err || result.changes === 0) {
    return res.status(500).send(ErrorMsg.SERVER.ERROR);
  }
  const booking_id = result.lastID;

  notifyBookingChangge(booking_id);

  res.status(200).json({
    id: booking_id,
    type_id,
    status_id,
    slot_id,
    user_id,
    start_time,
    end_time,
    start_timeTS,
    end_timeTS,
  });
});

// *** PUT /api/bookings/:id **************************************************
// API-Endpunkt zum Bearbeitem der Reservierung eines Parkplatzes
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  let { type_id, status_id, slot_id, user_id, start_time, end_time } = req.body;
  logger.debug(`API Owner -> Update Booking: ${id} User: ${user_id}`);

  if (!id || !user_id) {
    return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);
  }

  if (start_time && !isValidISODate(start_time)) {
    return res.status(400).send(ErrorMsg.VALIDATION.INVALID_DATE_FORMAT);
  }
  if (end_time && !isValidISODate(end_time)) {
    return res.status(400).send(ErrorMsg.VALIDATION.INVALID_DATE_FORMAT);
  }

  let result = await db_get('SELECT * FROM Booking WHERE id = ?', [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_BOOKING);
  if (result.row.user_id !== user_id) {
    return res.status(404).send(ErrorMsg.VALIDATION.WRONG_USER);
  }

  let booking = createBooking(result.row);
  booking.type_id = type_id ?? booking.type_id;
  booking.status_id = status_id ?? booking.status_id;
  booking.slot_id = slot_id ?? booking.slot_id;
  booking.user_id = user_id ?? booking.user_id;
  booking.start_time = start_time ? start_time : booking.start_time;
  booking.end_time = end_time ? end_time : booking.end_time;
  booking.start_timeTS = start_time ? time2ts(start_time) : booking.start_timeTS;
  booking.end_timeTS = end_time ? time2ts(end_time) : booking.end_timeTS;

  result = await db_run(
    'UPDATE Booking SET type_id = ?, status_id = ?, slot_id = ?, start_time = ?, end_time = ? WHERE id = ?',
    [
      booking.type_id,
      booking.status_id,
      booking.slot_id,
      booking.start_timeTS,
      booking.end_timeTS,
      id,
    ],
  );
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.changes === 0) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_BOOKING);

  res.status(200).json(booking);
});

// *** GET /api/bookings/ ****************************************************
// API-Endpunkt zum abrufen der reservierung eines Parkplatzes
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug('API Booking -> Retrieve Bookings');

  const result = await db_get('SELECT * FROM Booking where id = ?', [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_BOOKING);

  const booking = createBooking(result.row);
  res.json(booking);
});

// *** DELETE /api/bookings/:id ***********************************************
// API-Endpunkt zum Freigeben eines Parkplatzes
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  logger.debug(`API Booking -> Release Booking: ${id}`);

  if (!id) return res.status(400).send(ErrorMsg.VALIDATION.MISSING_FIELDS);

  let result = await db_get('SELECT * FROM Booking WHERE id = ?', [id]);
  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (!result.row) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_BOOKING);
  const booking = createBooking(result.row);

  booking.status_id = 4;
  booking.end_time = new Date();
  booking.end_timeTS = time2ts(booking.end_time);

  result = await db_run('UPDATE Booking SET end_time = ?, status_id = ? WHERE id = ?', [
    booking.end_timeTS,
    booking.status_id,
    id,
  ]);

  if (result.err) return res.status(500).send(ErrorMsg.SERVER.ERROR);
  if (result.changes === 0) return res.status(404).send(ErrorMsg.NOT_FOUND.NO_BOOKING);

  result = await db_get('SELECT * FROM Booking WHERE id = ?', [id]);
  if (result.err || !result.row) {
    return res.status(500).send('Error - there are always slots booked');
  }

  notifyBookingChangge(booking.id);
  res.status(200).json(booking);
});

async function notifyBookingChangge(booking_id) {
  logger.debug(`EVENT is raised: ${EventTypes.BOOKING_CHANGE} with booking_id=${booking_id}`);
  bookingEventBus.emit(EventTypes.BOOKING_CHANGE, booking_id);
}

module.exports = router;
