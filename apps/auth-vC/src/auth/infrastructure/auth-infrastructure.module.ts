import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RefreshTokenTypeOrmEntity } from "./database/entities/refresh-token.typeorm.entity";
import { UserTypeOrmEntity } from "./database/entities/user.typeorm.entity";

/**
 * Auth Infrastructure Module
 *
 * 이 모듈의 책임:
 * - TypeORM 엔티티 등록
 * - 리포지토리 구현체 제공
 * - 외부 서비스 (소셜 로그인, 이메일 등) 관리
 * - 데이터베이스 관련 인프라 관리
 */
@Module({
	imports: [
		TypeOrmModule.forFeature([UserTypeOrmEntity, RefreshTokenTypeOrmEntity]),
	],
	providers: [
		// 향후 추가될 리포지토리 구현체들
		// UserTypeOrmRepository,
		// RefreshTokenTypeOrmRepository,
		// 외부 서비스들
		// GoogleAuthService,
		// AppleAuthService,
		// EmailService,
	],
	exports: [
		// TypeORM 리포지토리들을 다른 계층에서 사용할 수 있도록 export
		TypeOrmModule,

		// 향후 추가될 서비스들
		// UserTypeOrmRepository,
		// RefreshTokenTypeOrmRepository,
		// GoogleAuthService,
		// AppleAuthService,
		// EmailService,
	],
})
export class AuthInfrastructureModule {}
