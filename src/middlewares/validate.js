const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/errors');

// Collect express-validator errors and forward in a consistent shape
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const details = errors.array().map((err) => ({
      field: err.path,
      message: err.msg
    }));

    return next(new ValidationError('Validation failed', details));
  }

  next();
};

module.exports = validate;
