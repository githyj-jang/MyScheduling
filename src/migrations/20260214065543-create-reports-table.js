'use strict';

/**
 * Reports Table Migration
 * 
 * 분석 리포트 테이블
 * 고객의 영양 섭취 분석 결과
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('reports', {
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
        comment: '작성 전문가 ID'
      },
      report_type: {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'custom'),
        allowNull: false,
        comment: '리포트 종류'
      },
      period_start: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: '분서 기간 시작일'
      },
      period_end: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        comment: '분서 기간 종료일'
      },
      summary_json: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: '분서 결과 데이터 (JSON 형식)'
      },
      recommendations: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '전문가 권고사항'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: '추가 메모'
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
    await queryInterface.addIndex('reports', ['client_id']);
    await queryInterface.addIndex('reports', ['user_id']);
    await queryInterface.addIndex('reports', ['report_type']);
    await queryInterface.addIndex('reports', ['period_start', 'period_end']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('reports');
  }
};
