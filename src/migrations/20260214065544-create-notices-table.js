'use strict';

/**
 * Notices Table Migration
 * 
 * 게시판 테이블
 * 공지사항, 팁, Q&A 등
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('notices', {
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
        comment: '작성자 ID'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: '제목'
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: '내용'
      },
      category: {
        type: Sequelize.ENUM('notice', 'tip', 'qa', 'general'),
        allowNull: false,
        defaultValue: 'general',
        comment: '게시글 분류'
      },
      views: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '조회수'
      },
      is_pinned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: '상단 고정 여부'
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
    await queryInterface.addIndex('notices', ['user_id']);
    await queryInterface.addIndex('notices', ['category']);
    await queryInterface.addIndex('notices', ['is_pinned']);
    await queryInterface.addIndex('notices', ['created_at']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('notices');
  }
};
