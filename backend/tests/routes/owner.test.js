const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const { db_run, db_get, db_all } = require('../../src/database');
const logger = require('../../src/logger');
const ownerRouter = require('../../src/routes/owner');

jest.mock('../../src/database'); // Mocked Database
jest.mock('../../src/logger'); // Mock des Loggers

const app = express();
app.use(express.json());
app.use('/api/owner', ownerRouter);

const { ErrorMsg } = require("../../src/constants");

describe('Owner API Endpoints', () => {
  let token;

  beforeEach(() => {
    token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com' }, config.jwtSecret, {
      expiresIn: '2h',
    });
  });

  describe('GET /api/owner/list', () => {
    it('should return a list of owners', async () => {
      db_all.mockResolvedValue({
        row: [
          { id: 1, name: 'Test Owner' },
          { id: 2, name: 'Test Owner 2' },
        ],
      });

      const response = await request(app)
        .get('/api/owner/list')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 1, name: 'Test Owner' },
        { id: 2, name: 'Test Owner 2' },
      ]);
    });

    it('should return 404 if no owners exist', async () => {
      db_all.mockResolvedValue({ row: [] });

      const response = await request(app)
        .get('/api/owner/list')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_OWNER);
    });

    it('should return 500 on database error', async () => {
      db_all.mockResolvedValue({ err: 'DB error' });

      const response = await request(app)
        .get('/api/owner/list')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403', async () => {
      const response = await request(app).get('/api/owner/list');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  // POST /api/owner
  describe('POST /api/owner', () => {
    it('should create a new owner', async () => {
      db_run.mockResolvedValue({ lastID: 1, changes: 1 });

      const response = await request(app)
        .post('/api/owner')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Owner' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ owner_id: 1, owner_name: 'New Owner' });
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/owner')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 500 if owner creation fails', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app)
        .post('/api/owner')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Owner' });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403', async () => {
      const response = await request(app).post('/api/owner');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  // PUT /api/owner/:id
  describe('PUT /api/owner/:id', () => {
     it('should update an owner', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app)
        .put('/api/owner/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Owner' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: '1', name: 'Updated Owner' });
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .put('/api/owner/1')
        .set('Authorization', `Bearer ${token}`)
        .send({});
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 404 if owner not found', async () => {
      db_run.mockResolvedValue({ changes: 0 });

      const response = await request(app)
        .put('/api/owner/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Owner' });

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_OWNER);
    });

    it('should return 500 if update fails', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app)
        .put('/api/owner/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Updated Owner' });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403', async () => {
      const response = await request(app).put('/api/owner/1');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  // GET /api/owner/:id
  describe('GET /api/owner/:id', () => {
    it('should return a specific owner', async () => {
      db_get.mockResolvedValue({ row: { id: 1, name: 'Test Owner' } });

      const response = await request(app)
        .get('/api/owner/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, name: 'Test Owner' });
    });

    it('should return 404 if owner is not found', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app)
        .get('/api/owner/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_OWNER);
    });

    it('should return 500 if database error occurs', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app)
        .get('/api/owner/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403', async () => {
      const response = await request(app).get('/api/owner/1');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  // DELETE /api/owner/:id
  describe('DELETE /api/owner/:id', () => {
     it('should delete an owner', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app)
        .delete('/api/owner/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.text).toBe('Owner deleted successfully');
    });

    it('should return 404 if owner is not found', async () => {
      db_run.mockResolvedValue({ changes: 0 });

      const response = await request(app)
        .delete('/api/owner/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_OWNER);
    });

    it('should return 500 if delete fails', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app)
        .delete('/api/owner/1')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403', async () => {
      const response = await request(app).delete('/api/owner/1');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });
});
