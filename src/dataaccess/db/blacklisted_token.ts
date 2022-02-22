import { injected, token } from "brandi";

export interface BlacklistedTokenDataAccessor {
    createBlacklistedToken(tokenID: number, expireAt: number): Promise<void>;
    deleteExpiredBlacklistedToken(requestTime: number): Promise<number>;
    getBlacklistedToken(tokenID: number): Promise<number>;
}

export class BlacklistedTokenDataAccessorImpl
    implements BlacklistedTokenDataAccessor
{
    public async createBlacklistedToken(
        tokenID: number,
        expireAt: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async deleteExpiredBlacklistedToken(
        requestTime: number
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async getBlacklistedToken(tokenID: number): Promise<number> {
        throw new Error("Method not implemented.");
    }
}

injected(BlacklistedTokenDataAccessorImpl);

export const BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN =
    token<BlacklistedTokenDataAccessor>("BlacklistedTokenDataAccessor");
