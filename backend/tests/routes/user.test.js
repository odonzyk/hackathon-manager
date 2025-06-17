const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const { db_run, db_get, db_all } = require('../../src/utils/db/dbUtils');
const logger = require('../../src/logger');
const userRouter = require('../../src/routes/user');

jest.mock('../../src/utils/db/dbUtils');
jest.mock('../../src/logger');
jest.mock('../../src/utils/emailUtils');

const app = express();
app.use(express.json());
app.use('/api/user', userRouter);

const { ErrorMsg, RoleTypes } = require('../../src/constants');

describe('User API Endpoints', () => {
  describe('POST /api/user/login', () => {
    let token;

    beforeEach(() => {
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
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
          password: '$2b$10$kDNS6MAF8YrrZx106PGYn.rcQp9nfhPl2vWfo116RCOggiuPD/k8m',
          role_id: RoleTypes.USER
        }
      });

      const response = await request(app).post('/api/user/login').send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');

      // Überprüfe den Inhalt des Tokens
      const decodedToken = jwt.verify(response.body.token, config.jwtSecret);
      expect(decodedToken).toHaveProperty('id', 1);
      expect(decodedToken).toHaveProperty('name', 'Test User');
      expect(decodedToken).toHaveProperty('email', 'test@example.com');
      expect(decodedToken).toHaveProperty('role', RoleTypes.USER);
    });

    it('should return 400 and NoPassword is set', async () => {
      db_get.mockResolvedValue({
        row: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: ''
        }
      });

      const response = await request(app).post('/api/user/login').send({ email: 'test@example.com', password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.SERVER.NO_PASSWORD);
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
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
        expiresIn: '2h'
      });
      tokenGuest = jwt.sign({ id: 2, name: 'Guest User', email: 'guest@example.com', role: RoleTypes.GUEST }, config.jwtSecret, {
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
            is_private_email: false,
            telephone: '12345',
            is_private_telephone: false,
            role_id: RoleTypes.USER
          },
          {
            id: 2,
            name: 'User Two',
            email: 'user2@example.com',
            is_private_email: true,
            telephone: '67890',
            is_private_telephone: false,
            role_id: RoleTypes.USER
          },
          {
            id: 3,
            name: 'User Three',
            email: 'user3@example.com',
            is_private_email: false,
            telephone: '67890',
            is_private_telephone: true,
            role_id: RoleTypes.USER
          }
        ]
      });

      const response = await request(app).get('/api/user/list').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(3);
      // Überprüfe die Felder des ersten Benutzers
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('name', 'User One');
      expect(response.body[0]).toHaveProperty('email', 'user1@example.com');
      expect(response.body[0]).toHaveProperty('telephone', '12345');
      expect(response.body[0]).toHaveProperty('role_id', RoleTypes.USER);
      expect(response.body[0]).toHaveProperty('participate', []);

      // Überprüfe die Felder des zweiten Benutzers
      expect(response.body[1]).toHaveProperty('id', 2);
      expect(response.body[1]).toHaveProperty('name', 'User Two');
      expect(response.body[1]).toHaveProperty('email', ''); // E-Mail ist privat
      expect(response.body[1]).toHaveProperty('telephone', '67890');
      expect(response.body[1]).toHaveProperty('role_id', RoleTypes.USER);
      expect(response.body[1]).toHaveProperty('participate', []);

      // Überprüfe die Felder des dritten Benutzers
      expect(response.body[2]).toHaveProperty('id', 3);
      expect(response.body[2]).toHaveProperty('name', 'User Three');
      expect(response.body[2]).toHaveProperty('email', 'user3@example.com');
      expect(response.body[2]).toHaveProperty('telephone', ''); // Telefonnummer ist privat
      expect(response.body[2]).toHaveProperty('role_id', RoleTypes.USER);
      expect(response.body[2]).toHaveProperty('participate', []);
    });

    it('should return 403 with wrong role permissions', async () => {
      const response = await request(app).get('/api/user/list').set('Authorization', `Bearer ${tokenGuest}`);
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);
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

  describe('POST /api/user/:id/participate', () => {
    let token;

    beforeEach(() => {
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should return 201 and create a participation', async () => {
      db_all.mockResolvedValue({ row: [] }); // Keine Konflikte
      db_run.mockResolvedValue({ changes: 1 });
      db_get.mockResolvedValue({
        row: {
          id: 1,
          user_id: 1,
          project_id: 2,
          idea: 'Project Idea',
          event_id: 3,
          name: 'Event Name'
        }
      });

      const response = await request(app).post('/api/user/1/participate').set('Authorization', `Bearer ${token}`).send({ project_id: 2 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('user_id', 1);
      expect(response.body).toHaveProperty('project_id', 2);
      expect(response.body).toHaveProperty('idea', 'Project Idea');
      expect(response.body).toHaveProperty('event_id', 3);
      expect(response.body).toHaveProperty('event_name', 'Event Name');
    });

    it('should return 400 for missing project_id', async () => {
      const response = await request(app).post('/api/user/1/participate').set('Authorization', `Bearer ${token}`).send({});

      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 403 for insufficient permissions', async () => {
      const tokenGuest = jwt.sign({ id: 2, name: 'Guest User', email: 'guest@example.com', role: RoleTypes.GUEST }, config.jwtSecret, {
        expiresIn: '2h'
      });
      const tokenAdmin = jwt.sign({ id: 3, name: 'Admin User', email: 'admin@example.com', role: RoleTypes.ADMIN }, config.jwtSecret, {
        expiresIn: '2h'
      });

      let response = await request(app).post('/api/user/2/participate').set('Authorization', `Bearer ${tokenGuest}`).send({ project_id: 2 });
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);

      response = await request(app).post('/api/user/2/participate').set('Authorization', `Bearer ${token}`).send({ project_id: 2 });
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);

      response = await request(app).post('/api/user/2/participate').set('Authorization', `Bearer ${tokenAdmin}`).send({ project_id: 2 });
      expect(response.status).toBe(201);
    });

    it('should return 409 for conflict in participation', async () => {
      db_all.mockResolvedValue({ row: [{ id: 1 }] }); // Konflikt vorhanden

      const response = await request(app).post('/api/user/1/participate').set('Authorization', `Bearer ${token}`).send({ project_id: 2 });

      expect(response.status).toBe(409);
      expect(response.text).toBe(ErrorMsg.VALIDATION.CONFLICT);
    });

    it('should return 500 for database error', async () => {
      db_all.mockResolvedValueOnce({ err: 'DB error' });
      db_all.mockResolvedValueOnce([]);
      db_run.mockResolvedValueOnce({ err: 'DB error' });

      let response = await request(app).post('/api/user/1/participate').set('Authorization', `Bearer ${token}`).send({ project_id: 2 });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);

      response = await request(app).post('/api/user/1/participate').set('Authorization', `Bearer ${token}`).send({ project_id: 2 });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  describe('GET /api/user/:id/participate', () => {
    let token;

    beforeEach(() => {
      jest.resetAllMocks();
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should return 200 and a list of participations for the user', async () => {
      db_all.mockResolvedValue({
        row: [
          {
            id: 1,
            user_id: 1,
            project_id: 2,
            idea: 'Project Idea',
            event_id: 3,
            name: 'Event Name'
          },
          {
            id: 2,
            user_id: 1,
            project_id: 4,
            idea: 'Another Project Idea',
            event_id: 5,
            name: 'Another Event Name'
          }
        ]
      });

      const response = await request(app).get('/api/user/1/participate').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('user_id', 1);
      expect(response.body[0]).toHaveProperty('project_id', 2);
      expect(response.body[0]).toHaveProperty('idea', 'Project Idea');
      expect(response.body[0]).toHaveProperty('event_id', 3);
      expect(response.body[0]).toHaveProperty('event_name', 'Event Name');
      expect(response.body[1]).toHaveProperty('id', 2);
      expect(response.body[1]).toHaveProperty('user_id', 1);
      expect(response.body[1]).toHaveProperty('project_id', 4);
      expect(response.body[1]).toHaveProperty('idea', 'Another Project Idea');
      expect(response.body[1]).toHaveProperty('event_id', 5);
      expect(response.body[1]).toHaveProperty('event_name', 'Another Event Name');
    });

    it('should return 403 for insufficient permissions', async () => {
      const tokenGuest = jwt.sign({ id: 2, name: 'Guest User', email: 'guest@example.com', role: RoleTypes.GUEST }, config.jwtSecret, {
        expiresIn: '2h'
      });

      const response = await request(app).get('/api/user/1/participate').set('Authorization', `Bearer ${tokenGuest}`);
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);
    });

    it('should return 200 if no participations exist', async () => {
      db_all.mockResolvedValue({ row: [] });

      const response = await request(app).get('/api/user/1/participate').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 500 on database error', async () => {
      db_all.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).get('/api/user/1/participate').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  describe('DELETE /api/user/:id/participate', () => {
    let token;

    beforeEach(() => {
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should delete a participation and return 200', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).delete('/api/user/1/participate').set('Authorization', `Bearer ${token}`).send({ project_id: 2 });

      expect(response.status).toBe(200);
      expect(response.text).toBe('Participation deleted successfully');
    });

    it('should return 403 for insufficient permissions', async () => {
      const tokenGuest = jwt.sign({ id: 2, name: 'Guest User', email: 'guest@example.com', role: RoleTypes.GUEST }, config.jwtSecret, {
        expiresIn: '2h'
      });
      const tokenAdmin = jwt.sign({ id: 3, name: 'Admin User', email: 'admin@example.com', role: RoleTypes.ADMIN }, config.jwtSecret, {
        expiresIn: '2h'
      });
      db_run.mockResolvedValue({ changes: 1 });

      let response = await request(app).delete('/api/user/1/participate').set('Authorization', `Bearer ${tokenGuest}`).send({ project_id: 2 });
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);

      response = await request(app).delete('/api/user/2/participate').set('Authorization', `Bearer ${token}`).send({ project_id: 2 });
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);

      response = await request(app).delete('/api/user/1/participate').set('Authorization', `Bearer ${tokenAdmin}`).send({ project_id: 2 });
      expect(response.status).toBe(200);
      expect(response.text).toBe('Participation deleted successfully');
    });

    it('should return 404 if participation does not exist', async () => {
      db_run.mockResolvedValue({ changes: 0 });

      const response = await request(app).delete('/api/user/1/participate').set('Authorization', `Bearer ${token}`).send({ project_id: 2 });

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PARTICIPANT);
    });

    it('should return 500 on database error', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).delete('/api/user/1/participate').set('Authorization', `Bearer ${token}`).send({ project_id: 2 });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  describe('POST /api/user', () => {
    /** Test für `POST /api/user` **/
    let token;
    beforeEach(() => {
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
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
        is_private_email: true,
        is_private_telephone: false,
        role_id: RoleTypes.USER,
        avatar_url: '/assets/avatars/avatar_2.png'
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('name', 'New User');
      expect(response.body).toHaveProperty('email', 'newuser@example.com');
      expect(response.body).toHaveProperty('telephone', '12345');
      expect(response.body).toHaveProperty('is_private_email', true);
      expect(response.body).toHaveProperty('is_private_telephone', false);
      expect(response.body).toHaveProperty('role_id', RoleTypes.NEW);
      expect(response.body).toHaveProperty('avatar_url', '/assets/avatars/avatar_2.png');
      expect(response.body).toHaveProperty('participate', []);
    });

    it('should return 409 if user already exists', async () => {
      db_get.mockResolvedValue({
        row: { id: 1, email: 'existing@example.com' }
      });

      const response = await request(app).post('/api/user').send({
        name: 'Existing User',
        email: 'existing@example.com',
        telephone: '12345',
        password: 'securepassword'
      });

      expect(response.status).toBe(409);
      expect(response.text).toBe(ErrorMsg.VALIDATION.CONFLICT);
    });

    it('should return 400 and create a user', async () => {
      db_get.mockResolvedValue({ row: null });
      db_run.mockResolvedValue({ lastID: 1 });

      let response = await request(app).post('/api/user').send({
        email: 'newuser@example.com',
        telephone: '12345'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
      response = await request(app).post('/api/user').send({
        name: 'New User',
        telephone: '12345'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);

      response = await request(app).post('/api/user').send({
        name: 'New User',
        email: 'newuser@example.com'
      });
      expect(response.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).post('/api/user').send({
        name: 'New User',
        email: 'newuser@example.com',
        telephone: '12345',
        password: 'securepassword'
      });
      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should set default values for missing fields', async () => {
      db_get.mockResolvedValue({ row: null });
      db_run.mockResolvedValue({ lastID: 1 });

      const response = await request(app).post('/api/user').send({
        name: 'Default User',
        email: 'defaultuser@example.com'
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('role_id', RoleTypes.NEW);
      expect(response.body).toHaveProperty('avatar_url', '/assets/avatars/avatar_1.png');
      expect(response.body).toHaveProperty('is_private_email', false);
      expect(response.body).toHaveProperty('is_private_telephone', false);
    });

    it('should hash the password before saving', async () => {
      const bcryptSpy = jest.spyOn(require('bcrypt'), 'hash');
      db_get.mockResolvedValue({ row: null });
      db_run.mockResolvedValue({ lastID: 1 });

      const response = await request(app).post('/api/user').send({
        name: 'Secure User',
        email: 'secureuser@example.com',
        password: 'securepassword'
      });

      expect(response.status).toBe(201);
      expect(bcryptSpy).toHaveBeenCalledWith('securepassword', 10);
      bcryptSpy.mockRestore();
    });
  });

  describe('PUT /api/user/:id', () => {
    /** Test für `PUT /api/user/:id` **/
    let token;
    beforeEach(() => {
      jest.resetAllMocks();
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
        expiresIn: '2h'
      });
      tokenGuest = jwt.sign({ id: 2, name: 'Guest User', email: 'guest@example.com', role: RoleTypes.GUEST }, config.jwtSecret, {
        expiresIn: '2h'
      });
      token99 = jwt.sign({ id: 99, name: 'Guest User', email: 'guest@example.com', role: RoleTypes.USER }, config.jwtSecret, {
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
          role_id: RoleTypes.USER,
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
        role_id: RoleTypes.USER,
        is_private_email: true,
        is_private_telephone: true
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'New Name');
      expect(response.body).toHaveProperty('email', 'new@example.com');
      expect(response.body).toHaveProperty('telephone', '67890');
      expect(response.body).toHaveProperty('is_private_email', true);
      expect(response.body).toHaveProperty('is_private_telephone', true);
    });

    it('should return 403 with wrong role permissions', async () => {
      let response = await request(app).put('/api/user/2').set('Authorization', `Bearer ${tokenGuest}`);
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);

      response = await request(app).put('/api/user/2').set('Authorization', `Bearer ${token}`).send({
        name: 'New Name',
        email: 'new@example.com',
        telephone: '67890',
        role_id: RoleTypes.USER,
        is_private_email: true,
        is_private_telephone: true
      });
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);

      response = await request(app).put('/api/user/2').set('Authorization', `Bearer ${token}`).send({
        name: 'New Name',
        email: 'new@example.com',
        telephone: '67890',
        role_id: RoleTypes.USER,
        is_private_email: true,
        is_private_telephone: true
      });
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);
    });

    it('should return 404 if user does not exist', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app).put('/api/user/99').set('Authorization', `Bearer ${token99}`).send({
        name: 'New Name',
        email: 'new@example.com',
        telephone: '67890',
        role_id: RoleTypes.USER
      });

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_USER);
    });

    it('should return 400 and not create a user', async () => {
      db_get.mockResolvedValue({ row: null });
      db_run.mockResolvedValue({ lastID: 1 });

      let response = await request(app).put('/api/user/99').set('Authorization', `Bearer ${token99}`).send({
        email: 'newuser@example.com',
        telephone: '12345'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
      response = await request(app).put('/api/user/99').set('Authorization', `Bearer ${token99}`).send({
        name: 'New User',
        telephone: '12345'
      });
      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
      response = await request(app).put('/api/user/99').set('Authorization', `Bearer ${token99}`).send({
        name: 'New User',
        email: 'newuser@example.com'
      });
      expect(response.status).toBe(404);
    });

    it('should return 409 if email is already taken', async () => {
      db_get
        .mockResolvedValueOnce({
          row: {
            id: 1,
            name: 'Existing User',
            email: 'existing@example.com',
            telephone: '12345',
            role_id: RoleTypes.USER
          }
        })
        .mockResolvedValueOnce({
          row: { id: 2, email: 'new@example.com' } // Simuliert bereits existierende E-Mail
        });

      const response = await request(app).put('/api/user/1').set('Authorization', `Bearer ${token}`).send({
        name: 'New Name',
        email: 'new@example.com', // Diese E-Mail gehört einem anderen User
        telephone: '67890',
        role_id: RoleTypes.USER
      });

      expect(response.status).toBe(409);
      expect(response.text).toBe(ErrorMsg.VALIDATION.CONFLICT);
    });

    it('should return 500 if database update fails', async () => {
      const row = {
        id: 1,
        name: 'Old Name',
        email: 'old@example.com',
        telephone: '12345',
        role_id: RoleTypes.USER,
        is_private_email: false,
        is_private_telephone: false
      };

      const user = {
        name: 'Updated Name',
        email: 'updated@example.com',
        telephone: '67890',
        role_id: RoleTypes.USER
      };

      db_get.mockResolvedValueOnce({ row: row });
      db_get.mockResolvedValueOnce({ err: true });

      db_get.mockResolvedValueOnce({ row: row });
      db_get.mockResolvedValueOnce({ row: null });
      db_run.mockResolvedValueOnce({ err: true });

      let response = await request(app).put('/api/user/1').set('Authorization', `Bearer ${token}`).send(user);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);

      response = await request(app).put('/api/user/1').set('Authorization', `Bearer ${token}`).send(user);

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
    let tokenGuest;
    let tokenAdmin;

    beforeEach(() => {
      jest.clearAllMocks();
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
        expiresIn: '2h'
      });
      tokenGuest = jwt.sign({ id: 2, name: 'Guest User', email: 'guest@example.com', role: RoleTypes.GUEST }, config.jwtSecret, {
        expiresIn: '2h'
      });
      tokenAdmin = jwt.sign({ id: 3, name: 'Admin User', email: 'admin@example.com', role: RoleTypes.ADMIN }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should return 200 and the user details with participation list', async () => {
      db_get.mockResolvedValueOnce({
        row: {
          id: 1,
          name: 'User One',
          email: 'user1@example.com',
          telephone: '12345',
          role_id: RoleTypes.USER,
          is_private_email: false,
          is_private_telephone: false
        }
      });
      db_all.mockResolvedValueOnce({
        row: [
          {
            id: 1,
            user_id: 1,
            project_id: 1,
            idea: 'Project Idea',
            event_id: 1,
            name: 'Event Name'
          }
        ]
      });

      const response = await request(app).get('/api/user/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'User One');
      expect(response.body).toHaveProperty('email', 'user1@example.com');
      expect(response.body).toHaveProperty('telephone', '12345');
      expect(response.body).toHaveProperty('is_private_email', false);
      expect(response.body).toHaveProperty('is_private_telephone', false);
      expect(response.body).toHaveProperty('role_id', RoleTypes.USER);
      expect(response.body.participate).toHaveLength(1);
      expect(response.body.participate[0]).toHaveProperty('idea', 'Project Idea');
      expect(response.body.participate[0]).toHaveProperty('event_name', 'Event Name');
    });

    it('should return 403 with wrong role permissions', async () => {
      const response = await request(app).get('/api/user/1').set('Authorization', `Bearer ${tokenGuest}`);
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);
    });

    it('should apply privacy filter for email and telephone', async () => {
      db_get.mockResolvedValue({
        row: {
          id: 1,
          name: 'User One',
          email: 'user1@example.com',
          telephone: '12345',
          role_id: RoleTypes.USER,
          is_private_email: true,
          is_private_telephone: true
        }
      });

      let response = await request(app).get('/api/user/1').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'user1@example.com');
      expect(response.body).toHaveProperty('telephone', '12345');

      response = await request(app).get('/api/user/2').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', '');
      expect(response.body).toHaveProperty('telephone', '');

      response = await request(app).get('/api/user/2').set('Authorization', `Bearer ${tokenAdmin}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('email', 'user1@example.com');
      expect(response.body).toHaveProperty('telephone', '12345');
    });

    it('should return 404 if user not found', async () => {
      db_get.mockResolvedValueOnce({ row: null });

      const response = await request(app).get('/api/user/99').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_USER);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValueOnce({ err: 'DB error' });

      const response = await request(app).get('/api/user/1').set('Authorization', `Bearer ${token}`);

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
      token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.ADMIN }, config.jwtSecret, {
        expiresIn: '2h'
      });
      tokenGuest = jwt.sign({ id: 2, name: 'Guest User', email: 'guest@example.com', role: RoleTypes.GUEST }, config.jwtSecret, {
        expiresIn: '2h'
      });
      tokenUser = jwt.sign({ id: 3, name: 'User Two', email: 'user2@example.com', role: RoleTypes.USER }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should return 200 if user is successfully deleted', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).delete('/api/user/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe('User deleted successfully');
    });

    it('should return 403 with wrong role permissions', async () => {
      const response = await request(app).delete('/api/user/1').set('Authorization', `Bearer ${tokenGuest}`);
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);
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

    it('should allow a user to delete themselves', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      let response = await request(app).delete('/api/user/3').set('Authorization', `Bearer ${tokenUser}`);
      expect(response.status).toBe(200);
      expect(response.text).toBe('User deleted successfully');

      response = await request(app).delete('/api/user/2').set('Authorization', `Bearer ${tokenUser}`);
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);
    });

    it('should allow a manager to delete another user', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).delete('/api/user/3').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.text).toBe('User deleted successfully');
    });

    it('should not allow a guest to delete a user', async () => {
      const response = await request(app).delete('/api/user/2').set('Authorization', `Bearer ${tokenGuest}`);
      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);
    });
  });
});
