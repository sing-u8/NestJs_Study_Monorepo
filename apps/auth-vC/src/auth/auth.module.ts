import { Module } from '@nestjs/common';
import { AuthInfrastructureModule } from './infrastructure/auth-infrastructure.module';

/**
 * Auth Module - Auth 도메인의 루트 모듈
 *
 * 이 모듈의 책임:
 * - 도메인 전체 조합
 * - 계층 간 의존성 관리
 * - 외부 모듈에 대한 인터페이스 제공
 */
@Module({
	imports: [
		// Infrastructure 계층
		AuthInfrastructureModule,

		// 향후 추가될 계층들
		// AuthApplicationModule,  // 애플리케이션 서비스들
		// AuthDomainModule,       // 도메인 서비스들 (필요시)
	],
	controllers: [
		// 향후 추가될 컨트롤러들
		// AuthController,
		// UserController,
		// SocialAuthController,
	],
	providers: [
		// 이 모듈에서만 사용할 서비스들
	],
	exports: [
		// 다른 도메인에서 사용할 수 있는 서비스들
		AuthInfrastructureModule,
	],
})
export class AuthModule {}
