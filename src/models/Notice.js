const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Notice = sequelize.define('Notice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  category: {
    type: DataTypes.ENUM('notice', 'tip', 'qa', 'general'),
    allowNull: false,
    defaultValue: 'general'
  },
  views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isPinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_pinned'
  }
}, {
  tableName: 'notices',
  underscored: true,
  timestamps: true
});

// Instance methods
Notice.prototype.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Associations
Notice.associate = (models) => {
  Notice.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'author'
  });
};

module.exports = Notice;
