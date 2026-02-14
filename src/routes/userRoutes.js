const router = require('express').Router();
const { body } = require('express-validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const userController = require('../controllers/userController');

// Validation rules
const validateUser = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscore'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be 2-100 characters'),
  
  body('role')
    .isIn(['admin', 'nutritionist', 'trainer'])
    .withMessage('Invalid role'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9-+().\s]+$/)
    .withMessage('Invalid phone format'),
  
  validate
];

const validateUserUpdate = [
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be 2-100 characters'),
  
  body('role')
    .optional()
    .isIn(['admin', 'nutritionist', 'trainer'])
    .withMessage('Invalid role'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9-+().\s]+$/)
    .withMessage('Invalid phone format'),
  
  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('is_active must be a boolean'),
  
  validate
];

// All routes require admin role

/**
 * @route   GET /api/users/stats
 * @desc    Get user statistics
 * @access  Private (admin only)
 */
router.get(
  '/stats',
  authenticate,
  authorize(['admin']),
  userController.getStats
);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private (admin only)
 * @query   ?page=1&limit=10&role=nutritionist&search=john&status=active
 */
router.get(
  '/',
  authenticate,
  authorize(['admin']),
  userController.getAll
);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user
 * @access  Private (admin only)
 */
router.get(
  '/:id',
  authenticate,
  authorize(['admin']),
  userController.getOne
);

/**
 * @route   POST /api/users
 * @desc    Create new user
 * @access  Private (admin only)
 */
router.post(
  '/',
  authenticate,
  authorize(['admin']),
  validateUser,
  userController.create
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (admin only)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['admin']),
  validateUserUpdate,
  userController.update
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (admin only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['admin']),
  userController.delete
);

/**
 * @route   PATCH /api/users/:id/toggle-active
 * @desc    Toggle user active status
 * @access  Private (admin only)
 */
router.patch(
  '/:id/toggle-active',
  authenticate,
  authorize(['admin']),
  userController.toggleActive
);

module.exports = router;
