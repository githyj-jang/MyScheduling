const router = require('express').Router();
const { body } = require('express-validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const clientController = require('../controllers/clientController');

// Validation rules
const validateClient = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9-+().\s]+$/)
    .withMessage('Invalid phone format'),
  
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      const date = new Date(value);
      const now = new Date();
      if (date > now) {
        throw new Error('Birth date cannot be in the future');
      }
      return true;
    }),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  
  body('goal')
    .optional()
    .isIn(['weight_loss', 'muscle_gain', 'maintenance', 'health_improvement'])
    .withMessage('Invalid goal'),
  
  body('activityLevel')
    .optional()
    .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
    .withMessage('Invalid activity level'),
  
  validate
];

const validateClientUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be 2-100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[0-9-+().\s]+$/)
    .withMessage('Invalid phone format'),
  
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Gender must be male, female, or other'),
  
  body('height')
    .optional()
    .isFloat({ min: 50, max: 300 })
    .withMessage('Height must be between 50 and 300 cm'),
  
  body('weight')
    .optional()
    .isFloat({ min: 20, max: 500 })
    .withMessage('Weight must be between 20 and 500 kg'),
  
  body('goal')
    .optional()
    .isIn(['weight_loss', 'muscle_gain', 'maintenance', 'health_improvement'])
    .withMessage('Invalid goal'),
  
  body('activityLevel')
    .optional()
    .isIn(['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'])
    .withMessage('Invalid activity level'),
  
  validate
];

// Routes

/**
 * @route   GET /api/clients/stats
 * @desc    Get client statistics
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/stats',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  clientController.getStats
);

/**
 * @route   GET /api/clients
 * @desc    Get all clients (filtered by user role)
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  clientController.getAll
);

/**
 * @route   GET /api/clients/:id
 * @desc    Get single client
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  clientController.getOne
);

/**
 * @route   POST /api/clients
 * @desc    Create new client
 * @access  Private (nutritionist, trainer)
 */
router.post(
  '/',
  authenticate,
  authorize(['nutritionist', 'trainer']),
  validateClient,
  clientController.create
);

/**
 * @route   PUT /api/clients/:id
 * @desc    Update client
 * @access  Private (nutritionist, trainer, admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateClientUpdate,
  clientController.update
);

/**
 * @route   DELETE /api/clients/:id
 * @desc    Deactivate client (soft delete)
 * @access  Private (nutritionist, trainer, admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  clientController.delete
);

/**
 * @route   PATCH /api/clients/:id/activate
 * @desc    Activate client
 * @access  Private (nutritionist, trainer, admin)
 */
router.patch(
  '/:id/activate',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  clientController.activate
);

/**
 * @route   DELETE /api/clients/:id/permanent
 * @desc    Permanently delete client
 * @access  Private (admin only)
 */
router.delete(
  '/:id/permanent',
  authenticate,
  authorize(['admin']),
  clientController.permanentDelete
);

module.exports = router;
