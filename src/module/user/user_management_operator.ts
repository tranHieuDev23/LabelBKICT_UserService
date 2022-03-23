import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import {
    UserDataAccessor,
    UserListSortOrder,
    USER_DATA_ACCESSOR_TOKEN,
} from "../../dataaccess/db";
import { User } from "../../proto/gen/User";
import { _UserListSortOrder_Values } from "../../proto/gen/UserListSortOrder";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";

export interface UserManagementOperator {
    createUser(username: string, displayName: string): Promise<User>;
    updateUser(user: User): Promise<User>;
    getUserList(
        offset: number,
        limit: number,
        sortOrder: _UserListSortOrder_Values
    ): Promise<{ totalUserCount: number; userList: User[] }>;
    getUser(userID: number): Promise<User>;
    searchUser(
        query: string,
        limit: number,
        includedUserIDList: number[]
    ): Promise<User[]>;
}

export class UserManagementOperatorImpl implements UserManagementOperator {
    constructor(
        private readonly userDM: UserDataAccessor,
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

        return this.userDM.withTransaction<User>(async (dataAccessor) => {
            const userRecord = await dataAccessor.getUserByUsernameWithXLock(
                username
            );
            if (userRecord !== null) {
                this.logger.error("username has already been taken", {
                    username,
                });
                throw new ErrorWithStatus(
                    `username ${username} has already been taken`,
                    status.ALREADY_EXISTS
                );
            }

            const createdUserID = await dataAccessor.createUser(
                username,
                displayName
            );
            return {
                id: createdUserID,
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
        const userID = user.id;

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

        return this.userDM.withTransaction<User>(async (dataAccessor) => {
            const userRecord = await dataAccessor.getUserByUserIDWithXLock(
                userID
            );
            if (userRecord === null) {
                this.logger.error("no user with user_id found", {
                    userID: user.id,
                });
                throw new ErrorWithStatus(
                    `no user with id ${user.id} found`,
                    status.NOT_FOUND
                );
            }

            if (user.username !== undefined) {
                userRecord.username = user.username;
            }
            if (user.displayName !== undefined) {
                userRecord.displayName = user.displayName;
            }

            await dataAccessor.updateUser(userRecord);
            return userRecord;
        });
    }

    public async getUserList(
        offset: number,
        limit: number,
        sortOrder: _UserListSortOrder_Values
    ): Promise<{ totalUserCount: number; userList: User[] }> {
        const dmSortOrder = this.getUserListSortOrder(sortOrder);
        const dmResults = await Promise.all([
            this.userDM.getUserCount(),
            this.userDM.getUserList(offset, limit, dmSortOrder),
        ]);
        return {
            totalUserCount: dmResults[0],
            userList: dmResults[1],
        };
    }

    public async getUser(userID: number): Promise<User> {
        const user = await this.userDM.getUserByUserID(userID);
        if (user === null) {
            this.logger.error("no user with user_id found", { userID });
            throw new ErrorWithStatus(
                `no user with user_id ${userID} found`,
                status.NOT_FOUND
            );
        }
        return user;
    }

    public async searchUser(
        query: string,
        limit: number,
        includedUserIDList: number[]
    ): Promise<User[]> {
        if (query === "") {
            return [];
        }
        return await this.userDM.searchUser(query, limit, includedUserIDList);
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
}

injected(UserManagementOperatorImpl, USER_DATA_ACCESSOR_TOKEN, LOGGER_TOKEN);

export const USER_MANAGEMENT_OPERATOR_TOKEN = token<UserManagementOperator>(
    "UserManagementOperator"
);
