const { ErrorMsg } = require("../src/constants");

const parkinglotPaths = {
  '/parkinglot/list': {
    get: {
      summary: 'Retrieve all parkinglots',
      tags: ['ParkingLot'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Successfully retrieved all parkinglots',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/ParkingLot' },
              },
            },
          },
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PARKINGLOT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
  },
  '/parkinglot': {
    post: {
      summary: 'Create a new parkinglot',
      tags: ['ParkingLot'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'owner_id'],
              properties: {
                name: {
                  type: 'string',
                  example: 'Parking Lot A',
                },
                owner_id: {
                  type: 'integer',
                  example: 1,
                },
                map_path: {
                  type: 'string',
                  example: '/maps/parking-lot-a.png',
                },
                slots: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Slot',
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'ParkingLot successfully generated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ParkingLot' },
            },
          },
        },
        400: {
          description: ErrorMsg.VALIDATION.MISSING_FIELDS,
        },
        409: {
          description: ErrorMsg.VALIDATION.CONFLICT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
  },
  '/parkinglot/{id}': {
    put: {
      summary: 'Update a parkinglot',
      tags: ['ParkingLot'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'ParkingLot ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', example: 'Updated Parking Lot' },
                owner_id: { type: 'integer', example: 2 },
                map_path: {
                  type: 'string',
                  example: '/maps/updated-parking.png',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Parkinglot successfully updated',
        },
        400: {
          description: ErrorMsg.VALIDATION.MISSING_FIELDS,
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PARKINGLOT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
    get: {
      summary: 'Retrieve a parkinglot by ID',
      tags: ['ParkingLot'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'ParkingLot ID',
        },
      ],
      responses: {
        200: {
          description: 'Successfully retrieved parkinglot',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ParkingLot' },
            },
          },
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PARKINGLOT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
    delete: {
      summary: 'Delete a parkinglot',
      tags: ['ParkingLot'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'ParkingLot ID',
        },
      ],
      responses: {
        200: {
          description: 'ParkingLot successfully deleted',
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PARKINGLOT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
  },
  '/parkinglot/{id}/list': {
    get: {
      summary: 'Retrieve all slots for a parkinglot',
      tags: ['ParkingLot'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'ParkingLot ID',
        },
      ],
      responses: {
        200: {
          description: 'Successfully retrieved slots',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Slot' },
              },
            },
          },
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_SLOT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
  },
  '/parkinglot/{id}/{slot_id}': {
    get: {
      summary: 'Retrieve one slots for a parkinglot',
      tags: ['ParkingLot'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'ParkingLot ID',
        },
        {
          in: 'path',
          name: 'slot_id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'Slot ID',
        },
      ],
      responses: {
        200: {
          description: 'Successfully retrieved slots',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Slot' },
            },
          },
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_SLOT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
  },
};
module.exports = { parkinglotPaths };
