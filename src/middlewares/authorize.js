const logger = require('../utils/logger');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

// Role-based access control middleware
// Accepts either an array of roles or variadic roles
const authorize = (...allowedRoles) => {
  const roles = Array.isArray(allowedRoles[0]) ? allowedRoles[0] : allowedRoles;

  return (req, res, next) => {
    if (!req.user) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const hasRole = roles.includes(req.user.role);

    if (!hasRole) {
      logger.warn(`Unauthorized access attempt by user ${req.user.id} (role: ${req.user.role})`);
      return next(
        new ForbiddenError(
          `Access denied. Required roles: ${roles.join(', ')}, current: ${req.user.role}`
        )
      );
    }

    next();
  };
};

module.exports = authorize;
