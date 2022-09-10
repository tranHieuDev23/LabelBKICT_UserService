import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import {
    UserDataAccessor,
    UserHasUserRoleDataAccessor,
    UserHasUserTagDataAccessor,
    UserListFilterOptions as DMUserListFilterOptions,
    UserListSortOrder,
    USER_DATA_ACCESSOR_TOKEN,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_HAS_USER_TAG_DATA_ACCESSOR_TOKEN,
} from "../../dataaccess/db";
import { User } from "../../proto/gen/User";
import { _UserListSortOrder_Values } from "../../proto/gen/UserListSortOrder";
import { UserListFilterOptions } from "../../proto/gen/UserListFilterOptions";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";

export interface UserManagementOperator {
    createUser(username: string, displayName: string): Promise<User>;
    updateUser(user: User): Promise<User>;
    getUserList(
        offset: number,
        limit: number,
        sortOrder: _UserListSortOrder_Values,
        filterOptions: UserListFilterOptions | undefined
    ): Promise<{ totalUserCount: number; userList: User[] }>;
    getUser(userId: number): Promise<User>;
    searchUser(
        query: string,
        limit: number,
        includedUserIdList: number[]
    ): Promise<User[]>;
}

export class UserManagementOperatorImpl implements UserManagementOperator {
    constructor(
        private readonly userDM: UserDataAccessor,
        private readonly userHasUserRoleDM: UserHasUserRoleDataAccessor,
        private readonly userHasUserTagDM: UserHasUserTagDataAccessor,
        private readonly logger: Logger
    ) {}

    public async createUser(
        username: string,
        displayName: string
    ): Promise<User> {
        if (!this.isValidUsername(username)) {
            this.logger.error("invalid username", { username });
            throw new ErrorWithStatus(
                `invalid username ${username}`,
                status.INVALID_ARGUMENT
            );
        }

        displayName = this.sanitizeDisplayName(displayName);
        if (!this.isValidDisplayName(displayName)) {
            this.logger.error("invalid display name", { displayName });
            throw new ErrorWithStatus(
                `invalid display name ${displayName}`,
                status.INVALID_ARGUMENT
            );
        }

        return this.userDM.withTransaction<User>(async (dm) => {
            const userRecord = await dm.getUserByUsernameWithXLock(username);
            if (userRecord !== null) {
                this.logger.error("username has already been taken", {
                    username,
                });
                throw new ErrorWithStatus(
                    `username ${username} has already been taken`,
                    status.ALREADY_EXISTS
                );
            }

            const createdUserId = await dm.createUser(username, displayName);
            return {
                id: createdUserId,
                username: username,
                displayName: displayName,
            };
        });
    }

    public async updateUser(user: User): Promise<User> {
        if (user.id === undefined) {
            this.logger.error("user.id is required");
            throw new ErrorWithStatus(
                `user.id is required`,
                status.INVALID_ARGUMENT
            );
        }
        const userId = user.id;

        if (user.username !== undefined) {
            if (!this.isValidUsername(user.username)) {
                this.logger.error("invalid username", {
                    username: user.username,
                });
                throw new ErrorWithStatus(
                    `invalid username ${user.username}`,
                    status.INVALID_ARGUMENT
                );
            }
        }

        if (user.displayName !== undefined) {
            user.displayName = this.sanitizeDisplayName(user.displayName);
            if (!this.isValidDisplayName(user.displayName)) {
                this.logger.error("invalid username", {
                    displayName: user.displayName,
                });
                throw new ErrorWithStatus(
                    `invalid display name ${user.displayName}`,
                    status.INVALID_ARGUMENT
                );
            }
        }

        return this.userDM.withTransaction<User>(async (dm) => {
            const userRecord = await dm.getUserByUserIdWithXLock(userId);
            if (userRecord === null) {
                this.logger.error("no user with user_id found", {
                    userId: user.id,
                });
                throw new ErrorWithStatus(
                    `no user with id ${user.id} found`,
                    status.NOT_FOUND
                );
            }

            if (user.username !== undefined) {
                const userWithUsernameRecord =
                    await dm.getUserByUsernameWithXLock(user.username);
                if (
                    userWithUsernameRecord !== null &&
                    userWithUsernameRecord.id !== userId
                ) {
                    this.logger.error("username has already been taken", {
                        username: user.username,
                    });
                    throw new ErrorWithStatus(
                        `username ${user.username} has already been taken`,
                        status.ALREADY_EXISTS
                    );
                }

                userRecord.username = user.username;
            }

            if (user.displayName !== undefined) {
                userRecord.displayName = user.displayName;
            }

            await dm.updateUser(userRecord);
            return userRecord;
        });
    }

    public async getUserList(
        offset: number,
        limit: number,
        sortOrder: _UserListSortOrder_Values,
        filterOptions: UserListFilterOptions | undefined
    ): Promise<{ totalUserCount: number; userList: User[] }> {
        const dmFilterOptions = await this.getDMUserListFilterOptions(
            filterOptions
        );

        const dmSortOrder = this.getUserListSortOrder(sortOrder);
        const dmResults = await Promise.all([
            this.userDM.getUserCount(),
            this.userDM.getUserList(
                offset,
                limit,
                dmSortOrder,
                dmFilterOptions
            ),
        ]);
        return {
            totalUserCount: dmResults[0],
            userList: dmResults[1],
        };
    }

    public async getUser(userId: number): Promise<User> {
        const user = await this.userDM.getUserByUserId(userId);
        if (user === null) {
            this.logger.error("no user with user_id found", { userId });
            throw new ErrorWithStatus(
                `no user with user_id ${userId} found`,
                status.NOT_FOUND
            );
        }
        return user;
    }

    public async searchUser(
        query: string,
        limit: number,
        includedUserIdList: number[]
    ): Promise<User[]> {
        if (query === "") {
            return [];
        }
        return await this.userDM.searchUser(query, limit, includedUserIdList);
    }

    private sanitizeDisplayName(displayName: string): string {
        return validator.escape(validator.trim(displayName));
    }

    private isValidUsername(username: string): boolean {
        return (
            validator.isLength(username, { min: 6, max: 64 }) &&
            validator.isAlphanumeric(username)
        );
    }

    private isValidDisplayName(displayName: string): boolean {
        return validator.isLength(displayName, { min: 1, max: 256 });
    }

    private getUserListSortOrder(
        sortOrder: _UserListSortOrder_Values
    ): UserListSortOrder {
        switch (sortOrder) {
            case _UserListSortOrder_Values.ID_ASCENDING:
                return UserListSortOrder.ID_ASCENDING;
            case _UserListSortOrder_Values.ID_DESCENDING:
                return UserListSortOrder.ID_DESCENDING;
            case _UserListSortOrder_Values.USERNAME_ASCENDING:
                return UserListSortOrder.USERNAME_ASCENDING;
            case _UserListSortOrder_Values.USERNAME_DESCENDING:
                return UserListSortOrder.USERNAME_DESCENDING;
            case _UserListSortOrder_Values.DISPLAY_NAME_ASCENDING:
                return UserListSortOrder.DISPLAY_NAME_ASCENDING;
            case _UserListSortOrder_Values.DISPLAY_NAME_DESCENDING:
                return UserListSortOrder.DISPLAY_NAME_DESCENDING;
            default:
                this.logger.error("invalid sort_order value", { sortOrder });
                throw new ErrorWithStatus(
                    `invalid sort_order value ${sortOrder}`,
                    status.INVALID_ARGUMENT
                );
        }
    }

    private async getDMUserListFilterOptions(
        filterOptions: UserListFilterOptions | undefined
    ): Promise<DMUserListFilterOptions> {
        const dmFilterOptions = new DMUserListFilterOptions();
        if (filterOptions === undefined) {
            return dmFilterOptions;
        }
        dmFilterOptions.usernameQuery = filterOptions.usernameQuery || "";

        let userTagIdList = (filterOptions.userTagIdList || []).map(
            (userTagId) => (userTagId === 0 ? null : userTagId)
        );
        userTagIdList = userTagIdList.filter(element => {
            return element !== null;
        });
        const userIdListOfUserTagList = await this.userHasUserTagDM.getUserIdListOfUserTagList(
            userTagIdList
        );

        let userRoleIdList = (
            filterOptions.userRoleIdList || []
        ).map((userRoleId) => (userRoleId === 0 ? null : userRoleId));
        userRoleIdList = userRoleIdList.filter(element => {
            return element !== null;
        });
        const userIdListOfUSerRoleList = await this.userHasUserRoleDM.getUserIdListOfUserRoleList(
            userRoleIdList
        );

        dmFilterOptions.userIdList = [...new Set([...userIdListOfUserTagList ,...userIdListOfUSerRoleList])];
        return dmFilterOptions;
    }
}

injected(
    UserManagementOperatorImpl, 
    USER_DATA_ACCESSOR_TOKEN, 
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN, 
    USER_HAS_USER_TAG_DATA_ACCESSOR_TOKEN,
    LOGGER_TOKEN
);

export const USER_MANAGEMENT_OPERATOR_TOKEN = token<UserManagementOperator>(
    "UserManagementOperator"
);
