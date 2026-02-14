'use strict';

/**
 * MealPlans Table Migration
 * 
 * 식단 계획 템플릿 테이블
 * 전문가가 고객을 위해 작성하는 식단 계획
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('meal_plans', {
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
        comment: '작성 전문가 ID'
      },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: '대상 고객 ID (NULL이면 템플릿)'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '계획 제목'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '계획 설명'
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: '시작일'
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true,
        comment: '종료일'
      },
      target_calories: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: '목표 칼로리 (kcal)'
      },
      meals_json: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: '식단 계획 데이터 (JSON 형식)'
      },
      is_template: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: '템플릿 여부'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: '활성 상태'
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
    await queryInterface.addIndex('meal_plans', ['user_id']);
    await queryInterface.addIndex('meal_plans', ['client_id']);
    await queryInterface.addIndex('meal_plans', ['is_template']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('meal_plans');
  }
};
