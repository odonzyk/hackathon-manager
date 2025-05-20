const { ErrorMsg } = require('../src/constants');

const projectPaths = {
  '/project/list': {
    get: {
      summary: 'List all projects',
      tags: ['Project'],
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: 'Success - Returns a list of projects',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Project',
                },
              },
            },
          },
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PROJECT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
  },
  '/project/listByUser/{id}': {
    get: {
      summary: 'List all projects',
      tags: ['Project'],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'ID of the user',
        },
      ],
      responses: {
        200: {
          description: 'Success - Returns a list of projects',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  $ref: '#/components/schemas/Project',
                },
              },
            },
          },
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PROJECT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
  },
  '/project': {
    post: {
      summary: 'Create a new project',
      tags: ['Project'],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['event_id', 'idea', 'description', 'iniator_id'],
              properties: {
                event_id: {
                  type: 'integer',
                  example: 1,
                },
                status_id: {
                  type: 'integer',
                  example: 1,
                },
                idea: {
                  type: 'string',
                  example: 'Innovative Hackathon Idea',
                },
                description: {
                  type: 'string',
                  example: 'A detailed description of the project idea.',
                },
                team_name: {
                  type: 'string',
                  example: 'Team Alpha',
                },
                team_avatar_url: {
                  type: 'string',
                  format: 'url',
                  example: 'https://example.com/avatar.png',
                },
                iniator_id: {
                  type: 'integer',
                  example: 42,
                },
                goal: {
                  type: 'string',
                  example: 'To create a prototype for the hackathon.',
                },
                components: {
                  type: 'string',
                  example: 'Frontend, Backend, Database',
                },
                skills: {
                  type: 'string',
                  example: 'React, Node.js, SQL',
                },
              },
            },
          },
        },
      },
      responses: {
        201: {
          description: 'Project successfully created',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Project',
              },
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
  '/project/{id}': {
    get: {
      summary: 'Get project by ID',
      tags: ['Project'],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'ID of the project',
        },
      ],
      responses: {
        200: {
          description: 'Successful return of the project',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Project',
              },
            },
          },
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PROJECT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
    put: {
      summary: 'Update project',
      tags: ['Project'],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'ID of the project',
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['event_id', 'idea', 'description', 'iniator_id'],
              properties: {
                event_id: {
                  type: 'integer',
                  example: 1,
                },
                status_id: {
                  type: 'integer',
                  example: 1,
                },
                idea: {
                  type: 'string',
                  example: 'Updated Hackathon Idea',
                },
                description: {
                  type: 'string',
                  example: 'Updated description for the project.',
                },
                team_name: {
                  type: 'string',
                  example: 'Updated Team Name',
                },
                team_avatar_url: {
                  type: 'string',
                  format: 'url',
                  example: 'https://example.com/new-avatar.png',
                },
                iniator_id: {
                  type: 'integer',
                  example: 42,
                },
                goal: {
                  type: 'string',
                  example: 'Updated project goal.',
                },
                components: {
                  type: 'string',
                  example: 'Updated components',
                },
                skills: {
                  type: 'string',
                  example: 'Updated skills',
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Project successfully updated',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Project',
              },
            },
          },
        },
        400: {
          description: ErrorMsg.VALIDATION.MISSING_FIELDS,
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PROJECT,
        },
        409: {
          description: ErrorMsg.VALIDATION.CONFLICT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
    delete: {
      summary: 'Delete project',
      tags: ['Project'],
      security: [
        {
          bearerAuth: [],
        },
      ],
      parameters: [
        {
          in: 'path',
          name: 'id',
          required: true,
          schema: {
            type: 'integer',
          },
          description: 'ID of the project',
        },
      ],
      responses: {
        200: {
          description: 'Project successfully deleted',
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_PROJECT,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
  },
};

module.exports = { projectPaths };
