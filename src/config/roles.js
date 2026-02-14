const ROLES = {
  ADMIN: 'admin',
  NUTRITIONIST: 'nutritionist',
  TRAINER: 'trainer'
};

const ROLE_DESCRIPTIONS = {
  admin: {
    name: '관리자',
    description: '시스템 전체 관리 권한',
    capabilities: [
      '모든 사용자 관리',
      '모든 고객 데이터 접근',
      '시스템 설정',
      '사용자 생성/삭제'
    ]
  },
  nutritionist: {
    name: '영양사',
    description: '영양 관리 전문가',
    capabilities: [
      '자신의 고객 관리',
      '식단 계획 생성',
      '영양 분석 리포트 작성',
      '고객 상담'
    ]
  },
  trainer: {
    name: '트레이너',
    description: '운동 관리 전문가',
    capabilities: [
      '자신의 고객 관리',
      '운동 식단 관리',
      '운동 일지 확인',
      '체성분 분석'
    ]
  }
};

module.exports = { ROLES, ROLE_DESCRIPTIONS };
