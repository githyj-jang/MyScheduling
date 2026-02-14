const { sequelize } = require('../config');

const User = require('./User');
const Client = require('./Client');
const Meal = require('./Meal');
const Nutrition = require('./Nutrition');
const MealPlan = require('./MealPlan');
const Report = require('./Report');
const Notice = require('./Notice');

const models = {
  User,
  Client,
  Meal,
  Nutrition,
  MealPlan,
  Report,
  Notice
};

// Initialize associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
