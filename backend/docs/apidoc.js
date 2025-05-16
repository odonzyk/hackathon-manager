const { healthPaths } = require("./health.swagger");
const { userPaths } = require("./users.swagger");
const { eventPaths } = require("./event.swagger");
const { projectPaths } = require("./project.swagger");
const { participantPaths } = require("./participant.swagger");

const { schemaObjects } = require("./apischema");
const config = require("../src/config"); // Inport the config

const apiDocumentation = {
  openapi: "3.0.0",
  info: {
    version: `${config.version}`,
    title: "Hackathon Manager API",
    description: "API for handling Events and Projects for Hackathons",
    termsOfService: "https://thalia-drs.de/terms",
    contact: {
      name: "Thalia DRS",
      email: "j.zech@thalia.de",
      url: "https://www.thalia-drs.de",
    },
    license: {
      name: "Apache 2.0",
      url: "https://www.apache.org/licenses/LICENSE-2.0.html",
    },
  },
  servers: [
    {
      url: "https://hackathon.drsbln.de/api",
      description: "Production Server",
    },
    {
      url: "https://hackathon-stg.drsbln.de/api",
      description: "Staging Server",
    },
    {
      url: `${config.apiUrl}:${config.apiPort}/api`,
      description: "Local Server",
    },
  ],
  tags: [
    {
      name: "Health",
    },
    {
      name: "User",
      description: "API endpoints for managing users",
    },
    {
      name: "Event",
      description: "API endpoints for managing events",
    },
    {
      name: "Project",
      description: "API endpoints for managing projects",
    },
    {
      name: "Participant",
      description: "API endpoints for managing participants",
    },
  ],
  paths: {
    ...healthPaths,
    ...userPaths,
    ...eventPaths,
    ...projectPaths,
    ...participantPaths,
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ...schemaObjects,
    },
  },
};

module.exports = apiDocumentation;
