const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const { db_run, db_get, db_all } = require('../../src/utils/db/dbUtils');
const logger = require('../../src/logger');
const eventRouter = require('../../src/routes/event');

jest.mock('../../src/utils/db/dbUtils');
jest.mock('../../src/logger'); // Mock des Loggers

const app = express();
app.use(express.json());
app.use('/api/event', eventRouter);

const { ErrorMsg, RoleTypes } = require('../../src/constants');

describe('Event API Endpoints', () => {
  describe('GET /api/event/list', () => {
    let token;

    beforeEach(() => {
      jest.resetAllMocks();
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should return 200 and a list of events', async () => {
      db_all.mockResolvedValue({
        row: [
          { id: 1, name: 'Event One', start_time: '2025-06-01', end_time: '2025-06-02' },
          { id: 2, name: 'Event Two', start_time: '2025-06-03', end_time: '2025-06-04' }
        ]
      });

      const response = await request(app).get('/api/event/list').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('name', 'Event One');
      expect(response.body[0]).toHaveProperty('start_time', '2025-06-01');
      expect(response.body[0]).toHaveProperty('end_time', '2025-06-02');
    });

    it('should return 404 if no events exist', async () => {
      db_all.mockResolvedValue({ row: [] });

      const response = await request(app).get('/api/event/list').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_EVENT);
    });

    it('should return 500 on database error', async () => {
      db_all.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).get('/api/event/list').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  describe('POST /api/event', () => {
    let token;

    beforeEach(() => {
      jest.resetAllMocks();
      token = jwt.sign({ id: 1, name: 'Manager User', email: 'manager@example.com', role: RoleTypes.MANAGER }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should create an event and return 201', async () => {
      db_get.mockResolvedValue({ row: null });
      db_run.mockResolvedValue({ lastID: 1, changes: 1 });

      const response = await request(app).post('/api/event').set('Authorization', `Bearer ${token}`).send({ name: 'New Event', start_time: '2025-06-01', end_time: '2025-06-02' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'New Event');
      expect(response.body).toHaveProperty('start_time', '2025-06-01');
      expect(response.body).toHaveProperty('end_time', '2025-06-02');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app).post('/api/event').set('Authorization', `Bearer ${token}`).send({ name: 'New Event' });

      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 409 for duplicate event name', async () => {
      db_get.mockResolvedValue({ row: { id: 1, name: 'Existing Event' } });

      const response = await request(app).post('/api/event').set('Authorization', `Bearer ${token}`).send({ name: 'Existing Event', start_time: '2025-06-01', end_time: '2025-06-02' });

      expect(response.status).toBe(409);
      expect(response.text).toBe(ErrorMsg.VALIDATION.CONFLICT);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).post('/api/event').set('Authorization', `Bearer ${token}`).send({ name: 'New Event', start_time: '2025-06-01', end_time: '2025-06-02' });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  describe('PUT /api/event/:id', () => {
    let token;

    beforeEach(() => {
      jest.resetAllMocks();
      token = jwt.sign({ id: 1, name: 'Manager User', email: 'manager@example.com', role: RoleTypes.MANAGER }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should update an event and return 200', async () => {
      db_get.mockResolvedValueOnce({ row: { id: 1, name: 'Old Event', start_time: '2025-06-01', end_time: '2025-06-02' } });
      db_get.mockResolvedValueOnce({ row: null });
      db_run.mockResolvedValueOnce({ changes: 1 });

      const response = await request(app).put('/api/event/1').set('Authorization', `Bearer ${token}`).send({ name: 'Updated Event', start_time: '2025-06-03', end_time: '2025-06-04' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'Updated Event');
      expect(response.body).toHaveProperty('start_time', '2025-06-03');
      expect(response.body).toHaveProperty('end_time', '2025-06-04');
    });

    it('should return 404 if event does not exist', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app).put('/api/event/1').set('Authorization', `Bearer ${token}`).send({ name: 'Updated Event', start_time: '2025-06-03', end_time: '2025-06-04' });

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_EVENT);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).put('/api/event/1').set('Authorization', `Bearer ${token}`).send({ name: 'Updated Event', start_time: '2025-06-03', end_time: '2025-06-04' });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  describe('GET /api/event/:id', () => {
    let token;

    beforeEach(() => {
      jest.resetAllMocks();
      token = jwt.sign({ id: 1, name: 'Manager User', email: 'manager@example.com', role: RoleTypes.MANAGER }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should return 200 and the event details', async () => {
      db_get.mockResolvedValue({
        row: {
          id: 1,
          name: 'Event One',
          start_time: '2025-06-01',
          end_time: '2025-06-02'
        }
      });

      const response = await request(app).get('/api/event/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'Event One');
      expect(response.body).toHaveProperty('start_time', '2025-06-01');
      expect(response.body).toHaveProperty('end_time', '2025-06-02');
    });

    it('should return 404 if the event does not exist', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app).get('/api/event/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_EVENT);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).get('/api/event/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403 for insufficient permissions', async () => {
      const tokenUser = jwt.sign({ id: 2, name: 'Regular User', email: 'user@example.com', role: RoleTypes.USER }, config.jwtSecret, {
        expiresIn: '2h'
      });

      const response = await request(app).get('/api/event/1').set('Authorization', `Bearer ${tokenUser}`);

      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);
    });
  });

  describe('DELETE /api/event/:id', () => {
    let token;

    beforeEach(() => {
      jest.resetAllMocks();
      token = jwt.sign({ id: 1, name: 'Admin User', email: 'admin@example.com', role: RoleTypes.ADMIN }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should delete an event and return 200', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).delete('/api/event/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe('Event deleted successfully');
    });

    it('should return 404 if event does not exist', async () => {
      db_run.mockResolvedValue({ changes: 0 });

      const response = await request(app).delete('/api/event/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_EVENT);
    });

    it('should return 500 on database error', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).delete('/api/event/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });
});
