import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Provider } from "../../../shared/enum/provider.enum";
import { RefreshToken, User } from "../../domain/entity";
import {
	InvalidCredentialsException,
	InvalidRefreshTokenException,
	UserNotFoundException,
} from "../../domain/exception";
import {
	IRefreshTokenRepository,
	IUserRepository,
} from "../../domain/repository";
import { PasswordDomainService, UserDomainService } from "../../domain/service";
import { Email, Password, UserId } from "../../domain/vo";
import {
	AuthResponseDto,
	LoginRequestDto,
	LogoutRequestDto,
	RefreshTokenRequestDto,
	SignUpRequestDto,
	TokenResponseDto,
	UserInfoDto,
} from "../dto";
import { UserLoggedInEvent, UserRegisteredEvent } from "../event/event";
import { JwtApplicationService } from "./jwt.service";

/**
 * 인증 애플리케이션 서비스
 * 회원가입, 로그인, 로그아웃, 토큰 갱신 등 인증 관련 비즈니스 로직을 담당
 */
@Injectable()
export class AuthApplicationService {
	constructor(
		private readonly userRepository: IUserRepository,
		private readonly refreshTokenRepository: IRefreshTokenRepository,
		private readonly userDomainService: UserDomainService,
		private readonly passwordDomainService: PasswordDomainService,
		private readonly jwtService: JwtApplicationService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	/**
	 * 회원가입 (로컬 계정)
	 */
	async signUp(dto: SignUpRequestDto): Promise<AuthResponseDto> {
		// 1. 값 객체 생성 및 검증
		const email = Email.create(dto.email);
		const password = Password.create(dto.password);

		// 2. 사용자 생성 (도메인 서비스에서 중복 검사 포함)
		const user = await this.userDomainService.createLocalUser(email, password);

		// 3. 사용자 저장
		const savedUser = await this.userRepository.save(user);

		// 4. 토큰 생성
		const tokens = await this.jwtService.generateTokenPair(
			savedUser.getId(),
			savedUser.getEmail().getValue(),
		);

		// 5. Refresh Token 저장
		await this.saveRefreshToken(
			savedUser.getId(),
			tokens.refreshToken,
			"unknown-device",
			"unknown-ip",
		);

		// 6. 도메인 이벤트 발행
		const event = new UserRegisteredEvent(
			savedUser.getId(),
			savedUser.getEmail().getValue(),
			savedUser.getProvider()?.getValue() || Provider.LOCAL,
			savedUser.isEmailVerified(),
		);
		this.eventEmitter.emit("user.registered", event);

		// 7. 응답 생성
		const userInfo = this.createUserInfoDto(savedUser);
		return new AuthResponseDto(
			tokens.accessToken,
			tokens.refreshToken,
			userInfo,
		);
	}

	/**
	 * 로그인 (로컬 계정)
	 */
	async login(dto: LoginRequestDto): Promise<AuthResponseDto> {
		// 1. 값 객체 생성
		const email = Email.create(dto.email);

		// 2. 사용자 인증 (도메인 서비스 사용)
		const user = await this.userDomainService.authenticateUser(
			email,
			dto.password,
		);

		// 3. 사용자 저장 (로그인 시간 업데이트됨)
		const savedUser = await this.userRepository.save(user);

		// 4. 토큰 생성
		const tokens = await this.jwtService.generateTokenPair(
			savedUser.getId(),
			savedUser.getEmail().getValue(),
		);

		// 5. Refresh Token 저장
		await this.saveRefreshToken(
			savedUser.getId(),
			tokens.refreshToken,
			"unknown-device",
			"unknown-ip",
		);

		// 6. 도메인 이벤트 발행
		const event = new UserLoggedInEvent(
			savedUser.getId(),
			savedUser.getEmail().getValue(),
			"unknown-ip",
			"unknown-user-agent",
			"unknown-device",
		);
		this.eventEmitter.emit("user.logged.in", event);

		// 7. 응답 생성
		const userInfo = this.createUserInfoDto(savedUser);
		return new AuthResponseDto(
			tokens.accessToken,
			tokens.refreshToken,
			userInfo,
		);
	}

	/**
	 * 토큰 갱신
	 */
	async refreshToken(dto: RefreshTokenRequestDto): Promise<TokenResponseDto> {
		// 1. Refresh Token 검증 (JWT 레벨)
		const payload = await this.jwtService.verifyRefreshToken(dto.refreshToken);

		// 2. DB에서 토큰 조회 및 검증
		const storedToken = await this.refreshTokenRepository.findByToken(
			dto.refreshToken,
		);
		if (!storedToken || !storedToken.isValid()) {
			throw new InvalidRefreshTokenException(
				"유효하지 않은 리프레시 토큰입니다.",
			);
		}

		// 3. 사용자 조회
		const userId = UserId.create(payload.sub);
		const user = await this.userRepository.findById(userId);
		if (!user || !user.isActive()) {
			throw new InvalidRefreshTokenException("사용자를 찾을 수 없습니다.");
		}

		// 4. 기존 토큰 무효화
		storedToken.deactivate();
		await this.refreshTokenRepository.save(storedToken);

		// 5. 새 토큰 생성
		const newTokens = await this.jwtService.generateTokenPair(
			user.getId(),
			user.getEmail().getValue(),
		);

		// 6. 새 Refresh Token 저장
		await this.saveRefreshToken(
			user.getId(),
			newTokens.refreshToken,
			storedToken.getDeviceInfo() || "unknown-device",
			storedToken.getIpAddress() || "unknown-ip",
		);

		return new TokenResponseDto(
			newTokens.accessToken,
			newTokens.refreshToken,
			newTokens.expiresIn,
		);
	}

	/**
	 * 로그아웃
	 */
	async logout(dto: LogoutRequestDto): Promise<void> {
		// 1. DB에서 토큰 조회 및 무효화
		const storedToken = await this.refreshTokenRepository.findByToken(
			dto.refreshToken,
		);
		if (storedToken) {
			storedToken.deactivate();
			await this.refreshTokenRepository.save(storedToken);
		}
	}

	/**
	 * 사용자의 모든 토큰 무효화 (전체 로그아웃)
	 */
	async logoutAll(userId: string): Promise<void> {
		const userIdVO = UserId.create(userId);
		await this.refreshTokenRepository.deleteAllByUserId(userIdVO);
	}

	/**
	 * 현재 사용자 정보 조회
	 */
	async getCurrentUser(userId: string): Promise<UserInfoDto> {
		const userIdVO = UserId.create(userId);
		const user = await this.userRepository.findById(userIdVO);

		if (!user) {
			throw new UserNotFoundException(userId);
		}

		return this.createUserInfoDto(user);
	}

	/**
	 * Refresh Token 저장 (private 헬퍼 메서드)
	 */
	private async saveRefreshToken(
		userId: string,
		token: string,
		deviceInfo: string,
		ipAddress: string,
	): Promise<void> {
		// 토큰 만료 시간 계산
		const expiresIn = this.jwtService.getRefreshTokenExpiresIn();
		const expiresAt = new Date(Date.now() + expiresIn * 1000);

		// Refresh Token 엔티티 생성
		const refreshToken = RefreshToken.create({
			userId: UserId.create(userId),
			token,
			expiresAt,
			deviceInfo,
			ipAddress,
		});

		// 저장
		await this.refreshTokenRepository.save(refreshToken);
	}

	/**
	 * UserInfoDto 생성 헬퍼
	 */
	private createUserInfoDto(user: User): UserInfoDto {
		return new UserInfoDto(
			user.getId(),
			user.getEmail().getValue(),
			user.getProvider()?.getValue() || Provider.LOCAL,
			user.isActive(),
			user.isEmailVerified(),
			user.getCreatedAt(),
			user.getLastLoginAt(),
		);
	}
}
