const ErrorMsg = Object.freeze({
    AUTH: {
      INVALID_CREDENTIALS: "Invalid credentials",
      INVALID_TOKEN: "Invalid Token",
    },
    VALIDATION: {
      MISSING_FIELDS: "Missing fields",
      CONFLICT: "Already exists",
      WRONG_USER: "Not the same user",
      INVALID_DATE_FORMAT: "Invalid date format for start_time. Expected ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ"
    },
    SERVER: {
      ERROR: "Server error",
    },
    NOT_FOUND: {
      NO_USER: "No user found",
      NO_PROJECT: "No project found",
    },
  }); 

  const EventTypes = {
    PROJECT_CHANGE: "Project Changed",
    PARTICIPANT_CHANGE: "Project Changed"
  }

module.exports = { ErrorMsg, EventTypes };