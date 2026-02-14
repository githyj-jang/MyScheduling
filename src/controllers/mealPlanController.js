const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { MealPlan, User, Client } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { NotFoundError, ForbiddenError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * 식단 플랜 목록 조회
 * - 템플릿과 할당된 플랜 모두 조회
 */
exports.getAll = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, isTemplate, clientId, isActive } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  // 템플릿 필터
  if (isTemplate !== undefined) {
    where.is_template = isTemplate === 'true';
  }

  // 고객 필터
  if (clientId) {
    where.client_id = clientId;
  }

  // 활성화 필터
  if (isActive !== undefined) {
    where.is_active = isActive === 'true';
  }

  // admin이 아니면 자신의 플랜만 조회
  if (req.user.role !== 'admin') {
    where.user_id = req.user.id;
  }

  const { count, rows } = await MealPlan.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      },
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'goal'],
        required: false
      }
    ],
    limit: parseInt(limit),
    offset,
    order: [['createdAt', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      mealPlans: rows,
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
 * 단일 식단 플랜 조회
 */
exports.getOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const mealPlan = await MealPlan.findByPk(id, {
    include: [
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      },
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'goal', 'height', 'weight'],
        required: false
      }
    ]
  });

  if (!mealPlan) {
    throw new NotFoundError('MealPlan');
  }

  // 소유권 확인
  if (req.user.role !== 'admin' && mealPlan.user_id !== req.user.id) {
    throw new ForbiddenError('You can only access your own meal plans');
  }

  res.json({
    success: true,
    data: mealPlan
  });
});

/**
 * 템플릿 목록 조회
 */
exports.getTemplates = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const where = {
    is_template: true,
    is_active: true
  };

  // admin이 아니면 자신의 템플릿만 조회
  if (req.user.role !== 'admin') {
    where.user_id = req.user.id;
  }

  const { count, rows } = await MealPlan.findAndCountAll({
    where,
    include: [
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
      templates: rows,
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
 * 식단 플랜 생성 (템플릿 또는 개별 플랜)
 */
exports.create = catchAsync(async (req, res) => {
  const {
    title,
    description,
    startDate,
    endDate,
    targetCalories,
    mealsJson,
    isTemplate,
    clientId
  } = req.body;

  // 템플릿이 아니면 clientId 필수
  if (!isTemplate && !clientId) {
    throw new ValidationError('Client ID is required for non-template meal plans');
  }

  // 고객 존재 및 소유권 확인
  if (clientId) {
    const client = await Client.findByPk(clientId);
    if (!client) {
      throw new NotFoundError('Client');
    }

    if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
      throw new ForbiddenError('You can only create meal plans for your own clients');
    }
  }

  const mealPlan = await MealPlan.create({
    user_id: req.user.id,
    client_id: clientId || null,
    title,
    description,
    start_date: startDate,
    end_date: endDate,
    target_calories: targetCalories,
    meals_json: mealsJson,
    is_template: isTemplate || false
  });

  // 생성된 플랜 다시 조회 (관계 포함)
  const createdMealPlan = await MealPlan.findByPk(mealPlan.id, {
    include: [
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      },
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name'],
        required: false
      }
    ]
  });

  logger.info(
    `${req.user.username} created ${isTemplate ? 'template' : 'meal plan'}: ${title} (ID: ${mealPlan.id})`
  );

  res.status(201).json({
    success: true,
    message: `${isTemplate ? 'Template' : 'Meal plan'} created successfully`,
    data: createdMealPlan
  });
});

/**
 * 식단 플랜 수정
 */
exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    startDate,
    endDate,
    targetCalories,
    mealsJson,
    isActive
  } = req.body;

  const mealPlan = await MealPlan.findByPk(id);

  if (!mealPlan) {
    throw new NotFoundError('MealPlan');
  }

  // 소유권 확인
  if (req.user.role !== 'admin' && mealPlan.user_id !== req.user.id) {
    throw new ForbiddenError('You can only update your own meal plans');
  }

  // 업데이트
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (startDate !== undefined) updateData.start_date = startDate;
  if (endDate !== undefined) updateData.end_date = endDate;
  if (targetCalories !== undefined) updateData.target_calories = targetCalories;
  if (mealsJson !== undefined) updateData.meals_json = mealsJson;
  if (isActive !== undefined) updateData.is_active = isActive;

  await mealPlan.update(updateData);

  // 업데이트된 플랜 다시 조회
  const updatedMealPlan = await MealPlan.findByPk(id, {
    include: [
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      },
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name'],
        required: false
      }
    ]
  });

  logger.info(`${req.user.username} updated meal plan ${id}`);

  res.json({
    success: true,
    message: 'Meal plan updated successfully',
    data: updatedMealPlan
  });
});

/**
 * 식단 플랜 삭제
 */
exports.delete = catchAsync(async (req, res) => {
  const { id } = req.params;

  const mealPlan = await MealPlan.findByPk(id);

  if (!mealPlan) {
    throw new NotFoundError('MealPlan');
  }

  // 소유권 확인 (admin이거나 자신의 플랜)
  if (req.user.role !== 'admin' && mealPlan.user_id !== req.user.id) {
    throw new ForbiddenError('You can only delete your own meal plans');
  }

  await mealPlan.destroy();

  logger.info(`${req.user.username} deleted meal plan ${id}`);

  res.json({
    success: true,
    message: 'Meal plan deleted successfully'
  });
});

/**
 * 템플릿을 고객에게 할당
 */
exports.assignToClient = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { clientId, startDate, endDate } = req.body;

  // 템플릿 조회
  const template = await MealPlan.findByPk(id);

  if (!template) {
    throw new NotFoundError('Template');
  }

  if (!template.is_template) {
    throw new ValidationError('This meal plan is not a template');
  }

  // 소유권 확인
  if (req.user.role !== 'admin' && template.user_id !== req.user.id) {
    throw new ForbiddenError('You can only assign your own templates');
  }

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only assign meal plans to your own clients');
  }

  // 템플릿 복사하여 고객에게 할당
  const assignedPlan = await MealPlan.create({
    user_id: req.user.id,
    client_id: clientId,
    title: `${template.title} - ${client.name}`,
    description: template.description,
    start_date: startDate,
    end_date: endDate,
    target_calories: template.target_calories,
    meals_json: template.meals_json,
    is_template: false
  });

  // 생성된 플랜 다시 조회
  const createdPlan = await MealPlan.findByPk(assignedPlan.id, {
    include: [
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      },
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'goal']
      }
    ]
  });

  logger.info(
    `${req.user.username} assigned template ${id} to client ${clientId} (New Plan ID: ${assignedPlan.id})`
  );

  res.status(201).json({
    success: true,
    message: 'Template assigned to client successfully',
    data: createdPlan
  });
});

/**
 * 고객별 식단 플랜 조회
 */
exports.getClientMealPlans = catchAsync(async (req, res) => {
  const { clientId } = req.params;
  const { isActive } = req.query;

  // 고객 존재 및 소유권 확인
  const client = await Client.findByPk(clientId);
  if (!client) {
    throw new NotFoundError('Client');
  }

  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only access your own clients');
  }

  const where = {
    client_id: clientId,
    is_template: false
  };

  if (isActive !== undefined) {
    where.is_active = isActive === 'true';
  }

  const mealPlans = await MealPlan.findAll({
    where,
    include: [
      {
        model: User,
        as: 'createdBy',
        attributes: ['id', 'username', 'fullName']
      }
    ],
    order: [['start_date', 'DESC']]
  });

  res.json({
    success: true,
    data: {
      client: {
        id: client.id,
        name: client.name,
        goal: client.goal
      },
      mealPlans
    }
  });
});

/**
 * 통계
 */
exports.getStats = catchAsync(async (req, res) => {
  const where = {};

  // admin이 아니면 자신의 플랜만
  if (req.user.role !== 'admin') {
    where.user_id = req.user.id;
  }

  const [total, templates, assigned, active] = await Promise.all([
    MealPlan.count({ where }),
    MealPlan.count({ where: { ...where, is_template: true } }),
    MealPlan.count({ where: { ...where, is_template: false, client_id: { [Op.ne]: null } } }),
    MealPlan.count({ where: { ...where, is_active: true } })
  ]);

  res.json({
    success: true,
    data: {
      total,
      templates,
      assigned,
      active,
      inactive: total - active
    }
  });
});

module.exports = exports;
