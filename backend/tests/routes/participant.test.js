const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { ErrorMsg, RoleTypes } = require('../../src/constants');
const { db_get, db_run } = require('../../src/utils/db/dbUtils');
const config = require('../../src/config');
const logger = require('../../src/logger');
const participantRouter = require('../../src/routes/participant');

jest.mock('../../src/utils/db/dbUtils');
jest.mock('../../src/logger'); // Mock des Loggers

const app = express();
app.use(express.json());
app.use('/api/participant', participantRouter);

describe('Participant API Endpoints', () => {
  let token;

  beforeEach(() => {
    token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
      expiresIn: '2h'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // *** POST /api/participant ***
  describe('POST /api/participant', () => {
    it('should create a participant and return 201', async () => {
      db_get.mockResolvedValueOnce({ row: null });
      db_run.mockResolvedValueOnce({ lastID: 1, changes: 1 });

      const response = await request(app).post('/api/participant').set('Authorization', `Bearer ${token}`).send({ project_id: 1, user_id: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('project_id', 1);
      expect(response.body).toHaveProperty('user_id', 1);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app).post('/api/participant').set('Authorization', `Bearer ${token}`).send({ project_id: 1 });

      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 409 for duplicate participant', async () => {
      db_get.mockResolvedValue({ row: { id: 1, project_id: 1, user_id: 2 } });

      const response = await request(app).post('/api/participant').set('Authorization', `Bearer ${token}`).send({ project_id: 1, user_id: 1 });

      expect(response.status).toBe(409);
      expect(response.text).toBe(ErrorMsg.VALIDATION.CONFLICT);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).post('/api/participant').set('Authorization', `Bearer ${token}`).send({ project_id: 1, user_id: 1 });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** PUT /api/participant/:id ***
  describe('PUT /api/participant/:id', () => {
    it('should update a participant and return 200', async () => {
      db_get.mockResolvedValue({ row: { id: 1, project_id: 1, user_id: 2 } });
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).put('/api/participant/1').set('Authorization', `Bearer ${token}`).send({ project_id: 3, user_id: 4 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('project_id', 3);
      expect(response.body).toHaveProperty('user_id', 4);
    });

    it('should return 404 if participant does not exist', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app).put('/api/participant/1').set('Authorization', `Bearer ${token}`).send({ project_id: 3, user_id: 4 });

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).put('/api/participant/1').set('Authorization', `Bearer ${token}`).send({ project_id: 3, user_id: 4 });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** GET /api/participant/:id ***
  describe('GET /api/participant/:id', () => {
    it('should return 200 and the participant details', async () => {
      db_get.mockResolvedValue({
        row: { id: 1, project_id: 1, user_id: 2 }
      });

      const response = await request(app).get('/api/participant/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('project_id', 1);
      expect(response.body).toHaveProperty('user_id', 2);
    });

    it('should return 404 if participant does not exist', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app).get('/api/participant/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).get('/api/participant/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** DELETE /api/participant/:id ***
  describe('DELETE /api/participant/:id', () => {
    let adminToken;

    beforeEach(() => {
      adminToken = jwt.sign({ id: 2, name: 'Admin User', email: 'admin@example.com', role: RoleTypes.ADMIN }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should delete a participant and return 200', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).delete('/api/participant/1').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe('Participant deleted successfully');
    });

    it('should return 404 if participant does not exist', async () => {
      db_run.mockResolvedValue({ changes: 0 });

      const response = await request(app).delete('/api/participant/1').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);
    });

    it('should return 500 on database error', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).delete('/api/participant/1').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** DELETE /api/participant ***
  describe('DELETE /api/participant', () => {
    let adminToken;

    beforeEach(() => {
      adminToken = jwt.sign({ id: 2, name: 'Admin User', email: 'admin@example.com', role: RoleTypes.ADMIN }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should delete all participants and return 200', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).delete('/api/participant').set('Authorization', `Bearer ${adminToken}`).send({ project_id: 3, user_id: 4 });

      expect(response.status).toBe(200);
      expect(response.text).toBe('Participant deleted successfully');
    });

    it('should return 500 on database error', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).delete('/api/participant').set('Authorization', `Bearer ${adminToken}`).send({ project_id: 3, user_id: 4 });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403 for insufficient permissions', async () => {
      const userToken = jwt.sign({ id: 3, name: 'Regular User', email: 'user@example.com', role: RoleTypes.USER }, config.jwtSecret, {
        expiresIn: '2h'
      });
      const guestToken = jwt.sign({ id: 3, name: 'Guest User', email: 'user@example.com', role: RoleTypes.GUEST }, config.jwtSecret, {
        expiresIn: '2h'
      });

      let response = await request(app).delete('/api/participant').set('Authorization', `Bearer ${guestToken}`);

      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);

      response = await request(app).delete('/api/participant').set('Authorization', `Bearer ${userToken}`).send({ project_id: 3, user_id: 4 });
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);

      db_run.mockResolvedValueOnce({ changes: 1 });
      response = await request(app).delete('/api/participant').set('Authorization', `Bearer ${adminToken}`).send({ project_id: 3, user_id: 4 });
      expect(response.status).toBe(200);
    });
  });
});
