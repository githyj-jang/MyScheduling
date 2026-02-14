'use strict';

/**
 * Nutrition Table Migration
 * 
 * 영양소 정보 테이블
 * 각 식사의 상세 영양소 정보
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('nutrition', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      meal_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'meals',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: '식사 ID (1:1 관계)'
      },
      energy_kcal: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '에너지 (kcal)'
      },
      protein_g: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '단백질 (g)'
      },
      carbs_g: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '탄수화물 (g)'
      },
      fat_g: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '지방 (g)'
      },
      fiber_g: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '식이섬유 (g)'
      },
      sodium_mg: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '나트륨 (mg)'
      },
      calcium_mg: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '칼슘 (mg)'
      },
      iron_mg: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '철분 (mg)'
      },
      zinc_mg: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '아연 (mg)'
      },
      folic_acid_mcg: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '엽산 (mcg)'
      },
      vitamin_a_mcg: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '비타민 A (mcg)'
      },
      vitamin_c_mg: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '비타민 C (mg)'
      },
      cholesterol_mg: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 0,
        comment: '콜레스테롤 (mg)'
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
    await queryInterface.addIndex('nutrition', ['meal_id']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('nutrition');
  }
};
