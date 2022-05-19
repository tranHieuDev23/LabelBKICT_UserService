import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import ms from "ms";
import { Logger } from "winston";
import { TokenConfig, TOKEN_CONFIG_TOKEN } from "../../config";
import {
    BlacklistedTokenDataAccessor,
    BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN,
    UserDataAccessor,
    USER_DATA_ACCESSOR_TOKEN,
} from "../../dataaccess/db";
import { User } from "../../proto/gen/User";
import { ErrorWithStatus, LOGGER_TOKEN, Timer, TIMER_TOKEN } from "../../utils";
import { TokenGenerator, TOKEN_GENERATOR_TOKEN } from "./generator";

export interface TokenManagementOperator {
    getUserFromToken(
        token: string
    ): Promise<{ user: User | null; newToken: string | null }>;
    blacklistToken(token: string): Promise<void>;
    deleteExpiredBlacklistedToken(requestTime: number): Promise<number>;
}

export class TokenManagementOperatorImpl implements TokenManagementOperator {
    private readonly renewTimeInMs: number;

    constructor(
        private readonly blacklistedTokenDM: BlacklistedTokenDataAccessor,
        private readonly userDM: UserDataAccessor,
        readonly tokenConfig: TokenConfig,
        private readonly tokenGenerator: TokenGenerator,
        private readonly timer: Timer,
        private readonly logger: Logger
    ) {
        this.renewTimeInMs = Math.round(ms(tokenConfig.jwtRenewTime) / 1000);
    }

    public async getUserFromToken(
        token: string
    ): Promise<{ user: User | null; newToken: string | null }> {
        const requestTime = this.timer.getCurrentTime();

        const decodedResult = await this.tokenGenerator.decode(token);
        if (await this.isTokenBlacklisted(decodedResult.tokenId)) {
            this.logger.info("token is blacklisted", {
                tokenId: decodedResult.tokenId,
            });
            throw new ErrorWithStatus(
                "token is blacklisted",
                status.UNAUTHENTICATED
            );
        }

        const user = await this.userDM.getUserByUserId(decodedResult.userId);
        if (user === null) {
            this.logger.info("no user with user_id found", {
                userId: decodedResult.userId,
            });
            throw new ErrorWithStatus(
                `no user with user_id ${decodedResult.userId} found`,
                status.UNAUTHENTICATED
            );
        }

        let newToken = null;
        if (this.isTokenNearExpireTime(requestTime, decodedResult.expireAt)) {
            newToken = await this.tokenGenerator.generate(user.id);
        }

        return { user, newToken };
    }

    public async blacklistToken(token: string): Promise<void> {
        const decodedResult = await this.tokenGenerator.decode(token);
        return this.blacklistedTokenDM.withTransaction(async (dm) => {
            const expireAt = await dm.getBlacklistedTokenExpireAtWithXLock(
                decodedResult.tokenId
            );
            if (expireAt !== null) {
                this.logger.info("token is blacklisted", {
                    tokenId: decodedResult.tokenId,
                });
                throw new ErrorWithStatus(
                    "token is blacklisted",
                    status.UNAUTHENTICATED
                );
            }

            await dm.createBlacklistedToken(
                decodedResult.tokenId,
                decodedResult.expireAt
            );
        });
    }

    public async deleteExpiredBlacklistedToken(
        requestTime: number
    ): Promise<number> {
        const deletedTokenCount =
            await this.blacklistedTokenDM.deleteExpiredBlacklistedToken(
                requestTime
            );
        if (deletedTokenCount == null || deletedTokenCount == 0) {
            this.logger.info("no token is expired", {
                deleteToken: deletedTokenCount,
            });
        }
        return deletedTokenCount;
    }

    private async isTokenBlacklisted(tokenId: number): Promise<boolean> {
        const expireAtTime =
            await this.blacklistedTokenDM.getBlacklistedTokenExpireAt(tokenId);
        return expireAtTime !== null;
    }

    private isTokenNearExpireTime(
        requestTime: number,
        expireAt: number
    ): boolean {
        return requestTime + this.renewTimeInMs >= expireAt;
    }
}

injected(
    TokenManagementOperatorImpl,
    BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN,
    USER_DATA_ACCESSOR_TOKEN,
    TOKEN_CONFIG_TOKEN,
    TOKEN_GENERATOR_TOKEN,
    TIMER_TOKEN,
    LOGGER_TOKEN
);

export const TOKEN_MANAGEMENT_OPERATOR_TOKEN = token<TokenManagementOperator>(
    "TokenManagementOperator"
);
