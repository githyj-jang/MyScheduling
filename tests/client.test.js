require('dotenv').config({ path: '.env.test' });
const request = require('supertest');
const express = require('express');
const clientRoutes = require('../src/routes/clientRoutes');
const authRoutes = require('../src/routes/authRoutes');
const { setupTestDatabase, cleanupTestDatabase, createTestUser, generateToken } = require('./setup');
const { User, Client } = require('../src/models');
const errorHandler = require('../src/middlewares/errorHandler');

// Express 앱 설정
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use(errorHandler);

describe('Client API', () => {
  let token;
  let user;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  beforeEach(async () => {
    // 테스트용 사용자 생성
    user = await createTestUser();
    token = generateToken(user);
  });

  afterEach(async () => {
    // 데이터 정리
    await Client.destroy({ where: {}, truncate: true, cascade: true });
    await User.destroy({ where: {}, truncate: true, cascade: true });
  });

  describe('POST /api/clients', () => {
    it('should create a new client successfully', async () => {
      const clientData = {
        name: '홍길동',
        age: 30,
        gender: 'male',
        height: 175,
        weight: 70,
        goal: 'weight_loss',
        activityLevel: 'moderate',
        phone: '010-1234-5678',
        email: 'hong@example.com'
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(clientData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(clientData.name);
      expect(response.body.data.age).toBe(clientData.age);
      expect(response.body.data.user_id).toBe(user.id);
    });

    it('should fail without authentication', async () => {
      const clientData = {
        name: '홍길동',
        age: 30,
        gender: 'male',
        height: 175,
        weight: 70,
        goal: 'weight_loss'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid data', async () => {
      const clientData = {
        name: 'A', // Too short
        age: 'invalid',
        gender: 'invalid'
      };

      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .send(clientData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/clients', () => {
    beforeEach(async () => {
      // 테스트 데이터 생성
      await Client.bulkCreate([
        {
          user_id: user.id,
          name: '고객1',
          age: 25,
          gender: 'male',
          height: 175,
          weight: 70,
          goal: 'weight_loss',
          activity_level: 'moderate'
        },
        {
          user_id: user.id,
          name: '고객2',
          age: 30,
          gender: 'female',
          height: 160,
          weight: 55,
          goal: 'muscle_gain',
          activity_level: 'active'
        }
      ]);
    });

    it('should get all clients for authenticated user', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clients).toHaveLength(2);
      expect(response.body.data.pagination.total).toBe(2);
    });

    it('should filter by goal', async () => {
      const response = await request(app)
        .get('/api/clients?goal=weight_loss')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clients).toHaveLength(1);
      expect(response.body.data.clients[0].goal).toBe('weight_loss');
    });

    it('should search by name', async () => {
      const response = await request(app)
        .get('/api/clients?search=고객1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clients).toHaveLength(1);
      expect(response.body.data.clients[0].name).toContain('고객1');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/clients?page=1&limit=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.clients).toHaveLength(1);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/clients/:id', () => {
    let client;

    beforeEach(async () => {
      client = await Client.create({
        user_id: user.id,
        name: '테스트고객',
        age: 28,
        gender: 'male',
        height: 180,
        weight: 75,
        goal: 'maintenance',
        activity_level: 'moderate'
      });
    });

    it('should get client by id', async () => {
      const response = await request(app)
        .get(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(client.id);
      expect(response.body.data.name).toBe('테스트고객');
    });

    it('should fail for non-existent client', async () => {
      const response = await request(app)
        .get('/api/clients/99999')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail for other user\'s client', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com'
      });
      const otherToken = generateToken(otherUser);

      const response = await request(app)
        .get(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/clients/:id', () => {
    let client;

    beforeEach(async () => {
      client = await Client.create({
        user_id: user.id,
        name: '수정전',
        age: 28,
        gender: 'male',
        height: 180,
        weight: 75,
        goal: 'maintenance',
        activity_level: 'moderate'
      });
    });

    it('should update client successfully', async () => {
      const updateData = {
        name: '수정후',
        weight: 72
      };

      const response = await request(app)
        .put(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('수정후');
      expect(response.body.data.weight).toBe(72);
      expect(response.body.data.age).toBe(28); // 변경되지 않은 필드
    });

    it('should fail to update other user\'s client', async () => {
      const otherUser = await createTestUser({
        username: 'otheruser',
        email: 'other@example.com'
      });
      const otherToken = generateToken(otherUser);

      const response = await request(app)
        .put(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ name: '해킹시도' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/clients/:id', () => {
    let client;

    beforeEach(async () => {
      client = await Client.create({
        user_id: user.id,
        name: '삭제테스트',
        age: 28,
        gender: 'male',
        height: 180,
        weight: 75,
        goal: 'maintenance',
        activity_level: 'moderate'
      });
    });

    it('should soft delete client', async () => {
      const response = await request(app)
        .delete(`/api/clients/${client.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);

      // 비활성화 확인
      const deletedClient = await Client.findByPk(client.id);
      expect(deletedClient.is_active).toBe(false);
    });
  });
});
