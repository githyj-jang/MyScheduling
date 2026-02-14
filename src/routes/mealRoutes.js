const router = require('express').Router();
const { body, param, query } = require('express-validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const mealController = require('../controllers/mealController');

// Validation rules
const validateMeal = [
  body('client_id')
    .notEmpty()
    .withMessage('Client ID is required')
    .isInt()
    .withMessage('Client ID must be an integer'),
  
  body('meal_date')
    .notEmpty()
    .withMessage('Meal date is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('meal_time')
    .notEmpty()
    .withMessage('Meal time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM)'),
  
  body('meal_type')
    .notEmpty()
    .withMessage('Meal type is required')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
    .withMessage('Invalid meal type'),
  
  body('foods')
    .notEmpty()
    .withMessage('Foods array is required')
    .isArray()
    .withMessage('Foods must be an array'),
  
  body('total_calories')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total calories must be a positive number'),
  
  body('nutrition.protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be a positive number'),
  
  body('nutrition.carbohydrates')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbohydrates must be a positive number'),
  
  body('nutrition.fat')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fat must be a positive number'),
  
  validate
];

const validateMealUpdate = [
  body('meal_date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('meal_time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid time format (use HH:MM)'),
  
  body('meal_type')
    .optional()
    .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
    .withMessage('Invalid meal type'),
  
  body('foods')
    .optional()
    .isArray()
    .withMessage('Foods must be an array'),
  
  body('total_calories')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Total calories must be a positive number'),
  
  validate
];

const validateClientId = [
  param('clientId')
    .isInt()
    .withMessage('Client ID must be an integer'),
  validate
];

const validateDate = [
  param('date')
    .isISO8601()
    .withMessage('Invalid date format'),
  validate
];

// Routes

/**
 * @route   GET /api/meals
 * @desc    Get all meals (filtered by user role)
 * @access  Private (nutritionist, trainer, admin)
 * @query   ?page=1&limit=10&clientId=1&startDate=2026-01-01&endDate=2026-12-31&mealType=breakfast
 */
router.get(
  '/',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  mealController.getAll
);

/**
 * @route   GET /api/meals/:id
 * @desc    Get single meal
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  mealController.getOne
);

/**
 * @route   POST /api/meals
 * @desc    Create new meal
 * @access  Private (nutritionist, trainer)
 */
router.post(
  '/',
  authenticate,
  authorize(['nutritionist', 'trainer']),
  validateMeal,
  mealController.create
);

/**
 * @route   PUT /api/meals/:id
 * @desc    Update meal
 * @access  Private (nutritionist, trainer, admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateMealUpdate,
  mealController.update
);

/**
 * @route   DELETE /api/meals/:id
 * @desc    Delete meal
 * @access  Private (nutritionist, trainer, admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  mealController.delete
);

/**
 * @route   GET /api/meals/client/:clientId/stats
 * @desc    Get meal statistics for a client
 * @access  Private (nutritionist, trainer, admin)
 * @query   ?startDate=2026-01-01&endDate=2026-12-31
 */
router.get(
  '/client/:clientId/stats',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateClientId,
  mealController.getClientMealStats
);

/**
 * @route   GET /api/meals/client/:clientId/date/:date
 * @desc    Get all meals for a client on a specific date
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/client/:clientId/date/:date',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateClientId,
  validateDate,
  mealController.getDailyMeals
);

module.exports = router;
