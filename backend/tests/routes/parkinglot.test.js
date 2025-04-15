const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const { db_run, db_get, db_all } = require('../../src/database');
const logger = require('../../src/logger');
const parkinglotRouter = require('../../src/routes/parkinglot');

jest.mock('../../src/database'); 
jest.mock('../../src/logger'); 

const app = express();
app.use(express.json());
app.use('/api/parkinglot', parkinglotRouter);

const { ErrorMsg } = require("../../src/constants");


describe('ParkingLot API Endpoints', () => {
  let token;

  beforeEach(() => {
    token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com' }, config.jwtSecret, {
      expiresIn: '2h',
    });
  });

  // GET /api/parkinglot/list
  describe('GET /api/parkinglot/list', () => {
    it('should return a list of parking lots', async () => {
      db_all.mockResolvedValue({
        row: [
          { id: 1, name: 'Lot A', owner_id: 1 },
          { id: 2, name: 'Lot B', owner_id: 1 }
        ]
      });

      const response = await request(app)
        .get('/api/parkinglot/list')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: 1, name: 'Lot A', owner_id: 1, map_path: '' },
        { id: 2, name: 'Lot B', owner_id: 1, map_path: '' }
      ]);
    });

    it('should return 404 if no parking lots exist', async () => {
      db_all.mockResolvedValue({ row: [] });

      const response = await request(app)
        .get('/api/parkinglot/list')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PARKINGLOT);
    });

    it('should return 500 on database error', async () => {
      db_all.mockResolvedValue({ err: 'DB error' });

      const response = await request(app)
        .get('/api/parkinglot/list')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403', async () => {
      const response = await request(app).get('/api/parkinglot/list');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  // POST /api/parkinglot/
  describe('POST /api/parkinglot', () => {
    it('should create a new parking lot', async () => {
      db_get.mockResolvedValue({ row: null });
      db_run.mockResolvedValue({ lastID: 1, changes: 1 });

      const response = await request(app)
        .post('/api/parkinglot')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Lot A', owner_id: 1, map_path: '' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, name: 'Lot A', owner_id: 1, map_path: '' });
    });

    it('should return 400 if name or owner_id is missing', async () => {
      const response = await request(app)
        .post('/api/parkinglot')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 409 if parking lot already exists', async () => {
      db_get.mockResolvedValue({ row: { id: 1, name: 'Lot A' } });

      const response = await request(app)
        .post('/api/parkinglot')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Lot A', owner_id: 1, map_path: '' });

      expect(response.status).toBe(409);
      expect(response.text).toBe(ErrorMsg.VALIDATION.CONFLICT);
    });

    it('should return 500 if database error occurs', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app)
        .post('/api/parkinglot')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Lot A', owner_id: 1, map_path: '' });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403', async () => {
      const response = await request(app).post('/api/parkinglot');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  // PUT /api/parkinglot/:id
  describe('PUT /api/parkinglot/:id', () => {
    it('should update an existing parking lot', async () => {
      db_get.mockResolvedValue({ row: { id: 1, name: 'Lot A' } });
      db_run.mockResolvedValue({ changes: 1 });

      let response = await request(app)
        .put('/api/parkinglot/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Lot B' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, name: 'Lot B', owner_id: null, map_path: '' });

      response = await request(app)
        .put('/api/parkinglot/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Lot C', map_path: '/url/test' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ id: 1, name: 'Lot C', owner_id: null, map_path: '/url/test' });
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .put('/api/parkinglot/1')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 404 if parking lot not found', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app)
        .put('/api/parkinglot/1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Lot B' });

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PARKINGLOT);
    });

    it('should return 403', async () => {
      const response = await request(app).put('/api/parkinglot/1');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  // DELETE /api/parkinglot/:id
  describe('DELETE /api/parkinglot/:id', () => {
    it('should delete a parking lot', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app)
        .delete('/api/parkinglot/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe('ParkingLot deleted successfully');
    });

    it('should return 404 if parking lot not found', async () => {
      db_run.mockResolvedValue({ changes: 0 });

      const response = await request(app)
        .delete('/api/parkinglot/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PARKINGLOT);
    });

    it('should return 403', async () => {
      const response = await request(app).delete('/api/parkinglot/1');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  // GET /api/parkinglot/:id/list (Slots)
  describe('GET /api/parkinglot/:id/list', () => {
    it('should return a list of slots', async () => {
      db_all.mockResolvedValue({ row: [
        { id: 1, name: 'Slot A', type_id: 1, parkinglot_id: 1 },
        { id: 2, name: 'Slot B', type_id: 1, parkinglot_id: 1 }
      ] });

      const response = await request(app)
        .get('/api/parkinglot/1/list')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          id: 1, name: 'Slot A', type_id: 1, parkinglot_id: 1,
          position: {
            "height": 0,
            "id": 0,
            "rotation": 0,
            "width": 0,
            "x": 0,
            "y": 0,
          },
          booking: {
            "booking_id": null,
            "user_id": null,
            "user_name": "",
          }
        },
        {
          id: 2, name: 'Slot B', type_id: 1, parkinglot_id: 1,
          position: {
            "height": 0,
            "id": 0,
            "rotation": 0,
            "width": 0,
            "x": 0,
            "y": 0,
          },
          booking: {
            "booking_id": null,
            "user_id": null,
            "user_name": "",
          }
        },
      ]);
    });

    it('should return 404 if no slots exist', async () => {
      db_all.mockResolvedValue({ row: [] });

      const response = await request(app)
        .get('/api/parkinglot/1/list')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_SLOT);
    });

    it('should return 403', async () => {
      const response = await request(app).get('/api/parkinglot/1/list');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  describe('GET /api/parkinglot/:id/:slot_id', () => {
    it('should return a single slot', async () => {
      db_get.mockResolvedValue({ row: { id: 1, name: 'Slot A', type_id: 1, parkinglot_id: 1 } });

      const response = await request(app)
        .get('/api/parkinglot/1/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        {
          id: 1, name: 'Slot A', type_id: 1, parkinglot_id: 1,
          position: {
            "height": 0,
            "id": 0,
            "rotation": 0,
            "width": 0,
            "x": 0,
            "y": 0,
          },
          booking: {
            "booking_id": null,
            "user_id": null,
            "user_name": "",
          }
        },
      );
    });

    it('should return 404 if no slots exist', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app)
        .get('/api/parkinglot/1/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_SLOT);
    });

    it('should return 403', async () => {
      const response = await request(app).get('/api/parkinglot/1/1');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });
});
