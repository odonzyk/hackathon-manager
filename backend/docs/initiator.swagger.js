const { ErrorMsg } = require('../src/constants');

const initiatorPaths = {
  '/initiator': {
    post: {
      summary: 'Register a new initiator',
      tags: ['Initiator'],
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
          description: 'Initiator successfully registered',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Initiator'
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
  '/initiator/{id}': {
    get: {
      summary: 'Get initiator by ID',
      tags: ['Initiator'],
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
          description: 'ID of the initiator'
        }
      ],
      responses: {
        200: {
          description: 'Successful return of the initiator',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Initiator'
              }
            }
          }
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_INITIATOR
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    },
    put: {
      summary: 'Update initiator details',
      tags: ['Initiator'],
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
          description: 'ID of the initiator'
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
          description: 'Initiator successfully updated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Initiator'
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
      summary: 'Delete initiator',
      tags: ['Initiator'],
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
          description: 'ID of the initiator'
        }
      ],
      responses: {
        200: {
          description: 'Initiator successfully deleted'
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_INITIATOR
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    }
  }
};

module.exports = { initiatorPaths };
