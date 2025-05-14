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
    },
  },

  Project: {
    type: 'object',
    required: ['name', 'id'],
    properties: {
      id: {
        type: 'integer',
        description: 'The unique project ID',
      },
      name: {
        type: 'string',
        description: 'Project name',
      },
    },
  },
};
module.exports = { schemaObjects };
