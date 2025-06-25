import { UserStatus } from '../../../shared/enum/user-status.enum';
import { DomainEntity } from '../../../shared/type/common.type';
import { InvalidCredentialsException } from '../exception/invalid-credentials.exception';
import { AuthProvider, Email, Password, UserId } from '../vo';

export interface CreateUserProps {
	email: Email;
	password?: Password;
	provider?: AuthProvider;
	providerId?: string;
	isEmailVerified?: boolean;
}

export interface UserProps extends CreateUserProps {
	id: UserId;
	status: UserStatus;
	lastLoginAt?: Date;
	createdAt: Date;
	updatedAt: Date;
}

export class User implements DomainEntity<User> {
	private constructor(private props: UserProps) {
		this.validate();
	}

	static create(props: CreateUserProps): User {
		const now = new Date();

		return new User({
			id: UserId.generate(),
			email: props.email,
			password: props.password,
			provider: props.provider || AuthProvider.createLocal(),
			providerId: props.providerId,
			status: props.isEmailVerified ? UserStatus.ACTIVE : UserStatus.PENDING_VERIFICATION,
			isEmailVerified: props.isEmailVerified || false,
			createdAt: now,
			updatedAt: now,
		});
	}

	static createFromSocial(
		email: Email,
		provider: AuthProvider,
		providerId: string,
	): User {
		if (provider.isLocal()) {
			throw new Error('Cannot create social user with local provider');
		}

		return User.create({
			email,
			provider,
			providerId,
			isEmailVerified: true, // 소셜 로그인은 이메일이 인증된 것으로 간주
		});
	}

	static fromPersistence(props: UserProps): User {
		return new User(props);
	}

	private validate(): void {
		// 로컬 계정은 반드시 비밀번호가 있어야 함
		if (this.props.provider?.isLocal() && !this.props.password) {
			throw new Error('Local account must have a password');
		}

		// 소셜 계정은 providerId가 있어야 함
		if (this.props.provider?.isSocial() && !this.props.providerId) {
			throw new Error('Social account must have providerId');
		}
	}

	verifyPassword(plainPassword: string, hashedPassword: string): boolean {
		if (!this.props.provider?.isLocal()) {
			throw new InvalidCredentialsException('Password verification not available for social accounts');
		}

		if (!this.props.password) {
			throw new InvalidCredentialsException('No password set for this account');
		}

		// 실제 구현에서는 bcrypt 등을 사용하여 해시 검증
		// 여기서는 도메인 로직만 표현
		return true; // 임시
	}

	changePassword(newPassword: Password): void {
		if (!this.props.provider?.isLocal()) {
			throw new Error('Cannot change password for social accounts');
		}

		this.props.password = newPassword;
		this.props.updatedAt = new Date();
	}

	verifyEmail(): void {
		if (this.props.isEmailVerified) {
			return; // 이미 인증됨
		}

		this.props.isEmailVerified = true;

		// 이메일 인증 완료시 계정 활성화
		if (this.props.status === UserStatus.PENDING_VERIFICATION) {
			this.props.status = UserStatus.ACTIVE;
		}

		this.props.updatedAt = new Date();
	}

	updateLastLoginAt(): void {
		this.props.lastLoginAt = new Date();
		this.props.updatedAt = new Date();
	}

	activate(): void {
		if (this.props.status === UserStatus.ACTIVE) {
			return; // 이미 활성
		}

		this.props.status = UserStatus.ACTIVE;
		this.props.updatedAt = new Date();
	}

	deactivate(): void {
		this.props.status = UserStatus.INACTIVE;
		this.props.updatedAt = new Date();
	}

	suspend(): void {
		this.props.status = UserStatus.SUSPENDED;
		this.props.updatedAt = new Date();
	}

	isActive(): boolean {
		return this.props.status === UserStatus.ACTIVE;
	}

	isEmailVerified(): boolean {
		return this.props.isEmailVerified || false;
	}

	isLocalAccount(): boolean {
		return this.props.provider?.isLocal() || false;
	}

	isSocialAccount(): boolean {
		return this.props.provider?.isSocial() || false;
	}

	// Getters
	getId(): string {
		return this.props.id.getValue();
	}

	getEmail(): Email {
		return this.props.email;
	}

	getProvider(): AuthProvider | undefined {
		return this.props.provider;
	}

	getProviderId(): string | undefined {
		return this.props.providerId;
	}

	getStatus(): UserStatus {
		return this.props.status;
	}

	getLastLoginAt(): Date | undefined {
		return this.props.lastLoginAt;
	}

	getCreatedAt(): Date {
		return this.props.createdAt;
	}

	getUpdatedAt(): Date {
		return this.props.updatedAt;
	}

	equals(other: User): boolean {
		if (!(other instanceof User)) {
			return false;
		}
		return this.props.id.equals(other.props.id);
	}

	toJSON(): Record<string, any> {
		return {
			id: this.props.id.getValue(),
			email: this.props.email.getValue(),
			provider: this.props.provider?.getValue(),
			providerId: this.props.providerId,
			status: this.props.status,
			isEmailVerified: this.props.isEmailVerified,
			lastLoginAt: this.props.lastLoginAt?.toISOString(),
			createdAt: this.props.createdAt.toISOString(),
			updatedAt: this.props.updatedAt.toISOString(),
		};
	}
}
