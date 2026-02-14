const { Op } = require('sequelize');
const { Notice, User } = require('../models');
const catchAsync = require('../utils/catchAsync');
const { NotFoundError, ForbiddenError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * 공지사항 목록 조회
 */
exports.getAll = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, category, search } = req.query;
  const offset = (page - 1) * limit;

  const where = {};

  // 카테고리 필터
  if (category) {
    where.category = category;
  }

  // 검색 조건
  if (search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { content: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count, rows } = await Notice.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'role']
      }
    ],
    limit: parseInt(limit),
    offset,
    order: [
      ['is_pinned', 'DESC'],
      ['createdAt', 'DESC']
    ]
  });

  res.json({
    success: true,
    data: {
      notices: rows,
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
 * 단일 공지사항 조회 (조회수 증가)
 */
exports.getOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notice = await Notice.findByPk(id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName', 'role']
      }
    ]
  });

  if (!notice) {
    throw new NotFoundError('Notice');
  }

  // 조회수 증가
  await notice.increment('views');

  res.json({
    success: true,
    data: {
      ...notice.toJSON(),
      views: notice.views + 1
    }
  });
});

/**
 * 공지사항 생성 (admin만)
 */
exports.create = catchAsync(async (req, res) => {
  const { title, content, category, isPinned } = req.body;

  const notice = await Notice.create({
    user_id: req.user.id,
    title,
    content,
    category,
    is_pinned: isPinned || false
  });

  // 생성된 공지사항 다시 조회 (관계 포함)
  const createdNotice = await Notice.findByPk(notice.id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName']
      }
    ]
  });

  logger.info(`${req.user.username} created notice: ${title} (ID: ${notice.id})`);

  res.status(201).json({
    success: true,
    message: 'Notice created successfully',
    data: createdNotice
  });
});

/**
 * 공지사항 수정
 */
exports.update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, content, category, isPinned } = req.body;

  const notice = await Notice.findByPk(id);

  if (!notice) {
    throw new NotFoundError('Notice');
  }

  // 작성자 또는 admin만 수정 가능
  if (req.user.role !== 'admin' && notice.user_id !== req.user.id) {
    throw new ForbiddenError('You can only update your own notices');
  }

  // 업데이트
  const updateData = {};
  if (title !== undefined) updateData.title = title;
  if (content !== undefined) updateData.content = content;
  if (category !== undefined) updateData.category = category;
  if (isPinned !== undefined) updateData.is_pinned = isPinned;

  await notice.update(updateData);

  // 업데이트된 공지사항 다시 조회
  const updatedNotice = await Notice.findByPk(id, {
    include: [
      {
        model: User,
        as: 'author',
        attributes: ['id', 'username', 'fullName']
      }
    ]
  });

  logger.info(`${req.user.username} updated notice ${id}`);

  res.json({
    success: true,
    message: 'Notice updated successfully',
    data: updatedNotice
  });
});

/**
 * 공지사항 삭제
 */
exports.delete = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notice = await Notice.findByPk(id);

  if (!notice) {
    throw new NotFoundError('Notice');
  }

  // 작성자 또는 admin만 삭제 가능
  if (req.user.role !== 'admin' && notice.user_id !== req.user.id) {
    throw new ForbiddenError('You can only delete your own notices');
  }

  await notice.destroy();

  logger.info(`${req.user.username} deleted notice ${id}`);

  res.json({
    success: true,
    message: 'Notice deleted successfully'
  });
});

/**
 * 공지사항 고정/해제
 */
exports.togglePin = catchAsync(async (req, res) => {
  const { id } = req.params;

  const notice = await Notice.findByPk(id);

  if (!notice) {
    throw new NotFoundError('Notice');
  }

  await notice.update({
    is_pinned: !notice.is_pinned
  });

  logger.info(`${req.user.username} ${notice.is_pinned ? 'pinned' : 'unpinned'} notice ${id}`);

  res.json({
    success: true,
    message: `Notice ${notice.is_pinned ? 'pinned' : 'unpinned'} successfully`,
    data: {
      id: notice.id,
      isPinned: notice.is_pinned
    }
  });
});

/**
 * 통계
 */
exports.getStats = catchAsync(async (req, res) => {
  const [total, byCategory, pinned] = await Promise.all([
    Notice.count(),
    Notice.findAll({
      attributes: [
        'category',
        [Notice.sequelize.fn('COUNT', Notice.sequelize.col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    }),
    Notice.count({ where: { is_pinned: true } })
  ]);

  const categoryStats = byCategory.reduce((acc, item) => {
    acc[item.category] = parseInt(item.count);
    return acc;
  }, {});

  res.json({
    success: true,
    data: {
      total,
      pinned,
      byCategory: categoryStats
    }
  });
});

module.exports = exports;
