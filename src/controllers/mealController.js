const { Op } = require('sequelize');
const { Meal, Nutrition, Client, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * 식단 목록 조회
 * - 자신의 고객 식단만 조회
 * - admin은 모든 식단 조회
 */
exports.getAll = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, clientId, startDate, endDate, mealType } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  // 날짜 필터
  if (startDate || endDate) {
    where.meal_date = {};
    if (startDate) where.meal_date[Op.gte] = new Date(startDate);
    if (endDate) where.meal_date[Op.lte] = new Date(endDate);
  }

  // 식사 타입 필터
  if (mealType) {
    where.meal_type = mealType;
  }

  // 고객 ID 필터
  if (clientId) {
    where.client_id = clientId;
  }

  // 소유권 필터 (admin이 아닌 경우)
  const includeOptions = [
    {
      model: Nutrition,
      required: false
    },
    {
      model: Client,
      attributes: ['id', 'name', 'user_id'],
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'fullName']
        }
      ]
    },
    {
      model: User,
      as: 'creator',
      attributes: ['id', 'username', 'fullName']
    }
  ];

  // admin이 아니면 자신의 식단만 조회
  if (req.user.role !== 'admin') {
    where.user_id = req.user.id;
  }

  const { count, rows } = await Meal.findAndCountAll({
    where,
    include: includeOptions,
    limit: parseInt(limit),
    offset,
    order: [['meal_date', 'DESC'], ['meal_time', 'DESC']]
  });

  logger.info(`${req.user.username} retrieved ${rows.length} meals`);

  res.json({
    success: true,
    data: {
      meals: rows,
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
 * 단일 식단 조회
 */
exports.getOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const meal = await Meal.findByPk(id, {
    include: [
      { model: Nutrition },
      {
        model: Client,
        attributes: ['id', 'name', 'user_id']
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'username', 'fullName']
      }
    ]
  });

  if (!meal) {
    throw new NotFoundError('Meal');
  }

  // 소유권 확인
  if (req.user.role !== 'admin' && meal.user_id !== req.user.id) {
    throw new ForbiddenError('You can only access your own meals');
  }

  logger.info(`${req.user.username} retrieved meal ${id}`);

  res.json({
    success: true,
    data: meal
  });
});

/**
 * 식단 생성 (영양소 정보 포함)
 */
exports.create = catchAsync(async (req, res) => {
  const {
    client_id,
    meal_date,
    meal_time,
    meal_type,
    foods,
    total_calories,
    notes,
    nutrition
  } = req.body;

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(client_id);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only create meals for your own clients');
  }

  // 식단 생성
  const meal = await Meal.create({
    client_id,
    user_id: req.user.id,
    meal_date,
    meal_time,
    meal_type,
    foods,
    total_calories,
    notes
  });

  // 영양소 정보 생성 (제공된 경우)
  if (nutrition) {
    await Nutrition.create({
      meal_id: meal.id,
      ...nutrition
    });
  }

  // 생성된 식단 다시 조회 (관계 포함)
  const createdMeal = await Meal.findByPk(meal.id, {
    include: [
      { model: Nutrition },
      {
        model: Client,
        attributes: ['id', 'name']
      }
    ]
  });

  logger.info(
    `${req.user.username} created meal for client ${client_id} (Meal ID: ${meal.id})`
  );

  res.status(201).json({
    success: true,
    message: 'Meal created successfully',
    data: createdMeal
  });
});

/**
 * 식단 수정
 */
exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { meal_date, meal_time, meal_type, foods, total_calories, notes, nutrition } = req.body;

  const meal = await Meal.findByPk(id, {
    include: [{ model: Nutrition }]
  });

  if (!meal) {
    throw new NotFoundError('Meal');
  }

  // 소유권 확인
  if (req.user.role !== 'admin' && meal.user_id !== req.user.id) {
    throw new ForbiddenError('You can only update your own meals');
  }

  // 식단 업데이트
  const updateData = {};
  if (meal_date !== undefined) updateData.meal_date = meal_date;
  if (meal_time !== undefined) updateData.meal_time = meal_time;
  if (meal_type !== undefined) updateData.meal_type = meal_type;
  if (foods !== undefined) updateData.foods = foods;
  if (total_calories !== undefined) updateData.total_calories = total_calories;
  if (notes !== undefined) updateData.notes = notes;

  await meal.update(updateData);

  // 영양소 정보 업데이트
  if (nutrition) {
    if (meal.Nutrition) {
      await meal.Nutrition.update(nutrition);
    } else {
      await Nutrition.create({
        meal_id: meal.id,
        ...nutrition
      });
    }
  }

  // 업데이트된 식단 다시 조회
  const updatedMeal = await Meal.findByPk(id, {
    include: [
      { model: Nutrition },
      {
        model: Client,
        attributes: ['id', 'name']
      }
    ]
  });

  logger.info(`${req.user.username} updated meal ${id}`);

  res.json({
    success: true,
    message: 'Meal updated successfully',
    data: updatedMeal
  });
});

/**
 * 식단 삭제
 */
exports.delete = catchAsync(async (req, res) => {
  const { id } = req.params;

  const meal = await Meal.findByPk(id);

  if (!meal) {
    throw new NotFoundError('Meal');
  }

  // 소유권 확인
  if (req.user.role !== 'admin' && meal.user_id !== req.user.id) {
    throw new ForbiddenError('You can only delete your own meals');
  }

  await meal.destroy();

  logger.info(`${req.user.username} deleted meal ${id}`);

  res.status(204).send();
});

/**
 * 고객의 식단 통계
 */
exports.getClientMealStats = catchAsync(async (req, res) => {
  const { clientId } = req.params;
  const { startDate, endDate } = req.query;

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only access your own clients');
  }

  const where = { client_id: clientId };

  // 날짜 필터
  if (startDate || endDate) {
    where.meal_date = {};
    if (startDate) where.meal_date[Op.gte] = new Date(startDate);
    if (endDate) where.meal_date[Op.lte] = new Date(endDate);
  }

  const meals = await Meal.findAll({
    where,
    include: [{ model: Nutrition }],
    order: [['meal_date', 'ASC']]
  });

  // 통계 계산
  const stats = {
    totalMeals: meals.length,
    totalCalories: 0,
    avgCaloriesPerDay: 0,
    byMealType: {},
    nutritionSummary: {
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0
    }
  };

  meals.forEach((meal) => {
    stats.totalCalories += meal.total_calories || 0;

    // 식사 타입별 카운트
    if (!stats.byMealType[meal.meal_type]) {
      stats.byMealType[meal.meal_type] = 0;
    }
    stats.byMealType[meal.meal_type]++;

    // 영양소 합계
    if (meal.Nutrition) {
      stats.nutritionSummary.protein += meal.Nutrition.protein || 0;
      stats.nutritionSummary.carbohydrates += meal.Nutrition.carbohydrates || 0;
      stats.nutritionSummary.fat += meal.Nutrition.fat || 0;
      stats.nutritionSummary.fiber += meal.Nutrition.fiber || 0;
    }
  });

  // 일별 평균 칼로리
  if (meals.length > 0) {
    const uniqueDates = new Set(meals.map((m) => m.meal_date.toISOString().split('T')[0]));
    const dayCount = uniqueDates.size;
    stats.avgCaloriesPerDay = Math.round(stats.totalCalories / dayCount);
  }

  res.json({
    success: true,
    data: {
      client: {
        id: client.id,
        name: client.name
      },
      period: {
        startDate: startDate || meals[0]?.meal_date,
        endDate: endDate || meals[meals.length - 1]?.meal_date
      },
      stats
    }
  });
});

/**
 * 일별 식단 조회
 */
exports.getDailyMeals = catchAsync(async (req, res) => {
  const { clientId, date } = req.params;

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only access your own clients');
  }

  const targetDate = new Date(date);
  const nextDate = new Date(targetDate);
  nextDate.setDate(nextDate.getDate() + 1);

  const meals = await Meal.findAll({
    where: {
      client_id: clientId,
      meal_date: {
        [Op.gte]: targetDate,
        [Op.lt]: nextDate
      }
    },
    include: [{ model: Nutrition }],
    order: [['meal_time', 'ASC']]
  });

  // 일일 통계
  const dailyStats = {
    totalCalories: meals.reduce((sum, m) => sum + (m.total_calories || 0), 0),
    mealCount: meals.length,
    protein: 0,
    carbohydrates: 0,
    fat: 0
  };

  meals.forEach((meal) => {
    if (meal.Nutrition) {
      dailyStats.protein += meal.Nutrition.protein || 0;
      dailyStats.carbohydrates += meal.Nutrition.carbohydrates || 0;
      dailyStats.fat += meal.Nutrition.fat || 0;
    }
  });

  res.json({
    success: true,
    data: {
      date: targetDate,
      client: {
        id: client.id,
        name: client.name
      },
      meals,
      dailyStats
    }
  });
});
