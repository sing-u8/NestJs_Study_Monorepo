# 🎯 NestJS Clean Architecture Auth System - Step 2 완료 현황

## 📋 Step 2: 도메인 계층 구현 개요

- **목표**: 도메인 엔티티, 값 객체, 리포지토리 인터페이스, 도메인 예외 구현
- **원칙**: 비즈니스 로직의 중심, 외부 의존성 없는 순수한 도메인 규칙
- **구조**: Entity → Value Object → Repository Interface → Domain Service → Exception

## ✅ Step 2: 도메인 계층 완료 내역

### 1. 공통 타입 및 열거형 (shared 폴더)

```typescript
// apps/auth-vC/src/shared/enum/
- provider.enum.ts          ✅ 인증 제공자 열거형 (LOCAL, GOOGLE, APPLE)
- user-status.enum.ts       ✅ 사용자 상태 열거형 (ACTIVE, INACTIVE, etc.)

// apps/auth-vC/src/shared/type/
- auth.types.ts             ✅ 인증 관련 타입 정의
- common.types.ts           ✅ 공통 인터페이스 및 타입
```

**주요 특징:**

- Provider 유틸리티 클래스로 제공자 검증 기능
- UserStatus 유틸리티 클래스로 상태 관리 기능
- 도메인 엔티티/값 객체 기본 인터페이스 정의
- 페이지네이션, 검색 옵션 타입 정의

### 2. 값 객체 (Value Objects)

```typescript
// apps/auth-vC/src/auth/domain/vo/

// email.vo.ts                ✅ 이메일 값 객체
- RFC 5321 표준 준수 (최대 254자)
- 이메일 형식 검증 (정규식)
- 대소문자 정규화 및 공백 제거
- 도메인/로컬 부분 추출 기능

// password.vo.ts             ✅ 비밀번호 값 객체
- 복잡성 요구사항 검증 (대소문자, 숫자, 특수문자)
- 최소/최대 길이 제한 (8-128자)
- 연속된 동일 문자 방지
- 비밀번호 강도 계산 (1-5점)

// provider.vo.ts             ✅ 인증 제공자 값 객체
- 지원되는 제공자만 허용
- 로컬/소셜 제공자 구분 기능
- 팩토리 메서드 제공

// user-id.vo.ts              ✅ 사용자 ID 값 객체
- UUID 형식 검증
- 새 ID 생성 기능
- 불변성 보장
```

### 3. 도메인 예외 (Domain Exceptions)

```typescript
// apps/auth-vC/src/auth/domain/exception/

// domain.exception.ts              ✅ 도메인 예외 기본 클래스
- 추상 클래스로 공통 예외 구조 정의
- 에러 코드, HTTP 상태 코드 포함
- JSON 직렬화 지원

// user-already-exists.exception.ts ✅ 사용자 중복 예외
- 409 상태 코드
- 이메일 정보 포함

// user-not-found.exception.ts      ✅ 사용자 미발견 예외
- 404 상태 코드
- ID/이메일 구분 지원

// invalid-credentials.exception.ts ✅ 잘못된 인증 정보 예외
- 401 상태 코드
- 로그인 실패 처리

// invalid-refresh-token.exception.ts ✅ 유효하지 않은 토큰 예외
- 401 상태 코드
- 토큰 실패 이유 포함
```

### 4. 도메인 엔티티 (Domain Entities)

```typescript
// apps/auth-vC/src/auth/domain/entity/

// user.entity.ts               ✅ 사용자 도메인 엔티티
- 로컬/소셜 계정 생성 팩토리 메서드
- 보안 강화: 오직 해시된 비밀번호만 저장 🔒
- 이메일 인증 처리
- 계정 상태 관리 (활성화/비활성화/정지)
- 로그인 시간 추적
- 비즈니스 규칙 검증

// refresh-token.entity.ts      ✅ 리프레시 토큰 도메인 엔티티
- 토큰 만료 검증
- 토큰 사용 기록 관리
- 토큰 갱신 로직
- 디바이스별 토큰 관리
- 보안 추적 기능
```

### 5. 리포지토리 인터페이스 (Repository Interfaces)

```typescript
// apps/auth-vC/src/auth/domain/repository/

// user.repository.interface.ts     ✅ 사용자 리포지토리 인터페이스
- CRUD 기본 operations
- 이메일/소셜 로그인 조회
- 존재 여부 확인
- 페이지네이션 지원
- 검색 및 필터링
- 상태 업데이트 메서드

// refresh-token.repository.interface.ts ✅ 리프레시 토큰 리포지토리 인터페이스
- 토큰 CRUD operations
- 사용자별 토큰 관리
- 디바이스별 토큰 조회
- 만료된 토큰 정리
- 토큰 사용 추적
- 토큰 개수 제한 지원
```

### 6. 도메인 서비스 (Domain Services)

```typescript
// apps/auth-vC/src/auth/domain/service/

// user.domain.service.ts       ✅ 사용자 도메인 서비스
- 복잡한 사용자 생성 로직
- 이메일 중복 검사 (로컬/소셜 통합)
- 사용자 인증 로직 (실제 비밀번호 해시 검증) 🔒
- 계정 연결/병합 로직
- 비밀번호 변경 (해시 업데이트) 🔒
- 계정 삭제 전 검증

// password.domain.service.ts   ✅ 비밀번호 도메인 서비스
- bcrypt 기반 해싱 (salt + pepper)
- 비밀번호 강도 평가
- 비밀번호 정책 검증
- 임시 비밀번호 생성
- 비밀번호 만료 관리
- 변경 주기 제한
```

## 📁 현재 폴더 구조 (Step 2 완료)

```
apps/auth-vC/src/
├── shared/                          # 공통 모듈
│   ├── enum/                        # 열거형
│   │   ├── provider.enum.ts         ✅ 인증 제공자
│   │   └── user-status.enum.ts      ✅ 사용자 상태
│   └── type/                        # 타입 정의
│       ├── auth.type.ts            ✅ 인증 관련 타입
│       └── common.type.ts          ✅ 공통 타입
├── auth/                            # Auth 도메인 루트
│   ├── domain/                      # 도메인 계층
│   │   ├── entity/                  # 도메인 엔티티
│   │   │   ├── user.entity.ts       ✅ 사용자 엔티티
│   │   │   ├── refresh-token.entity.ts ✅ 리프레시 토큰 엔티티
│   │   │   └── index.ts             ✅ 엔티티 export
│   │   ├── vo/                      # 값 객체
│   │   │   ├── email.vo.ts          ✅ 이메일 값 객체
│   │   │   ├── password.vo.ts       ✅ 비밀번호 값 객체
│   │   │   ├── provider.vo.ts       ✅ 제공자 값 객체
│   │   │   ├── user-id.vo.ts        ✅ 사용자 ID 값 객체
│   │   │   └── index.ts             ✅ 값 객체 export
│   │   ├── repository/              # 리포지토리 인터페이스
│   │   │   ├── user.repository.interface.ts         ✅ 사용자 리포지토리
│   │   │   ├── refresh-token.repository.interface.ts ✅ 토큰 리포지토리
│   │   │   └── index.ts             ✅ 리포지토리 export
│   │   ├── service/                 # 도메인 서비스
│   │   │   ├── user.domain.service.ts      ✅ 사용자 도메인 서비스
│   │   │   ├── password.domain.service.ts  ✅ 비밀번호 도메인 서비스
│   │   │   └── index.ts             ✅ 서비스 export
│   │   ├── exception/               # 도메인 예외
│   │   │   ├── domain.exception.ts  ✅ 기본 도메인 예외
│   │   │   ├── user-already-exists.exception.ts     ✅ 사용자 중복 예외
│   │   │   ├── user-not-found.exception.ts          ✅ 사용자 미발견 예외
│   │   │   ├── invalid-credentials.exception.ts     ✅ 잘못된 인증 정보 예외
│   │   │   ├── invalid-refresh-token.exception.ts   ✅ 유효하지 않은 토큰 예외
│   │   │   └── index.ts             ✅ 예외 export
│   │   └── index.ts                 ✅ 도메인 계층 전체 export
│   └── infrastructure/              # 인프라스트럭처 계층 (Step 1 완료)
│       └── database/
│           ├── entity/            # TypeORM 엔티티
│           └── migration/          # DB 마이그레이션
├── config/                          # 전역 설정 (Step 1 완료)
└── app/                             # 애플리케이션 루트
```

## 🔍 도메인 계층 핵심 특징

### 1. 순수성 (Purity)

- 외부 의존성 없음 (NestJS 데코레이터 제외)
- 프레임워크 독립적인 비즈니스 로직
- 테스트하기 쉬운 구조

### 2. 불변성 (Immutability)

- 값 객체는 생성 후 변경 불가
- 엔티티 상태 변경은 메서드를 통해서만

### 3. 타입 안전성 (Type Safety)

- 원시 타입 대신 값 객체 사용
- 컴파일 타임 타입 검증
- 런타임 유효성 검증

### 4. 비즈니스 규칙 중심

- 도메인 엔티티에 비즈니스 로직 집중
- 도메인 서비스로 복잡한 로직 분리
- 예외를 통한 비즈니스 규칙 위반 처리

### 5. 확장성

- 새로운 인증 제공자 쉽게 추가 가능
- 비밀번호 정책 확장 가능
- 사용자 상태 확장 가능

### 6. 보안성 (Security) ✨

- **평문 비밀번호 완전 제거**: User 엔티티에서 평문 비밀번호 저장 금지
- **해시만 저장**: 오직 bcrypt 해시된 비밀번호만 저장
- **도메인 서비스 통한 해싱**: 평문 비밀번호는 도메인 서비스에서만 처리
- **메모리 보안**: 평문 비밀번호가 엔티티에 잔존하지 않음
- **타입 안전성**: Password 값 객체는 생성/검증 시에만 사용

## 🔒 보안 아키텍처 개선사항

### Before (보안 취약)

```typescript
// ❌ User 엔티티에 평문 비밀번호와 해시가 함께 존재
interface UserProps {
	password?: Password; // 평문 비밀번호 (위험!)
	passwordHash?: string; // 해시된 비밀번호
}
```

### After (보안 강화) ✅

```typescript
// ✅ User 엔티티에는 오직 해시만 저장
interface CreateUserProps {
	passwordHash?: string; // 해시된 비밀번호만 저장
}

// ✅ 평문 비밀번호는 도메인 서비스에서만 처리
class UserDomainService {
	async createLocalUser(email: Email, password: Password) {
		// 1. 평문 비밀번호를 즉시 해싱
		const hashedPassword = await this.hashPassword(password);

		// 2. User 엔티티에는 해시만 전달
		const user = User.create({
			email,
			passwordHash: hashedPassword, // 해시만 저장
		});
	}
}
```

### 보안 장점

1. **메모리 보안**: 평문 비밀번호가 엔티티에 잔존하지 않음
2. **직렬화 보안**: `toJSON()` 등에서 평문 비밀번호 노출 방지
3. **데이터베이스 보안**: DB에는 해시만 저장
4. **코드 안전성**: 컴파일 타임에 평문 비밀번호 사용 방지

## 🎯 다음 단계 (Step 3: 애플리케이션 계층)

구현 예정:

1. **애플리케이션 서비스**

   - `src/auth/application/service/auth.service.ts`
   - `src/auth/application/service/user.service.ts`
   - `src/auth/application/service/jwt.service.ts`

2. **애플리케이션 DTO**

   - `src/auth/application/dto/auth.dto.ts`
   - `src/auth/application/dto/user.dto.ts`

3. **도메인 이벤트**
   - `src/auth/application/event/user-registered.event.ts`
   - `src/auth/application/event/user-logged-in.event.ts`

## 🔧 필요한 추가 패키지

```bash
# bcrypt for password hashing
pnpm add bcrypt
pnpm add -D @types/bcrypt
```

## 🧪 단위 테스트 준비

도메인 계층은 외부 의존성이 없어 단위 테스트가 용이합니다:

- 값 객체 테스트 (유효성 검증, 불변성)
- 엔티티 테스트 (비즈니스 로직)
- 도메인 서비스 테스트 (복잡한 비즈니스 규칙)
- 예외 테스트 (에러 처리)
