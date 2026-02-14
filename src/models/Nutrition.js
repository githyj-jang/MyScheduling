const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');

const Nutrition = sequelize.define('Nutrition', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  mealId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    field: 'meal_id'
  },
  energyKcal: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'energy_kcal'
  },
  proteinG: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'protein_g'
  },
  carbsG: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'carbs_g'
  },
  fatG: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'fat_g'
  },
  fiberG: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'fiber_g'
  },
  sodiumMg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'sodium_mg'
  },
  calciumMg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'calcium_mg'
  },
  ironMg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'iron_mg'
  },
  zincMg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'zinc_mg'
  },
  folicAcidMcg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'folic_acid_mcg'
  },
  vitaminAMcg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'vitamin_a_mcg'
  },
  vitaminCMg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'vitamin_c_mg'
  },
  cholesterolMg: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    defaultValue: 0,
    field: 'cholesterol_mg'
  }
}, {
  tableName: 'nutrition',
  underscored: true,
  timestamps: true
});

// Associations
Nutrition.associate = (models) => {
  Nutrition.belongsTo(models.Meal, {
    foreignKey: 'meal_id',
    as: 'meal'
  });
};

module.exports = Nutrition;
