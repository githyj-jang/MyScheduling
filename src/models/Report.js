const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'client_id'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id'
  },
  reportType: {
    type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'custom'),
    allowNull: false,
    field: 'report_type'
  },
  periodStart: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'period_start'
  },
  periodEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'period_end'
  },
  summaryJson: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'summary_json'
  },
  recommendations: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'reports',
  underscored: true,
  timestamps: true
});

// Associations
Report.associate = (models) => {
  Report.belongsTo(models.Client, {
    foreignKey: 'client_id',
    as: 'client'
  });
  Report.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'createdBy'
  });
};

module.exports = Report;
