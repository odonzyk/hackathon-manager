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
      NO_OWNER: "No owner found",
      NO_PARKINGLOT: "No parking lot found",
      NO_SLOT: "No slot found",
      NO_BOOKING: "No booking found",
      NO_VEHICLE: "No vehicle found",
    },
  }); 

  const EventTypes = {
    BOOKING_CHANGE: "Booking Changed"
  }

module.exports = { ErrorMsg, EventTypes };