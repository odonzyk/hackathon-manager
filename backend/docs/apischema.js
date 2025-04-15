const schemaObjects = {
  User: {
    type: 'object',
    required: ['name', 'email', 'telephone'],
    properties: {
      id: {
        type: 'integer',
        description: 'The unique user ID',
      },
      name: {
        type: 'string',
        description: 'Name of the user',
      },
      email: {
        type: 'string',
        format: 'email',
        description: "User's email address",
      },
      is_private_email: {
        type: 'boolean',
        description: 'Indicates if the user allows their email address to be visible',
      },
      telephone: {
        type: 'string',
        description: "User's phone number",
      },
      is_private_telephone: {
        type: 'boolean',
        description: 'Indicates if the user allows their phone number to be visible',
      },
      role_id: {
        type: 'integer',
        description: 'Id of role type (User, Admin, ...)',
      },
      licence_plate: {
        type: 'string',
        description: "The user's preferred vehicle license plate",
      },
      vehicle_type_id: {
        type: 'integer',
        description: 'Vehicle type',
      },
    },
  },
  Owner: {
    type: 'object',
    required: ['name'],
    properties: {
      id: {
        type: 'integer',
        description: 'The unique owner ID',
      },
      name: {
        type: 'string',
        description: 'Name of the owner',
      },
    },
  },
  ParkingLot: {
    type: 'object',
    required: ['name', 'owner_id'],
    properties: {
      id: {
        type: 'integer',
        description: 'The unique parkinglot ID',
      },
      name: {
        type: 'string',
        description: 'Name of the parking area',
      },
      owner_id: {
        type: 'integer',
        description: 'Id of owner entry',
      },
      map_path: {
        type: 'string',
        description: 'URL to an parkinglot map or picture',
      },
    },
  },
  Slot: {
    type: 'object',
    required: ['name', 'parkinglot_id'],
    properties: {
      id: {
        type: 'integer',
        description: 'The unique slot ID',
      },
      name: {
        type: 'string',
        description: 'Slot name',
      },
      type_id: {
        type: 'integer',
        description: 'Id of slot type',
      },
      parkinglot_id: {
        type: 'integer',
        description: 'Id of and parkinglot entry',
      },
      position: {
        $ref: '#/components/schemas/Position',
      },
      booking: {
        $ref: '#/components/schemas/BookingShort',
      },
    },
  },
  Position: {
    type: 'object',
    description: 'Defines the position and size of a parking slot.',
    required: ['id', 'x', 'y', 'width', 'height', 'rotation'],
    properties: {
      id: {
        type: 'integer',
        description: 'The unique identifier of the position.',
      },
      x: {
        type: 'integer',
        description: 'X coordinate of the slot.',
      },
      y: {
        type: 'integer',
        description: 'Y coordinate of the slot.',
      },
      width: {
        type: 'integer',
        description: 'Width of the slot.',
      },
      height: {
        type: 'integer',
        description: 'Height of the slot.',
      },
      rotation: {
        type: 'integer',
        description: 'Rotation angle of the slot in degrees.',
      },
    },
  },
  BookingShort: {
    type: 'object',
    description: 'Contains booking details if the slot is reserved.',
    properties: {
      user_id: {
        type: 'integer',
        description: 'The ID of the user who booked the slot.',
      },
      user_name: {
        type: 'string',
        description: 'The name of the user who booked the slot.',
      },
      booking_id: {
        type: 'integer',
        description: 'The booking ID if the slot is currently reserved.',
      },
    },
  },
  Booking: {
    type: 'object',
    description: 'Represents a booking for a parking slot.',
    required: ['slot_id', 'user_id', 'start_time', 'end_time'],
    properties: {
      id: {
        type: 'integer',
        description: 'The unique booking ID',
      },
      type_id: {
        type: 'integer',
        description: 'The type of the booking',
      },
      status_id: {
        type: 'integer',
        description: 'The current status of the booking',
      },
      slot_id: {
        type: 'integer',
        description: 'The ID of the parking slot',
      },
      user_id: {
        type: 'integer',
        description: 'The ID of the user who made the booking',
      },
      start_timeTS: {
        type: 'integer',
        description: 'Start time of the booking in UNIX timestamp format',
      },
      end_timeTS: {
        type: 'integer',
        description: 'End time of the booking in UNIX timestamp format',
      },
      start_time: {
        type: 'string',
        format: 'date-time',
        description: 'Start time of the booking',
      },
      end_time: {
        type: 'string',
        format: 'date-time',
        description: 'End time of the booking',
      },
    },
  },
};
module.exports = { schemaObjects };
