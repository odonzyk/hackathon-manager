const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const client = require("prom-client");
const prometheus = require("prometheus-api-metrics");

const config = require("./src/config");
const logger = require("./src/logger");
logger.info(`${config.name} v${config.version}`);
logger.info(`Config: ${config.config_name}`);
logger.info(`Log Level: ${logger.level}`);

const swaggerUi = require("swagger-ui-express");
const apiDocumentation = require("./docs/apidoc");

require("./src/middlewares/projectEventBus");
require("./src/eventListener/prometheusExport");

const { dbCreate } = require("./src/database");
const healthRouter = require("./src/routes/health");
const userRoutes = require("./src/routes/user");

// CORS-Options for Frontend
const corsOptions = {
  origin: [
    `${config.hostUrl}:${config.hostPort}`,
    `${config.apiUrl}:${config.apiPort}`,
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
// Definiere globale Labels
const globalLabels = {
  environment: config.node_env,
};

const app = express();
logger.debug("Initialise database");
dbCreate();

logger.debug("Initialise routes");

app.use(cors(corsOptions));
app.use(bodyParser.json());
registerPrometheus();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(apiDocumentation));
app.use("/api/health", healthRouter);
app.use("/api/user", userRoutes);

// Start Server
app
  .listen(config.apiPort, () => {
    logger.info(`Server started on ${config.hostUrl}:${config.apiPort}`);
    logger.info(
      `Swagger Docs availiable under: ${config.hostUrl}:${config.apiPort}/api-docs`,
    );
  })
  .on("error", (err) => {
    logger.error(`Server could not start: ${err.message}`);
  });

// Prometheus integration
function registerPrometheus() {
  const register = new client.Registry();
  const http_request_counter = new client.Counter({
    name: "http_request_count",
    help: "Count of HTTP requests",
    labelNames: ["method", "route", "statusCode", "environment"],
  });

  register.registerMetric(http_request_counter);

  app.use(
    prometheus({
      additionalLabels: Object.keys(globalLabels),
      extractAdditionalLabelValuesFn: () => globalLabels,
      defaultMetrics: true,
    }),
  );
  app.use("/*", function (req, res, next) {
    let route = req.originalUrl;
    route = route.replace(/\/\d+/g, "/:id");

    http_request_counter
      .labels({
        method: req.method,
        route: route,
        statusCode: res.statusCode,
        environment: config.node_env,
      })
      .inc();
    next();
  });
}
