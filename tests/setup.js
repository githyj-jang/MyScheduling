const { sequelize } = require('../src/models');
const { User } = require('../src/models');
const bcrypt = require('bcrypt');

// Test 데이터베이스 설정
const setupTestDatabase = async () => {
  try {
    // 모든 테이블 삭제 후 재생성
    await sequelize.sync({ force: true });
    console.log('✅ Test database initialized');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  }
};

// Test 데이터베이스 정리
const cleanupTestDatabase = async () => {
  try {
    await sequelize.close();
    console.log('✅ Test database connection closed');
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error);
  }
};

// Test 사용자 생성 헬퍼
const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: await bcrypt.hash('Test1234!', 10),
    fullName: 'Test User',
    role: 'nutritionist',
    is_active: true
  };

  const user = await User.create({ ...defaultUser, ...overrides });
  return user;
};

// Admin 사용자 생성 헬퍼
const createAdminUser = async () => {
  return await createTestUser({
    username: 'admin',
    email: 'admin@example.com',
    fullName: 'Admin User',
    role: 'admin'
  });
};

// JWT 토큰 생성 헬퍼
const generateToken = (user) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h', issuer: process.env.JWT_ISSUER, audience: process.env.JWT_AUDIENCE }
  );
};

module.exports = {
  setupTestDatabase,
  cleanupTestDatabase,
  createTestUser,
  createAdminUser,
  generateToken
};
