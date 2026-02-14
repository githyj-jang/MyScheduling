const logger = require('../utils/logger');

// Centralized error handler for consistent API responses
const errorHandler = (err, req, res, next) => {
  const fallbackStatus = (err.statusCode || 500).toString().startsWith('4') ? 'fail' : 'error';
  const error = {
    ...err,
    message: err.message || 'Internal server error',
    statusCode: err.statusCode || 500,
    status: err.status || fallbackStatus
  };

  if (error.statusCode === 500 || !err.isOperational) {
    logger.error('Error:', {
      message: error.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      user: req.user?.username
    });
  } else {
    logger.warn('Operational Error:', {
      message: error.message,
      url: req.originalUrl,
      method: req.method,
      user: req.user?.username
    });
  }

  // Sequelize validation
  if (err.name === 'SequelizeValidationError') {
    error.message = 'Validation failed';
    error.statusCode = 400;
    error.details = err.errors.map((e) => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    error.message = 'Duplicate entry';
    error.statusCode = 409;
    error.details = err.errors.map((e) => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error.message = 'Foreign key constraint failed';
    error.statusCode = 400;
  }

  if (err.name === 'SequelizeDatabaseError') {
    error.message = 'Database error';
    error.statusCode = 500;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // express-validator custom ValidationError
  if (err.name === 'ValidationError' && err.details) {
    error.message = 'Validation failed';
    error.statusCode = 400;
    error.details = err.details;
  }

  const response = {
    success: false,
    status: error.status,
    message: error.message
  };

  if (error.details) {
    response.details = error.details;
  }

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

module.exports = errorHandler;
