# 🎯 NestJS Clean Architecture Auth System - Step 3 완료 현황

## 📋 Step 3: 애플리케이션 계층 구현 개요

- **목표**: 애플리케이션 서비스, DTO, 도메인 이벤트 시스템 구현
- **원칙**: 도메인 계층을 활용한 비즈니스 로직 조율, 외부와의 인터페이스 정의
- **구조**: Application Service → DTO → Domain Event System

## ✅ Step 3: 애플리케이션 계층 완료 내역

### 1. 애플리케이션 DTO (Data Transfer Objects)

```typescript
// apps/auth-vC/src/auth/application/dto/

// auth.dto.ts                ✅ 인증 관련 DTO
-SignUpRequestDto - // 회원가입 요청
	LoginRequestDto - // 로그인 요청
	RefreshTokenRequestDto - // 토큰 갱신 요청
	AuthResponseDto - // 인증 응답
	UserInfoDto - // 사용자 정보
	TokenResponseDto - // 토큰 응답
	LogoutRequestDto - // 로그아웃 요청
	// user.dto.ts                ✅ 사용자 관련 DTO
	CreateUserDto - // 사용자 생성
	UpdateUserDto - // 사용자 업데이트
	ChangePasswordDto - // 비밀번호 변경
	GetUsersQueryDto - // 사용자 목록 조회
	UserDetailDto - // 사용자 상세 정보
	UsersResponseDto - // 사용자 목록 응답
	VerifyEmailDto - // 이메일 인증
	// social-auth.dto.ts         ✅ 소셜 인증 DTO
	SocialLoginRequestDto - // 소셜 로그인 요청
	SocialLoginCallbackDto - // 소셜 로그인 콜백
	SocialProfileDto - // 소셜 프로필
	GoogleUserInfoDto - // Google 사용자 정보
	AppleUserInfoDto - // Apple 사용자 정보
	LinkAccountRequestDto - // 계정 연결 요청
	UnlinkAccountRequestDto - // 계정 연결 해제
	SocialAccountDto; // 소셜 계정 정보
```

**주요 특징:**

- class-validator 데코레이터로 유효성 검증
- 명확한 입출력 타입 정의
- 페이지네이션 및 필터링 지원
- 보안을 위한 민감 정보 제외

### 2. 도메인 이벤트 시스템

#### 이벤트 클래스 (Event Classes)

```typescript
// apps/auth-vC/src/auth/application/event/event/

// user-registered.event.ts    ✅ 사용자 등록 이벤트
- 발생 시점: 회원가입 완료 시
- 포함 데이터: userId, email, provider, isEmailVerified, registeredAt

// user-logged-in.event.ts     ✅ 사용자 로그인 이벤트
- 발생 시점: 로그인 성공 시
- 포함 데이터: userId, email, ipAddress, userAgent, deviceInfo, loggedInAt

// user-deleted.event.ts       ✅ 사용자 삭제 이벤트
- 발생 시점: 계정 삭제 시
- 포함 데이터: userId, email, provider, deletedBy, reason, deletedAt
```

#### 이벤트 핸들러 (Event Handlers)

```typescript
// apps/auth-vC/src/auth/application/event/handler/

// user-registered.handler.ts  ✅ 등록 이벤트 핸들러
- 이메일 인증 메일 발송
- 환영 이메일 발송
- 사용자 등록 통계 업데이트
- 관리자에게 신규 가입 알림

// user-logged-in.handler.ts   ✅ 로그인 이벤트 핸들러
- 로그인 로그 기록
- 보안 검사 (비정상적 접근 감지)
- 의심스러운 활동 감지
- 로그인 알림 발송

// user-deleted.handler.ts     ✅ 삭제 이벤트 핸들러
- 사용자 관련 데이터 정리
- 외부 서비스 연동 해제
- 삭제 로그 기록 및 관리자 알림
- 데이터 아카이브 처리
```

### 3. 애플리케이션 서비스 (Application Services)

#### AuthApplicationService (인증 애플리케이션 서비스)

```typescript
// apps/auth-vC/src/auth/application/service/auth.service.ts ✅

주요 기능:
- signUp()           // 회원가입 처리 (도메인 서비스 활용, 이벤트 발행)
- login()            // 로그인 처리 (인증, 토큰 생성, 이벤트 발행)
- refreshToken()     // 토큰 갱신 (JWT 검증, DB 토큰 확인)
- logout()           // 로그아웃 (특정 토큰 무효화)
- logoutAll()        // 전체 로그아웃 (모든 토큰 삭제)
- getCurrentUser()   // 현재 사용자 정보 조회

구현 특징:
- 도메인 서비스를 통한 비즈니스 로직 처리
- 이벤트 발행으로 느슨한 결합
- JWT 서비스와 협력하여 토큰 관리
- 에러 처리 및 로깅
```

#### UserApplicationService (사용자 애플리케이션 서비스)

```typescript
// apps/auth-vC/src/auth/application/service/user.service.ts ✅

주요 기능:
- getUsers()         // 사용자 목록 조회 (페이지네이션, 필터링)
- getUserById()      // 특정 사용자 조회
- updateUser()       // 사용자 프로필 업데이트
- changePassword()   // 비밀번호 변경 (현재 비밀번호 검증)
- deleteUser()       // 사용자 계정 삭제 (소프트 삭제, 이벤트 발행)
- verifyEmail()      // 이메일 인증 처리
- getUserStats()     // 사용자 통계 조회

구현 특징:
- 페이지네이션 및 정렬 지원
- 도메인 서비스를 통한 비밀번호 변경
- 이벤트 기반 삭제 처리
- 통계 데이터 제공
```

#### PasswordApplicationService (비밀번호 애플리케이션 서비스)

```typescript
// apps/auth-vC/src/auth/application/service/password.service.ts ✅

주요 기능:
- forgotPassword()   // 비밀번호 찾기 (보안상 항상 성공 응답)
- resetPassword()    // 비밀번호 재설정 (토큰 검증, 새 비밀번호 설정)
- validatePasswordStrength()  // 비밀번호 강도 검증
- generateTemporaryPassword() // 임시 비밀번호 생성
- getPasswordPolicy()         // 비밀번호 정책 조회
- checkPasswordExpiry()       // 비밀번호 만료 확인

구현 특징:
- 보안 중심 설계 (토큰 기반 재설정)
- 비밀번호 정책 준수
- 도메인 서비스 활용
- 이메일 발송 로직 포함
```

#### SocialAuthApplicationService (소셜 인증 애플리케이션 서비스)

```typescript
// apps/auth-vC/src/auth/application/service/social-auth.service.ts ✅

주요 기능:
- socialLogin()      // 소셜 로그인 처리 (기존/신규 사용자 구분)
- linkAccount()      // 소셜 계정 연결
- unlinkAccount()    // 소셜 계정 연결 해제
- getLinkedAccounts() // 연결된 소셜 계정 목록
- generateAuthUrl()  // 소셜 로그인 URL 생성

구현 특징:
- Google, Apple 지원
- 계정 연결/해제 로직
- 프로필 정보 매핑
- 도메인 서비스와 협력
```

#### JwtApplicationService (JWT 애플리케이션 서비스)

```typescript
// apps/auth-vC/src/auth/application/service/jwt.service.ts ✅

주요 기능:
- generateAccessToken()    // Access Token 생성
- generateRefreshToken()   // Refresh Token 생성
- generateTokenPair()      // 토큰 쌍 생성
- verifyAccessToken()      // Access Token 검증
- verifyRefreshToken()     // Refresh Token 검증
- extractUserIdFromToken() // 토큰에서 사용자 ID 추출
- isTokenExpired()         // 토큰 만료 확인
- getAccessTokenExpiresIn() // Access Token TTL
- getRefreshTokenExpiresIn() // Refresh Token TTL

구현 특징:
- Access/Refresh 토큰 분리 관리
- 보안 강화 (issuer, audience 검증)
- TTL 관리 및 만료 검사
- 에러 처리 및 유효성 검증
```

### 4. 🔧 기술적 해결사항

#### JWT 서비스 데코레이터 문제 해결

```typescript
// ❌ 문제 발생 코드:
constructor(
  private readonly jwtService: NestJwtService,
  @Inject(jwtConfig.KEY)
  private readonly jwtConfiguration: ConfigType<typeof jwtConfig>  // 데코레이터 + 매개변수 프로퍼티
) {}

// ✅ 해결된 코드 (방법 1):
private readonly jwtConfiguration: ConfigType<typeof jwtConfig>;

constructor(
  private readonly jwtService: NestJwtService,
  @Inject(jwtConfig.KEY)
  jwtConfiguration: ConfigType<typeof jwtConfig>  // 데코레이터와 매개변수 분리
) {
  this.jwtConfiguration = jwtConfiguration;
}
```

**문제 원인:**

- TypeScript 컴파일러의 데코레이터 + 매개변수 프로퍼티 조합 해석 이슈
- NestJS의 `@Inject` 데코레이터와 생성자 매개변수 프로퍼티 간의 충돌

**해결 방법:**

- 데코레이터와 매개변수 프로퍼티 분리
- 수동 할당으로 타입 안전성과 NestJS 패턴 유지

### 5. 📁 완성된 애플리케이션 계층 구조

```
apps/auth-vC/src/auth/application/
├── service/                           # 애플리케이션 서비스
│   ├── auth.service.ts               ✅ 인증 서비스
│   ├── user.service.ts              ✅ 사용자 서비스
│   ├── password.service.ts          ✅ 비밀번호 서비스
│   ├── social-auth.service.ts       ✅ 소셜 인증 서비스
│   ├── jwt.service.ts               ✅ JWT 서비스
│   └── index.ts                     ✅ 서비스 export
├── dto/                              # 애플리케이션 DTO
│   ├── auth.dto.ts                  ✅ 인증 DTO
│   ├── user.dto.ts                  ✅ 사용자 DTO
│   ├── social-auth.dto.ts           ✅ 소셜 인증 DTO
│   └── index.ts                     ✅ DTO export
└── event/                            # 도메인 이벤트 시스템
    ├── event/                        # 이벤트 클래스
    │   ├── user-registered.event.ts  ✅ 등록 이벤트
    │   ├── user-logged-in.event.ts   ✅ 로그인 이벤트
    │   ├── user-deleted.event.ts     ✅ 삭제 이벤트
    │   └── index.ts                  ✅ 이벤트 export
    └── handler/                      # 이벤트 핸들러
        ├── user-registered.handler.ts ✅ 등록 핸들러
        ├── user-logged-in.handler.ts  ✅ 로그인 핸들러
        ├── user-deleted.handler.ts    ✅ 삭제 핸들러
        └── index.ts                   ✅ 핸들러 export
```

## 🎯 애플리케이션 계층 핵심 특징

### 1. 책임 분리 (Separation of Concerns)

- **애플리케이션 서비스**: 비즈니스 플로우 조율, 도메인 서비스 호출
- **DTO**: 데이터 전송 및 유효성 검증
- **이벤트 시스템**: 횡단 관심사 처리 (로깅, 알림, 통계)

### 2. 도메인 중심 설계

- 도메인 서비스를 활용한 핵심 비즈니스 로직 처리
- 도메인 예외를 통한 일관된 에러 처리
- 도메인 엔티티와 값 객체 활용

### 3. 이벤트 기반 아키텍처

- 느슨한 결합으로 확장성 향상
- 횡단 관심사의 독립적 처리
- 비동기 처리 지원 준비

### 4. 보안 중심 설계

- JWT 토큰 분리 관리 (Access/Refresh)
- 비밀번호 정책 및 강도 검증
- 보안 이벤트 추적 및 로깅

### 5. 확장 가능한 구조

- 새로운 소셜 로그인 제공자 쉽게 추가
- 추가적인 이벤트 및 핸들러 확장 가능
- 마이크로서비스 분리 준비

## 🔄 이벤트 플로우 예시

### 회원가입 플로우:

```
1. AuthApplicationService.signUp()
2. → UserDomainService.createLocalUser()
3. → User.create() (도메인 엔티티)
4. → UserRepository.save() (TODO: Step 4)
5. → EventEmitter.emit(UserRegisteredEvent)
6. → UserRegisteredHandler.handle()
   - 이메일 인증 발송
   - 환영 메시지 발송
   - 통계 업데이트
```

### 로그인 플로우:

```
1. AuthApplicationService.login()
2. → UserDomainService.authenticateUser()
3. → PasswordDomainService.verify()
4. → JwtApplicationService.generateTokenPair()
5. → RefreshTokenRepository.save() (TODO: Step 4)
6. → EventEmitter.emit(UserLoggedInEvent)
7. → UserLoggedInHandler.handle()
   - 로그인 로그 기록
   - 보안 검사
   - 알림 발송
```

## 🚀 완료된 기능들

### 🔐 인증 기능

- ✅ 이메일/비밀번호 회원가입
- ✅ 이메일/비밀번호 로그인
- ✅ JWT 토큰 기반 인증
- ✅ 토큰 갱신 (Refresh Token)
- ✅ 로그아웃 (단일/전체 디바이스)

### 👤 사용자 관리

- ✅ 사용자 프로필 조회/수정
- ✅ 비밀번호 변경
- ✅ 계정 삭제 (소프트 삭제)
- ✅ 이메일 인증
- ✅ 사용자 목록 조회 (페이지네이션)

### 🔑 비밀번호 관리

- ✅ 비밀번호 찾기
- ✅ 비밀번호 재설정
- ✅ 비밀번호 강도 검증
- ✅ 임시 비밀번호 생성
- ✅ 비밀번호 정책 관리

### 🌐 소셜 로그인

- ✅ Google 로그인 지원
- ✅ Apple 로그인 지원
- ✅ 소셜 계정 연결/해제
- ✅ 연결된 계정 관리

### 📊 이벤트 시스템

- ✅ 사용자 등록 이벤트 처리
- ✅ 로그인 추적 및 보안 검사
- ✅ 계정 삭제 후 정리 작업
- ✅ 확장 가능한 이벤트 핸들러 구조

## 📦 사용된 주요 패키지

```json
{
	"dependencies": {
		"@nestjs/common": "^10.0.0",
		"@nestjs/config": "^3.0.0",
		"@nestjs/event-emitter": "^2.0.0",
		"@nestjs/jwt": "^10.0.0",
		"class-validator": "^0.14.0",
		"class-transformer": "^0.5.0",
		"bcrypt": "^5.1.0"
	},
	"devDependencies": {
		"@types/bcrypt": "^5.0.0"
	}
}
```

## 🎯 다음 단계: Step 4 - 인프라스트럭처 계층

구현 예정:

### 1. 리포지토리 구현체

- `user.typeorm.repository.ts` - 사용자 데이터 영속성
- `refresh-token.typeorm.repository.ts` - 토큰 데이터 영속성

### 2. 외부 서비스

- `google-auth.service.ts` - Google OAuth 연동
- `apple-auth.service.ts` - Apple OAuth 연동
- `email.service.ts` - 이메일 발송 서비스

### 3. 보안 계층

- `jwt-auth.guard.ts` - JWT 인증 가드
- `refresh-token.guard.ts` - 리프레시 토큰 가드
- `optional-auth.guard.ts` - 선택적 인증 가드

### 4. Passport 전략

- `jwt.strategy.ts` - JWT 전략
- `refresh-token.strategy.ts` - 리프레시 토큰 전략
- `google.strategy.ts` - Google OAuth 전략
- `apple.strategy.ts` - Apple OAuth 전략

### 5. 설정 및 모듈

- `social-auth.config.ts` - 소셜 로그인 설정
- `auth-infrastructure.module.ts` - 인프라 모듈 설정

## 🔍 Step 3에서 얻은 교훈

1. **NestJS 데코레이터 패턴**: `@Inject`와 매개변수 프로퍼티 조합 시 주의 필요
2. **이벤트 기반 설계**: 횡단 관심사를 깔끔하게 분리 가능
3. **타입 안전성**: DTO와 도메인 객체 간의 명확한 변환 중요
4. **테스트 용이성**: 애플리케이션 서비스가 도메인 서비스를 활용하여 테스트하기 쉬운 구조
5. **확장성**: 새로운 기능 추가 시 기존 코드 수정 최소화

## 💡 베스트 프랙티스 정리

1. **서비스 분리**: 각 애플리케이션 서비스는 단일 책임 원칙 준수
2. **DTO 활용**: 입출력 데이터 검증 및 타입 안전성 확보
3. **이벤트 활용**: 부수 효과를 이벤트로 분리하여 결합도 낮춤
4. **에러 처리**: 도메인 예외를 활용한 일관된 에러 처리
5. **보안 고려**: 모든 인증/인가 로직에서 보안 검증 철저히 수행

---

**Step 3 애플리케이션 계층 구현이 성공적으로 완료되었습니다! 🎉**

이제 Step 4 인프라스트럭처 계층으로 진행하여 실제 데이터 영속성과 외부 서비스 연동을 구현할 준비가 되었습니다.
