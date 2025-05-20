const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const { db_run, db_get, db_all } = require('../../src/database');
const logger = require('../../src/logger');
const userRouter = require('../../src/routes/user'); // Pfad anpassen, falls nötig

jest.mock('../../src/database'); // Mock der Datenbankfunktionen
jest.mock('../../src/logger'); // Mock des Loggers

const app = express();
app.use(express.json());
app.use('/api/user', userRouter);

const { ErrorMsg } = require('../../src/constants');

describe('User API Endpoints', () => {
  describe('POST /api/user/login', () => {
    let token;

    beforeEach(() => {
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com' }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    /** Test für `POST /api/user/login` **/
    it('should return 200 and a JWT token for valid credentials', async () => {
      db_get.mockResolvedValue({
        row: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: '$2b$10$kDNS6MAF8YrrZx106PGYn.rcQp9nfhPl2vWfo116RCOggiuPD/k8m'
        }
      });

      const response = await request(app).post('/api/user/login').send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 for invalid credentials', async () => {
      db_get.mockResolvedValue({
        row: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: '$2b$10$wrongpassword'
        }
      });

      const response = await request(app).post('/api/user/login').send({ email: 'test@example.com', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_CREDENTIALS);
    });

    it('should return 400 for missing field', async () => {
      db_get.mockResolvedValue({
        row: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: '$2b$10$wrongpassword'
        }
      });

      const response = await request(app).post('/api/user/login').send({ email: 'test@example.com' });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);

      const response2 = await request(app).post('/api/user/login').send({ password: 'wrongpassword' });
      expect(response2.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 404 user not found', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app).post('/api/user/login').send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_USER);
    });
  });

  describe('GET /api/user/list', () => {
    /** Test für `GET /api/user/list` **/
    let token;
    beforeEach(() => {
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com' }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should return 200 and a list of users', async () => {
      db_all.mockResolvedValue({
        row: [
          {
            id: 1,
            name: 'User One',
            email: 'user1@example.com',
            telephone: '12345',
            role_id: 2,
            licence_plate: 'ABC123',
            vehicle_type_id: 1
          },
          {
            id: 2,
            name: 'User Two',
            email: 'user2@example.com',
            telephone: '67890',
            role_id: 2,
            licence_plate: 'XYZ789',
            vehicle_type_id: 1
          }
        ]
      });

      const response = await request(app).get('/api/user/list').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('email', 'user1@example.com');
    });

    it('should return 404 if no user exist', async () => {
      db_all.mockResolvedValue({ row: [] });

      const response = await request(app).get('/api/user/list').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_USER);
    });

    it('should return 500 on database error', async () => {
      db_all.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).get('/api/user/list').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403', async () => {
      const response = await request(app).get('/api/user/list');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  describe('POST /api/user', () => {
    /** Test für `POST /api/user` **/
    let token;
    beforeEach(() => {
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com' }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should return 201 and create a user', async () => {
      db_get.mockResolvedValue({ row: null });
      db_run.mockResolvedValue({ lastID: 1 });

      const response = await request(app).post('/api/user').send({
        name: 'New User',
        email: 'newuser@example.com',
        telephone: '12345',
        password: 'securepassword',
        licence_plate: 'B-XY 123',
        vehicle_type_id: 1
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', 'New User');
      expect(response.body).toHaveProperty('email', 'newuser@example.com');
      expect(response.body).toHaveProperty('telephone', '12345');
      expect(response.body).toHaveProperty('licence_plate', 'B-XY 123');
      expect(response.body).toHaveProperty('is_private_email', false);
      expect(response.body).toHaveProperty('is_private_telephone', false);
      expect(response.body).toHaveProperty('role_id', 2);
    });

    it('should return 409 if user already exists', async () => {
      db_get.mockResolvedValue({
        row: { id: 1, email: 'existing@example.com' }
      });

      const response = await request(app).post('/api/user').send({
        name: 'Existing User',
        email: 'existing@example.com',
        telephone: '12345',
        password: 'securepassword',
        licence_plate: 'B-XY 123',
        vehicle_type_id: 1
      });

      expect(response.status).toBe(409);
      expect(response.text).toBe(ErrorMsg.VALIDATION.CONFLICT);
    });

    it('should return 400 and create a user', async () => {
      db_get.mockResolvedValue({ row: null });
      db_run.mockResolvedValue({ lastID: 1 });

      let response = await request(app).post('/api/user').send({
        email: 'newuser@example.com',
        telephone: '12345',
        licence_plate: 'B-XY 123'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
      response = await request(app).post('/api/user').send({
        name: 'New User',
        telephone: '12345',
        licence_plate: 'B-XY 123'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);

      response = await request(app).post('/api/user').send({
        name: 'New User',
        email: 'newuser@example.com',
        licence_plate: 'B-XY 123'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);

      response = await request(app).post('/api/user').send({
        name: 'New User',
        email: 'newuser@example.com',
        telephone: '12345'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 500 on database error', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).post('/api/user').send({
        name: 'New User',
        email: 'newuser@example.com',
        telephone: '12345',
        password: 'securepassword',
        licence_plate: 'B-XY 123',
        vehicle_type_id: 1
      });
      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  describe('PUT /api/user/:id', () => {
    /** Test für `PUT /api/user/:id` **/
    let token;
    beforeEach(() => {
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com' }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should return 200 and update user details', async () => {
      db_get.mockResolvedValueOnce({
        row: {
          id: 1,
          name: 'Old Name',
          email: 'old@example.com',
          telephone: '12345',
          role_id: 2,
          licence_plate: 'OLD-123',
          is_private_email: false,
          is_private_telephone: false
        }
      });
      db_get.mockResolvedValueOnce({
        row: null
      });

      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).put('/api/user/1').set('Authorization', `Bearer ${token}`).send({
        name: 'New Name',
        email: 'new@example.com',
        telephone: '67890',
        role_id: 2,
        licence_plate: 'NEW-456',
        is_private_email: true,
        is_private_telephone: true
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'New Name');
      expect(response.body).toHaveProperty('email', 'new@example.com');
      expect(response.body).toHaveProperty('telephone', '67890');
      expect(response.body).toHaveProperty('licence_plate', 'NEW-456');
      expect(response.body).toHaveProperty('is_private_email', true);
      expect(response.body).toHaveProperty('is_private_telephone', true);
    });

    it('should return 404 if user does not exist', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app).put('/api/user/99').set('Authorization', `Bearer ${token}`).send({
        name: 'New Name',
        email: 'new@example.com',
        telephone: '67890',
        role_id: 2,
        licence_plate: 'NEW-456'
      });

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_USER);
    });

    it('should return 400 and not create a user', async () => {
      db_get.mockResolvedValue({ row: null });
      db_run.mockResolvedValue({ lastID: 1 });

      let response = await request(app).put('/api/user/99').set('Authorization', `Bearer ${token}`).send({
        email: 'newuser@example.com',
        telephone: '12345',
        licence_plate: 'B-XY 123'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
      response = await request(app).put('/api/user/99').set('Authorization', `Bearer ${token}`).send({
        name: 'New User',
        telephone: '12345',
        licence_plate: 'B-XY 123'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
      response = await request(app).put('/api/user/99').set('Authorization', `Bearer ${token}`).send({
        name: 'New User',
        email: 'newuser@example.com',
        licence_plate: 'B-XY 123'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
      response = await request(app).put('/api/user/99').set('Authorization', `Bearer ${token}`).send({
        name: 'New User',
        email: 'newuser@example.com',
        telephone: '12345'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 409 if email is already taken', async () => {
      db_get
        .mockResolvedValueOnce({
          row: {
            id: 1,
            name: 'Existing User',
            email: 'existing@example.com',
            telephone: '12345',
            role_id: 2,
            licence_plate: 'OLD-123'
          }
        })
        .mockResolvedValueOnce({
          row: { id: 2, email: 'new@example.com' } // Simuliert bereits existierende E-Mail
        });

      const response = await request(app).put('/api/user/1').set('Authorization', `Bearer ${token}`).send({
        name: 'New Name',
        email: 'new@example.com', // Diese E-Mail gehört einem anderen User
        telephone: '67890',
        role_id: 2,
        licence_plate: 'NEW-456'
      });

      expect(response.status).toBe(409);
      expect(response.text).toBe(ErrorMsg.VALIDATION.CONFLICT);
    });

    it('should return 500 if database update fails', async () => {
      db_get.mockResolvedValueOnce({
        row: {
          id: 1,
          name: 'Old Name',
          email: 'old@example.com',
          telephone: '12345',
          role_id: 2,
          licence_plate: 'OLD-123',
          is_private_email: false,
          is_private_telephone: false
        }
      });
      db_get.mockResolvedValueOnce({
        row: null
      });

      db_run.mockResolvedValue({ err: true });

      const response = await request(app).put('/api/user/1').set('Authorization', `Bearer ${token}`).send({
        name: 'Updated Name',
        email: 'updated@example.com',
        telephone: '67890',
        role_id: 2,
        licence_plate: 'NEW-456'
      });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403', async () => {
      const response = await request(app).put('/api/user/1');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  describe('GET /api/user', () => {
    /** Test für `GET /api/user/:id` **/
    let token;
    beforeEach(() => {
      jest.clearAllMocks();
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com' }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should return 200 and the user details', async () => {
      db_get.mockResolvedValueOnce({
        row: {
          id: 1,
          name: 'User One',
          email: 'user1@example.com',
          telephone: '12345',
          role_id: 2,
          licence_plate: 'ABC123'
        }
      });

      const response = await request(app).get('/api/user/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'User One');
      expect(response.body).toHaveProperty('email', 'user1@example.com');
      expect(response.body).toHaveProperty('telephone', '12345');
      expect(response.body).toHaveProperty('licence_plate', 'ABC123');
      expect(response.body).toHaveProperty('is_private_email', false);
      expect(response.body).toHaveProperty('is_private_telephone', false);
      expect(response.body).toHaveProperty('role_id', 2);
    });

    it('should return 404 if user not found', async () => {
      db_get.mockResolvedValueOnce({ row: null });

      const response = await request(app).get('/api/user/99').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_USER);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).get('/api/user/99').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403', async () => {
      const response = await request(app).get('/api/user/99');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });

  describe('DELETE /api/user', () => {
    /**  Test für `DELETE /api/user/:id` **/
    let token;
    beforeEach(() => {
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com' }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should return 200 if user is successfully deleted', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).delete('/api/user/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe('User deleted successfully');
    });

    it('should return 404 if user does not exist', async () => {
      db_run.mockResolvedValue({ changes: 0 });

      const response = await request(app).delete('/api/user/99').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_USER);
    });

    it('should return 500 on database error', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).delete('/api/user/1').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403', async () => {
      const response = await request(app).delete('/api/user/1');
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
    });
  });
});
