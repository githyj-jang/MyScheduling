const { ROLES } = require('./roles');

const PERMISSIONS = {
  // 사용자 관리
  'users:list': [ROLES.ADMIN],
  'users:read': [ROLES.ADMIN],
  'users:create': [ROLES.ADMIN],
  'users:update': [ROLES.ADMIN],
  'users:delete': [ROLES.ADMIN],

  // 고객 관리
  'clients:list': [ROLES.ADMIN, ROLES.NUTRITIONIST, ROLES.TRAINER],
  'clients:read': [ROLES.ADMIN, ROLES.NUTRITIONIST, ROLES.TRAINER],
  'clients:create': [ROLES.NUTRITIONIST, ROLES.TRAINER],
  'clients:update': [ROLES.NUTRITIONIST, ROLES.TRAINER],
  'clients:delete': [ROLES.ADMIN, ROLES.NUTRITIONIST, ROLES.TRAINER],

  // 식단 관리
  'meals:list': [ROLES.ADMIN, ROLES.NUTRITIONIST, ROLES.TRAINER],
  'meals:read': [ROLES.ADMIN, ROLES.NUTRITIONIST, ROLES.TRAINER],
  'meals:create': [ROLES.NUTRITIONIST, ROLES.TRAINER],
  'meals:update': [ROLES.NUTRITIONIST, ROLES.TRAINER],
  'meals:delete': [ROLES.NUTRITIONIST, ROLES.TRAINER],

  // 영양 분석
  'nutrition:analyze': [ROLES.NUTRITIONIST, ROLES.TRAINER],
  'nutrition:report': [ROLES.NUTRITIONIST],

  // 식단 계획
  'meal-plans:list': [ROLES.ADMIN, ROLES.NUTRITIONIST, ROLES.TRAINER],
  'meal-plans:read': [ROLES.ADMIN, ROLES.NUTRITIONIST, ROLES.TRAINER],
  'meal-plans:create': [ROLES.NUTRITIONIST],
  'meal-plans:update': [ROLES.NUTRITIONIST],
  'meal-plans:delete': [ROLES.ADMIN, ROLES.NUTRITIONIST],

  // 리포트
  'reports:list': [ROLES.ADMIN, ROLES.NUTRITIONIST, ROLES.TRAINER],
  'reports:read': [ROLES.ADMIN, ROLES.NUTRITIONIST, ROLES.TRAINER],
  'reports:create': [ROLES.NUTRITIONIST],
  'reports:delete': [ROLES.ADMIN, ROLES.NUTRITIONIST],

  // 게시판
  'notices:list': [ROLES.ADMIN, ROLES.NUTRITIONIST, ROLES.TRAINER],
  'notices:read': [ROLES.ADMIN, ROLES.NUTRITIONIST, ROLES.TRAINER],
  'notices:create': [ROLES.ADMIN],
  'notices:update': [ROLES.ADMIN],
  'notices:delete': [ROLES.ADMIN]
};

const hasPermission = (role, permission) => {
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) {
    return false;
  }
  return allowedRoles.includes(role);
};

const getRolePermissions = (role) => {
  return Object.keys(PERMISSIONS).filter((permission) =>
    PERMISSIONS[permission].includes(role)
  );
};

module.exports = {
  PERMISSIONS,
  hasPermission,
  getRolePermissions
};
