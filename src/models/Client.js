const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Client = sequelize.define('Client', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  birthDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'birth_date'
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: true
  },
  heightCm: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'height_cm'
  },
  weightKg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'weight_kg'
  },
  targetWeightKg: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    field: 'target_weight_kg'
  },
  activityLevel: {
    type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active', 'very_active'),
    allowNull: true,
    defaultValue: 'moderate',
    field: 'activity_level'
  },
  healthGoals: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'health_goals'
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  medicalConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'medical_conditions'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active'
  }
}, {
  tableName: 'clients',
  underscored: true,
  timestamps: true
});

// Associations
Client.associate = (models) => {
  Client.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'nutritionist'
  });
  Client.hasMany(models.Meal, {
    foreignKey: 'client_id',
    as: 'meals'
  });
  Client.hasMany(models.MealPlan, {
    foreignKey: 'client_id',
    as: 'mealPlans'
  });
  Client.hasMany(models.Report, {
    foreignKey: 'client_id',
    as: 'reports'
  });
};

module.exports = Client;
