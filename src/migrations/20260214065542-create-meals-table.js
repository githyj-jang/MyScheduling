'use strict';

/**
 * Meals Table Migration
 * 
 * 식단 기록 테이블
 * 고객의 일일 식사 기록
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('meals', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      client_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: '고객 ID'
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
        comment: '기록한 전문가 ID'
      },
      meal_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: '식사 날짜'
      },
      meal_type: {
        type: Sequelize.ENUM('breakfast', 'lunch', 'dinner', 'snack', 'other'),
        allowNull: false,
        comment: '식사 종류'
      },
      food_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '음식 이름'
      },
      portion_size: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: '1인분, 200g 등'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '메모'
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
    await queryInterface.addIndex('meals', ['client_id']);
    await queryInterface.addIndex('meals', ['user_id']);
    await queryInterface.addIndex('meals', ['meal_date']);
    await queryInterface.addIndex('meals', ['client_id', 'meal_date']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('meals');
  }
};
