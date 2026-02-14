const router = require('express').Router();
const { body } = require('express-validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const noticeController = require('../controllers/noticeController');

// Validation rules
const validateNotice = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  
  body('category')
    .notEmpty()
    .isIn(['notice', 'tip', 'qa', 'general'])
    .withMessage('Category must be one of: notice, tip, qa, general'),
  
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  
  validate
];

const validateNoticeUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  
  body('content')
    .optional()
    .trim(),
  
  body('category')
    .optional()
    .isIn(['notice', 'tip', 'qa', 'general'])
    .withMessage('Category must be one of: notice, tip, qa, general'),
  
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean'),
  
  validate
];

// Routes

/**
 * @route   GET /api/notices/stats
 * @desc    Get notice statistics
 * @access  Private (admin only)
 */
router.get(
  '/stats',
  authenticate,
  authorize(['admin']),
  noticeController.getStats
);

/**
 * @route   GET /api/notices
 * @desc    Get all notices (public)
 * @access  Public
 */
router.get(
  '/',
  noticeController.getAll
);

/**
 * @route   GET /api/notices/:id
 * @desc    Get single notice (views increment)
 * @access  Public
 */
router.get(
  '/:id',
  noticeController.getOne
);

/**
 * @route   POST /api/notices
 * @desc    Create new notice
 * @access  Private (admin only)
 */
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validateNotice,
  noticeController.create
);

/**
 * @route   PUT /api/notices/:id
 * @desc    Update notice
 * @access  Private (admin or author)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validateNoticeUpdate,
  noticeController.update
);

/**
 * @route   PATCH /api/notices/:id/pin
 * @desc    Toggle pin status
 * @access  Private (admin only)
 */
router.patch(
  '/:id/pin',
  authenticate,
  authorize(['admin']),
  noticeController.togglePin
);

/**
 * @route   DELETE /api/notices/:id
 * @desc    Delete notice
 * @access  Private (admin or author)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  noticeController.delete
);

module.exports = router;
