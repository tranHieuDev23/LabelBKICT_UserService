import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import { Knex } from "knex";
import { Logger } from "winston";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { KNEX_INSTANCE_TOKEN } from "./knex";
import { UserTag } from "./user_tag";

export interface UserHasUserTagDataAccessor {
    createUserHasUserTag(userId: number, userTagId: number): Promise<void>;
    deleteUserHasUserTag(userId: number, userTagId: number): Promise<void>;
    getUserTagListOfUser(userId: number): Promise<UserTag[]>;
    getUserTagListOfUserList(userIdList: number[]): Promise<UserTag[][]>;
    getUserTagIdListOfUser(userId: number): Promise<number[]>;
    getUserIdListOfUserTagList(userTagIdList: number[]): Promise<number[]>;
    getUserHasUserTagWithXLock(
        userId: number,
        userTagId: number
    ): Promise<{ userId: number; userTagId: number } | null>;
    withTransaction<T>(execFunc: (dataAccessor: UserHasUserTagDataAccessor) => Promise<T>): Promise<T>;
}

const TabNameUserServiceUserHasUserTag = "user_service_user_has_user_tag_tab";
const ColNameUserServiceUserHasUserTagUserId = "user_id";
const ColNameUserServiceUserHasUserTagUserTagId = "user_tag_id";

const TabNameUserServiceUserTag = "user_service_user_tag_tab";
const ColNameUserServiceUserTagId = "user_tag_id";
const ColNameUserServiceUserTagDisplayName = "display_name";
const ColNameUserServiceUserTagDescription = "description";

export class UserHasUserTagDataAccessorImpl implements UserHasUserTagDataAccessor {
    constructor(private readonly knex: Knex<any, any[]>, private readonly logger: Logger) {}

    public async createUserHasUserTag(userId: number, userTagId: number): Promise<void> {
        try {
            await this.knex
                .insert({
                    [ColNameUserServiceUserHasUserTagUserId]: userId,
                    [ColNameUserServiceUserHasUserTagUserTagId]: userTagId,
                })
                .into(TabNameUserServiceUserHasUserTag);
        } catch (error) {
            this.logger.error("failed to create user has user tag relation", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async deleteUserHasUserTag(userId: number, userTagId: number): Promise<void> {
        let deletedCount: number;
        try {
            deletedCount = await this.knex
                .delete()
                .from(TabNameUserServiceUserHasUserTag)
                .where({
                    [ColNameUserServiceUserHasUserTagUserId]: userId,
                    [ColNameUserServiceUserHasUserTagUserTagId]: userTagId,
                });
        } catch (error) {
            this.logger.error("failed to create user has user tag relation", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
        if (deletedCount === 0) {
            this.logger.debug("no user has user tag relation found", { userId }, { userTagId });
            throw new ErrorWithStatus(
                `no user has user tag relation found with user_id ${userId}, user_tag_id ${userTagId}`,
                status.NOT_FOUND
            );
        }
    }

    public async getUserTagListOfUser(userId: number): Promise<UserTag[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserTag)
                .join(
                    TabNameUserServiceUserTag,
                    `${TabNameUserServiceUserHasUserTag}.${ColNameUserServiceUserHasUserTagUserTagId}`,
                    `${TabNameUserServiceUserTag}.${ColNameUserServiceUserTagId}`
                )
                .where(ColNameUserServiceUserHasUserTagUserId, userId)
                .orderBy(ColNameUserServiceUserHasUserTagUserId, "asc");

            const results: UserTag[] = [];
            for (const row of rows) {
                results.push(this.getUserTagFromRow(row));
            }

            return results;
        } catch (error) {
            this.logger.error("failed to get user tag list of user", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserTagListOfUserList(userIdList: number[]): Promise<UserTag[][]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserTag)
                .join(
                    TabNameUserServiceUserTag,
                    `${TabNameUserServiceUserHasUserTag}.${ColNameUserServiceUserHasUserTagUserTagId}`,
                    `${TabNameUserServiceUserTag}.${ColNameUserServiceUserTagId}`
                )
                .whereIn(ColNameUserServiceUserHasUserTagUserId, userIdList)
                .orderBy(ColNameUserServiceUserHasUserTagUserId, "asc");

            const userIdToUserTagList = new Map<number, UserTag[]>();
            for (const row of rows) {
                const userId = row[ColNameUserServiceUserHasUserTagUserId];
                if (!userIdToUserTagList.has(userId)) {
                    userIdToUserTagList.set(userId, []);
                }
                userIdToUserTagList.get(userId)?.push(this.getUserTagFromRow(row));
            }

            const results: UserTag[][] = [];
            for (const userId of userIdList) {
                results.push(userIdToUserTagList.get(userId) || []);
            }

            return results;
        } catch (error) {
            this.logger.error("failed to get user tag list of user id list", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserTagIdListOfUser(userId: number): Promise<number[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserTag)
                .where({
                    [ColNameUserServiceUserHasUserTagUserId]: userId,
                });

            return rows.map((row) => +row[ColNameUserServiceUserHasUserTagUserTagId]);
        } catch (error) {
            this.logger.error("failed to get user tag id list of user id", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserIdListOfUserTagList(userTagIdList: number[]): Promise<number[]> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserTag)
                .whereIn(ColNameUserServiceUserHasUserTagUserTagId, userTagIdList);
            return rows.map((row) => +row[ColNameUserServiceUserHasUserTagUserId]);
        } catch (error) {
            this.logger.error("failed to get user id list of user tag id list", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async getUserHasUserTagWithXLock(
        userId: number,
        userTagId: number
    ): Promise<{ userId: number; userTagId: number } | null> {
        try {
            const rows = await this.knex
                .select()
                .from(TabNameUserServiceUserHasUserTag)
                .where({
                    [ColNameUserServiceUserHasUserTagUserId]: userId,
                    [ColNameUserServiceUserHasUserTagUserTagId]: userTagId,
                })
                .forUpdate();

            if (rows.length == 0) {
                this.logger.debug("no user has user tag relation found", { userId }, { userTagId });
                return null;
            }

            if (rows.length > 1) {
                this.logger.error("more than one user has user tag relation found", { userId, userTagId });
                throw new ErrorWithStatus("more than one user has user tag relation found", status.INTERNAL);
            }

            return {
                userId: +rows[0][ColNameUserServiceUserHasUserTagUserId],
                userTagId: +rows[0][ColNameUserServiceUserHasUserTagUserTagId],
            };
        } catch (error) {
            this.logger.error("failed to get user has user tag relation", {
                error,
            });
            throw ErrorWithStatus.wrapWithStatus(error, status.INTERNAL);
        }
    }

    public async withTransaction<T>(cb: (dataAccessor: UserHasUserTagDataAccessor) => Promise<T>): Promise<T> {
        return this.knex.transaction(async (tx) => {
            const txDataAccessor = new UserHasUserTagDataAccessorImpl(tx, this.logger);
            return cb(txDataAccessor);
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

injected(UserHasUserTagDataAccessorImpl, KNEX_INSTANCE_TOKEN, LOGGER_TOKEN);

export const USER_HAS_USER_TAG_DATA_ACCESSOR_TOKEN = token<UserHasUserTagDataAccessor>("UserHasUserTagDataAccessor");
