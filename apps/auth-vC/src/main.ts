/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

/**
 * 애플리케이션 부트스트랩 함수
 *
 * 이 함수는 NestJS 애플리케이션을 초기화하고 시작합니다.
 * 클린 아키텍처에서 이는 외부 인터페이스의 진입점 역할을 합니다.
 */
async function bootstrap() {
	// NestJS 애플리케이션 인스턴스 생성
	const app = await NestFactory.create(AppModule);

	// ConfigService 인스턴스 획득
	const configService = app.get(ConfigService);

	/**
	 * 전역 파이프 설정
	 *
	 * ValidationPipe를 전역으로 설정하여:
	 * - 자동 DTO 검증
	 * - 타입 변환
	 * - 잘못된 요청 데이터 필터링
	 */
	app.useGlobalPipes(
		new ValidationPipe({
			// 알려지지 않은 속성 자동 제거
			whitelist: true,
			// 알려지지 않은 속성이 있을 때 에러 발생
			forbidNonWhitelisted: true,
			// 타입 자동 변환 (string -> number 등)
			transform: true,
			// 중첩된 객체도 검증
			validateCustomDecorators: true,
			// 에러 메시지 상세화
			disableErrorMessages: false,
		}),
	);

	/**
	 * CORS 설정
	 *
	 * 개발 환경에서 프론트엔드와의 통신을 위해 설정합니다.
	 * 프로덕션에서는 더 엄격한 설정이 필요합니다.
	 */
	app.enableCors({
		origin:
			process.env.NODE_ENV === "development"
				? [
						"http://localhost:3000",
						"http://localhost:3001",
						"http://localhost:5173",
					]
				: [], // 프로덕션에서는 실제 도메인으로 설정
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	});

	/**
	 * 전역 프리픽스 설정
	 *
	 * 모든 API 엔드포인트에 /api 프리픽스를 추가합니다.
	 * 예: POST /auth/login -> POST /api/auth/login
	 */
	app.setGlobalPrefix("api", {
		exclude: ["/health", "/"], // 헬스체크 등은 제외
	});

	/**
	 * 우아한 종료 설정
	 *
	 * 애플리케이션이 종료될 때 현재 진행 중인 작업을 완료하고
	 * 리소스를 정리할 수 있도록 합니다.
	 */
	app.enableShutdownHooks();

	// 포트 설정
	const port = configService.get<number>("PORT", 3000);

	// 서버 시작
	await app.listen(port);

	// 시작 메시지 출력
	console.log(`🚀 Application is running on: http://localhost:${port}`);
	console.log(`📚 API endpoints available at: http://localhost:${port}/api`);

	// 개발 환경에서만 추가 정보 출력
	if (process.env.NODE_ENV === "development") {
		console.log("🔧 Development mode - Auto-reload enabled");
		console.log(
			`📖 Swagger documentation will be available at: http://localhost:${port}/api/docs`,
		);
	}

	return app;
}

// 애플리케이션 시작 및 에러 핸들링
bootstrap().catch((error) => {
	console.error("❌ Error starting application:", error);
	process.exit(1);
});
