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
    getUserByUserID(userID: number): Promise<User | null>;
    getUserByUserIDWithXLock(userID: number): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
    getUserByUsernameWithXLock(username: string): Promise<User | null>;
    getUserCount(): Promise<number>;
    getUserList(
        offset: number,
        limit: number,
        sortOrder: UserListSortOrder
    ): Promise<User[]>;
    withTransaction<T>(
        cb: (dataAccessor: UserDataAccessor) => Promise<T>
    ): Promise<T>;
}

const TabNameUserServiceUser = "user_service_user_tab";
const ColNameUserServiceUserID = "id";
const ColNameUserServiceUserUsername = "username";
const ColNameUserServiceUserDisplayName = "display_name";

export class UserDataAccessorImpl implements UserDataAccessor {
    constructor(private readonly knex: Knex, private readonly logger: Logger) {}

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
                .returning(ColNameUserServiceUserID)
                .into(TabNameUserServiceUser);
            return +rows[0][ColNameUserServiceUserID];
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
                    [ColNameUserServiceUserID]: user.id,
                });
        } catch (error) {
            this.logger.error("failed to update user", { user, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserByUserID(userID: number): Promise<User | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUser)
                .where({
                    [ColNameUserServiceUserID]: userID,
                });
        } catch (error) {
            this.logger.error("failed to get user by user_id", {
                userID,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user with user_id found", { userID });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with user_id found", {
                userID,
            });
            throw new ErrorWithStatus(
                "more than one user was found",
                status.INTERNAL
            );
        }

        return this.getUserFromRow(rows[0]);
    }

    public async getUserByUserIDWithXLock(
        userID: number
    ): Promise<User | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUser)
                .where({
                    [ColNameUserServiceUserID]: userID,
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get user by user_id", {
                userID,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user with user_id found", { userID });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with user_id found", {
                userID,
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
                    .select([ColNameUserServiceUserID])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserID, "asc")
                    .offset(offset);
                break;

            case UserListSortOrder.ID_DESCENDING:
                queryBuilder = this.knex
                    .select([ColNameUserServiceUserID])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserID, "desc")
                    .offset(offset);
                break;

            case UserListSortOrder.USERNAME_ASCENDING:
                queryBuilder = this.knex
                    .select([
                        ColNameUserServiceUserID,
                        ColNameUserServiceUserUsername,
                    ])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserUsername, "asc")
                    .orderBy(ColNameUserServiceUserID, "asc")
                    .offset(offset);
                break;

            case UserListSortOrder.USERNAME_DESCENDING:
                queryBuilder = this.knex
                    .select([
                        ColNameUserServiceUserID,
                        ColNameUserServiceUserUsername,
                    ])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserUsername, "desc")
                    .orderBy(ColNameUserServiceUserID, "desc")
                    .offset(offset);
                break;

            case UserListSortOrder.DISPLAY_NAME_ASCENDING:
                queryBuilder = this.knex
                    .select([
                        ColNameUserServiceUserID,
                        ColNameUserServiceUserDisplayName,
                    ])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserDisplayName, "asc")
                    .orderBy(ColNameUserServiceUserID, "asc")
                    .offset(offset);
                break;

            case UserListSortOrder.DISPLAY_NAME_DESCENDING:
                queryBuilder = this.knex
                    .select([
                        ColNameUserServiceUserID,
                        ColNameUserServiceUserDisplayName,
                    ])
                    .from(TabNameUserServiceUser)
                    .orderBy(ColNameUserServiceUserDisplayName, "desc")
                    .orderBy(ColNameUserServiceUserID, "desc")
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
                        ColNameUserServiceUserID,
                        ">=",
                        keyset[ColNameUserServiceUserID]
                    )
                    .orderBy(ColNameUserServiceUserID, "asc");
                break;

            case UserListSortOrder.ID_DESCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUser)
                    .where(
                        ColNameUserServiceUserID,
                        "<=",
                        keyset[ColNameUserServiceUserID]
                    )
                    .orderBy(ColNameUserServiceUserID, "desc");
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
                                ColNameUserServiceUserID,
                                ">=",
                                keyset[ColNameUserServiceUserID]
                            )
                    )
                    .orderBy(ColNameUserServiceUserUsername, "asc")
                    .orderBy(ColNameUserServiceUserID, "asc");
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
                                ColNameUserServiceUserID,
                                "<=",
                                keyset[ColNameUserServiceUserID]
                            )
                    )
                    .orderBy(ColNameUserServiceUserUsername, "desc")
                    .orderBy(ColNameUserServiceUserID, "desc");
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
                                ColNameUserServiceUserID,
                                ">=",
                                keyset[ColNameUserServiceUserID]
                            )
                    )
                    .orderBy(ColNameUserServiceUserDisplayName, "asc")
                    .orderBy(ColNameUserServiceUserID, "asc");
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
                                ColNameUserServiceUserID,
                                "<=",
                                keyset[ColNameUserServiceUserID]
                            )
                    )
                    .orderBy(ColNameUserServiceUserDisplayName, "desc")
                    .orderBy(ColNameUserServiceUserID, "desc");
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
            +row[ColNameUserServiceUserID],
            row[ColNameUserServiceUserUsername],
            row[ColNameUserServiceUserDisplayName]
        );
    }
}

injected(UserDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_DATA_ACCESSOR_TOKEN =
    token<UserDataAccessor>("UserDataAccessor");
