const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { Client, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * 고객 목록 조회
 * - nutritionist/trainer: 자신의 고객만 조회
 * - admin: 모든 고객 조회
 */
exports.getAll = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const offset = (page - 1) * limit;

  // 필터 조건 구성
  const where = {};
  
  // admin이 아니면 자신의 고객만 조회
  if (req.user.role !== 'admin') {
    where.user_id = req.user.id;
  }

  // 검색 조건
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // 상태 필터
  if (status) {
    where.is_active = status === 'active';
  }

  const { count, rows } = await Client.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'nutritionist',
        attributes: ['id', 'username', 'fullName', 'role']
      }
    ],
    limit: parseInt(limit),
    offset,
    order: [['createdAt', 'DESC']]
  });

  logger.info(`${req.user.username} retrieved ${rows.length} clients`);

  res.json({
    success: true,
    data: {
      clients: rows,
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
 * 단일 고객 조회
 */
exports.getOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const client = await Client.findByPk(id, {
    include: [
      {
        model: User,
        attributes: ['id', 'username', 'fullName', 'role']
      }
    ]
  });

  if (!client) {
    throw new NotFoundError('Client');
  }

  // 소유권 확인 (admin은 모든 고객 접근 가능)
  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only access your own clients');
  }

  logger.info(`${req.user.username} retrieved client ${id}`);

  res.json({
    success: true,
    data: client
  });
});

/**
 * 고객 생성
 */
exports.create = catchAsync(async (req, res) => {
  const {
    name,
    email,
    phone,
    birthDate,
    gender,
    height,
    weight,
    goal,
    activityLevel,
    medicalHistory,
    allergies,
    notes
  } = req.body;

  const client = await Client.create({
    user_id: req.user.id,
    name,
    email,
    phone,
    birthDate,
    gender,
    height,
    weight,
    goal,
    activityLevel,
    medicalHistory,
    allergies,
    notes
  });

  logger.info(`${req.user.username} created client: ${client.name} (ID: ${client.id})`);

  res.status(201).json({
    success: true,
    message: 'Client created successfully',
    data: client
  });
});

/**
 * 고객 정보 수정
 */
exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;

  const client = await Client.findByPk(id);

  if (!client) {
    throw new NotFoundError('Client');
  }

  // 소유권 확인
  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only update your own clients');
  }

  const allowedFields = [
    'name',
    'email',
    'phone',
    'birthDate',
    'gender',
    'height',
    'weight',
    'goal',
    'activityLevel',
    'medicalHistory',
    'allergies',
    'notes'
  ];

  // 허용된 필드만 업데이트
  const updateData = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  });

  await client.update(updateData);

  logger.info(`${req.user.username} updated client ${id}`);

  res.json({
    success: true,
    message: 'Client updated successfully',
    data: client
  });
});

/**
 * 고객 삭제 (소프트 삭제)
 */
exports.delete = catchAsync(async (req, res) => {
  const { id } = req.params;

  const client = await Client.findByPk(id);

  if (!client) {
    throw new NotFoundError('Client');
  }

  // 소유권 확인
  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only delete your own clients');
  }

  // 소프트 삭제 (is_active = false)
  await client.update({ is_active: false });

  logger.info(`${req.user.username} deactivated client ${id}`);

  res.json({
    success: true,
    message: 'Client deactivated successfully'
  });
});

/**
 * 고객 영구 삭제 (admin 전용)
 */
exports.permanentDelete = catchAsync(async (req, res) => {
  const { id } = req.params;

  const client = await Client.findByPk(id);

  if (!client) {
    throw new NotFoundError('Client');
  }

  await client.destroy();

  logger.warn(`${req.user.username} permanently deleted client ${id}`);

  res.status(204).send();
});

/**
 * 고객 활성화
 */
exports.activate = catchAsync(async (req, res) => {
  const { id } = req.params;

  const client = await Client.findByPk(id);

  if (!client) {
    throw new NotFoundError('Client');
  }

  // 소유권 확인
  if (req.user.role !== 'admin' && client.user_id !== req.user.id) {
    throw new ForbiddenError('You can only activate your own clients');
  }

  await client.update({ is_active: true });

  logger.info(`${req.user.username} activated client ${id}`);

  res.json({
    success: true,
    message: 'Client activated successfully',
    data: client
  });
});

/**
 * 고객 통계 (대시보드용)
 */
exports.getStats = catchAsync(async (req, res) => {
  const where = {};
  
  // admin이 아니면 자신의 고객만
  if (req.user.role !== 'admin') {
    where.user_id = req.user.id;
  }

  const [total, active, inactive, byGoal, byGender] = await Promise.all([
    Client.count({ where }),
    Client.count({ where: { ...where, is_active: true } }),
    Client.count({ where: { ...where, is_active: false } }),
    Client.findAll({
      where,
      attributes: [
        'goal',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['goal']
    }),
    Client.findAll({
      where,
      attributes: [
        'gender',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['gender']
    })
  ]);

  res.json({
    success: true,
    data: {
      total,
      active,
      inactive,
      byGoal,
      byGender
    }
  });
});
