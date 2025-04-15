const config = require('../config');
const logger = require('../logger');
const bookingEventBus = require("../middlewares/bookingEventBus");;
const { EventTypes } = require("../constants");
const promClient = require("prom-client");
const { checkFreeSlots } = require('../utils/parkingLotUtils');

// Definiere globale Labels
const globalLabels = {
  environment: config.node_env,
};

// Define Prometheus metrics
const kpi_totalParkingGauge = new promClient.Gauge({
  name: "kpi_parking_slots_total",
  help: "Total number of parking slots",
  labelNames: ["environment"],
});

const kpi_bookedParkingGauge = new promClient.Gauge({
  name: "kpi_parking_slots_booked",
  help: "Number of occupied parking slots",
  labelNames: ["environment"],
});

const kpi_freeParkingGauge = new promClient.Gauge({
  name: "kpi_parking_slots_free",
  help: "Number of available parking slots",
  labelNames: ["environment"],
});

// ** For Sending OneSignal-Notifications *************************************
async function exportBookingCount(slots) {
  if (!slots) return;
  logger.debug(`exportBookingCount -> Slots: ${JSON.stringify(slots)}`);
  kpi_totalParkingGauge.labels(globalLabels).set(slots.total);
  kpi_bookedParkingGauge.labels(globalLabels).set(slots.booked);
  kpi_freeParkingGauge.labels(globalLabels).set(slots.free);
}

// ** Handle Eventbus notification ********************************************
bookingEventBus.on(EventTypes.BOOKING_CHANGE, async (booking_id) => {
  logger.debug(`PrometheusExport -> EVENT is recieved: ${EventTypes.BOOKING_CHANGE} with booking_id=${booking_id}`);
  updateFreeParkingSlots(booking_id);
});

async function updateFreeParkingSlots(booking_id) {
  checkFreeSlots(booking_id)
    .then((slots) => {
      exportBookingCount(slots);
    })
    .catch((err) => {
      logger.error('Error during PrometheusExport', err);
    });
}

module.exports = {};
