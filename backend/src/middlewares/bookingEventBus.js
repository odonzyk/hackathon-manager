const EventEmitter = require("events");
const { EventTypes } = require("../constants");

class EventBus extends EventEmitter {}
const eventBus = new EventBus();

// Maximale Anzahl an Listeners erhöhen (verhindert Warnungen)
eventBus.setMaxListeners(10);

module.exports = eventBus;
