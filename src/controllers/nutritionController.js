const catchAsync = require('../utils/catchAsync');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');
const { Client } = require('../models');
const nutritionService = require('../services/nutritionService');
const logger = require('../utils/logger');

/**
 * 일일 영양 분석
 */
exports.analyzeDailyNutrition = catchAsync(async (req, res) => {
  const { clientId, date } = req.params;

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only analyze your own clients');
  }

  const analysis = await nutritionService.analyzeDailyNutrition(parseInt(clientId), date);

  logger.info(`${req.user.username} analyzed daily nutrition for client ${clientId} on ${date}`);

  res.json({
    success: true,
    data: {
      client: {
        id: client.id,
        name: client.name,
        goal: client.goal
      },
      analysis
    }
  });
});

/**
 * 기간별 영양 추세 분석
 */
exports.analyzeTrend = catchAsync(async (req, res) => {
  const { clientId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ValidationError('Start date and end date are required');
  }

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only analyze your own clients');
  }

  const trend = await nutritionService.analyzeTrend(parseInt(clientId), startDate, endDate);

  logger.info(
    `${req.user.username} analyzed nutrition trend for client ${clientId} (${startDate} to ${endDate})`
  );

  res.json({
    success: true,
    data: {
      client: {
        id: client.id,
        name: client.name,
        goal: client.goal
      },
      trend
    }
  });
});

/**
 * 영양 상태 평가
 */
exports.evaluateNutritionalStatus = catchAsync(async (req, res) => {
  const { clientId } = req.params;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new ValidationError('Start date and end date are required');
  }

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only evaluate your own clients');
  }

  const evaluation = await nutritionService.evaluateNutritionalStatus(
    parseInt(clientId),
    startDate,
    endDate
  );

  logger.info(
    `${req.user.username} evaluated nutritional status for client ${clientId} (${startDate} to ${endDate})`
  );

  res.json({
    success: true,
    data: evaluation
  });
});

/**
 * 권장 섭취량 계산
 */
exports.getRecommendedIntake = catchAsync(async (req, res) => {
  const { clientId } = req.params;

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only access your own clients');
  }

  const recommendations = nutritionService.calculateRecommendedIntake(client);

  res.json({
    success: true,
    data: {
      client: {
        id: client.id,
        name: client.name,
        goal: client.goal,
        age: client.age,
        gender: client.gender,
        height: client.height,
        weight: client.weight,
        activityLevel: client.activity_level
      },
      recommendations
    }
  });
});

module.exports = exports;
