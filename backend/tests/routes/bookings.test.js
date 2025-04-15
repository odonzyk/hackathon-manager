const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const { db_run, db_get, db_all } = require('../../src/database');
const logger = require('../../src/logger');
const bookingsRouter = require('../../src/routes/bookings');

jest.mock('../../src/database');
jest.mock('../../src/logger');

const app = express();
app.use(express.json());
app.use('/api/bookings', bookingsRouter);

const { ErrorMsg } = require("../../src/constants");

describe('Bookings API Endpoints', () => {
    let token;

    beforeEach(() => {
        token = jwt.sign({ id: 1, name: 'Test User', email: 'test@example.com' }, config.jwtSecret, {
            expiresIn: '2h',
        });
    });

    // GET /api/bookings/list
    describe('GET /api/bookings/list', () => {
        it('should return a list of bookings', async () => {
            db_all.mockResolvedValue({ row: [{ id: 1, slot_id: 5, user_id: 2, status_id: 2 }] });

            const response = await request(app)
                .get('/api/bookings/list')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                { id: 1, type_id: 1, status_id: 2, slot_id: 5, user_id: 2, start_timeTS: null, end_timeTS: null, start_time: null, end_time: null },
            ]);
        });

        it('should return 404 if no bookings exist', async () => {
            db_all.mockResolvedValue({ row: [] });

            const response = await request(app)
                .get('/api/bookings/list')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_BOOKING);
        });

        it('should return 500 on database error', async () => {
            db_all.mockResolvedValue({ err: 'DB error' });

            const response = await request(app)
                .get('/api/bookings/list')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
        });

        it('should return 403 if unauthorized', async () => {
            const response = await request(app).get('/api/bookings/list');
            expect(response.status).toBe(403);
            expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
        });
    });

    // GET /api/bookings/user/:user_id
    describe('GET /api/bookings/user/:user_id', () => {
        it('should return a list of bookings for a specific user', async () => {
            db_all.mockResolvedValue({ row: [{ id: 1, slot_id: 5, user_id: 2, status_id: 2 }] });

            const response = await request(app)
                .get('/api/bookings/user/2')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual([
                { id: 1, type_id: 1, status_id: 2, slot_id: 5, user_id: 2, start_timeTS: null, end_timeTS: null, start_time: null, end_time: null },
            ]);
        });

        it('should return 404 if no bookings exist for the user', async () => {
            db_all.mockResolvedValue({ row: [] });

            const response = await request(app)
                .get('/api/bookings/user/2')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_BOOKING);
        });

        it('should return 500 on database error', async () => {
            db_all.mockResolvedValue({ err: 'DB error' });

            const response = await request(app)
                .get('/api/bookings/user/2')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
        });

        it('should return 403 if unauthorized', async () => {
            const response = await request(app).get('/api/bookings/user/2');
            expect(response.status).toBe(403);
            expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
        });
    });

    // DELETE /api/bookings/user/:user_id
    describe('DELETE /api/bookings/user/:user_id', () => {
        it('should delete all bookings of a specific user', async () => {
            db_run.mockResolvedValue({ changes: 3 });

            const response = await request(app)
                .delete('/api/bookings/user/2')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.text).toBe('3 bookings deleted successfully');
        });

        it('should return 404 if no bookings exist for the user', async () => {
            db_run.mockResolvedValue({ changes: 0 });

            const response = await request(app)
                .delete('/api/bookings/user/2')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_BOOKING);
        });

        it('should return 500 if database error occurs', async () => {
            db_run.mockResolvedValue({ err: 'DB error' });

            const response = await request(app)
                .delete('/api/bookings/user/2')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(500);
            expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
        });

        it('should return 403 if unauthorized', async () => {
            const response = await request(app).delete('/api/bookings/user/2');
            expect(response.status).toBe(403);
            expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
        });
    });

    // POST /api/bookings/
    describe('POST /api/bookings', () => {
        it('should create a new booking', async () => {
            db_run.mockResolvedValue({ lastID: 10, changes: 1 });

            let start_time = new Date();
            let end_time = new Date();
            end_time.setHours(18, 0, 0, 0);

            let response = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({ slot_id: 5, user_id: 2, start_time: start_time });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                { "id": 10, "slot_id": 5, "status_id": 2, "type_id": 1, "user_id": 2, "start_time": start_time.toISOString(), "start_timeTS": Math.floor(start_time.getTime() / 1000), "end_time": end_time.toISOString(), "end_timeTS": Math.floor(end_time.getTime() / 1000) }
            );

            start_time.setHours(19, 22, 30, 0);
            end_time.setHours(20, 0, 0, 0);
            response = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({ slot_id: 5, user_id: 2, start_time: start_time });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
                { "id": 10, "slot_id": 5, "status_id": 2, "type_id": 1, "user_id": 2, "start_time": start_time.toISOString(), "start_timeTS": Math.floor(start_time.getTime() / 1000), "end_time": end_time.toISOString(), "end_timeTS": Math.floor(end_time.getTime() / 1000) }
            );

        });

        it('should return 400 if slot_id or user_id is missing', async () => {
            let response = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({});
            expect(response.status).toBe(400);
            expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);

            response = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({ slot_id: 1 });
            expect(response.status).toBe(400);
            expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);

            response = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({ user_id: 1 });
            expect(response.status).toBe(400);
            expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
        });

        it('should return 500 if booking creation fails', async () => {
            db_run.mockResolvedValue({ err: 'DB error' });

            const response = await request(app)
                .post('/api/bookings')
                .set('Authorization', `Bearer ${token}`)
                .send({ slot_id: 5, user_id: 2 });

            expect(response.status).toBe(500);
            expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
        });

        it('should return 403 if unauthorized', async () => {
            const response = await request(app).post('/api/bookings');
            expect(response.status).toBe(403);
            expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
        });
    });

    // PUT /api/bookings/:id
    describe('PUT /api/bookings/:id', () => {
        it('should update an existing booking', async () => {
            db_get.mockResolvedValue({ row: { id: 10, user_id: 2, slot_id: 5, status_id: 2 } });
            db_run.mockResolvedValue({ changes: 1 });

            let updatedBooking = {
                type_id: 1,
                status_id: 3,
                slot_id: 6,
                user_id: 2,
                start_time: "2025-02-20T10:06:23.617Z",
                end_time: "2025-02-20T17:00:00.000Z",
            };

            let response = await request(app)
                .put('/api/bookings/10')
                .set('Authorization', `Bearer ${token}`)
                .send(updatedBooking);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject(updatedBooking);

            updatedBooking = {
                type_id: null,
                status_id: null,
                slot_id: null,
                user_id: 2,
                start_time: null,
                end_time: null,
            };

            response = await request(app)
                .put('/api/bookings/10')
                .set('Authorization', `Bearer ${token}`)
                .send(updatedBooking);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject({
                type_id: 1,
                status_id: 2,
                slot_id: 5,
                user_id: 2,
                start_time: null,
                end_time: null,
            });
        });

        it('should return XXX', async () => {
            let updatedBooking = {
                user_id: 2,
                start_time: "123456789",
            };

            let response = await request(app)
                .put('/api/bookings/10')
                .set('Authorization', `Bearer ${token}`)
                .send(updatedBooking);
            expect(response.status).toBe(400);
            expect(response.text).toBe(ErrorMsg.VALIDATION.INVALID_DATE_FORMAT);

            updatedBooking = {
                user_id: 2,
                end_time: "ABC-02-20T10:06:23.617Z",
            };

            response = await request(app)
                .put('/api/bookings/10')
                .set('Authorization', `Bearer ${token}`)
                .send(updatedBooking);
            expect(response.status).toBe(400);
            expect(response.text).toBe(ErrorMsg.VALIDATION.INVALID_DATE_FORMAT);
        });

        it('should return 400 if required fields are missing', async () => {
            let response = await request(app)
                .put('/api/bookings/10')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(response.status).toBe(400);
            expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);

            response = await request(app)
                .put('/api/bookings/10')
                .set('Authorization', `Bearer ${token}`)
                .send({ slot_id: 1 });
            expect(response.status).toBe(400);
            expect(response.text).toBe(ErrorMsg.VALIDATION.MISSING_FIELDS);
        });

        it('should return 404 if booking is not found', async () => {
            db_get.mockResolvedValue({ row: null });

            const response = await request(app)
                .put('/api/bookings/10')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type_id: 1,
                    status_id: 2,
                    slot_id: 5,
                    user_id: 2,
                    start_time: "2025-02-20T10:06:23.617Z",
                    end_time: "2025-02-20T17:00:00.000Z",
                });

            expect(response.status).toBe(404);
            expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_BOOKING);
        });

        it('should return 404 if booking is not owned by the user', async () => {
            db_get.mockResolvedValue({ row: { id: 10, user_id: 99, slot_id: 5, status_id: 2 } });

            const response = await request(app)
                .put('/api/bookings/10')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type_id: 1,
                    status_id: 2,
                    slot_id: 5,
                    user_id: 2,
                    start_time: "2025-02-20T10:06:23.617Z",
                    end_time: "2025-02-20T17:00:00.000Z",
                });

            expect(response.status).toBe(404);
            expect(response.text).toBe(ErrorMsg.VALIDATION.WRONG_USER);
        });

        it('should return 500 if database update fails', async () => {
            db_get.mockResolvedValue({ row: { id: 10, user_id: 2, slot_id: 5, status_id: 2 } });
            db_run.mockResolvedValue({ err: 'DB error' });

            const response = await request(app)
                .put('/api/bookings/10')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    type_id: 1,
                    status_id: 2,
                    slot_id: 5,
                    user_id: 2,
                    start_time: "2025-02-20T10:06:23.617Z",
                    end_time: "2025-02-20T17:00:00.000Z",
                });

            expect(response.status).toBe(500);
            expect(response.text).toBe(ErrorMsg.SERVER.ERROR);
        });

        it('should return 403 if unauthorized', async () => {
            const response = await request(app).put('/api/bookings/10');
            expect(response.status).toBe(403);
            expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
        });
    });

    // GET /api/bookings/:id
    describe('GET /api/bookings/:id', () => {
        it('should return a specific booking', async () => {
            db_get.mockResolvedValue({ row: { id: 1, slot_id: 5, user_id: 2, status_id: 2 } });

            const response = await request(app)
                .get('/api/bookings/1')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            console.log(request.body);
            expect(response.body).toEqual(    
                { id: 1, type_id: 1, status_id: 2, slot_id: 5, user_id: 2, start_timeTS: null, end_timeTS: null, start_time: null, end_time: null },
            );
        });

        it('should return 404 if booking not found', async () => {
            db_get.mockResolvedValue({ row: null });

            const response = await request(app)
                .get('/api/bookings/1')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_BOOKING);
        });

        it('should return 403 if unauthorized', async () => {
            const response = await request(app).get('/api/bookings/1');
            expect(response.status).toBe(403);
            expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
        });
    });

    // DELETE /api/bookings/:id
    describe('DELETE /api/bookings/:id', () => {
        it('should delete a booking', async () => {
            db_get.mockResolvedValue({ row: { id: 1, slot_id: 5, user_id: 2, status_id: 2 } });
            db_run.mockResolvedValue({ changes: 1 });

            const response = await request(app)
                .delete('/api/bookings/1')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toMatchObject(    
                { id: 1, type_id: 1, status_id: 4, slot_id: 5, user_id: 2},
            );
        });

        it('should return 404 if booking not found', async () => {
            db_run.mockResolvedValue({ changes: 0 });

            const response = await request(app)
                .delete('/api/bookings/1')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.text).toBe(ErrorMsg.NOT_FOUND.NO_BOOKING);
        });

        it('should return 403 if unauthorized', async () => {
            const response = await request(app).delete('/api/bookings/1');
            expect(response.status).toBe(403);
            expect(response.text).toBe(ErrorMsg.AUTH.INVALID_TOKEN);
        });
    });
});