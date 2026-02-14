const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Report, Client, User, Meal, Nutrition } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * 리포트 목록 조회
 */
exports.getAll = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, clientId, reportType, startDate, endDate } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  // 고객 필터
  if (clientId) {
    where.client_id = clientId;
  }

  // 리포트 타입 필터
  if (reportType) {
    where.report_type = reportType;
  }

  // 기간 필터
  if (startDate || endDate) {
    where.period_start = {};
    if (startDate) where.period_start[Op.gte] = new Date(startDate);
    if (endDate) where.period_end = { [Op.lte]: new Date(endDate) };
  }

  // admin이 아니면 자신의 리포트만 조회
  if (req.user.role !== 'admin') {
    where.user_id = req.user.id;
  }

  const { count, rows } = await Report.findAndCountAll({
    where,
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'goal']
      },
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      }
    ],
    limit: parseInt(limit),
    offset,
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      reports: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    }
  });
});

/**
 * 단일 리포트 조회
 */
exports.getOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const report = await Report.findByPk(id, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'goal', 'height', 'weight', 'age', 'gender']
      },
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      }
    ]
  });

  if (!report) {
    throw new NotFoundError('Report');
  }

  // 소유권 확인
  if (req.user.role !== 'admin' && report.user_id !== req.user.id) {
    throw new ForbiddenError('You can only access your own reports');
  }

  res.json({
    success: true,
    data: report
  });
});

/**
 * 리포트 생성 (영양 분석 포함)
 */
exports.create = catchAsync(async (req, res) => {
  const {
    clientId,
    reportType,
    periodStart,
    periodEnd,
    recommendations,
    notes
  } = req.body;

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only create reports for your own clients');
  }

  // 기간 내 식단 데이터 조회
  const meals = await Meal.findAll({
    where: {
      client_id: clientId,
      meal_date: {
        [Op.gte]: new Date(periodStart),
        [Op.lte]: new Date(periodEnd)
      }
    },
    include: [{ model: Nutrition }],
    order: [['meal_date', 'ASC']]
  });

  // 영양 통계 계산
  const summaryJson = calculateNutritionSummary(meals, periodStart, periodEnd);

  // 리포트 생성
  const report = await Report.create({
    client_id: clientId,
    user_id: req.user.id,
    report_type: reportType,
    period_start: periodStart,
    period_end: periodEnd,
    summary_json: summaryJson,
    recommendations,
    notes
  });

  // 생성된 리포트 다시 조회
  const createdReport = await Report.findByPk(report.id, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'goal']
      },
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      }
    ]
  });

  logger.info(
    `${req.user.username} created ${reportType} report for client ${clientId} (Report ID: ${report.id})`
  );

  res.status(201).json({
    success: true,
    message: 'Report created successfully',
    data: createdReport
  });
});

/**
 * 리포트 수정
 */
exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { recommendations, notes, summaryJson } = req.body;

  const report = await Report.findByPk(id);

  if (!report) {
    throw new NotFoundError('Report');
  }

  // 소유권 확인
  if (req.user.role !== 'admin' && report.user_id !== req.user.id) {
    throw new ForbiddenError('You can only update your own reports');
  }

  // 업데이트
  const updateData = {};
  if (recommendations !== undefined) updateData.recommendations = recommendations;
  if (notes !== undefined) updateData.notes = notes;
  if (summaryJson !== undefined) updateData.summary_json = summaryJson;

  await report.update(updateData);

  // 업데이트된 리포트 다시 조회
  const updatedReport = await Report.findByPk(id, {
    include: [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name']
      },
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      }
    ]
  });

  logger.info(`${req.user.username} updated report ${id}`);

  res.json({
    success: true,
    message: 'Report updated successfully',
    data: updatedReport
  });
});

/**
 * 리포트 삭제
 */
exports.delete = catchAsync(async (req, res) => {
  const { id } = req.params;

  const report = await Report.findByPk(id);

  if (!report) {
    throw new NotFoundError('Report');
  }

  // 소유권 확인 (admin이거나 자신의 리포트)
  if (req.user.role !== 'admin' && report.user_id !== req.user.id) {
    throw new ForbiddenError('You can only delete your own reports');
  }

  await report.destroy();

  logger.info(`${req.user.username} deleted report ${id}`);

  res.json({
    success: true,
    message: 'Report deleted successfully'
  });
});

/**
 * 고객별 최신 리포트 조회
 */
exports.getLatestByClient = catchAsync(async (req, res) => {
  const { clientId } = req.params;

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only access your own clients');
  }

  const report = await Report.findOne({
    where: {
      client_id: clientId
    },
    include: [
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  if (!report) {
    throw new NotFoundError('No reports found for this client');
  }

  res.json({
    success: true,
    data: report
  });
});

/**
 * 고객별 리포트 목록
 */
exports.getClientReports = catchAsync(async (req, res) => {
  const { clientId } = req.params;
  const { reportType } = req.query;

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only access your own clients');
  }

  const where = {
    client_id: clientId
  };

  if (reportType) {
    where.report_type = reportType;
  }

  const reports = await Report.findAll({
    where,
    include: [
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      }
    ],
    order: [['period_start', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      client: {
        id: client.id,
        name: client.name,
        goal: client.goal
      },
      reports
    }
  });
});

/**
 * 통계
 */
exports.getStats = catchAsync(async (req, res) => {
  const where = {};

  // admin이 아니면 자신의 리포트만
  if (req.user.role !== 'admin') {
    where.user_id = req.user.id;
  }

  const [total, byType] = await Promise.all([
    Report.count({ where }),
    Report.findAll({
      where,
      attributes: [
        'report_type',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['report_type'],
      raw: true
    })
  ]);

  const typeStats = byType.reduce((acc, item) => {
    acc[item.report_type] = parseInt(item.count);
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      total,
      byType: typeStats
    }
  });
});

/**
 * 영양 통계 계산 헬퍼 함수
 */
function calculateNutritionSummary(meals, periodStart, periodEnd) {
  const summary = {
    period: {
      start: periodStart,
      end: periodEnd,
      days: Math.ceil((new Date(periodEnd) - new Date(periodStart)) / (1000 * 60 * 60 * 24)) + 1
    },
    totalMeals: meals.length,
    totalCalories: 0,
    avgCaloriesPerDay: 0,
    nutrition: {
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0
    },
    avgNutritionPerDay: {
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0
    },
    mealTypeDistribution: {},
    dailyCalories: []
  };

  // 일별 칼로리 맵
  const dailyCaloriesMap = {};

  meals.forEach((meal) => {
    const mealDate = meal.meal_date.toISOString().split('T')[0];

    // 총 칼로리
    const calories = meal.total_calories || 0;
    summary.totalCalories += calories;

    // 일별 칼로리
    if (!dailyCaloriesMap[mealDate]) {
      dailyCaloriesMap[mealDate] = 0;
    }
    dailyCaloriesMap[mealDate] += calories;

    // 식사 타입별 분포
    if (!summary.mealTypeDistribution[meal.meal_type]) {
      summary.mealTypeDistribution[meal.meal_type] = 0;
    }
    summary.mealTypeDistribution[meal.meal_type]++;

    // 영양소 합계
    if (meal.Nutrition) {
      summary.nutrition.protein += meal.Nutrition.protein || 0;
      summary.nutrition.carbohydrates += meal.Nutrition.carbohydrates || 0;
      summary.nutrition.fat += meal.Nutrition.fat || 0;
      summary.nutrition.fiber += meal.Nutrition.fiber || 0;
    }
  });

  // 일별 칼로리 배열
  summary.dailyCalories = Object.entries(dailyCaloriesMap).map(([date, calories]) => ({
    date,
    calories: Math.round(calories)
  }));

  // 평균 계산
  const daysWithMeals = Object.keys(dailyCaloriesMap).length;
  if (daysWithMeals > 0) {
    summary.avgCaloriesPerDay = Math.round(summary.totalCalories / daysWithMeals);
    summary.avgNutritionPerDay.protein = Math.round((summary.nutrition.protein / daysWithMeals) * 10) / 10;
    summary.avgNutritionPerDay.carbohydrates = Math.round((summary.nutrition.carbohydrates / daysWithMeals) * 10) / 10;
    summary.avgNutritionPerDay.fat = Math.round((summary.nutrition.fat / daysWithMeals) * 10) / 10;
    summary.avgNutritionPerDay.fiber = Math.round((summary.nutrition.fiber / daysWithMeals) * 10) / 10;
  }

  // 영양소 반올림
  summary.nutrition.protein = Math.round(summary.nutrition.protein * 10) / 10;
  summary.nutrition.carbohydrates = Math.round(summary.nutrition.carbohydrates * 10) / 10;
  summary.nutrition.fat = Math.round(summary.nutrition.fat * 10) / 10;
  summary.nutrition.fiber = Math.round(summary.nutrition.fiber * 10) / 10;

  return summary;
}

module.exports = exports;
