const { ErrorMsg } = require("../src/constants");

const ownerPaths = {
  '/owner/list': {
    get: {
      summary: 'Retrieve a list of all owners',
      tags: ['Owner'],
      security: [
        {
          bearerAuth: [],
        },
      ],
      responses: {
        200: {
          description: 'Successfully retrieved owner list',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/Owner' },
              },
            },
          },
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_OWNER,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
  },
  '/owner': {
    post: {
      summary: 'Create a new owner',
      tags: ['Owner'],
      security: [
        {
          bearerAuth: [],
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
                name: { type: 'string', example: 'John Doe' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Owner successfully created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Owner' },
            },
          },
        },
        400: {
          description: ErrorMsg.VALIDATION.MISSING_FIELDS,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
  },
  '/owner/{id}': {
    put: {
      summary: 'Update an owner',
      tags: ['Owner'],
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
          description: 'The ID of the owner to be updated',
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
                name: { type: 'string', example: 'John Doe' },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Owner successfully updated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Owner' },
            },
          },
        },
        400: {
          description: ErrorMsg.VALIDATION.MISSING_FIELDS,
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_OWNER,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
    get: {
      summary: 'Retrieve an owner by ID',
      tags: ['Owner'],
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
          description: 'ID of the owner to retrieve',
        },
      ],
      responses: {
        200: {
          description: 'Successfully retrieved owner details',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Owner' },
            },
          },
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_OWNER,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
    delete: {
      summary: 'Delete an owner',
      tags: ['Owner'],
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
          description: 'The ID of the owner to be deleted',
        },
      ],
      responses: {
        200: {
          description: 'Owner successfully deleted',
        },
        404: {
          description: ErrorMsg.NOT_FOUND.NO_OWNER,
        },
        500: {
          description: ErrorMsg.SERVER.ERROR,
        },
      },
    },
  },
};
module.exports = { ownerPaths };
