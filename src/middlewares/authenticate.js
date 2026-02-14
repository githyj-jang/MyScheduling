const { verifyToken } = require('../utils/jwt');
const { User } = require('../models');
const logger = require('../utils/logger');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

// JWT authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('Access denied. No token provided.');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedError('Invalid token format. Use: Bearer <token>');
    }

    const token = parts[1];
    const decoded = verifyToken(token);

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new UnauthorizedError('User not found.');
    }

    if (!user.isActive) {
      throw new ForbiddenError('Account is deactivated.');
    }

    req.user = user;
    logger.info(`User authenticated: ${user.username} (${user.role})`);
    next();
  } catch (error) {
    return next(error);
  }
};

module.exports = authenticate;
