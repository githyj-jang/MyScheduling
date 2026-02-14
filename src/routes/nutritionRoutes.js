const router = require('express').Router();
const { param, query } = require('express-validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const nutritionController = require('../controllers/nutritionController');

// Validation rules
const validateClientId = [
  param('clientId')
    .isInt()
    .withMessage('Client ID must be an integer'),
  validate
];

const validateDate = [
  param('date')
    .isISO8601()
    .withMessage('Date must be valid (YYYY-MM-DD)'),
  validate
];

const validateDateRange = [
  query('startDate')
    .notEmpty()
    .isISO8601()
    .withMessage('Start date is required and must be valid'),
  
  query('endDate')
    .notEmpty()
    .isISO8601()
    .withMessage('End date is required and must be valid')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.query.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  
  validate
];

// Routes

/**
 * @route   GET /api/nutrition/client/:clientId/recommended
 * @desc    Get recommended daily intake for client
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/client/:clientId/recommended',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateClientId,
  nutritionController.getRecommendedIntake
);

/**
 * @route   GET /api/nutrition/client/:clientId/daily/:date
 * @desc    Get daily nutrition analysis
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/client/:clientId/daily/:date',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateClientId,
  validateDate,
  nutritionController.analyzeDailyNutrition
);

/**
 * @route   GET /api/nutrition/client/:clientId/trend
 * @desc    Get nutrition trend analysis
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/client/:clientId/trend',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateClientId,
  validateDateRange,
  nutritionController.analyzeTrend
);

/**
 * @route   GET /api/nutrition/client/:clientId/evaluate
 * @desc    Evaluate nutritional status with suggestions
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/client/:clientId/evaluate',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateClientId,
  validateDateRange,
  nutritionController.evaluateNutritionalStatus
);

module.exports = router;
