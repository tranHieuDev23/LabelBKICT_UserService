import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";

export class UserTag {
    constructor(public id: number, public displayName: string, public description: string) {}
}

export enum UserTagListSortOrder {
    ID_ASCENDING = 0,
    ID_DESCENDING = 1,
    DISPLAY_NAME_ASCENDING = 2,
    DISPLAY_NAME_DESCENDING = 3,
}

export interface UserTagDataAccessor {
    createUserTag(displayName: string, description: string): Promise<number>;
    updateUserTag(userTag: UserTag): Promise<void>;
    deleteUserTag(id: number): Promise<void>;
    getUserTagCount(): Promise<number>;
    getUserTagList(offset: number, limit: number, sortOrder: UserTagListSortOrder): Promise<UserTag[]>;
    getUserTag(id: number): Promise<UserTag | null>;
    getUserTagByDisplayName(displayName: string): Promise<UserTag | null>;
    getUserTagWithXLock(id: number): Promise<UserTag | null>;
    withTransaction<T>(executeFunc: (dataAccessor: UserTagDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameUserServiceUserTag = "user_service_user_tag_tab";
const ColNameUserServiceUserTagId = "user_tag_id";
const ColNameUserServiceUserTagDisplayName = "display_name";
const ColNameUserServiceUserTagDescription = "description";

export class UserTagDataAccessorImpl implements UserTagDataAccessor {
    constructor(private readonly knex: Knex<any, any[]>, private readonly logger: Logger) {}

    public async createUserTag(displayName: string, description: string): Promise<number> {
        try {
            const rows = await this.knex
                .insert({
                    [ColNameUserServiceUserTagDisplayName]: displayName,
                    [ColNameUserServiceUserTagDescription]: description,
                })
                .returning(ColNameUserServiceUserTagId)
                .into(TabNameUserServiceUserTag);
            return +rows[0][ColNameUserServiceUserTagId];
        } catch (error) {
            this.logger.error("failed to create user tag", {
                displayName,
                description,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async updateUserTag(userTag: UserTag): Promise<void> {
        try {
            await this.knex
                .table(TabNameUserServiceUserTag)
                .update({
                    [ColNameUserServiceUserTagDisplayName]: userTag.displayName,
                    [ColNameUserServiceUserTagDescription]: userTag.description,
                })
                .where({
                    [ColNameUserServiceUserTagId]: userTag.id,
                });
        } catch (error) {
            this.logger.error("failed to update user tag", {
                userTag,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteUserTag(id: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameUserServiceUserTag)
                .where({
                    [ColNameUserServiceUserTagId]: id,
                });
        } catch (error) {
            this.logger.error("failed to delete user tag", {
                userTagId: id,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.error("no user tag with user_tag_id found", {
                userTagId: id,
            });
            throw new ErrorWithStatus(`no user tag with user_tag_id ${id} found`, status.NOT_FOUND);
        }
    }

    public async getUserTagCount(): Promise<number> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex.count().from(TabNameUserServiceUserTag);
        } catch (error) {
            this.logger.error("failed to get user tag count", { error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }

        return +rows[0]["count"];
    }

    public async getUserTagList(offset: number, limit: number, sortOrder: UserTagListSortOrder): Promise<UserTag[]> {
        const keyset = await this.getUserListPaginationKeyset(offset, sortOrder);
        if (keyset === null) {
            return [];
        }

        const rows = await this.getUserListFromPaginationKeyset(keyset, limit, sortOrder);
        return rows.map((row) => this.getUserTagFromRow(row));
    }

    private async getUserListPaginationKeyset(
        offset: number,
        sortOrder: UserTagListSortOrder
    ): Promise<Record<string, any> | null> {
        let queryBuilder: Knex.QueryBuilder;
        switch (sortOrder) {
            case UserTagListSortOrder.ID_ASCENDING:
                queryBuilder = this.knex
                    .select([ColNameUserServiceUserTagId])
                    .from(TabNameUserServiceUserTag)
                    .orderBy(ColNameUserServiceUserTagId, "asc")
                    .offset(offset);
                break;

            case UserTagListSortOrder.ID_DESCENDING:
                queryBuilder = this.knex
                    .select([ColNameUserServiceUserTagId])
                    .from(TabNameUserServiceUserTag)
                    .orderBy(ColNameUserServiceUserTagId, "desc")
                    .offset(offset);
                break;

            case UserTagListSortOrder.DISPLAY_NAME_ASCENDING:
                queryBuilder = this.knex
                    .select([ColNameUserServiceUserTagId, ColNameUserServiceUserTagDisplayName])
                    .from(TabNameUserServiceUserTag)
                    .orderBy(ColNameUserServiceUserTagDisplayName, "asc")
                    .orderBy(ColNameUserServiceUserTagId, "asc")
                    .offset(offset);
                break;

            case UserTagListSortOrder.DISPLAY_NAME_DESCENDING:
                queryBuilder = this.knex
                    .select([ColNameUserServiceUserTagId, ColNameUserServiceUserTagDisplayName])
                    .from(TabNameUserServiceUserTag)
                    .orderBy(ColNameUserServiceUserTagDisplayName, "desc")
                    .orderBy(ColNameUserServiceUserTagId, "desc")
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
            this.logger.error("failed to get user tag list pagination keyset", { error });
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
        sortOrder: UserTagListSortOrder
    ): Promise<Record<string, any>[]> {
        let queryBuilder: Knex.QueryBuilder;
        switch (sortOrder) {
            case UserTagListSortOrder.ID_ASCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUserTag)
                    .where(ColNameUserServiceUserTagId, ">=", keyset[ColNameUserServiceUserTagId])
                    .orderBy(ColNameUserServiceUserTagId, "asc");
                break;

            case UserTagListSortOrder.ID_DESCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUserTag)
                    .where(ColNameUserServiceUserTagId, "<=", keyset[ColNameUserServiceUserTagId])
                    .orderBy(ColNameUserServiceUserTagId, "desc");
                break;

            case UserTagListSortOrder.DISPLAY_NAME_ASCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUserTag)
                    .where(ColNameUserServiceUserTagDisplayName, ">", keyset[ColNameUserServiceUserTagDisplayName])
                    .orWhere((qb) =>
                        qb
                            .where(
                                ColNameUserServiceUserTagDisplayName,
                                "=",
                                keyset[ColNameUserServiceUserTagDisplayName]
                            )
                            .andWhere(ColNameUserServiceUserTagId, ">=", keyset[ColNameUserServiceUserTagId])
                    )
                    .orderBy(ColNameUserServiceUserTagDisplayName, "asc")
                    .orderBy(ColNameUserServiceUserTagId, "asc");
                break;

            case UserTagListSortOrder.DISPLAY_NAME_DESCENDING:
                queryBuilder = this.knex
                    .select()
                    .from(TabNameUserServiceUserTag)
                    .where(ColNameUserServiceUserTagDisplayName, "<", keyset[ColNameUserServiceUserTagDisplayName])
                    .orWhere((qb) =>
                        qb
                            .where(
                                ColNameUserServiceUserTagDisplayName,
                                "=",
                                keyset[ColNameUserServiceUserTagDisplayName]
                            )
                            .andWhere(ColNameUserServiceUserTagId, "<=", keyset[ColNameUserServiceUserTagId])
                    )
                    .orderBy(ColNameUserServiceUserTagDisplayName, "desc")
                    .orderBy(ColNameUserServiceUserTagId, "desc");
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

    public async getUserTag(id: number): Promise<UserTag | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUserTag)
                .where({
                    [ColNameUserServiceUserTagId]: id,
                });
        } catch (error) {
            this.logger.error("failed to get user tag", {
                userTagId: id,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (rows.length === 0) {
            this.logger.info("no user tag with user_tag_id found", {
                userTagId: id,
            });
            return null;
        }
        if (rows.length > 1) {
            this.logger.error("more than one user tag with user_tag_id found", { userTagId: id });
            throw new ErrorWithStatus("more than one user tag was found", status.INTERNAL);
        }
        return this.getUserTagFromRow(rows[0]);
    }

    public async getUserTagByDisplayName(displayName: string): Promise<UserTag | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUserTag)
                .where({
                    [ColNameUserServiceUserTagDisplayName]: displayName,
                });
        } catch (error) {
            this.logger.error("failed to get user tag by display name", { displayName, error });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (rows.length === 0) {
            this.logger.info("no user tag with display name found", { displayName });
            return null;
        }
        if (rows.length > 1) {
            this.logger.error("more than one user tag with display name found", { displayName });
            throw new ErrorWithStatus("more than one user tag was found", status.INTERNAL);
        }
        return this.getUserTagFromRow(rows[0]);
    }

    public async getUserTagWithXLock(id: number): Promise<UserTag | null> {
        let rows: Record<string, any>[];
        try {
            rows = await this.knex
                .select()
                .from(TabNameUserServiceUserTag)
                .where({
                    [ColNameUserServiceUserTagId]: id,
                })
                .forUpdate();
        } catch (error) {
            this.logger.error("failed to get user tag", {
                userTagId: id,
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (rows.length === 0) {
            this.logger.info("no user tag with user_tag_id found", {
                userTagId: id,
            });
            return null;
        }
        if (rows.length > 1) {
            this.logger.error("more than one user tag with user_tag_id found", { userTagId: id });
            throw new ErrorWithStatus("more than one user tag was found", status.INTERNAL);
        }
        return this.getUserTagFromRow(rows[0]);
    }

    public async withTransaction<T>(executeFunc: (dataAccessor: UserTagDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new UserTagDataAccessorImpl(tx, this.logger);
            return executeFunc(txDataAccessor);
        });
    }

    private getUserTagFromRow(row: Record<string, any>): UserTag {
        return new UserTag(
            +row[ColNameUserServiceUserTagId],
            row[ColNameUserServiceUserTagDisplayName],
            row[ColNameUserServiceUserTagDescription]
        );
    }
}

injected(UserTagDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_TAG_DATA_ACCESSOR_TOKEN = token<UserTagDataAccessor>("UserTagDataAccessor");
