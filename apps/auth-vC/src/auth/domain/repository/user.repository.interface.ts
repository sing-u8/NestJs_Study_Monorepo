import {
	PaginatedResult,
	Repository,
	SearchOptions,
} from "../../../shared/type/common.type";
import { User } from "../entity/user.entity";
import { AuthProvider, Email, UserId } from "../vo";

/**
 * 사용자 검색 필터
 */
export interface UserSearchFilters {
	provider?: AuthProvider;
	isActive?: boolean;
	isEmailVerified?: boolean;
	createdAfter?: Date;
	createdBefore?: Date;
}

/**
 * 사용자 리포지토리 인터페이스
 * 사용자 엔티티의 영속성을 추상화
 */
export interface IUserRepository extends Repository<User> {
	save(user: User): Promise<User>;

	findById(id: UserId): Promise<User | null>;

	findByEmail(email: Email): Promise<User | null>;

	findByProviderAndProviderId(
		provider: AuthProvider,
		providerId: string,
	): Promise<User | null>;

	existsByEmail(email: Email): Promise<boolean>;

	existsByProviderAndProviderId(
		provider: AuthProvider,
		providerId: string,
	): Promise<boolean>;

	findMany(
		options: SearchOptions & { filters?: UserSearchFilters },
	): Promise<PaginatedResult<User>>;

	countActiveUsers(): Promise<number>;

	delete(id: UserId): Promise<void>;

	softDelete(id: UserId): Promise<void>;

	updateLastLoginAt(id: UserId, loginAt: Date): Promise<void>;

	updateEmailVerificationStatus(id: UserId, isVerified: boolean): Promise<void>;
}
