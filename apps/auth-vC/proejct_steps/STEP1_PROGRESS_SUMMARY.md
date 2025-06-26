# 🚀 NestJS Clean Architecture Auth System - Step 1 완료 현황

## 📋 프로젝트 개요

- **목표**: NestJS + 클린 아키텍처를 사용한 인증 시스템 구현
- **기능**: 회원가입, 로그인(일반/소셜), 로그아웃, 회원탈퇴
- **데이터베이스**: PostgreSQL + TypeORM
- **아키텍처**: CQRS 없는 클린 아키텍처 (Domain → Application → Infrastructure → Presentation)

## ✅ Step 1: 기반 설정 완료 내역

### 1. 환경 변수 관리 시스템

```typescript
// apps/auth-vC/src/config/env.validation.ts
- Joi 기반 환경 변수 검증 스키마
- TypeScript 타입 정의 (EnvironmentVariables)
- 필수/선택 환경 변수 구분
- 개발/프로덕션 환경 구분
```

**포함된 환경 변수:**

- DATABASE\_\* (PostgreSQL 연결 정보)
- JWT_SECRET, REFRESH_TOKEN_SECRET (토큰 시크릿)
- GOOGLE*\*, APPLE*\* (소셜 로그인 설정)
- PORT, NODE_ENV (애플리케이션 설정)

### 2. 데이터베이스 설정

```typescript
// apps/auth-vC/src/config/database.config.ts
- TypeORM 설정 팩토리 (registerAs 사용)
- PostgreSQL 연결 설정
- 개발/테스트 환경별 설정 분리
- 연결 풀, SSL, 로깅 설정
- 엔티티 자동 로딩 경로 설정
```

### 3. JWT 토큰 시스템

```typescript
// apps/auth-vC/src/config/jwt.config.ts
- Access Token / Refresh Token 분리 설정
- 토큰 페이로드 타입 정의 (JwtPayload, RefreshTokenPayload)
- NestJS JWT 모듈 설정
- 발행자(issuer), 대상(audience) 설정
```

### 4. TypeORM 엔티티 (인프라스트럭처 계층)

```typescript
// apps/auth-vC/src/auth/infrastructure/database/entity/

// user.typeorm.entity.ts
- 사용자 기본 정보 (id, email, password_hash)
- 소셜 로그인 지원 (provider, provider_id)
- 계정 상태 관리 (is_active, is_email_verified)
- 활동 추적 (last_login_at, created_at, updated_at)
- 인덱스 최적화 (이메일, 소셜로그인 조회)

// refresh-token.typeorm.entity.ts
- 리프레시 토큰 관리 (token, expires_at)
- 사용자와 1:N 관계 (CASCADE 삭제)
- 보안 추적 (device_info, ip_address)
- 토큰 상태 관리 (is_active, last_used_at)
- 다중 디바이스 로그인 지원
```

### 5. 데이터베이스 마이그레이션

```typescript
// apps/auth-vC/src/auth/infrastructure/database/migration/

// 1234567890-create-users-table.ts
- users 테이블 생성
- 인덱스 설정 (이메일, 소셜로그인, 활성상태, 생성일)
- 제약조건 설정

// 1234567891-create-refresh-tokens-table.ts
- refresh_tokens 테이블 생성
- 외래키 제약조건 (users.id 참조, CASCADE 삭제)
- 복합 인덱스 (사용자별 활성 토큰 조회 최적화)
- 토큰 만료 정리를 위한 인덱스
```

### 6. 애플리케이션 설정

```typescript
// apps/auth-vC/src/app/app.module.ts
- ConfigModule 전역 설정 (Joi 검증)
- TypeORM 모듈 설정 (비동기 설정)
- JwtModule 전역 설정
- EventEmitterModule 준비 (주석 처리)

// apps/auth-vC/src/main.ts
- ValidationPipe 전역 설정 (DTO 검증)
- CORS 설정 (개발/프로덕션 구분)
- 글로벌 프리픽스 (/api)
- 우아한 종료 설정
```

## 📁 현재 폴더 구조

```
apps/auth-vC/src/
├── config/                     # 전역 설정
│   ├── env.validation.ts       ✅ 환경변수 검증
│   ├── database.config.ts      ✅ DB 설정
│   └── jwt.config.ts          ✅ JWT 설정
├── auth/
│   └── infrastructure/
│       └── database/
│           ├── entities/       # TypeORM 엔티티
│           │   ├── user.typeorm.entity.ts          ✅
│           │   └── refresh-token.typeorm.entity.ts ✅
│           └── migrations/     # DB 스키마 버전 관리
│               ├── 1234567890-create-users-table.ts        ✅
│               └── 1234567891-create-refresh-tokens-table.ts ✅
├── app/
│   └── app.module.ts          ✅ 루트 모듈 (업데이트됨)
└── main.ts                    ✅ 애플리케이션 부트스트랩
```

## 🗄️ 데이터베이스 스키마

```sql
-- Users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),                    -- 소셜 로그인시 NULL
  provider VARCHAR(50) DEFAULT 'local',          -- 'local', 'google', 'apple'
  provider_id VARCHAR(255),                      -- 소셜 로그인 ID
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Refresh Tokens 테이블
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  device_info VARCHAR(255),                      -- 디바이스 추적
  ip_address VARCHAR(45),                        -- IPv6 지원
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 필요한 환경 변수 (.env)

```env
# 데이터베이스
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=password
DATABASE_NAME=auth_db

# JWT (32자 이상 권장)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-32chars
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-this-in-production-32chars
REFRESH_TOKEN_EXPIRES_IN=7d

# 소셜 로그인 (선택사항)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# 애플리케이션
PORT=3000
NODE_ENV=development
```

## 🎯 다음 단계 (Step 2: 도메인 계층)

구현 예정:

1. **도메인 엔티티 & 값 객체**

   - `src/auth/domain/entities/user.entity.ts`
   - `src/auth/domain/value-objects/email.vo.ts`
   - `src/auth/domain/value-objects/password.vo.ts`
   - `src/auth/domain/value-objects/provider.vo.ts`

2. **리포지토리 인터페이스**

   - `src/auth/domain/repositories/user.repository.interface.ts`
   - `src/auth/domain/repositories/refresh-token.repository.interface.ts`

3. **도메인 예외**
   - `src/auth/domain/exceptions/user-already-exists.exception.ts`
   - `src/auth/domain/exceptions/invalid-credentials.exception.ts`
   - `src/auth/domain/exceptions/user-not-found.exception.ts`

## 🔍 핵심 설계 원칙

1. **클린 아키텍처**: 의존성 역전, 계층 분리
2. **타입 안전성**: TypeScript + Joi 검증
3. **보안**: JWT 분리, 환경변수 검증, 토큰 추적
4. **확장성**: 소셜 로그인 지원, 다중 디바이스
5. **유지보수**: 마이그레이션, 설정 분리, 문서화
