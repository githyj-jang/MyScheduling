const { Op } = require('sequelize');
const { User } = require('../models');
const { generateTokens } = require('../utils/jwt');
const logger = require('../utils/logger');
const catchAsync = require('../utils/catchAsync');
const {
  ConflictError,
  UnauthorizedError,
  ForbiddenError
} = require('../utils/errors');

// Register new user
const register = catchAsync(async (req, res) => {
  const { username, email, password, fullName, role, licenseNumber, phone } = req.body;

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ username }, { email }]
    }
  });

  if (existingUser) {
    throw new ConflictError('Username or email already exists');
  }

  const user = await User.create({
    username,
    email,
    password,
    fullName,
    role: role || 'nutritionist',
    licenseNumber,
    phone
  });

  const tokens = generateTokens(user);

  logger.info(`New user registered: ${user.username} (${user.role})`);

  res.status(201).json({
    success: true,
    data: {
      user: user.toJSON(),
      ...tokens
    }
  });
});

// Login user
const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ where: { username } });

  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  if (!user.isActive) {
    throw new ForbiddenError('Account is inactive');
  }

  const isValidPassword = await user.validatePassword(password);

  if (!isValidPassword) {
    throw new UnauthorizedError('Invalid credentials');
  }

  await user.update({ lastLoginAt: new Date() });

  const tokens = generateTokens(user);

  logger.info(`User logged in: ${user.username}`);

  res.json({
    success: true,
    data: {
      user: user.toJSON(),
      ...tokens
    }
  });
});

// Get current user profile
const getMe = catchAsync(async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

// Change password for authenticated user
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findByPk(req.user.id);

  const isValid = await user.validatePassword(currentPassword);

  if (!isValid) {
    throw new UnauthorizedError('Current password is incorrect');
  }

  await user.update({ password: newPassword });

  logger.info(`Password changed for user: ${user.username}`);

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});

module.exports = {
  register,
  login,
  getMe,
  changePassword
};
