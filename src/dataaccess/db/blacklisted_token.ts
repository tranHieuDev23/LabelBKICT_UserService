import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export interface BlacklistedTokenDataAccessor {
    createBlacklistedToken(tokenID: number, expireAt: number): Promise<void>;
    deleteExpiredBlacklistedToken(requestTime: number): Promise<number>;
    getBlacklistedTokenExpireAt(tokenID: number): Promise<number | null>;
    getBlacklistedTokenExpireAtWithXLock(
        tokenID: number
    ): Promise<number | null>;
    withTransaction<T>(
        execFunc: (dataAccessor: BlacklistedTokenDataAccessor) => Promise<T>
    ): Promise<T>;
}

const TabNameUserServiceBlacklistedToken = "user_service_blacklisted_token_tab";
const ColNameUserServiceBlacklistedTokenID = "id";
const ColNameUserServiceBlacklistedTokenExpireAt = "expire_at";

export class BlacklistedTokenDataAccessorImpl
    implements BlacklistedTokenDataAccessor
{
    constructor(private readonly knex: Knex, private readonly logger: Logger) {}

    public async createBlacklistedToken(
        tokenID: number,
        expireAt: number
    ): Promise<void> {
        try {
            await this.knex
                .insert({
                    [ColNameUserServiceBlacklistedTokenID]: tokenID,
                    [ColNameUserServiceBlacklistedTokenExpireAt]: expireAt,
                })
                .into(TabNameUserServiceBlacklistedToken);
        } catch (error) {
            this.logger.error("failed to create new blacklisted token", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteExpiredBlacklistedToken(
        requestTime: number
    ): Promise<number> {
        try {
            const deletedRows = await this.knex
                .delete("*")
                .from(TabNameUserServiceBlacklistedToken)
                .where(
                    ColNameUserServiceBlacklistedTokenExpireAt,
                    "<=",
                    requestTime
                );
            return deletedRows.length;
        } catch (error) {
            this.logger.error("failed to delete blacklisted tokens", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getBlacklistedTokenExpireAt(
        tokenID: number
    ): Promise<number | null> {
        try {
            const rows = await this.knex
                .select([ColNameUserServiceBlacklistedTokenExpireAt])
                .from(TabNameUserServiceBlacklistedToken)
                .where(ColNameUserServiceBlacklistedTokenID, "=", tokenID);
            if (rows.length !== 1) {
                return null;
            }
            return +rows[0][ColNameUserServiceBlacklistedTokenExpireAt];
        } catch (error) {
            this.logger.error("failed to get blacklisted token record", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getBlacklistedTokenExpireAtWithXLock(
        tokenID: number
    ): Promise<number | null> {
        try {
            const rows = await this.knex
                .select([ColNameUserServiceBlacklistedTokenExpireAt])
                .from(TabNameUserServiceBlacklistedToken)
                .where(ColNameUserServiceBlacklistedTokenID, "=", tokenID)
                .forUpdate();
            if (rows.length !== 1) {
                return null;
            }
            return +rows[0][ColNameUserServiceBlacklistedTokenExpireAt];
        } catch (error) {
            this.logger.error("failed to get blacklisted token record", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(
        cb: (dataAccessor: BlacklistedTokenDataAccessor) => Promise<T>
    ): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new BlacklistedTokenDataAccessorImpl(
                tx,
                this.logger
            );
            return cb(txDataAccessor);
        });
    }
}

injected(BlacklistedTokenDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN =
    token<BlacklistedTokenDataAccessor>("BlacklistedTokenDataAccessor");
