const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const MealPlan = sequelize.define('MealPlan', {
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
  clientId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'client_id'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'end_date'
  },
  targetCalories: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'target_calories'
  },
  mealsJson: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'meals_json'
  },
  isTemplate: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
    field: 'is_template'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active'
  }
}, {
  tableName: 'meal_plans',
  underscored: true,
  timestamps: true
});

// Associations
MealPlan.associate = (models) => {
  MealPlan.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'createdBy'
  });
  MealPlan.belongsTo(models.Client, {
    foreignKey: 'client_id',
    as: 'client'
  });
};

module.exports = MealPlan;
