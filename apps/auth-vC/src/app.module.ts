import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./auth/auth.module";
import { databaseConfig } from "./config/database.config";
// 설정 파일들
import { envValidationSchema } from "./config/env.validation";
import { jwtConfig, jwtModuleConfig } from "./config/jwt.config";
// import { EventEmitterModule } from '@nestjs/event-emitter'; // 나중에 설치 예정

/**
 * AppModule - 애플리케이션의 루트 모듈
 *
 * 클린 아키텍처에서 이 모듈은:
 * - 전역 설정 관리
 * - 의존성 주입 컨테이너 설정
 * - 각 도메인 모듈들의 조합
 *
 * Step 1에서는 기본 인프라 설정에 집중합니다.
 */
@Module({
	imports: [
		/**
		 * ConfigModule 설정
		 * - 환경 변수 로딩 및 검증
		 * - 전역 사용 가능하도록 설정
		 * - Joi를 사용한 환경 변수 검증
		 */
		ConfigModule.forRoot({
			isGlobal: true, // 모든 모듈에서 ConfigService 사용 가능
			cache: true, // 성능 최적화를 위한 캐싱
			validationSchema: envValidationSchema, // 환경 변수 검증
			validationOptions: {
				allowUnknown: true, // 알려지지 않은 환경 변수 허용
				abortEarly: true, // 첫 번째 검증 실패 시 중단
			},
			// 설정 팩토리들 등록
			load: [databaseConfig, jwtConfig, jwtModuleConfig],
		}),

		/**
		 * TypeORM 설정
		 * - PostgreSQL 연결
		 * - 엔티티 자동 로딩
		 * - 개발환경에서 스키마 동기화
		 */
		TypeOrmModule.forRootAsync({
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return configService.get("database");
			},
		}),

		/**
		 * JWT 모듈 설정
		 * - Access Token 생성/검증
		 * - 전역 사용 가능하도록 설정
		 */
		JwtModule.registerAsync({
			global: true, // 전역 모듈로 설정
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => {
				return configService.get("jwtModule");
			},
		}),

		/**
		 * 이벤트 시스템 설정 (나중에 추가 예정)
		 * - 도메인 이벤트 처리
		 * - 비동기 이벤트 핸들링
		 */
		// EventEmitterModule.forRoot({
		// 	// 설정 옵션들
		// 	wildcard: false,
		// 	delimiter: '.',
		// 	newListener: false,
		// 	removeListener: false,
		// 	maxListeners: 10,
		// 	verboseMemoryLeak: false,
		// 	ignoreErrors: false,
		// }),

		// 도메인 모듈들은 Step 2에서 추가 예정
		AuthModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {
	/**
	 * 애플리케이션 시작 시 실행되는 생성자
	 *
	 * 개발 환경에서 유용한 로깅을 추가할 수 있습니다.
	 */
	constructor(private configService: ConfigService) {
		// 개발 환경에서만 설정 정보 로깅
		if (process.env.NODE_ENV === "development") {
			console.log("🚀 Auth-vC Application Starting...");
			console.log(
				`📊 Database: ${this.configService.get("DATABASE_HOST")}:${this.configService.get("DATABASE_PORT")}`,
			);
			console.log(
				`🔐 JWT Secret: ${this.configService.get("JWT_SECRET") ? "✅ Set" : "❌ Not Set"}`,
			);
			console.log(`🌐 Port: ${this.configService.get("PORT", 3000)}`);
		}
	}
}
