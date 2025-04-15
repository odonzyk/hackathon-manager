const { db_get } = require("../database");
const { time2ts } = require("./utils");

// ** Notification logig ******************************************************
async function checkFreeSlots(booking_id) {
    let slotStatus = {
        booked: 0,
        free: 0,
        total: 0
    }
    if (!booking_id) return result;

    try {
        const currentTime = time2ts(Date.now());

        let result = await db_get(
            `SELECT count(*) as total_slots FROM Slot WHERE parkinglot_id in
          (SELECT slot.parkinglot_id FROM Slot join Booking on booking.slot_id = slot.id WHERE booking.id = ?)`,
            [booking_id],
        );
        if (result.err) {
            throw new Error('Fehler beim Abrufen der freien Parkplätze');
        }
        slotStatus.total = result.row ? result.row.total_slots : 0;

        result = await db_get(
            `SELECT COUNT(*) AS booked_slot 
          FROM booking JOIN slot on booking.slot_id=slot.id
          WHERE 
              status_id = 2 
              AND start_time <= ? AND end_time >= ? 
              AND slot.parkinglot_id in
                  (SELECT slot.parkinglot_id FROM Slot join Booking on booking.slot_id = slot.id WHERE booking.id = ?)`,
            [currentTime, currentTime, booking_id],
        );
        if (result.err) {
            throw new Error('Fehler beim Abrufen der freien Parkplätze');
        }
        slotStatus.booked = result.row ? result.row.booked_slot : 0;
        slotStatus.free = slotStatus.total - slotStatus.booked;

    } catch (error) {
        logger.error(error.message);
    }

    return slotStatus;
}

module.exports = { checkFreeSlots };
