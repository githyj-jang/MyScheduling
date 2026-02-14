const router = require('express').Router();
const { body, param } = require('express-validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const mealPlanController = require('../controllers/mealPlanController');

// Validation rules
const validateMealPlan = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (req.body.startDate && value) {
        if (new Date(value) < new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  body('targetCalories')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Target calories must be a positive integer'),
  
  body('mealsJson')
    .optional()
    .isObject()
    .withMessage('mealsJson must be an object'),
  
  body('isTemplate')
    .optional()
    .isBoolean()
    .withMessage('isTemplate must be a boolean'),
  
  body('clientId')
    .optional()
    .isInt()
    .withMessage('Client ID must be an integer'),
  
  validate
];

const validateMealPlanUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  
  body('description')
    .optional()
    .trim(),
  
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format'),
  
  body('targetCalories')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Target calories must be a positive integer'),
  
  body('mealsJson')
    .optional()
    .isObject()
    .withMessage('mealsJson must be an object'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
  validate
];

const validateAssignment = [
  body('clientId')
    .notEmpty()
    .isInt()
    .withMessage('Client ID is required'),
  
  body('startDate')
    .notEmpty()
    .isISO8601()
    .withMessage('Start date is required and must be valid'),
  
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
    .custom((value, { req }) => {
      if (value && req.body.startDate) {
        if (new Date(value) < new Date(req.body.startDate)) {
          throw new Error('End date must be after start date');
        }
      }
      return true;
    }),
  
  validate
];

const validateClientId = [
  param('clientId')
    .isInt()
    .withMessage('Client ID must be an integer'),
  validate
];

// Routes

/**
 * @route   GET /api/meal-plans/stats
 * @desc    Get meal plan statistics
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/stats',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  mealPlanController.getStats
);

/**
 * @route   GET /api/meal-plans/templates
 * @desc    Get meal plan templates
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/templates',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  mealPlanController.getTemplates
);

/**
 * @route   GET /api/meal-plans/client/:clientId
 * @desc    Get meal plans for specific client
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/client/:clientId',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateClientId,
  mealPlanController.getClientMealPlans
);

/**
 * @route   GET /api/meal-plans
 * @desc    Get all meal plans
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  mealPlanController.getAll
);

/**
 * @route   GET /api/meal-plans/:id
 * @desc    Get single meal plan
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  mealPlanController.getOne
);

/**
 * @route   POST /api/meal-plans
 * @desc    Create new meal plan (template or client plan)
 * @access  Private (nutritionist, trainer)
 */
router.post(
  '/',
  authenticate,
  authorize(['nutritionist', 'trainer']),
  validateMealPlan,
  mealPlanController.create
);

/**
 * @route   POST /api/meal-plans/:id/assign
 * @desc    Assign template to client
 * @access  Private (nutritionist, trainer)
 */
router.post(
  '/:id/assign',
  authenticate,
  authorize(['nutritionist', 'trainer']),
  validateAssignment,
  mealPlanController.assignToClient
);

/**
 * @route   PUT /api/meal-plans/:id
 * @desc    Update meal plan
 * @access  Private (nutritionist, trainer, admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateMealPlanUpdate,
  mealPlanController.update
);

/**
 * @route   DELETE /api/meal-plans/:id
 * @desc    Delete meal plan
 * @access  Private (nutritionist, trainer, admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  mealPlanController.delete
);

module.exports = router;
