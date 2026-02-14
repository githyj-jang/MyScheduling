const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Meal = sequelize.define('Meal', {
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
  mealDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'meal_date'
  },
  mealType: {
    type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack', 'other'),
    allowNull: false,
    field: 'meal_type'
  },
  foodName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'food_name',
    validate: {
      notEmpty: true
    }
  },
  portionSize: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'portion_size'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'meals',
  underscored: true,
  timestamps: true,
  updatedAt: 'updated_at',
  createdAt: 'created_at'
});

// Associations
Meal.associate = (models) => {
  Meal.belongsTo(models.Client, {
    foreignKey: 'client_id',
    as: 'client'
  });
  Meal.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'recordedBy'
  });
  Meal.hasOne(models.Nutrition, {
    foreignKey: 'meal_id',
    as: 'nutrition'
  });
};

module.exports = Meal;
