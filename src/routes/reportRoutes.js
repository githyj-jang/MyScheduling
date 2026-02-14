const router = require('express').Router();
const { body, param } = require('express-validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const reportController = require('../controllers/reportController');

// Validation rules
const validateReport = [
  body('clientId')
    .notEmpty()
    .isInt()
    .withMessage('Client ID is required'),
  
  body('reportType')
    .notEmpty()
    .isIn(['daily', 'weekly', 'monthly', 'custom'])
    .withMessage('Report type must be daily, weekly, monthly, or custom'),
  
  body('periodStart')
    .notEmpty()
    .isISO8601()
    .withMessage('Period start date is required and must be valid'),
  
  body('periodEnd')
    .notEmpty()
    .isISO8601()
    .withMessage('Period end date is required and must be valid')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.periodStart)) {
        throw new Error('Period end must be after period start');
      }
      return true;
    }),
  
  body('recommendations')
    .optional()
    .trim(),
  
  body('notes')
    .optional()
    .trim(),
  
  validate
];

const validateReportUpdate = [
  body('recommendations')
    .optional()
    .trim(),
  
  body('notes')
    .optional()
    .trim(),
  
  body('summaryJson')
    .optional()
    .isObject()
    .withMessage('summaryJson must be an object'),
  
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
 * @route   GET /api/reports/stats
 * @desc    Get report statistics
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/stats',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  reportController.getStats
);

/**
 * @route   GET /api/reports/client/:clientId/latest
 * @desc    Get latest report for client
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/client/:clientId/latest',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateClientId,
  reportController.getLatestByClient
);

/**
 * @route   GET /api/reports/client/:clientId
 * @desc    Get all reports for specific client
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/client/:clientId',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateClientId,
  reportController.getClientReports
);

/**
 * @route   GET /api/reports
 * @desc    Get all reports
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  reportController.getAll
);

/**
 * @route   GET /api/reports/:id
 * @desc    Get single report
 * @access  Private (nutritionist, trainer, admin)
 */
router.get(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  reportController.getOne
);

/**
 * @route   POST /api/reports
 * @desc    Create new report with nutrition analysis
 * @access  Private (nutritionist, trainer)
 */
router.post(
  '/',
  authenticate,
  authorize(['nutritionist', 'trainer']),
  validateReport,
  reportController.create
);

/**
 * @route   PUT /api/reports/:id
 * @desc    Update report
 * @access  Private (nutritionist, trainer, admin)
 */
router.put(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  validateReportUpdate,
  reportController.update
);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete report
 * @access  Private (nutritionist, trainer, admin)
 */
router.delete(
  '/:id',
  authenticate,
  authorize(['nutritionist', 'trainer', 'admin']),
  reportController.delete
);

module.exports = router;
