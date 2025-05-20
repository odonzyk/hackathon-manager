const ErrorMsg = Object.freeze({
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid credentials',
    INVALID_TOKEN: 'Invalid Token'
  },
  VALIDATION: {
    MISSING_FIELDS: 'Missing fields',
    CONFLICT: 'Already exists',
    WRONG_USER: 'Not the same user'
  },
  SERVER: {
    ERROR: 'Server error',
    NO_PASSWORD: 'No password is set'
  },
  NOT_FOUND: {
    NO_USER: 'No user found',
    NO_PROJECT: 'No project found',
    NO_EVENT: 'No event found',
    NO_PARTICIPANT: 'No participant found'
  }
});

const EventTypes = {
  PROJECT_CHANGE: 'Project Changed',
  PARTICIPANT_CHANGE: 'Participant Changed'
};

module.exports = { ErrorMsg, EventTypes };
