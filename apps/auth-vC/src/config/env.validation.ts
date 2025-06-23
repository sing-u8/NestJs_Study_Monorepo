import * as Joi from "joi";

/**
 * 환경 변수 검증 스키마
 *
 * 이 파일은 애플리케이션이 시작될 때 필요한 모든 환경 변수가
 * 올바른 형식으로 설정되었는지 검증합니다.
 *
 * 장점:
 * - 런타임 에러 방지
 * - 환경 변수 문서화 역할
 * - 타입 안전성 보장
 */
export const envValidationSchema = Joi.object({
	// 데이터베이스 설정
	DATABASE_HOST: Joi.string().default("localhost"),
	DATABASE_PORT: Joi.number().default(5432),
	DATABASE_USERNAME: Joi.string().required(),
	DATABASE_PASSWORD: Joi.string().required(),
	DATABASE_NAME: Joi.string().required(),

	// JWT 설정
	JWT_SECRET: Joi.string().required().min(32),
	JWT_EXPIRES_IN: Joi.string().default("1h"),
	REFRESH_TOKEN_SECRET: Joi.string().required().min(32),
	REFRESH_TOKEN_EXPIRES_IN: Joi.string().default("7d"),

	// 소셜 로그인 설정
	GOOGLE_CLIENT_ID: Joi.string().optional(),
	GOOGLE_CLIENT_SECRET: Joi.string().optional(),
	GOOGLE_CALLBACK_URL: Joi.string().optional(),

	APPLE_CLIENT_ID: Joi.string().optional(),
	APPLE_PRIVATE_KEY: Joi.string().optional(),
	APPLE_CALLBACK_URL: Joi.string().optional(),

	// 애플리케이션 설정
	PORT: Joi.number().default(3000),
	NODE_ENV: Joi.string()
		.valid("development", "production", "test")
		.default("development"),

	// 이메일 설정 (선택사항)
	EMAIL_HOST: Joi.string().optional(),
	EMAIL_PORT: Joi.number().optional(),
	EMAIL_USER: Joi.string().optional(),
	EMAIL_PASS: Joi.string().optional(),
});

/**
 * 환경 변수 타입 정의
 * ConfigService에서 사용할 타입을 정의합니다.
 */
export interface EnvironmentVariables {
	// Database
	DATABASE_HOST: string;
	DATABASE_PORT: number;
	DATABASE_USERNAME: string;
	DATABASE_PASSWORD: string;
	DATABASE_NAME: string;

	// JWT
	JWT_SECRET: string;
	JWT_EXPIRES_IN: string;
	REFRESH_TOKEN_SECRET: string;
	REFRESH_TOKEN_EXPIRES_IN: string;

	// Social Auth
	GOOGLE_CLIENT_ID?: string;
	GOOGLE_CLIENT_SECRET?: string;
	GOOGLE_CALLBACK_URL?: string;
	APPLE_CLIENT_ID?: string;
	APPLE_PRIVATE_KEY?: string;
	APPLE_CALLBACK_URL?: string;

	// App
	PORT: number;
	NODE_ENV: "development" | "production" | "test";

	// Email
	EMAIL_HOST?: string;
	EMAIL_PORT?: number;
	EMAIL_USER?: string;
	EMAIL_PASS?: string;
}
