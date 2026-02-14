'use strict';

const bcrypt = require('bcrypt');

/**
 * Demo Seed Data
 * 
 * 초기 테스트를 위한 데모 데이터
 * - 전문가 계정 3명 (admin, nutritionist, trainer)
 * - 고객 데이터 5명
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. 전문가 계정 생성
    const users = await queryInterface.bulkInsert('users', [
      {
        username: 'admin',
        email: 'admin@nutrition.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        full_name: '관리자',
        phone: '010-1234-5678',
        license_number: 'ADMIN-2024-001',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'nutritionist1',
        email: 'nutritionist1@nutrition.com',
        password: await bcrypt.hash('nutrition123', 10),
        role: 'nutritionist',
        full_name: '김영양',
        phone: '010-2345-6789',
        license_number: 'NUT-2024-001',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'trainer1',
        email: 'trainer1@nutrition.com',
        password: await bcrypt.hash('trainer123', 10),
        role: 'trainer',
        full_name: '박트레',
        phone: '010-3456-7890',
        license_number: 'TRA-2024-001',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], { returning: true });

    // 2. 고객 데이터 생성
    await queryInterface.bulkInsert('clients', [
      {
        user_id: 2, // nutritionist1
        name: '이고객',
        email: 'client1@example.com',
        phone: '010-1111-2222',
        birth_date: '1990-05-15',
        gender: 'male',
        height_cm: 175.0,
        weight_kg: 75.5,
        target_weight_kg: 70.0,
        activity_level: 'moderate',
        health_goals: '체중 감량 5kg, 근력 증가',
        allergies: '땅콩',
        medical_conditions: null,
        notes: '운동을 좋아하고 규칙적인 생활 패턴',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2, // nutritionist1
        name: '김건강',
        email: 'client2@example.com',
        phone: '010-2222-3333',
        birth_date: '1985-08-20',
        gender: 'female',
        height_cm: 165.0,
        weight_kg: 58.0,
        target_weight_kg: 55.0,
        activity_level: 'light',
        health_goals: '건강한 식습관 유지',
        allergies: '갑각류',
        medical_conditions: '고혈압',
        notes: '저염식 선호',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 3, // trainer1
        name: '최운동',
        email: 'client3@example.com',
        phone: '010-3333-4444',
        birth_date: '1995-03-10',
        gender: 'male',
        height_cm: 180.0,
        weight_kg: 82.0,
        target_weight_kg: 78.0,
        activity_level: 'very_active',
        health_goals: '근육량 증가, 체지방률 감소',
        allergies: null,
        medical_conditions: null,
        notes: '하루 2회 운동, 고단백 식단 선호',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2, // nutritionist1
        name: '박다이어트',
        email: 'client4@example.com',
        phone: '010-4444-5555',
        birth_date: '1992-11-25',
        gender: 'female',
        height_cm: 160.0,
        weight_kg: 68.0,
        target_weight_kg: 58.0,
        activity_level: 'sedentary',
        health_goals: '체중 감량 10kg, 식습관 개선',
        allergies: '유제품',
        medical_conditions: null,
        notes: '사무직, 외식이 잦음',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 3, // trainer1
        name: '정선수',
        email: 'client5@example.com',
        phone: '010-5555-6666',
        birth_date: '1998-07-30',
        gender: 'male',
        height_cm: 178.0,
        weight_kg: 70.0,
        target_weight_kg: 75.0,
        activity_level: 'active',
        health_goals: '체중 증가, 근육량 증가',
        allergies: null,
        medical_conditions: null,
        notes: '마른 체형, 식사량 증가 필요',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    // 3. 샘플 게시글 생성
    await queryInterface.bulkInsert('notices', [
      {
        user_id: 1, // admin
        title: '전문 영양 관리 시스템에 오신 것을 환영합니다',
        content: `안녕하세요! 전문 영양 관리 시스템을 이용해 주셔서 감사합니다.\n\n본 시스템은 영양사와 트레이너가 고객의 식단을 체계적으로 관리할 수 있도록 설계되었습니다.\n\n주요 기능:\n- 고객 관리\n- 식단 기록 및 분석\n- 영양소 추적\n- 맞춤형 식단 계획\n- 상세 분석 리포트\n\n문의사항이 있으시면 언제든지 연락 주세요.`,
        category: 'notice',
        views: 0,
        is_pinned: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 2, // nutritionist1
        title: '건강한 아침 식사의 중요성',
        content: `아침 식사는 하루를 시작하는 중요한 식사입니다.\n\n권장 아침 식단:\n- 통곡물 (현미밥, 통밀빵)\n- 단백질 (계란, 두부, 생선)\n- 채소와 과일\n- 저지방 유제품\n\n아침을 거르면 점심에 과식하게 되고, 혈당 조절이 어려워집니다.`,
        category: 'tip',
        views: 0,
        is_pinned: false,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        user_id: 3, // trainer1
        title: '운동 전후 식사 가이드',
        content: `운동 효과를 극대화하기 위한 식사 타이밍:\n\n운동 전 (1-2시간):\n- 탄수화물 중심\n- 바나나, 오트밀, 고구마\n\n운동 후 (30분 이내):\n- 단백질 + 탄수화물\n- 닭가슴살, 쉐이크, 삶은 계란\n\n수분 섭취도 잊지 마세요!`,
        category: 'tip',
        views: 0,
        is_pinned: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    console.log('✅ Demo seed data inserted successfully!');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('notices', null, {});
    await queryInterface.bulkDelete('clients', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
