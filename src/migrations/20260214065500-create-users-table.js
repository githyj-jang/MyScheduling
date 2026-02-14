'use strict';

/**
 * Users Table Migration
 * 
 * 전문가 계정 테이블 (영양사, 트레이너, 관리자)
 * Role-Based Access Control (RBAC) 지원
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
        comment: '사용자 아이디 (로그인용)'
      },
      email: {
        type: Sequelize.STRING(255),
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true
        },
        comment: '이메일 주소'
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'bcrypt 해싱된 비밀번호'
      },
      role: {
        type: Sequelize.ENUM('admin', 'nutritionist', 'trainer'),
        allowNull: false,
        defaultValue: 'nutritionist',
        comment: '사용자 역할 (admin: 관리자, nutritionist: 영양사, trainer: 트레이너)'
      },
      full_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '실명'
      },
      license_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: '전문가 자격증 번호'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '전화번호'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: '계정 활성화 상태'
      },
      last_login_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: '마지막 로그인 시간'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // 인덱스 생성 (성능 최적화)
    await queryInterface.addIndex('users', ['username']);
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['role']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
