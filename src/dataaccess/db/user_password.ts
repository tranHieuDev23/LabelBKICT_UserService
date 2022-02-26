import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export interface UserPasswordDataAccessor {
    createUserPassword(ofUserID: number, hash: string): Promise<void>;
    updateUserPassword(ofUserID: number, hash: string): Promise<void>;
    getUserPasswordHash(ofUserID: number): Promise<string | null>;
    withTransaction<T>(
        execFunc: (dataAccessor: UserPasswordDataAccessor) => Promise<T>
    ): Promise<T>;
}

const TabNameUserServiceUserPassword = "user_service_user_password_tab";
const ColNameUserServiceUserPasswordOfUserID = "of_user_id";
const ColNameUserServiceUserPasswordHash = "hash";

export class UserPasswordDataAccessorImpl implements UserPasswordDataAccessor {
    constructor(private readonly knex: Knex, private readonly logger: Logger) {}

    public async createUserPassword(
        ofUserID: number,
        hash: string
    ): Promise<void> {
        try {
            await this.knex
                .insert({
                    [ColNameUserServiceUserPasswordOfUserID]: ofUserID,
                    [ColNameUserServiceUserPasswordHash]: hash,
                })
                .into(TabNameUserServiceUserPassword);
        } catch (error) {
            this.logger.error("failed to create user password", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateUserPassword(
        ofUserID: number,
        hash: string
    ): Promise<void> {
        try {
            await this.knex
                .table(TabNameUserServiceUserPassword)
                .update({
                    [ColNameUserServiceUserPasswordHash]: hash,
                })
                .where({
                    [ColNameUserServiceUserPasswordOfUserID]: ofUserID,
                });
        } catch (error) {
            this.logger.error("failed to update user password", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserPasswordHash(ofUserID: number): Promise<string | null> {
        let rows;
        try {
            rows = await this.knex
                .select([ColNameUserServiceUserPasswordHash])
                .from(TabNameUserServiceUserPassword)
                .where({
                    [ColNameUserServiceUserPasswordOfUserID]: ofUserID,
                });
        } catch (error) {
            this.logger.error("failed to get user password hash", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length === 0) {
            this.logger.debug("no user password of user_id found", {
                userID: ofUserID,
            });
            return null;
        }

        return rows[0][ColNameUserServiceUserPasswordHash];
    }

    public async withTransaction<T>(
        cb: (dataAccessor: UserPasswordDataAccessor) => Promise<T>
    ): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new UserPasswordDataAccessorImpl(
                tx,
                this.logger
            );
            return cb(txDataAccessor);
        });
    }
}

injected(UserPasswordDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_PASSWORD_DATA_ACCESSOR_TOKEN =
    token<UserPasswordDataAccessor>("UserPasswordDataAccessor");
