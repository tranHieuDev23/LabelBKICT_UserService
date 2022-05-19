import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export class UserRole {
    constructor(
        public id: number,
        public displayName: string,
        public description: string
    ) {}
}

export enum UserRoleListSortOrder {
    ID_ASCENDING = 0,
    ID_DESCENDING = 1,
    DISPLAY_NAME_ASCENDING = 2,
    DISPLAY_NAME_DESCENDING = 3,
}

export interface UserRoleDataAccessor {
    createUserRole(displayName: string, description: string): Promise<number>;
    updateUserRole(userRole: UserRole): Promise<void>;
    deleteUserRole(id: number): Promise<void>;
    getUserRoleCount(): Promise<number>;
    getUserRoleList(
        offset: number,
        limit: number,
        sortOrder: UserRoleListSortOrder
    ): Promise<UserRole[]>;
    getUserRole(id: number): Promise<UserRole | null>;
    getUserRoleWithXLock(id: number): Promise<UserRole | null>;
    withTransaction<T>(
        execFunc: (dataAccessor: UserRoleDataAccessor) => Promise<T>
    ): Promise<T>;
}

const TabNameUserServiceUserRole = "user_service_user_role_tab";
const ColNameUserServiceUserRoleId = "user_role_id";
const ColNameUserServiceUserRoleDisplayName = "display_name";
const ColNameUserServiceUserRoleDescription = "description";

export class UserRoleDataAccessorImpl implements UserRoleDataAccessor {
    constructor(
        private readonly knex: Knex<any, any[]>,
        private readonly logger: Logger
    ) {}

    public async createUserRole(
        displayName: string,
        description: string
    ): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameUserServiceUserRoleDisplayName]: displayName,
                    [ColNameUserServiceUserRoleDescription]: description,
                })
                .returning(ColNameUserServiceUserRoleId)
                .into(TabNameUserServiceUserRole);
            return +rows[0][ColNameUserServiceUserRoleId];
        } catch (error) {
            this.logger.error("failed to create user role", {
                displayName,
                description,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateUserRole(userRole: UserRole): Promise<void> {
        try {
            await this.knex
                .table(TabNameUserServiceUserRole)
                .update({
                    [ColNameUserServiceUserRoleDisplayName]:
                        userRole.displayName,
                    [ColNameUserServiceUserRoleDescription]:
                        userRole.description,
                })
                .where({
                    [ColNameUserServiceUserRoleId]: userRole.id,
                });
        } catch (error) {
            this.logger.error("failed to update user role", {
                userRole,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteUserRole(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameUserServiceUserRole)
                .where({
                    [ColNameUserServiceUserRoleId]: id,
                });
        } catch (error) {
            this.logger.error("failed to delete user role", {
                userRoleId: id,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.error("no user role with user_role_id found", {
                userRoleId: id,
            });
            throw new ErrorWithStatus(
                `no user role with user_role_id ${id} found`,
                status.NOT_FOUND
            );
        }
    }

    public async getUserRoleCount(): Promise<number> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex.count().from(TabNameUserServiceUserRole);
        } catch (error) {
            this.logger.error("failed to get user role count", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        return +rows[0]["count"];
    }

    public async getUserRoleList(
        offset: number,
        limit: number,
        sortOrder: UserRoleListSortOrder
    ): Promise<UserRole[]> {
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
        return rows.map((row) => this.getUserRoleFromRow(row));
    }

    private async getUserListPaginationKeyset(
        offset: number,
        sortOrder: UserRoleListSortOrder
    ): Promise<Record<string, any> | null> {
        let queryBuilder: Knex.QueryBuilder;
        switch (sortOrder) {
            case UserRoleListSortOrder.ID_ASCENDING:
                queryBuilder = this.knex
                    .select([ColNameUserServiceUserRoleId])
                    .from(TabNameUserServiceUserRole)
                    .orderBy(ColNameUserServiceUserRoleId, "asc")
                    .offset(offset);
                break;

            case UserRoleListSortOrder.ID_DESCENDING:
                queryBuilder = this.knex
                    .select([ColNameUserServiceUserRoleId])
                    .from(TabNameUserServiceUserRole)
                    .orderBy(ColNameUserServiceUserRoleId, "desc")
                    .offset(offset);
                break;

            case UserRoleListSortOrder.DISPLAY_NAME_ASCENDING:
                queryBuilder = this.knex
                    .select([
                        ColNameUserServiceUserRoleId,
                        ColNameUserServiceUserRoleDisplayName,
                    ])
                    .from(TabNameUserServiceUserRole)
                    .orderBy(ColNameUserServiceUserRoleDisplayName, "asc")
                    .orderBy(ColNameUserServiceUserRoleId, "asc")
                    .offset(offset);
                break;

            case UserRoleListSortOrder.DISPLAY_NAME_DESCENDING:
                queryBuilder = this.knex
                    .select([
                        ColNameUserServiceUserRoleId,
                        ColNameUserServiceUserRoleDisplayName,
                    ])
                    .from(TabNameUserServiceUserRole)
                    .orderBy(ColNameUserServiceUserRoleDisplayName, "desc")
                    .orderBy(ColNameUserServiceUserRoleId, "desc")
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
            this.logger.error(
                "failed to get user role list pagination keyset",
                { error }
            );
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
        sortOrder: UserRoleListSortOrder
    ): Promise<Record<string, any>[]> {
        let queryBuilder: Knex.QueryBuilder;
        switch (sortOrder) {
            case UserRoleListSortOrder.ID_ASCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUserRole)
                    .where(
                        ColNameUserServiceUserRoleId,
                        ">=",
                        keyset[ColNameUserServiceUserRoleId]
                    )
                    .orderBy(ColNameUserServiceUserRoleId, "asc");
                break;

            case UserRoleListSortOrder.ID_DESCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUserRole)
                    .where(
                        ColNameUserServiceUserRoleId,
                        "<=",
                        keyset[ColNameUserServiceUserRoleId]
                    )
                    .orderBy(ColNameUserServiceUserRoleId, "desc");
                break;

            case UserRoleListSortOrder.DISPLAY_NAME_ASCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUserRole)
                    .where(
                        ColNameUserServiceUserRoleDisplayName,
                        ">",
                        keyset[ColNameUserServiceUserRoleDisplayName]
                    )
                    .orWhere((qb) =>
                        qb
                            .where(
                                ColNameUserServiceUserRoleDisplayName,
                                "=",
                                keyset[ColNameUserServiceUserRoleDisplayName]
                            )
                            .andWhere(
                                ColNameUserServiceUserRoleId,
                                ">=",
                                keyset[ColNameUserServiceUserRoleId]
                            )
                    )
                    .orderBy(ColNameUserServiceUserRoleDisplayName, "asc")
                    .orderBy(ColNameUserServiceUserRoleId, "asc");
                break;

            case UserRoleListSortOrder.DISPLAY_NAME_DESCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUserRole)
                    .where(
                        ColNameUserServiceUserRoleDisplayName,
                        "<",
                        keyset[ColNameUserServiceUserRoleDisplayName]
                    )
                    .orWhere((qb) =>
                        qb
                            .where(
                                ColNameUserServiceUserRoleDisplayName,
                                "=",
                                keyset[ColNameUserServiceUserRoleDisplayName]
                            )
                            .andWhere(
                                ColNameUserServiceUserRoleId,
                                "<=",
                                keyset[ColNameUserServiceUserRoleId]
                            )
                    )
                    .orderBy(ColNameUserServiceUserRoleDisplayName, "desc")
                    .orderBy(ColNameUserServiceUserRoleId, "desc");
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

    public async getUserRole(id: number): Promise<UserRole | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUserRole)
                .where({
                    [ColNameUserServiceUserRoleId]: id,
                });
        } catch (error) {
            this.logger.error("failed to get user role by user_role_id", {
                userRoleId: id,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user role with user_role_id found", {
                userRoleId: id,
            });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with user_id found", {
                userRoleId: id,
            });
            throw new ErrorWithStatus(
                "more than one user role was found",
                status.INTERNAL
            );
        }

        return this.getUserRoleFromRow(rows[0]);
    }

    public async getUserRoleWithXLock(id: number): Promise<UserRole | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUserRole)
                .where({
                    [ColNameUserServiceUserRoleId]: id,
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get user role by user_role_id", {
                userRoleId: id,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        if (rows.length == 0) {
            this.logger.debug("no user role with user_role_id found", {
                userRoleId: id,
            });
            return null;
        }

        if (rows.length > 1) {
            this.logger.error("more than one user with user_id found", {
                userRoleId: id,
            });
            throw new ErrorWithStatus(
                "more than one user role was found",
                status.INTERNAL
            );
        }

        return this.getUserRoleFromRow(rows[0]);
    }

    public async withTransaction<T>(
        cb: (dataAccessor: UserRoleDataAccessor) => Promise<T>
    ): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new UserRoleDataAccessorImpl(
                tx,
                this.logger
            );
            return cb(txDataAccessor);
        });
    }

    private getUserRoleFromRow(row: Record<string, any>): UserRole {
        return new UserRole(
            +row[ColNameUserServiceUserRoleId],
            row[ColNameUserServiceUserRoleDisplayName],
            row[ColNameUserServiceUserRoleDescription]
        );
    }
}

injected(UserRoleDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_ROLE_DATA_ACCESSOR_TOKEN = token<UserRoleDataAccessor>(
    "UserRoleDataAccessor"
);
