const schemaObjects = {
  User: {
    type: "object",
    required: ["name", "email", "telephone"],
    properties: {
      id: {
        type: "integer",
        description: "The unique user ID",
      },
      name: {
        type: "string",
        description: "Name of the user",
      },
      email: {
        type: "string",
        format: "email",
        description: "User's email address",
      },
      is_private_email: {
        type: "boolean",
        description:
          "Indicates if the user allows their email address to be visible",
      },
      telephone: {
        type: "string",
        description: "User's phone number",
      },
      is_private_telephone: {
        type: "boolean",
        description:
          "Indicates if the user allows their phone number to be visible",
      },
      role_id: {
        type: "integer",
        description: "Id of role type (User, Admin, ...)",
      },
    },
  },
  Event: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      name: {
        type: "string",
        example: "Hackathon 2025",
      },
      start_time: {
        type: "string",
        format: "timestamp",
        example: "1748389600",
      },
      end_time: {
        type: "string",
        format: "timestamp",
        example: "1748504800",
      },
    },
  },
  Project: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      event_id: {
        type: "integer",
        example: 1,
      },
      status_id: {
        type: "integer",
        example: 1,
      },
      idea: {
        type: "string",
        example: "Hackathon Idea",
      },
      description: {
        type: "string",
        example: "A detailed description of the project.",
      },
      team_name: {
        type: "string",
        example: "Team Alpha",
      },
      team_avatar_url: {
        type: "string",
        format: "url",
        example: "https://example.com/avatar.png",
      },
      iniator_id: {
        type: "integer",
        example: 42,
      },
      goal: {
        type: "string",
        example: "To create a prototype.",
      },
      components: {
        type: "string",
        example: "Frontend, Backend",
      },
      skills: {
        type: "string",
        example: "React, Node.js",
      },
    },
  },
  Participant: {
    type: "object",
    properties: {
      id: {
        type: "integer",
        example: 1,
      },
      project_id: {
        type: "integer",
        example: 1,
      },
      user_id: {
        type: "integer",
        example: 42,
      },
    },
  },
};
module.exports = { schemaObjects };
