const bookingPaths = {
  '/bookings/list': {
    get: {
      summary: 'Retrieve all bookings',
      tags: ['Booking'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Successfully retrieved all bookings',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Booking' },
              },
            },
          },
        },
        404: {
          description: 'No bookings found',
        },
        500: {
          description: 'Server error',
        },
      },
    },
  },
  '/bookings/user/{user_id}': {
    get: {
      summary: 'Retrieve all bookings for a user',
      tags: ['Booking'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'user_id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'User ID to retrieve bookings for',
        },
      ],
      responses: {
        200: {
          description: 'Successfully retrieved bookings',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Booking' },
              },
            },
          },
        },
        404: {
          description: 'No bookings found',
        },
        500: {
          description: 'Server error',
        },
      },
    },
    delete: {
      summary: 'Delete all bookings for a user',
      tags: ['Booking'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'user_id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'User ID to delete bookings for',
        },
      ],
      responses: {
        200: {
          description: 'Successfully deleted bookings',
        },
        404: {
          description: 'No bookings found',
        },
        500: {
          description: 'Server error',
        },
      },
    },
  },
  '/api/bookings': {
    post: {
      summary: 'Create a new booking',
      tags: ['Booking'],
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['slot_id', 'user_id'],
              properties: {
                slot_id: { type: 'integer', example: 1 },
                user_id: { type: 'integer', example: 2 },
                start_time: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-02-01T10:00:00Z',
                },
                end_time: {
                  type: 'string',
                  format: 'date-time',
                  example: '2025-02-01T18:00:00Z',
                },
                status_id: { type: 'integer', example: 2 },
                type_id: { type: 'integer', example: 1 },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Booking successfully created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Booking' },
            },
          },
        },
        400: {
          description: 'Missing fields',
        },
        500: {
          description: 'Server error',
        },
      },
    },
  },
  '/api/bookings/{id}': {
    put: {
      summary: 'Update a booking',
      tags: ['Booking'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'Booking ID',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Booking',
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Booking successfully updated',
        },
        404: {
          description: 'No bookings found',
        },
        500: {
          description: 'Server error',
        },
      },
    },
    get: {
      summary: 'Retrieve a booking by ID',
      tags: ['Booking'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'Booking ID',
        },
      ],
      responses: {
        200: {
          description: 'Successfully retrieved booking',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Booking' },
            },
          },
        },
        404: {
          description: 'No bookings found',
        },
        500: {
          description: 'Server error',
        },
      },
    },
    delete: {
      summary: 'Delete a booking',
      tags: ['Booking'],
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'Booking ID',
        },
      ],
      responses: {
        200: {
          description: 'Updated and terminated booking',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Booking' },
            },
          },
        },
        404: {
          description: 'No bookings found',
        },
        500: {
          description: 'Server error',
        },
      },
    },
  },
};
module.exports = { bookingPaths };
