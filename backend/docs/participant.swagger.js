const { ErrorMsg } = require('../src/constants');

const participantPaths = {
  '/participant': {
    post: {
      summary: 'Register a new participant',
      tags: ['Participant'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['project_id', 'user_id'],
              properties: {
                project_id: {
                  type: 'integer',
                  example: 1
                },
                user_id: {
                  type: 'integer',
                  example: 42
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'Participant successfully registered',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Participant'
              }
            }
          }
        },
        400: {
          description: ErrorMsg.VALIDATION.MISSING_FIELDS
        },
        409: {
          description: ErrorMsg.VALIDATION.CONFLICT
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    }
  },
  '/participant/{id}': {
    get: {
      summary: 'Get participant by ID',
      tags: ['Participant'],
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
          description: 'ID of the participant'
        }
      ],
      responses: {
        200: {
          description: 'Successful return of the participant',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Participant'
              }
            }
          }
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PARTICIPANT
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    },
    put: {
      summary: 'Update participant details',
      tags: ['Participant'],
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
          description: 'ID of the participant'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['project_id', 'user_id'],
              properties: {
                project_id: {
                  type: 'integer',
                  example: 1
                },
                user_id: {
                  type: 'integer',
                  example: 42
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Participant successfully updated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Participant'
              }
            }
          }
        },
        400: {
          description: ErrorMsg.VALIDATION.MISSING_FIELDS
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PARTICIPANT
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    },
    delete: {
      summary: 'Delete participant',
      tags: ['Participant'],
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
          description: 'ID of the participant'
        }
      ],
      responses: {
        200: {
          description: 'Participant successfully deleted'
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PARTICIPANT
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    }
  }
};

module.exports = { participantPaths };
