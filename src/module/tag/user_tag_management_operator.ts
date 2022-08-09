import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import {
    UserDataAccessor,
    UserHasUserTagDataAccessor,
    USER_DATA_ACCESSOR_TOKEN,
    USER_HAS_USER_TAG_DATA_ACCESSOR_TOKEN,
    USER_TAG_DATA_ACCESSOR_TOKEN,
} from "../../dataaccess/db";
import { UserTag } from "../../proto/gen/UserTag";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import {
    UserTagDataAccessor,
    UserTagListSortOrder,
} from "../../dataaccess/db/user_tag";
import { _UserTagListSortOrder_Values } from "../../proto/gen/UserTagListSortOrder";

export interface UserTagManagementOperator {
    createUserTag(displayName: string, description: string): Promise<UserTag>;
    updateUserTag(userTag: UserTag): Promise<UserTag>;
    deleteUserTag(id: number): Promise<void>;
    getUserTagList(
        offset: number,
        limit: number,
        sortOrder: _UserTagListSortOrder_Values
    ): Promise<{ totalUserTagCount: number; userTagList: UserTag[] }>;
    addUserTagToUser(userId: number, userTagId: number): Promise<void>;
    removeUserTagFromUser(userId: number, userTagId: number): Promise<void>;
    getUserTagListFromUserList(userIdList: number[]): Promise<UserTag[][]>;
}

export class UserTagManagementOperatorImpl
    implements UserTagManagementOperator
{
    constructor(
        private readonly userTagDM: UserTagDataAccessor,
        private readonly userDM: UserDataAccessor,
        private readonly userHasUserTagDM: UserHasUserTagDataAccessor,
        private readonly logger: Logger
    ) {}

    public async createUserTag(
        displayName: string,
        description: string
    ): Promise<UserTag> {
        displayName = this.sanitizeUserTagDisplayName(displayName);
        if (!this.isValidUserTagDisplayName(displayName)) {
            this.logger.error("invalid user tag display name", {
                displayName,
            });
            throw new ErrorWithStatus(
                "invalid user tag display name",
                status.INVALID_ARGUMENT
            );
        }

        description = this.sanitizeUserTagDescription(description);
        if (!this.isValidUserTagDescription(description)) {
            this.logger.error("invalid user tag description", { description });
            throw new ErrorWithStatus(
                "invalid user tag description",
                status.INVALID_ARGUMENT
            );
        }

        const userTagId = await this.userTagDM.createUserTag(
            displayName,
            description
        );
        return {
            id: userTagId,
            displayName: displayName,
            description: description,
        };
    }

    public async updateUserTag(userTag: UserTag): Promise<UserTag> {
        if (userTag.id === undefined) {
            this.logger.error("user_tag.id is required");
            throw new ErrorWithStatus(
                "user_tag.id is required",
                status.INVALID_ARGUMENT
            );
        }
        const userTagId = userTag.id;

        if (userTag.displayName !== undefined) {
            userTag.displayName = this.sanitizeUserTagDisplayName(
                userTag.displayName
            );
            if (!this.isValidUserTagDisplayName(userTag.displayName)) {
                this.logger.error("invalid user tag display name", {
                    displayName: userTag.displayName,
                });
                throw new ErrorWithStatus(
                    "invalid user tag display name",
                    status.INVALID_ARGUMENT
                );
            }
        }

        if (userTag.description !== undefined) {
            userTag.description = this.sanitizeUserTagDescription(
                userTag.description
            );
            if (!this.isValidUserTagDescription(userTag.description)) {
                this.logger.error("invalid user tag description", {
                    description: userTag.description,
                });
                throw new ErrorWithStatus(
                    "invalid user tag description",
                    status.INVALID_ARGUMENT
                );
            }
        }

        return this.userTagDM.withTransaction(async (dm) => {
            const userTagRecord = await dm.getUserTagWithXLock(userTagId);
            if (userTagRecord === null) {
                this.logger.error("no user_tag with user_tag_id found", {
                    userTagId,
                });
                throw new ErrorWithStatus(
                    `no user tag with user_tag_id ${userTagId}`,
                    status.NOT_FOUND
                );
            }

            if (userTag.displayName !== undefined) {
                userTagRecord.displayName = userTag.displayName;
            }
            if (userTag.description !== undefined) {
                userTagRecord.description = userTag.description;
            }

            await dm.updateUserTag(userTagRecord);
            return userTagRecord;
        });
    }

    public async deleteUserTag(id: number): Promise<void> {
        await this.userTagDM.deleteUserTag(id);
    }

    public async getUserTagList(
        offset: number,
        limit: number,
        sortOrder: _UserTagListSortOrder_Values
    ): Promise<{ totalUserTagCount: number; userTagList: UserTag[] }> {
        const dmSortOrder = this.getUserTagListSortOrder(sortOrder);
        const dmResults = await Promise.all([
            this.userTagDM.getUserTagCount(),
            this.userTagDM.getUserTagList(offset, limit, dmSortOrder),
        ]);
        return {
            totalUserTagCount: dmResults[0],
            userTagList: dmResults[1],
        };
    }

    public async addUserTagToUser(
        userId: number,
        userTagId: number
    ): Promise<void> {
        const userRecord = await this.userDM.getUserByUserId(userId);
        if (userRecord === null) {
            this.logger.error("no user with user_id found", { userId });
            throw new ErrorWithStatus(
                `no user with user_id ${userId} found`,
                status.NOT_FOUND
            );
        }

        const userTagRecord = await this.userTagDM.getUserTag(userTagId);
        if (userTagRecord === null) {
            this.logger.error("no user tag with user_tag_id found", {
                userTagId,
            });
            throw new ErrorWithStatus(
                `no user tag with user_tag_id ${userTagId} found`,
                status.NOT_FOUND
            );
        }

        return this.userHasUserTagDM.withTransaction(async (dm) => {
            const userHasUserTag = await dm.getUserHasUserTagWithXLock(
                userId,
                userTagId
            );
            if (userHasUserTag !== null) {
                this.logger.error("user already has user tag", {
                    userId,
                    userTagId,
                });
                throw new ErrorWithStatus(
                    `user ${userId} already has user tag ${userTagId}`,
                    status.FAILED_PRECONDITION
                );
            }

            await dm.createUserHasUserTag(userId, userTagId);
        });
    }

    public async removeUserTagFromUser(
        userId: number,
        userTagId: number
    ): Promise<void> {
        const userRecord = await this.userDM.getUserByUserId(userId);
        if (userRecord === null) {
            this.logger.error("no user with user_id found", { userId });
            throw new ErrorWithStatus(
                `no user with user_id ${userId} found`,
                status.NOT_FOUND
            );
        }

        const userTagRecord = await this.userTagDM.getUserTag(userTagId);
        if (userTagRecord === null) {
            this.logger.error("no user tag with user_tag_id found", {
                userTagId,
            });
            throw new ErrorWithStatus(
                `no user tag with user_tag_id ${userTagId} found`,
                status.NOT_FOUND
            );
        }

        return this.userHasUserTagDM.withTransaction(async (dm) => {
            const userHasUserTag = await dm.getUserHasUserTagWithXLock(
                userId,
                userTagId
            );
            if (userHasUserTag === null) {
                this.logger.error("user does not have user tag", {
                    userId,
                    userTagId,
                });
                throw new ErrorWithStatus(
                    `user ${userId} does not have user tag ${userTagId}`,
                    status.FAILED_PRECONDITION
                );
            }
            console.log("o day", userId, userTagId);
            return await this.userHasUserTagDM.deleteUserHasUserTag(
                userId,
                userTagId
            );
        });
    }

    public async getUserTagListFromUserList(
        userIdList: number[]
    ): Promise<UserTag[][]> {
        return await this.userHasUserTagDM.getUserTagListOfUserList(userIdList);
    }

    private sanitizeUserTagDisplayName(displayName: string): string {
        return validator.escape(validator.trim(displayName));
    }

    private isValidUserTagDisplayName(displayName: string): boolean {
        return validator.isLength(displayName, { min: 1, max: 256 });
    }

    private sanitizeUserTagDescription(description: string): string {
        return validator.escape(validator.trim(description));
    }

    private isValidUserTagDescription(description: string): boolean {
        return validator.isLength(description, { min: 0, max: 256 });
    }

    private getUserTagListSortOrder(
        sortOrder: _UserTagListSortOrder_Values
    ): UserTagListSortOrder {
        switch (sortOrder) {
            case _UserTagListSortOrder_Values.ID_ASCENDING:
                return UserTagListSortOrder.ID_ASCENDING;
            case _UserTagListSortOrder_Values.ID_DESCENDING:
                return UserTagListSortOrder.ID_DESCENDING;
            case _UserTagListSortOrder_Values.DISPLAY_NAME_ASCENDING:
                return UserTagListSortOrder.DISPLAY_NAME_ASCENDING;
            case _UserTagListSortOrder_Values.DISPLAY_NAME_DESCENDING:
                return UserTagListSortOrder.DISPLAY_NAME_DESCENDING;
            default:
                this.logger.error("invalid sort_order value", { sortOrder });
                throw new ErrorWithStatus(
                    `invalid sort_order value ${sortOrder}`,
                    status.INVALID_ARGUMENT
                );
        }
    }
}

injected(
    UserTagManagementOperatorImpl,
    USER_TAG_DATA_ACCESSOR_TOKEN,
    USER_DATA_ACCESSOR_TOKEN,
    USER_HAS_USER_TAG_DATA_ACCESSOR_TOKEN,
    LOGGER_TOKEN
);

export const USER_TAG_MANAGEMENT_OPERATOR_TOKEN =
    token<UserTagManagementOperator>("UserTagManagementOperator");
