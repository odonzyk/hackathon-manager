const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const { ErrorMsg, RoleTypes } = require('../../src/constants');
const projectRouter = require('../../src/routes/project');
const { db_get, db_run, db_all } = require('../../src/utils/db/dbUtils');

jest.mock('../../src/utils/db/dbUtils');
jest.mock('../../src/logger'); // Mock des Loggers

const app = express();
app.use(express.json());
app.use('/api/project', projectRouter);

describe('Project API Endpoints', () => {
  let token;
  let tokenManager;

  beforeEach(() => {
    token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com', role: RoleTypes.USER }, config.jwtSecret, {
      expiresIn: '2h'
    });
    tokenManager = jwt.sign({ id: 2, name: 'Test Manager', email: 'test@example.com', role: RoleTypes.MANAGER }, config.jwtSecret, {
      expiresIn: '2h'
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // *** GET /api/project/list/:event_id ***
  describe('GET /api/project/list/:event_id', () => {
    it('should return 200 and a list of projects for the event', async () => {
      db_all.mockResolvedValue({
        row: [
          { id: 1, idea: 'Project One', description: 'Description One', event_id: 1 },
          { id: 2, idea: 'Project Two', description: 'Description Two', event_id: 1 }
        ]
      });

      const response = await request(app).get('/api/project/list/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('idea', 'Project One');
    });

    it('should return 404 if no projects exist for the event', async () => {
      db_all.mockResolvedValue({ row: [] });

      const response = await request(app).get('/api/project/list/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PROJECT);
    });

    it('should return 500 on database error', async () => {
      db_all.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).get('/api/project/list/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** GET /api/project/list ***
  describe('GET /api/project/list', () => {
    it('should return 200 and a list of all projects', async () => {
      db_all.mockResolvedValue({
        row: [
          { id: 1, idea: 'Project One', description: 'Description One' },
          { id: 2, idea: 'Project Two', description: 'Description Two' }
        ]
      });

      const response = await request(app).get('/api/project/list').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return 404 if no projects exist', async () => {
      db_all.mockResolvedValue({ row: [] });

      const response = await request(app).get('/api/project/list').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PROJECT);
    });

    it('should return 500 on database error', async () => {
      db_all.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).get('/api/project/list').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** GET /api/project/listByUser/:id ***
  describe('GET /api/project/listByUser/:id', () => {
    it('should return 200 and a list of projects for the user', async () => {
      db_all.mockResolvedValue({
        row: [
          { id: 1, idea: 'Project One', description: 'Description One', user_id: 1 },
          { id: 2, idea: 'Project Two', description: 'Description Two', user_id: 1 }
        ]
      });

      const response = await request(app).get('/api/project/listByUser/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });

    it('should return 404 if no projects exist for the user', async () => {
      db_all.mockResolvedValue({ row: [] });

      const response = await request(app).get('/api/project/listByUser/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PROJECT);
    });

    it('should return 500 on database error', async () => {
      db_all.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).get('/api/project/listByUser/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** POST /api/project ***
  describe('POST /api/project', () => {
    it('should create a project and return 201', async () => {
      db_get.mockResolvedValueOnce({ row: null });
      db_run.mockResolvedValueOnce({ lastID: 1, changes: 1 });
      db_run.mockResolvedValueOnce({ lastID: 1, changes: 1 });
      db_all.mockResolvedValueOnce({ row: [{ id: 1, name: 'Test User 1', avatar_url: 'example.com/a1.png' }] });
      db_all.mockResolvedValueOnce({ row: [{ id: 2, name: 'Test User 2', avatar_url: 'example.com/a2.png' }] });

      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${tokenManager}`)
        .send({
          event_id: 1,
          idea: 'New Project',
          description: 'Project Description',
          initiators: [{ id: 1 }]
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('idea', 'New Project');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app).post('/api/project').set('Authorization', `Bearer ${tokenManager}`).send({ event_id: 1 });

      expect(response.status).toBe(400);
      expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
    });

    it('should return 409 for duplicate project idea', async () => {
      db_get.mockResolvedValue({ row: { id: 1, idea: 'Existing Project' } });

      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${tokenManager}`)
        .send({
          event_id: 1,
          idea: 'Existing Project',
          description: 'Project Description',
          initiators: [{ id: 1 }]
        });

      expect(response.status).toBe(409);
      expect(response.text).toBe(ErrorMsg.VALIDATION.CONFLICT);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app)
        .post('/api/project')
        .set('Authorization', `Bearer ${tokenManager}`)
        .send({
          event_id: 1,
          idea: 'New Project',
          description: 'Project Description',
          initiators: [{ id: 1 }]
        });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** PUT /api/project/:id ***
  describe('PUT /api/project/:id', () => {
    it('should update a project and return 200', async () => {
      db_get.mockResolvedValueOnce({ row: { id: 1, idea: 'Old Project', description: 'Old Description' } });
      db_get.mockResolvedValueOnce({ row: null });
      db_run.mockResolvedValueOnce({ changes: 1 });

      const response = await request(app).put('/api/project/1').set('Authorization', `Bearer ${tokenManager}`).send({
        event_id: 1,
        idea: 'Updated Project',
        description: 'Updated Description'
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('idea', 'Updated Project');
    });

    it('should return 404 if project does not exist', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app).put('/api/project/1').set('Authorization', `Bearer ${tokenManager}`).send({
        event_id: 1,
        idea: 'Updated Project',
        description: 'Updated Description'
      });

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PROJECT);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).put('/api/project/1').set('Authorization', `Bearer ${tokenManager}`).send({
        event_id: 1,
        idea: 'Updated Project',
        description: 'Updated Description'
      });

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });

  // *** GET /api/project/:id ***
  describe('GET /api/project/:id', () => {
    it('should return 200 and the project details', async () => {
      db_get.mockResolvedValueOnce({
        row: {
          id: 1,
          event_id: 1,
          status_id: 1,
          idea: 'Project One',
          description: 'Description One',
          team_name: 'Team One',
          team_avatar_url: 'avatar_url',
          goal: 'Goal One',
          components: 'Components One',
          skills: 'Skills One'
        }
      });
      db_all.mockResolvedValueOnce({ row: [{ id: 1, name: 'Test User 1', avatar_url: 'example.com/a1.png' }] });
      db_all.mockResolvedValueOnce({ row: [{ id: 2, name: 'Test User 2', avatar_url: 'example.com/a2.png' }] });

      const response = await request(app).get('/api/project/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('idea', 'Project One');
      expect(response.body).toHaveProperty('description', 'Description One');
      expect(response.body).toHaveProperty('team_name', 'Team One');
      expect(response.body).toHaveProperty('goal', 'Goal One');
    });

    it('should return 404 if the project does not exist', async () => {
      db_get.mockResolvedValue({ row: null });

      const response = await request(app).get('/api/project/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PROJECT);
    });

    it('should return 500 on database error', async () => {
      db_get.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).get('/api/project/1').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });

    it('should return 403 for insufficient permissions', async () => {
      const tokenGuest = jwt.sign({ id: 2, name: 'Guest User', email: 'guest@example.com', role: RoleTypes.GUEST }, config.jwtSecret, {
        expiresIn: '2h'
      });

      const response = await request(app).get('/api/project/1').set('Authorization', `Bearer ${tokenGuest}`);

      expect(response.status).toBe(403);
      expect(response.text).toBe(ErrorMsg.AUTH.NO_PERMISSION);
    });
  });

  // *** DELETE /api/project/:id ***
  describe('DELETE /api/project/:id', () => {
    let adminToken;

    beforeEach(() => {
      adminToken = jwt.sign({ id: 3, name: 'Admin User', email: 'admin@example.com', role: RoleTypes.ADMIN }, config.jwtSecret, {
        expiresIn: '2h'
      });
    });

    it('should delete a project and return 200', async () => {
      db_run.mockResolvedValue({ changes: 1 });

      const response = await request(app).delete('/api/project/1').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.text).toBe('Project deleted successfully');
    });

    it('should return 404 if project does not exist', async () => {
      db_run.mockResolvedValue({ changes: 0 });

      const response = await request(app).delete('/api/project/1').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_PROJECT);
    });

    it('should return 500 on database error', async () => {
      db_run.mockResolvedValue({ err: 'DB error' });

      const response = await request(app).delete('/api/project/1').set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(500);
      expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
    });
  });
});
