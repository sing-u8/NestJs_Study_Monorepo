import { Repository } from "../../../shared/type/common.type";
import { RefreshToken } from "../entity/refresh-token.entity";
import { UserId } from "../vo";

export interface IRefreshTokenRepository extends Repository<RefreshToken> {
	save(refreshToken: RefreshToken): Promise<RefreshToken>;

	findById(id: string): Promise<RefreshToken | null>;

	findByToken(token: string): Promise<RefreshToken | null>;

	findActiveTokensByUserId(userId: UserId): Promise<RefreshToken[]>;

	findByUserIdAndDeviceInfo(
		userId: UserId,
		deviceInfo: string,
	): Promise<RefreshToken | null>;

	existsByToken(token: string): Promise<boolean>;

	delete(id: string): Promise<void>;

	deleteByToken(token: string): Promise<void>;

	deleteAllByUserId(userId: UserId): Promise<void>;

	deleteByUserIdAndDeviceInfo(
		userId: UserId,
		deviceInfo: string,
	): Promise<void>;

	deleteExpiredTokens(): Promise<number>;

	countActiveTokensByUserId(userId: UserId): Promise<number>;

	updateLastUsedAt(id: string, lastUsedAt: Date): Promise<void>;

	deactivateToken(id: string): Promise<void>;

	deleteOldTokensByUserId(userId: UserId, keepCount: number): Promise<number>;
}
