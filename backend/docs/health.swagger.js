const healthPaths = {
  "/health": {
    get: {
      summary: "Returns the health status of the server",
      tags: ["Health"],
      responses: {
        200: {
          description: "Server is healthy",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: { type: "string", example: "OK" },
                  uptime: { type: "number", example: 3600 },
                  memoryUsage: { type: "object" },
                  cpuLoad: {
                    type: "array",
                    items: { type: "number" },
                  },
                  timestamp: {
                    type: "datetime",
                    example: "2025-01-01T01:01:01.000Z",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  "/health/config": {
    get: {
      summary: "Returns the current application configuration",
      tags: ["Health"],
      responses: {
        200: {
          description: "Returns the app configuration",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "hackathon-manager-backend" },
                  version: { type: "string", example: "0.1.0" },
                  config_name: { type: "string", example: "Example Config" },
                  logLevel: { type: "string", example: "debug" },
                  apiUrl: { type: "string", example: "http://localhost" },
                  hostPort: { type: "string", example: "8100" },
                  hostUrl: { type: "string", example: "http://localhost" },
                  apiPort: { type: "string", example: "3000" },
                  dbPath: { type: "string", example: "./parking.dev.db" },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = { healthPaths };
