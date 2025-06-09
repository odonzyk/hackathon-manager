const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const { ErrorMsg, RoleTypes } = require('../../src/constants');
const { db_get, db_run } = require('../../src/utils/db/dbUtils');
const config = require('../../src/config');
const logger = require('../../src/logger');
const initiatorRouter = require('../../src/routes/initiator');

jest.mock('../../src/utils/db/dbUtils');
jest.mock('../../src/logger'); // Mock des Loggers

const app = express();
app.use(express.json());
app.use('/api/initiator', initiatorRouter);

describe('Initiator API Endpoints', () => {
  let token;

  beforeEach(() => {
    token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
      expiresIn: '2h'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // *** POST /api/initiator ***
  describe('POST /api/initiator', () => {
    it('should create an initiator and return 201', async () => {
      db_get.mockResolvedValueOnce({ row: null });
      db_run.mockResolvedValueOnce({ lastID: 1, changes: 1 });

      const response = await request(app).post('/api/initiator').set('Authorization', `Bearer ${token}`).send({ project_id: 1, user_id: 1 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('project_id', 1);
      expect(response.body).toHaveProperty('user_id', 1);
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app).post('/api/initiator').set('Authorization', `Bearer ${token}`).send({ project_id: 1 });

      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 409 for duplicate initiator', async () => {
      db_get.mockResolvedValue({ row: { id: 1, project_id: 1, user_id: 2 } });

      const response = await request(app).post('/api/initiator').set('Authorization', `Bearer ${token}`).send({ project_id: 1, user_id: 1 });

      expect(response.status).toBe(409);
      expect(response.text).toBe(ErrorMsg.VALIDATION.CONFLICT);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).post('/api/initiator').set('Authorization', `Bearer ${token}`).send({ project_id: 1, user_id: 1 });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** PUT /api/initiator/:id ***
  describe('PUT /api/initiator/:id', () => {
    it('should update an initiator and return 200', async () => {
      db_get.mockResolvedValue({ row: { id: 1, project_id: 1, user_id: 2 } });
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).put('/api/initiator/1').set('Authorization', `Bearer ${token}`).send({ project_id: 3, user_id: 4 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('project_id', 3);
      expect(response.body).toHaveProperty('user_id', 4);
    });

    it('should return 404 if initiator does not exist', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app).put('/api/initiator/1').set('Authorization', `Bearer ${token}`).send({ project_id: 3, user_id: 4 });

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_INITIATOR);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).put('/api/initiator/1').set('Authorization', `Bearer ${token}`).send({ project_id: 3, user_id: 4 });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** GET /api/initiator/:id ***
  describe('GET /api/initiator/:id', () => {
    it('should return 200 and the initiator details', async () => {
      db_get.mockResolvedValue({
        row: { id: 1, project_id: 1, user_id: 2 }
      });

      const response = await request(app).get('/api/initiator/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('project_id', 1);
      expect(response.body).toHaveProperty('user_id', 2);
    });

    it('should return 404 if initiator does not exist', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app).get('/api/initiator/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_INITIATOR);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).get('/api/initiator/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** DELETE /api/initiator/:id ***
  describe('DELETE /api/initiator/:id', () => {
    let adminToken;

    beforeEach(() => {
      adminToken = jwt.sign({ id: 2, name: 'Admin User', email: 'admin@example.com', role: RoleTypes.ADMIN }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should delete an initiator and return 200', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).delete('/api/initiator/1').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe('Initiator deleted successfully');
    });

    it('should return 404 if initiator does not exist', async () => {
      db_run.mockResolvedValue({ changes: 0 });

      const response = await request(app).delete('/api/initiator/1').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_INITIATOR);
    });

    it('should return 500 on database error', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).delete('/api/initiator/1').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });
});
