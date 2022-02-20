export interface BlacklistedTokenDataAccessor {
    CreateBlacklistedToken(tokenID: number, expireAt: number): Promise<void>;
    DeleteExpiredBlacklistedToken(requestTime: number): Promise<number>;
    GetBlacklistedToken(tokenID: number): Promise<number>;
}

export class BlacklistedTokenDataAccessorImpl
    implements BlacklistedTokenDataAccessor
{
    public async CreateBlacklistedToken(
        tokenID: number,
        expireAt: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async DeleteExpiredBlacklistedToken(
        requestTime: number
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async GetBlacklistedToken(tokenID: number): Promise<number> {
        throw new Error("Method not implemented.");
    }
}
