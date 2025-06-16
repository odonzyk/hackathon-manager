const EventEmitter = require('events');

class EventBus extends EventEmitter {}
const eventBus = new EventBus();

// Maximale Anzahl an Listeners erhöhen (verhindert Warnungen)
eventBus.setMaxListeners(10);

module.exports = eventBus;
