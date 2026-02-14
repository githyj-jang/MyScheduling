const { hasPermission } = require('../config/permissions');
const logger = require('../utils/logger');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const userRole = req.user.role;

    if (!hasPermission(userRole, permission)) {
      logger.warn(
        `Permission denied: ${req.user.username} (${userRole}) tried to access ${permission}`
      );

      return next(new ForbiddenError(`Permission '${permission}' required for role '${userRole}'`));
    }

    logger.info(
      `Permission granted: ${req.user.username} (${userRole}) accessed ${permission}`
    );

    next();
  };
};

module.exports = checkPermission;
