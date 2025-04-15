const config = require('../config');
const logger = require('../logger');
const bookingEventBus = require("../middlewares/bookingEventBus");
const { EventTypes } = require("../constants");
const { checkFreeSlots } = require('../utils/parkingLotUtils');

// ** For Sending OneSignal-Notifications *************************************
async function sendOneSignalNotification(slots) {
  logger.debug(`sendOneSignalNotification -> Slots: ${JSON.stringify(slots)}`);

  const message = slots.booked === 0 ? `All ${slots.total} slots free ;-)` : slots.free = 0 ? `All slots booked :-(` : `${slots.booked} of ${slots.total} slots reserved`;

  const payload = {
    app_id: config.appID,
    contents: {
      en: message,
    },
    included_segments: ['Total Subscriptions'],
  };
  try {
    fetch('https://api.onesignal.com/notifications?c=push', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
      },
      body: JSON.stringify(payload),
      headers: {
        Authorization: `Basic ${config.oneSignalApi}`,
        accept: 'application/json',
        'content-type': 'application/json',
      },
    });
  } catch (error) {
    logger.error("Can't send OneSignal Notification:", error);
  }
}

// ** Handle Eventbus notification ********************************************
bookingEventBus.on(EventTypes.BOOKING_CHANGE, async (booking_id) => {
  logger.debug(`OneSignalHandler -> EVENT is recieved: ${EventTypes.BOOKING_CHANGE} with booking_id=${booking_id}`);
  checkFreeSlots(booking_id)
    .then((slots) => {
      sendOneSignalNotification(slots);
    })
    .catch((err) => {
      logger.error('Error during Notification', err);
    });
});


module.exports = {};
