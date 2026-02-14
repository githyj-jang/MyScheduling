'use strict';

/**
 * Clients Table Migration
 * 
 * 고객 정보 테이블
 * 전문가(Users)가 관리하는 고객들의 기본 정보 및 건강 데이터
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('clients', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: '담당 전문가 ID'
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '고객 이름'
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true
        },
        comment: '고객 이메일'
      },
      phone: {
        type: Sequelize.STRING(20),
        allowNull: true,
        comment: '전화번호'
      },
      birth_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: '생년월일'
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true,
        comment: '성별'
      },
      height_cm: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: '키 (cm)'
      },
      weight_kg: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: '현재 체중 (kg)'
      },
      target_weight_kg: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: '목표 체중 (kg)'
      },
      activity_level: {
        type: Sequelize.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
        allowNull: true,
        defaultValue: 'moderate',
        comment: '활동 수준'
      },
      health_goals: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '건강 목표'
      },
      allergies: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '알레르기 정보'
      },
      medical_conditions: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '기저 질환'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '기타 메모'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: '활성 고객 여부'
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

    // 인덱스 생성
    await queryInterface.addIndex('clients', ['user_id']);
    await queryInterface.addIndex('clients', ['email']);
    await queryInterface.addIndex('clients', ['is_active']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('clients');
  }
};
