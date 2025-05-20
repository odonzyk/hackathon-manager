const { ErrorMsg } = require('../src/constants');

const eventPaths = {
  '/event/list': {
    get: {
      summary: 'List of all events',
      tags: ['Event'],
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Success - Returns a list of events',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Event' }
              }
            }
          }
        },
        404: { description: ErrorMsg.NOT_FOUND.NO_EVENT },
        500: { description: ErrorMsg.SERVER.ERROR }
      }
    }
  },
  '/event': {
    post: {
      summary: 'Create a new event',
      tags: ['Event'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'start_time', 'end_time'],
              properties: {
                name: { type: 'string', example: 'Hackathon 2025' },
                start_time: { type: 'string', format: 'timestamp', example: '1748389600' },
                end_time: { type: 'string', format: 'timestamp', example: '1748504800' }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Event succensfull created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Event' }
            }
          }
        },
        400: { description: ErrorMsg.VALIDATION.MISSING_FIELDS },
        403: { description: ErrorMsg.AUTH.INVALID_TOKEN },
        409: { description: ErrorMsg.VALIDATION.CONFLICT },
        500: { description: ErrorMsg.SERVER.ERROR }
      }
    }
  },
  '/event/{id}': {
    get: {
      summary: 'Get event by ID',
      tags: ['Event'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'ID of the events'
        }
      ],
      responses: {
        200: {
          description: 'Successful return of the event',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Event'
              }
            }
          }
        },
        403: {
          description: ErrorMsg.AUTH.INVALID_TOKEN
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_EVENT
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    },
    put: {
      summary: 'event update',
      tags: ['Event'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'ID des Events'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'start_time', 'end_time'],
              properties: {
                name: {
                  type: 'string',
                  example: 'Hackathon 2025'
                },
                start_time: {
                  type: 'string',
                  format: 'timestamp',
                  example: '1748389600'
                },
                end_time: {
                  type: 'string',
                  format: 'timestamp',
                  example: '1748504800'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Event erfolgreich aktualisiert',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Event'
              }
            }
          }
        },
        400: {
          description: ErrorMsg.VALIDATION.MISSING_FIELDS
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_EVENT
        },
        409: {
          description: ErrorMsg.VALIDATION.CONFLICT
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    },
    delete: {
      summary: 'delete event',
      tags: ['Event'],
      security: [
        {
          bearerAuth: []
        }
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'id of the event'
        }
      ],
      responses: {
        200: {
          description: 'Event successfully deleted'
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_EVENT
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    }
  }
};

module.exports = { eventPaths };
