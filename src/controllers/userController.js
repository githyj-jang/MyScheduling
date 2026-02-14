const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { NotFoundError, ConflictError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * 사용자 목록 조회 (admin 전용)
 */
exports.getAll = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, role, search, status } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  // 역할 필터
  if (role) {
    where.role = role;
  }

  // 검색 조건
  if (search) {
    where[Op.or] = [
      { username: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { fullName: { [Op.iLike]: `%${search}%` } }
    ];
  }

  // 상태 필터
  if (status) {
    where.is_active = status === 'active';
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password'] },
    limit: parseInt(limit),
    offset,
    order: [['createdAt', 'DESC']]
  });

  logger.info(`${req.user.username} retrieved ${rows.length} users`);

  res.json({
    success: true,
    data: {
      users: rows,
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
 * 단일 사용자 조회 (admin 전용)
 */
exports.getOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password'] }
  });

  if (!user) {
    throw new NotFoundError('User');
  }

  logger.info(`${req.user.username} retrieved user ${id}`);

  res.json({
    success: true,
    data: user
  });
});

/**
 * 사용자 생성 (admin 전용)
 */
exports.create = catchAsync(async (req, res) => {
  const { username, email, password, fullName, role, licenseNumber, phone } = req.body;

  // 중복 체크
  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email }]
    }
  });

  if (existingUser) {
    throw new ConflictError('Username or email already exists');
  }

  const user = await User.create({
    username,
    email,
    password,
    fullName,
    role: role || 'nutritionist',
    licenseNumber,
    phone
  });

  logger.info(`${req.user.username} created user: ${user.username} (${user.role})`);

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: user.toJSON()
  });
});

/**
 * 사용자 정보 수정 (admin 전용)
 */
exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { email, fullName, role, licenseNumber, phone, is_active } = req.body;

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError('User');
  }

  // 이메일 중복 체크 (변경 시)
  if (email && email !== user.email) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictError('Email already exists');
    }
  }

  const updateData = {};
  if (email !== undefined) updateData.email = email;
  if (fullName !== undefined) updateData.fullName = fullName;
  if (role !== undefined) updateData.role = role;
  if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
  if (phone !== undefined) updateData.phone = phone;
  if (is_active !== undefined) updateData.is_active = is_active;

  await user.update(updateData);

  logger.info(`${req.user.username} updated user ${id}`);

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user.toJSON()
  });
});

/**
 * 사용자 삭제 (admin 전용)
 */
exports.delete = catchAsync(async (req, res) => {
  const { id } = req.params;

  // 자기 자신은 삭제 불가
  if (parseInt(id) === req.user.id) {
    throw new ForbiddenError('You cannot delete your own account');
  }

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError('User');
  }

  await user.destroy();

  logger.warn(`${req.user.username} deleted user ${id} (${user.username})`);

  res.status(204).send();
});

/**
 * 사용자 활성화/비활성화 (admin 전용)
 */
exports.toggleActive = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);

  if (!user) {
    throw new NotFoundError('User');
  }

  // 자기 자신은 비활성화 불가
  if (parseInt(id) === req.user.id) {
    throw new ForbiddenError('You cannot deactivate your own account');
  }

  await user.update({ is_active: !user.is_active });

  const action = user.is_active ? 'activated' : 'deactivated';
  logger.info(`${req.user.username} ${action} user ${id}`);

  res.json({
    success: true,
    message: `User ${action} successfully`,
    data: user.toJSON()
  });
});

/**
 * 사용자 통계 (admin 전용)
 */
exports.getStats = catchAsync(async (req, res) => {
  const [total, active, inactive, byRole] = await Promise.all([
    User.count(),
    User.count({ where: { is_active: true } }),
    User.count({ where: { is_active: false } }),
    User.findAll({
      attributes: [
        'role',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['role']
    })
  ]);

  res.json({
    success: true,
    data: {
      total,
      active,
      inactive,
      byRole
    }
  });
});
