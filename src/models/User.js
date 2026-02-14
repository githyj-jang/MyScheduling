const { DataTypes } = require('sequelize');
const { sequelize } = require('../config');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'nutritionist', 'trainer'),
    allowNull: false,
    defaultValue: 'nutritionist'
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'full_name'
  },
  licenseNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'license_number'
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
    field: 'is_active'
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at'
  }
}, {
  tableName: 'users',
  underscored: true,
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

// Associations
User.associate = (models) => {
  User.hasMany(models.Client, {
    foreignKey: 'user_id',
    as: 'clients'
  });
  User.hasMany(models.Meal, {
    foreignKey: 'user_id',
    as: 'meals'
  });
  User.hasMany(models.MealPlan, {
    foreignKey: 'user_id',
    as: 'mealPlans'
  });
  User.hasMany(models.Report, {
    foreignKey: 'user_id',
    as: 'reports'
  });
  User.hasMany(models.Notice, {
    foreignKey: 'user_id',
    as: 'notices'
  });
};

module.exports = User;
