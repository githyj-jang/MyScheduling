const { Client, Meal, MealPlan, Report } = require('../models');
const logger = require('../utils/logger');
const { NotFoundError, ForbiddenError } = require('../utils/errors');

const checkClientOwnership = async (req, res, next) => {
  try {
    const clientId = req.params.id || req.body.client_id;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'admin') {
      return next();
    }

    const client = await Client.findByPk(clientId);

    if (!client) {
      throw new NotFoundError('Client');
    }

    if (client.user_id !== userId) {
      logger.warn(
        `Ownership violation: ${req.user.username} tried to access client ${clientId} owned by ${client.user_id}`
      );
      throw new ForbiddenError('Access denied. You can only access your own clients.');
    }

    req.client = client;
    next();
  } catch (error) {
    next(error);
  }
};

const checkMealOwnership = async (req, res, next) => {
  try {
    const mealId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'admin') {
      return next();
    }

    const meal = await Meal.findByPk(mealId, {
      include: [{
        model: Client,
        attributes: ['user_id']
      }]
    });

    if (!meal) {
      throw new NotFoundError('Meal');
    }

    const isOwner = meal.user_id === userId || meal.Client?.user_id === userId;

    if (!isOwner) {
      throw new ForbiddenError('Access denied. You can only access your own meals.');
    }

    req.meal = meal;
    next();
  } catch (error) {
    next(error);
  }
};

const checkMealPlanOwnership = async (req, res, next) => {
  try {
    const planId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'admin') {
      return next();
    }

    const plan = await MealPlan.findByPk(planId);

    if (!plan) {
      throw new NotFoundError('Meal plan');
    }

    if (plan.user_id !== userId) {
      throw new ForbiddenError('Access denied. You can only access your own meal plans.');
    }

    req.mealPlan = plan;
    next();
  } catch (error) {
    next(error);
  }
};

const checkReportOwnership = async (req, res, next) => {
  try {
    const reportId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'admin') {
      return next();
    }

    const report = await Report.findByPk(reportId);

    if (!report) {
      throw new NotFoundError('Report');
    }

    if (report.user_id !== userId) {
      throw new ForbiddenError('Access denied. You can only access your own reports.');
    }

    req.report = report;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkClientOwnership,
  checkMealOwnership,
  checkMealPlanOwnership,
  checkReportOwnership
};
