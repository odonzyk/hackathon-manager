const request = require("supertest");
const express = require("express");
const healthRouter = require("../../src/routes/health"); // Importiere die Health-Routen
const config = require("../../src/config"); // Importiere die Konfiguration

const app = express();
app.use("/api/health", healthRouter);

describe("Health API Endpoints", () => {
  describe("GET /api/health", () => {
    /** Test für GET /api/health **/
    it("should return server health status", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("status", "OK");
      expect(response.body).toHaveProperty("uptime");
      expect(response.body).toHaveProperty("memoryUsage");
      expect(response.body).toHaveProperty("cpuLoad");
      expect(Array.isArray(response.body.cpuLoad)).toBe(true);
      expect(response.body).toHaveProperty("timestamp");
    });
  });

  describe("GET /api/health/check", () => {
    /** Test für GET /api/health/config **/
    it("should return sanitized config without sensitive keys", async () => {
      const response = await request(app).get("/api/health/config");

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Object);

      // Sicherstellen, dass die sensiblen Daten entfernt wurden
      expect(response.body).not.toHaveProperty("jwtSecret");

      // Andere Konfigurationswerte sollten vorhanden sein
      expect(response.body).toHaveProperty("apiUrl", config.apiUrl);
    });
  });
});
