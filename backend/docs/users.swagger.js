const { ErrorMsg } = require('../src/constants');

const userPaths = {
  '/user/login': {
    post: {
      summary: 'User login',
      tags: ['User'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'max@example.com'
                },
                password: {
                  type: 'string',
                  format: 'password',
                  example: 'password123'
                }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'Successful login, returns a JWT token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1...'
                  }
                }
              }
            }
          }
        },
        400: {
          description: ErrorMsg.VALIDATION.MISSING_FIELDS
        },
        401: {
          description: ErrorMsg.AUTH.INVALID_CREDENTIALS
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_USER
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    }
  },
  '/user/list': {
    get: {
      summary: 'Returns a list of all users',
      tags: ['User'],
      security: [
        {
          bearerAuth: []
        }
      ],
      responses: {
        200: {
          description: 'Success - Returns a list of users',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          }
        },
        403: {
          description: ErrorMsg.AUTH.INVALID_TOKEN
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_USER
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    }
  },
  '/user/{id}/participate': {
    post: {
      summary: 'Add a user as a participant to a project',
      tags: ['User'],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'The ID of the user'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['project_id'],
              properties: {
                project_id: {
                  type: 'integer',
                  description: 'The ID of the project to join',
                  example: 1
                }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User successfully added as a participant',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'integer',
                    description: 'The ID of the participation entry'
                  },
                  user_id: {
                    type: 'integer',
                    description: 'The ID of the user'
                  },
                  project_id: {
                    type: 'integer',
                    description: 'The ID of the project'
                  },
                  idea: {
                    type: 'string',
                    description: 'The idea of the project'
                  },
                  event_id: {
                    type: 'integer',
                    description: 'The ID of the event'
                  },
                  event_name: {
                    type: 'string',
                    description: 'The name of the event'
                  }
                }
              }
            }
          }
        },
        400: {
          description: ErrorMsg.VALIDATION.MISSING_FIELDS
        },
        404: {
          description: 'Project not found'
        },
        409: {
          description: 'User already participates in another project within the same event'
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    },
    get: {
      summary: 'Get participation details for a user',
      tags: ['User'],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'The ID of the user'
        }
      ],
      responses: {
        200: {
          description: 'Participation details retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'integer',
                      description: 'The ID of the participation entry'
                    },
                    user_id: {
                      type: 'integer',
                      description: 'The ID of the user'
                    },
                    project_id: {
                      type: 'integer',
                      description: 'The ID of the project'
                    },
                    idea: {
                      type: 'string',
                      description: 'The idea of the project'
                    },
                    event_id: {
                      type: 'integer',
                      description: 'The ID of the event'
                    },
                    event_name: {
                      type: 'string',
                      description: 'The name of the event'
                    }
                  }
                }
              }
            }
          }
        },
        404: {
          description: 'No participation found for the user'
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    },
    delete: {
      summary: 'Remove a user from a project',
      tags: ['User'],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'The ID of the user'
        },
        {
          in: 'query',
          name: 'project_id',
          required: true,
          schema: {
            type: 'integer'
          },
          description: 'The ID of the project to leave'
        }
      ],
      responses: {
        200: {
          description: 'User successfully removed from the project'
        },
        404: {
          description: 'Participation not found'
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    },
  },
  '/user': {
    post: {
      summary: 'Registers a new user',
      tags: ['User'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'telephone'],
              properties: {
                name: { type: 'string', example: 'Max Mustermann' },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'max@example.com'
                },
                is_private_email: { type: 'boolean', example: true },
                telephone: { type: 'string', example: '+49123456789' },
                is_private_telephone: { type: 'boolean', example: true },
                password: {
                  type: 'string',
                  format: 'password',
                  example: 'password123'
                },
                role_id: { type: 'integer', example: 1 }
              }
            }
          }
        }
      },
      responses: {
        201: {
          description: 'User successfully created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
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
  '/user/{id}': {
    put: {
      summary: 'Updates user data',
      tags: ['User'],
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
          description: 'The ID of the user to be updated'
        }
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['name', 'email', 'telephone', 'licence_plate'],
              properties: {
                name: { type: 'string', example: 'Max Mustermann' },
                email: {
                  type: 'string',
                  format: 'email',
                  example: 'max@example.com'
                },
                is_private_email: { type: 'boolean', example: true },
                telephone: { type: 'string', example: '+49123456789' },
                is_private_telephone: { type: 'boolean', example: true },
                password: {
                  type: 'string',
                  format: 'password',
                  example: 'password123'
                },
                role_id: { type: 'integer', example: 1 },
                licence_plate: { type: 'string', example: 'B-BB 001' },
                vehicle_type_id: { type: 'integer', example: 1 }
              }
            }
          }
        }
      },
      responses: {
        200: {
          description: 'User successfully updated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        400: {
          description: ErrorMsg.VALIDATION.MISSING_FIELDS
        },
        403: {
          description: ErrorMsg.AUTH.INVALID_TOKEN
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_USER
        },
        409: {
          description: ErrorMsg.VALIDATION.CONFLICT
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    },
    get: {
      summary: 'Retrieve a user by ID',
      tags: ['User'],
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
          description: 'The ID of the user to retrieve'
        }
      ],
      responses: {
        200: {
          description: 'User successfully retrieved user details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' }
            }
          }
        },
        403: {
          description: ErrorMsg.AUTH.INVALID_TOKEN
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_USER
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    },
    delete: {
      summary: 'Deletes a user and removes all associated bookings',
      tags: ['User'],
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
          description: 'The ID of the user to be deleted.'
        }
      ],
      responses: {
        200: {
          description: 'User successfully deleted'
        },
        403: {
          description: ErrorMsg.AUTH.INVALID_TOKEN
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_USER
        },
        500: {
          description: ErrorMsg.SERVER.ERROR
        }
      }
    }
  }
};

module.exports = { userPaths };
