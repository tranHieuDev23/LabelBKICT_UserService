import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export class User {
    constructor(
        public id: number,
        public username: string,
        public displayName: string
    ) {}
}

export enum UserListSortOrder {
    ID_ASCENDING = 0,
    ID_DESCENDING = 1,
    USERNAME_ASCENDING = 2,
    USERNAME_DESCENDING = 3,
    DISPLAY_NAME_ASCENDING = 4,
    DISPLAY_NAME_DESCENDING = 5,
}

export interface UserDataAccessor {
    createUser(username: string, displayName: string): Promise<number>;
    updateUser(user: User): Promise<void>;
    getUserByUserId(userId: number): Promise<User | null>;
    getUserByUserIdWithXLock(userId: number): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
    getUserByUsernameWithXLock(username: string): Promise<User | null>;
    getUserCount(): Promise<number>;
    getUserList(
        offset: number,
        limit: number,
        sortOrder: UserListSortOrder
    ): Promise<User[]>;
    searchUser(
        query: string,
        limit: number,
        includedUserIdList: number[]
    ): Promise<User[]>;
    withTransaction<T>(
        cb: (dataAccessor: UserDataAccessor) => Promise<T>
    ): Promise<T>;
}

const TabNameUserServiceUser = "user_service_user_tab";
const ColNameUserServiceUserId = "user_id";
const ColNameUserServiceUserUsername = "username";
const ColNameUserServiceUserDisplayName = "display_name";
const ColNameUserServiceUserFullTextSearchDocument =
    "full_text_search_document";

export class UserDataAccessorImpl implements UserDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) {}

    public async createUser(
        username: string,
        displayName: string
    ): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameUserServiceUserUsername]: username,
                    [ColNameUserServiceUserDisplayName]: displayName,
                })
                .returning(ColNameUserServiceUserId)
                .into(TabNameUserServiceUser);
            return +rows[0][ColNameUserServiceUserId];
        } catch (error) {
            this.logger.error("failed to create user", {
                username,
                displayName,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateUser(user: User): Promise<void> {
        try {
            await this.knex
                .table(TabNameUserServiceUser)
                .update({
                    [ColNameUserServiceUserUsername]: user.username,
                    [ColNameUserServiceUserDisplayName]: user.displayName,
                })
                .where({
                    [ColNameUserServiceUserId]: user.id,
                });
        } catch (error) {
            this.logger.error("failed to update user", { user, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserByUserId(userId: number): Promise<User | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUser)
                .where({
                    [ColNameUserServiceUserId]: userId,
                });
        } catch (error) {
            this.logger.error("failed to get user by user_id", {
                userId,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user with user_id found", { userId });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with user_id found", {
                userId,
            });
            throw new ErrorWithStatus(
                "more than one user was found",
                status.INTERNAL
            );
        }

        return this.getUserFromRow(rows[0]);
    }

    public async getUserByUserIdWithXLock(
        userId: number
    ): Promise<User | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUser)
                .where({
                    [ColNameUserServiceUserId]: userId,
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get user by user_id", {
                userId,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user with user_id found", { userId });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with user_id found", {
                userId,
            });
            throw new ErrorWithStatus(
                "more than one user was found",
                status.INTERNAL
            );
        }

        return this.getUserFromRow(rows[0]);
    }

    public async getUserByUsername(username: string): Promise<User | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUser)
                .where({
                    [ColNameUserServiceUserUsername]: username,
                });
        } catch (error) {
            this.logger.error("failed to get user by username", {
                username,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user with username found", { username });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with username found", {
                username,
            });
            throw new ErrorWithStatus(
                "more than one user was found",
                status.INTERNAL
            );
        }

        return this.getUserFromRow(rows[0]);
    }

    public async getUserByUsernameWithXLock(
        username: string
    ): Promise<User | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUser)
                .where({
                    [ColNameUserServiceUserUsername]: username,
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get user by username", {
                username,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user with username found", { username });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with username found", {
                username,
            });
            throw new ErrorWithStatus(
                "more than one user was found",
                status.INTERNAL
            );
        }

        return this.getUserFromRow(rows[0]);
    }

    public async getUserCount(): Promise<number> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex.count().from(TabNameUserServiceUser);
        } catch (error) {
            this.logger.error("failed to get user count", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        return +rows[0]["count"];
    }

    public async getUserList(
        offset: number,
        limit: number,
        sortOrder: UserListSortOrder
    ): Promise<User[]> {
        const keyset = await this.getUserListPaginationKeyset(
            offset,
            sortOrder
        );
        if (keyset === null) {
            return [];
        }

        const rows = await this.getUserListFromPaginationKeyset(
            keyset,
            limit,
            sortOrder
        );
        return rows.map((row) => this.getUserFromRow(row));
    }

    private async getUserListPaginationKeyset(
        offset: number,
        sortOrder: UserListSortOrder
    ): Promise<Record<string, any> | null> {
        let queryBuilder: Knex.QueryBuilder;
        switch (sortOrder) {
            case UserListSortOrder.ID_ASCENDING:
                queryBuilder = this.knex
                    .select([ColNameUserServiceUserId])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserId, "asc")
                    .offset(offset);
                break;

            case UserListSortOrder.ID_DESCENDING:
                queryBuilder = this.knex
                    .select([ColNameUserServiceUserId])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserId, "desc")
                    .offset(offset);
                break;

            case UserListSortOrder.USERNAME_ASCENDING:
                queryBuilder = this.knex
                    .select([
                        ColNameUserServiceUserId,
                        ColNameUserServiceUserUsername,
                    ])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserUsername, "asc")
                    .orderBy(ColNameUserServiceUserId, "asc")
                    .offset(offset);
                break;

            case UserListSortOrder.USERNAME_DESCENDING:
                queryBuilder = this.knex
                    .select([
                        ColNameUserServiceUserId,
                        ColNameUserServiceUserUsername,
                    ])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserUsername, "desc")
                    .orderBy(ColNameUserServiceUserId, "desc")
                    .offset(offset);
                break;

            case UserListSortOrder.DISPLAY_NAME_ASCENDING:
                queryBuilder = this.knex
                    .select([
                        ColNameUserServiceUserId,
                        ColNameUserServiceUserDisplayName,
                    ])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserDisplayName, "asc")
                    .orderBy(ColNameUserServiceUserId, "asc")
                    .offset(offset);
                break;

            case UserListSortOrder.DISPLAY_NAME_DESCENDING:
                queryBuilder = this.knex
                    .select([
                        ColNameUserServiceUserId,
                        ColNameUserServiceUserDisplayName,
                    ])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserDisplayName, "desc")
                    .orderBy(ColNameUserServiceUserId, "desc")
                    .offset(offset);
                break;

            default:
                throw new Error("Unsupported sort order value.");
        }

        queryBuilder = queryBuilder.limit(1);

        let rows: Record<string, any>[];
        try {
            rows = await queryBuilder;
        } catch (error) {
            this.logger.error("failed to get user list pagination keyset", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            return null;
        }
        return rows[0];
    }

    private async getUserListFromPaginationKeyset(
        keyset: Record<string, any>,
        limit: number,
        sortOrder: UserListSortOrder
    ): Promise<Record<string, any>[]> {
        let queryBuilder: Knex.QueryBuilder;
        switch (sortOrder) {
            case UserListSortOrder.ID_ASCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUser)
                    .where(
                        ColNameUserServiceUserId,
                        ">=",
                        keyset[ColNameUserServiceUserId]
                    )
                    .orderBy(ColNameUserServiceUserId, "asc");
                break;

            case UserListSortOrder.ID_DESCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUser)
                    .where(
                        ColNameUserServiceUserId,
                        "<=",
                        keyset[ColNameUserServiceUserId]
                    )
                    .orderBy(ColNameUserServiceUserId, "desc");
                break;

            case UserListSortOrder.USERNAME_ASCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUser)
                    .where(
                        ColNameUserServiceUserUsername,
                        ">",
                        keyset[ColNameUserServiceUserUsername]
                    )
                    .orWhere((qb) =>
                        qb
                            .where(
                                ColNameUserServiceUserUsername,
                                "=",
                                keyset[ColNameUserServiceUserUsername]
                            )
                            .andWhere(
                                ColNameUserServiceUserId,
                                ">=",
                                keyset[ColNameUserServiceUserId]
                            )
                    )
                    .orderBy(ColNameUserServiceUserUsername, "asc")
                    .orderBy(ColNameUserServiceUserId, "asc");
                break;

            case UserListSortOrder.USERNAME_DESCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUser)
                    .where(
                        ColNameUserServiceUserUsername,
                        "<",
                        keyset[ColNameUserServiceUserUsername]
                    )
                    .orWhere((qb) =>
                        qb
                            .where(
                                ColNameUserServiceUserUsername,
                                "=",
                                keyset[ColNameUserServiceUserUsername]
                            )
                            .andWhere(
                                ColNameUserServiceUserId,
                                "<=",
                                keyset[ColNameUserServiceUserId]
                            )
                    )
                    .orderBy(ColNameUserServiceUserUsername, "desc")
                    .orderBy(ColNameUserServiceUserId, "desc");
                break;

            case UserListSortOrder.DISPLAY_NAME_ASCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUser)
                    .where(
                        ColNameUserServiceUserDisplayName,
                        ">",
                        keyset[ColNameUserServiceUserDisplayName]
                    )
                    .orWhere((qb) =>
                        qb
                            .where(
                                ColNameUserServiceUserDisplayName,
                                "=",
                                keyset[ColNameUserServiceUserDisplayName]
                            )
                            .andWhere(
                                ColNameUserServiceUserId,
                                ">=",
                                keyset[ColNameUserServiceUserId]
                            )
                    )
                    .orderBy(ColNameUserServiceUserDisplayName, "asc")
                    .orderBy(ColNameUserServiceUserId, "asc");
                break;

            case UserListSortOrder.DISPLAY_NAME_DESCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUser)
                    .where(
                        ColNameUserServiceUserDisplayName,
                        "<",
                        keyset[ColNameUserServiceUserDisplayName]
                    )
                    .orWhere((qb) =>
                        qb
                            .where(
                                ColNameUserServiceUserDisplayName,
                                "=",
                                keyset[ColNameUserServiceUserDisplayName]
                            )
                            .andWhere(
                                ColNameUserServiceUserId,
                                "<=",
                                keyset[ColNameUserServiceUserId]
                            )
                    )
                    .orderBy(ColNameUserServiceUserDisplayName, "desc")
                    .orderBy(ColNameUserServiceUserId, "desc");
                break;

            default:
                throw new Error("Unsupported sort order value.");
        }

        queryBuilder = queryBuilder.limit(limit);

        try {
            return await queryBuilder;
        } catch (error) {
            this.logger.error("failed to get user list", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async searchUser(
        query: string,
        limit: number,
        includedUserIdList: number[]
    ): Promise<User[]> {
        let qb = this.knex
            .select()
            .from(TabNameUserServiceUser)
            .whereRaw(
                `${ColNameUserServiceUserFullTextSearchDocument} @@ plainto_tsquery (?)`,
                query
            )
            .orderByRaw(
                `ts_rank(${ColNameUserServiceUserFullTextSearchDocument}, plainto_tsquery (?)) DESC`,
                query
            )
            .limit(limit);
        if (includedUserIdList.length > 0) {
            qb = qb.andWhere((qb) =>
                qb.whereIn(ColNameUserServiceUserId, includedUserIdList)
            );
        }

        try {
            const rows = await qb;
            return rows.map((row) => this.getUserFromRow(row));
        } catch (error) {
            this.logger.error("failed to get user list", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(
        cb: (dataAccessor: UserDataAccessor) => Promise<T>
    ): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new UserDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
        });
    }

    private getUserFromRow(row: Record<string, any>): User {
        return new User(
            +row[ColNameUserServiceUserId],
            row[ColNameUserServiceUserUsername],
            row[ColNameUserServiceUserDisplayName]
        );
    }
}

injected(UserDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_DATA_ACCESSOR_TOKEN =
    token<UserDataAccessor>("UserDataAccessor");
