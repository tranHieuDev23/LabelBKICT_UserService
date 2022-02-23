import { injected, token } from "brandi";
import { Knex } from "knex";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export interface UserPasswordDataAccessor {
    createUserPassword(ofUserID: number, hash: string): Promise<void>;
    updateUserPassword(ofUserID: number, hash: string): Promise<void>;
    getUserPasswordHash(ofUserID: number): Promise<string | null>;
}

const TabNameUserServiceUserPassword = "user_service_user_password_tab";
const ColNameUserServiceUserPasswordOfUserID = "of_user_id";
const ColNameUserServiceUserPasswordHash = "hash";

export class UserPasswordDataAccessorImpl implements UserPasswordDataAccessor {
    constructor(private readonly knex: Knex) {}

    public async createUserPassword(
        ofUserID: number,
        hash: string
    ): Promise<void> {
        await this.knex
            .insert({
                [ColNameUserServiceUserPasswordOfUserID]: ofUserID,
                [ColNameUserServiceUserPasswordHash]: hash,
            })
            .into(TabNameUserServiceUserPassword);
    }

    public async updateUserPassword(
        ofUserID: number,
        hash: string
    ): Promise<void> {
        await this.knex
            .table(TabNameUserServiceUserPassword)
            .update({
                [ColNameUserServiceUserPasswordHash]: hash,
            })
            .where({
                [ColNameUserServiceUserPasswordOfUserID]: ofUserID,
            });
    }

    public async getUserPasswordHash(ofUserID: number): Promise<string | null> {
        const rows = await this.knex
            .select([ColNameUserServiceUserPasswordHash])
            .from(TabNameUserServiceUserPassword)
            .where({
                [ColNameUserServiceUserPasswordOfUserID]: ofUserID,
            });
        if (rows.length !== 1) {
            return null;
        }
        return rows[0][ColNameUserServiceUserPasswordHash];
    }
}

injected(UserPasswordDataAccessorImpl, KNEX_INSTANCE_TOKEN);

export const USER_PASSWORD_DATA_ACCESSOR_TOKEN =
    token<UserPasswordDataAccessor>("UserPasswordDataAccessor");
