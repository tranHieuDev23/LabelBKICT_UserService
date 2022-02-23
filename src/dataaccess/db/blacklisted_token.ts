import { injected, token } from "brandi";
import { Knex } from "knex";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export interface BlacklistedTokenDataAccessor {
    createBlacklistedToken(tokenID: number, expireAt: number): Promise<void>;
    deleteExpiredBlacklistedToken(requestTime: number): Promise<number>;
    getBlacklistedTokenExpireAt(tokenID: number): Promise<number | null>;
}

const TabNameUserServiceBlacklistedToken = "user_service_blacklisted_token_tab";
const ColNameUserServiceBlacklistedTokenID = "id";
const ColNameUserServiceBlacklistedTokenExpireAt = "expire_at";

export class BlacklistedTokenDataAccessorImpl
    implements BlacklistedTokenDataAccessor
{
    constructor(private readonly knex: Knex) {}

    public async createBlacklistedToken(
        tokenID: number,
        expireAt: number
    ): Promise<void> {
        await this.knex
            .insert({
                [ColNameUserServiceBlacklistedTokenID]: tokenID,
                [ColNameUserServiceBlacklistedTokenExpireAt]: expireAt,
            })
            .into(TabNameUserServiceBlacklistedToken);
    }

    public async deleteExpiredBlacklistedToken(
        requestTime: number
    ): Promise<number> {
        const deletedRows = await this.knex
            .delete("*")
            .from(TabNameUserServiceBlacklistedToken)
            .where(
                ColNameUserServiceBlacklistedTokenExpireAt,
                "<=",
                requestTime
            );
        return deletedRows.length;
    }

    public async getBlacklistedTokenExpireAt(
        tokenID: number
    ): Promise<number | null> {
        const rows = await this.knex
            .select([ColNameUserServiceBlacklistedTokenExpireAt])
            .from(TabNameUserServiceBlacklistedToken)
            .where(ColNameUserServiceBlacklistedTokenID, "=", tokenID);
        if (rows.length !== 1) {
            return null;
        }
        return +rows[0][ColNameUserServiceBlacklistedTokenExpireAt];
    }
}

injected(BlacklistedTokenDataAccessorImpl, KNEX_INSTANCE_TOKEN);

export const BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN =
    token<BlacklistedTokenDataAccessor>("BlacklistedTokenDataAccessor");
