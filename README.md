# 🥗 Nutrition Management System

> 전문 영양사, 트레이너, 의료 전문가를 위한 종합 영양 관리 시스템

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://www.postgresql.org/)
[![Jest](https://img.shields.io/badge/Jest-30.2-red.svg)](https://jestjs.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📖 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [API 문서](#-api-문서)
- [테스트](#-테스트)
- [프로젝트 구조](#-프로젝트-구조)
- [보안 기능](#-보안-기능)
- [라이선스](#-라이선스)

## 🎯 프로젝트 소개

Nutrition Management System은 영양사, 퍼스널 트레이너, 의료 전문가가 고객의 영양 상태를 체계적으로 관리하고 분석할 수 있도록 설계된 전문 웹 애플리케이션입니다.

### 핵심 가치

- **과학적 분석**: Harris-Benedict 공식 기반의 정확한 칼로리 및 영양소 권장량 계산
- **개인화**: 각 고객의 목표, 활동 수준, 신체 정보에 맞춘 맞춤형 영양 계획
- **효율성**: 식단 템플릿, 자동 분석, 통계 기능으로 전문가의 업무 효율 극대화
- **확장성**: RESTful API 설계로 모바일 앱, 웹 대시보드 등 다양한 플랫폼 연동 가능

## ✨ 주요 기능

### 1. 사용자 및 권한 관리
- **역할 기반 접근 제어 (RBAC)**
  - Admin: 시스템 전체 관리
  - Nutritionist: 영양 상담 및 식단 관리
  - Trainer: 운동 및 영양 통합 관리
- JWT 기반 인증 (Access + Refresh Token)
- 사용자 통계 및 활동 관리

### 2. 고객 관리
- 고객 프로필 생성 및 관리 (신체 정보, 건강 목표, 알레르기 등)
- 소유권 검증으로 데이터 보안 보장
- Soft delete로 데이터 복구 가능
- 고객별 통계 및 목표 진행도 추적

### 3. 식단 관리
- **영양소 정보 포함 식단 기록**
  - 칼로리, 탄수화물, 단백질, 지방
  - 식이섬유, 비타민, 미네랄 등 13가지 영양소
- 식사 타입별 분류 (아침, 점심, 저녁, 간식)
- 일일/기간별 식단 조회 및 통계
- 고객별 식단 히스토리 관리

### 4. 식단 플랜
- **템플릿 시스템**
  - 재사용 가능한 식단 템플릿 생성
  - 여러 고객에게 일괄 할당
- 목표 칼로리 기반 플랜 설계
- JSON 형식으로 유연한 식단 구성
- 플랜 활성화/비활성화 관리

### 5. 영양 분석 엔진
- **권장 섭취량 계산**
  - Harris-Benedict 공식으로 BMR 계산
  - 활동 수준별 TDEE (총 에너지 소비량) 산출
  - 목표별 칼로리 조정 (체중 감량, 증량, 유지)
- **일일 영양 분석**
  - 실제 섭취량 vs 권장량 비교
  - 부족/과잉 영양소 식별
  - 섭취 비율 시각화 데이터
- **기간별 추세 분석**
  - 평균 섭취량 계산
  - 일관성 평가 (표준편차)
  - 영양 상태 점수화 (0-100점)
- **자동 식단 제안**
  - 부족한 영양소 보충 방안
  - 과잉 영양소 조절 권장사항

### 6. 리포트 생성
- 일별/주별/월별/커스텀 기간 리포트
- 자동 영양 분석 포함
- 전문가 추천사항 및 메모 기능
- 고객별 최신 리포트 조회

### 7. 공지사항 관리
- 카테고리별 분류 (공지, 팁, Q&A, 일반)
- 중요 공지 상단 고정 기능
- 조회수 자동 추적
- 검색 및 페이지네이션

## 🛠 기술 스택

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js 4.18
- **Database**: PostgreSQL 16
- **ORM**: Sequelize 6.37

### Security
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Security Headers**: Helmet
- **Rate Limiting**: express-rate-limit
- **CORS**: cors

### Testing
- **Framework**: Jest 30.2
- **HTTP Testing**: Supertest 7.2
- **Coverage**: Built-in Jest coverage

### Utilities
- **Logging**: Winston
- **Validation**: express-validator
- **Environment**: dotenv
- **Compression**: compression

## 🚀 시작하기

### 사전 요구사항

- Node.js 18.x 이상
- PostgreSQL 16.x
- npm 또는 yarn

### 설치

1. **저장소 클론**
```bash
git clone <repository-url>
cd MyScheduling
```

2. **의존성 설치**
```bash
npm install
```

3. **환경 변수 설정**
```bash
cp .env.example .env
```

`.env` 파일을 열어 다음 항목을 설정하세요:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nutrition_management
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
```

4. **데이터베이스 생성**
```bash
createdb nutrition_management
```

5. **서버 실행**
```bash
# 개발 모드 (nodemon)
npm run dev

# 프로덕션 모드
npm start
```

서버가 http://localhost:3000 에서 실행됩니다.

### 초기 관리자 계정 생성

서버 실행 후, 다음 API를 호출하여 관리자 계정을 생성하세요:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "Admin123!@#",
    "fullName": "System Administrator",
    "role": "admin"
  }'
```

## 📚 API 문서

### 인증 (Authentication) - 4개

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | 회원가입 | Public |
| POST | `/api/auth/login` | 로그인 | Public |
| GET | `/api/auth/me` | 내 정보 조회 | Required |
| PUT | `/api/auth/change-password` | 비밀번호 변경 | Required |

### 사용자 관리 (Users) - 7개

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/stats` | 사용자 통계 | Admin |
| GET | `/api/users` | 사용자 목록 | Admin |
| GET | `/api/users/:id` | 사용자 조회 | Admin |
| POST | `/api/users` | 사용자 생성 | Admin |
| PUT | `/api/users/:id` | 사용자 수정 | Admin |
| DELETE | `/api/users/:id` | 사용자 삭제 | Admin |
| PATCH | `/api/users/:id/toggle-active` | 활성화 토글 | Admin |

### 고객 관리 (Clients) - 8개

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/clients/stats` | 고객 통계 | Required |
| GET | `/api/clients` | 고객 목록 | Required |
| GET | `/api/clients/:id` | 고객 조회 | Required |
| POST | `/api/clients` | 고객 생성 | Required |
| PUT | `/api/clients/:id` | 고객 수정 | Required |
| DELETE | `/api/clients/:id` | 고객 삭제 (soft) | Required |
| DELETE | `/api/clients/:id/permanent` | 고객 영구 삭제 | Admin |
| PATCH | `/api/clients/:id/activate` | 고객 활성화 | Required |

### 식단 관리 (Meals) - 7개

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/meals` | 식단 목록 | Required |
| GET | `/api/meals/:id` | 식단 조회 | Required |
| POST | `/api/meals` | 식단 생성 | Required |
| PUT | `/api/meals/:id` | 식단 수정 | Required |
| DELETE | `/api/meals/:id` | 식단 삭제 | Required |
| GET | `/api/meals/client/:clientId/stats` | 고객 식단 통계 | Required |
| GET | `/api/meals/client/:clientId/date/:date` | 일별 식단 | Required |

### 식단 플랜 (Meal Plans) - 9개

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/meal-plans/stats` | 플랜 통계 | Required |
| GET | `/api/meal-plans/templates` | 템플릿 목록 | Required |
| GET | `/api/meal-plans/client/:clientId` | 고객별 플랜 | Required |
| GET | `/api/meal-plans` | 플랜 목록 | Required |
| GET | `/api/meal-plans/:id` | 플랜 조회 | Required |
| POST | `/api/meal-plans` | 플랜 생성 | Required |
| POST | `/api/meal-plans/:id/assign` | 템플릿 할당 | Required |
| PUT | `/api/meal-plans/:id` | 플랜 수정 | Required |
| DELETE | `/api/meal-plans/:id` | 플랜 삭제 | Required |

### 리포트 (Reports) - 8개

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/reports/stats` | 리포트 통계 | Required |
| GET | `/api/reports/client/:clientId/latest` | 최신 리포트 | Required |
| GET | `/api/reports/client/:clientId` | 고객별 리포트 | Required |
| GET | `/api/reports` | 리포트 목록 | Required |
| GET | `/api/reports/:id` | 리포트 조회 | Required |
| POST | `/api/reports` | 리포트 생성 | Required |
| PUT | `/api/reports/:id` | 리포트 수정 | Required |
| DELETE | `/api/reports/:id` | 리포트 삭제 | Required |

### 영양 분석 (Nutrition Analysis) - 4개

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/nutrition/client/:clientId/recommended` | 권장 섭취량 | Required |
| GET | `/api/nutrition/client/:clientId/daily/:date` | 일일 분석 | Required |
| GET | `/api/nutrition/client/:clientId/trend` | 추세 분석 | Required |
| GET | `/api/nutrition/client/:clientId/evaluate` | 영양 상태 평가 | Required |

### 공지사항 (Notices) - 7개

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/notices/stats` | 공지 통계 | Admin |
| GET | `/api/notices` | 공지사항 목록 | Public |
| GET | `/api/notices/:id` | 공지사항 조회 | Public |
| POST | `/api/notices` | 공지사항 생성 | Admin |
| PUT | `/api/notices/:id` | 공지사항 수정 | Admin |
| PATCH | `/api/notices/:id/pin` | 고정 토글 | Admin |
| DELETE | `/api/notices/:id` | 공지사항 삭제 | Admin |

**총 54개 API 엔드포인트**

상세한 API 문서는 [docs/API-ENDPOINTS.md](docs/API-ENDPOINTS.md)를 참조하세요.

## 🧪 테스트

### 테스트 실행

```bash
# 모든 테스트 실행
npm test

# 테스트 커버리지 포함
npm test -- --coverage

# 특정 테스트 파일 실행
npm test tests/auth.test.js

# Watch 모드
npm run test:watch
```

### 테스트 결과

```
Test Suites: 3 passed, 3 total
Tests:       30 passed, 30 total
Snapshots:   0 total
Time:        2.174s
```

### 테스트 커버리지

- **Controllers**: 19.19%
- **Models**: 95.52%
- **Middlewares**: 37.12%
- **Services**: 18.60%
- **Utils**: 51.28%

### 테스트 범위

- ✅ 인증 API (회원가입, 로그인, 토큰 검증)
- ✅ 고객 관리 API (CRUD, 검색, 페이지네이션)
- ✅ 영양 분석 서비스 (BMR/TDEE 계산, 권장량 산출)

## 📁 프로젝트 구조

```
MyScheduling/
├── src/
│   ├── config/            # 설정 파일
│   │   ├── index.js       # Sequelize 설정
│   │   └── database.js    # 환경별 DB 설정
│   ├── controllers/       # 비즈니스 로직
│   │   ├── authController.js
│   │   ├── clientController.js
│   │   ├── mealController.js
│   │   ├── mealPlanController.js
│   │   ├── noticeController.js
│   │   ├── nutritionController.js
│   │   ├── reportController.js
│   │   └── userController.js
│   ├── middlewares/       # 미들웨어
│   │   ├── authenticate.js
│   │   ├── authorize.js
│   │   ├── checkOwnership.js
│   │   ├── checkPermission.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── migrations/        # DB 마이그레이션
│   │   └── 20260214065500-create-*.js
│   ├── models/            # Sequelize 모델
│   │   ├── index.js
│   │   ├── User.js
│   │   ├── Client.js
│   │   ├── Meal.js
│   │   ├── MealPlan.js
│   │   ├── Nutrition.js
│   │   ├── Report.js
│   │   └── Notice.js
│   ├── routes/            # API 라우트
│   │   ├── authRoutes.js
│   │   ├── clientRoutes.js
│   │   ├── mealRoutes.js
│   │   ├── mealPlanRoutes.js
│   │   ├── noticeRoutes.js
│   │   ├── nutritionRoutes.js
│   │   ├── reportRoutes.js
│   │   └── userRoutes.js
│   ├── seeders/           # 테스트 데이터
│   │   └── 20260214065953-demo-users-and-clients.js
│   ├── services/          # 비즈니스 서비스
│   │   └── nutritionService.js
│   ├── utils/             # 유틸리티
│   │   ├── AppError.js
│   │   ├── catchAsync.js
│   │   ├── errors.js
│   │   ├── jwt.js
│   │   └── logger.js
│   └── server.js          # 서버 엔트리 포인트
├── tests/                 # 테스트 코드
│   ├── setup.js
│   ├── auth.test.js
│   ├── client.test.js
│   └── nutrition.test.js
├── docs/                  # 문서
│   └── API-ENDPOINTS.md
├── public/                # 정적 파일
│   ├── index.html
│   ├── login.html
│   └── ...
├── .env                   # 환경 변수
├── .env.test              # 테스트 환경 변수
├── .gitignore
├── jest.config.js         # Jest 설정
├── package.json
└── README.md
```

## 🔒 보안 기능

### 인증 및 권한
- JWT 기반 인증 (Access Token + Refresh Token)
- 역할 기반 접근 제어 (Admin, Nutritionist, Trainer)
- 리소스 소유권 검증
- 토큰 만료 관리

### 데이터 보안
- bcrypt를 사용한 비밀번호 해싱 (salt rounds: 10)
- SQL Injection 방지 (Sequelize ORM)
- XSS 방지 (입력 검증 및 이스케이프)
- CSRF 보호 가능 (필요시 활성화)

### 네트워크 보안
- Helmet으로 보안 헤더 설정
- CORS 정책 적용
- Rate Limiting (전역: 100req/15min, 로그인: 5req/15min)
- HTTPS 권장 (프로덕션)

### 데이터 무결성
- express-validator로 입력 검증
- Sequelize 모델 레벨 유효성 검사
- 외래 키 제약조건
- Soft delete로 데이터 복구 가능

## 🌟 주요 알고리즘

### Harris-Benedict 공식 (BMR 계산)

**남성**:
```
BMR = 88.362 + (13.397 × 체중kg) + (4.799 × 신장cm) - (5.677 × 나이)
```

**여성**:
```
BMR = 447.593 + (9.247 × 체중kg) + (3.098 × 신장cm) - (4.330 × 나이)
```

### TDEE (총 에너지 소비량)

```
TDEE = BMR × 활동 계수
```

활동 계수:
- 좌식: 1.2
- 가벼운 활동: 1.375
- 보통 활동: 1.55
- 활발한 활동: 1.725
- 매우 활발: 1.9

### 목표별 칼로리 조정

- **체중 감량**: TDEE - 500kcal
- **체중 증량**: TDEE + 300kcal  
- **체중 유지**: TDEE

## 📈 향후 개선 계획

- [ ] GraphQL API 추가
- [ ] 실시간 알림 시스템 (Socket.io)
- [ ] 모바일 앱 (React Native)
- [ ] 식품 데이터베이스 연동
- [ ] AI 기반 식단 추천
- [ ] 다국어 지원 (i18n)
- [ ] Docker 컨테이너화
- [ ] CI/CD 파이프라인 구축

## 🤝 기여하기

프로젝트 개선에 참여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 👨‍💻 개발자

**Jang Yunho**
- GitHub: [@your-github](https://github.com/your-github)
- Email: your.email@example.com

## 🙏 감사의 말

이 프로젝트는 다음 오픈소스 프로젝트를 사용했습니다:
- Express.js
- Sequelize
- PostgreSQL
- Jest
- 그 외 모든 의존성 패키지

---

**⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!**
