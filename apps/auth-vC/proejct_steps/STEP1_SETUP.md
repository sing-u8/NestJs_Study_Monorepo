# 🚀 Step 1: 기반 설정 완료 가이드

## ✅ 완료된 작업들

### 1. 환경 변수 설정

- [x] `src/config/env.validation.ts` - Joi 기반 환경 변수 검증
- [x] 필수 환경 변수 정의 및 타입 지정
- [x] 개발/프로덕션 환경 구분

### 2. 데이터베이스 설정

- [x] `src/config/database.config.ts` - TypeORM 설정
- [x] PostgreSQL 연결 설정
- [x] 개발/테스트 환경별 설정 분리
- [x] 연결 풀 및 SSL 설정

### 3. JWT 설정

- [x] `src/config/jwt.config.ts` - JWT 토큰 설정
- [x] Access Token / Refresh Token 분리
- [x] 토큰 페이로드 타입 정의

### 4. TypeORM 엔티티

- [x] `src/auth/infrastructure/database/entities/user.typeorm.entity.ts`
- [x] `src/auth/infrastructure/database/entities/refresh-token.typeorm.entity.ts`
- [x] 인덱스 최적화 및 관계 설정

### 5. 데이터베이스 마이그레이션

- [x] `src/auth/infrastructure/database/migrations/1234567890-create-users-table.ts`
- [x] `src/auth/infrastructure/database/migrations/1234567891-create-refresh-tokens-table.ts`
- [x] 외래 키 제약조건 및 인덱스 설정

### 6. 애플리케이션 설정

- [x] `src/app/app.module.ts` - 루트 모듈 설정
- [x] `src/main.ts` - 애플리케이션 부트스트랩
- [x] CORS, Validation Pipe, Global Prefix 설정

## 🔧 환경 변수 설정 가이드

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 데이터베이스 설정
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=auth_db

# JWT 설정 (32자 이상 권장)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-32chars
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this-in-production-32chars
REFRESH_TOKEN_EXPIRES_IN=7d

# 소셜 로그인 설정 (선택사항)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

APPLE_CLIENT_ID=your-apple-client-id
APPLE_PRIVATE_KEY=your-apple-private-key
APPLE_CALLBACK_URL=http://localhost:3000/api/auth/apple/callback

# 애플리케이션 설정
PORT=3000
NODE_ENV=development

# 이메일 설정 (선택사항)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password
```

## 📦 필요한 패키지들

다음 패키지들이 설치되어 있어야 합니다:

### Dependencies:

```bash
pnpm add @nestjs/event-emitter passport-google-oauth20
```

### DevDependencies:

```bash
pnpm add -D @types/passport-google-oauth20
```

## 🗄️ 데이터베이스 스키마

### Users 테이블

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  provider VARCHAR(50) DEFAULT 'local',
  provider_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens 테이블

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  device_info VARCHAR(255),
  ip_address VARCHAR(45),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🚀 애플리케이션 실행

1. PostgreSQL 데이터베이스가 실행 중인지 확인
2. 환경 변수 설정 완료
3. 애플리케이션 실행:

```bash
cd apps/auth-vC
pnpm start:dev
```

4. 접속 확인:
   - API: http://localhost:3000/api
   - Health Check: http://localhost:3000/health

## 🎯 다음 단계 (Step 2: 도메인 계층)

Step 1이 완료되었으므로 이제 다음 작업들을 진행할 수 있습니다:

1. **도메인 엔티티 & 값 객체 정의**

   - `src/auth/domain/entities/user.entity.ts`
   - `src/auth/domain/value-objects/email.vo.ts`
   - `src/auth/domain/value-objects/password.vo.ts`

2. **리포지토리 인터페이스**

   - `src/auth/domain/repositories/user.repository.interface.ts`

3. **도메인 예외**
   - `src/auth/domain/exceptions/`

## 🔍 트러블슈팅

### 데이터베이스 연결 실패

- PostgreSQL 서비스가 실행 중인지 확인
- 환경 변수의 데이터베이스 정보가 정확한지 확인
- 데이터베이스가 존재하는지 확인

### 환경 변수 검증 실패

- .env 파일이 프로젝트 루트에 있는지 확인
- 필수 환경 변수가 모두 설정되었는지 확인
- JWT_SECRET이 32자 이상인지 확인

### 포트 충돌

- PORT 환경 변수를 다른 값으로 변경
- 다른 애플리케이션이 3000 포트를 사용 중인지 확인
