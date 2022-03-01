import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import validator from "validator";
import { Logger } from "winston";
import {
    UserDataAccessor,
    UserHasUserRoleDataAccessor,
    UserRoleDataAccessor,
    UserRoleListSortOrder,
    USER_DATA_ACCESSOR_TOKEN,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_ROLE_DATA_ACCESSOR_TOKEN,
} from "../../dataaccess/db";
import { UserRole } from "../../proto/gen/UserRole";
import { _UserRoleListSortOrder_Values } from "../../proto/gen/UserRoleListSortOrder";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";

export interface UserRoleManagementOperator {
    createUserRole(displayName: string, description: string): Promise<UserRole>;
    updateUserRole(userRole: UserRole): Promise<UserRole>;
    deleteUserRole(id: number): Promise<void>;
    getUserRoleList(
        offset: number,
        limit: number,
        sortOrder: _UserRoleListSortOrder_Values
    ): Promise<{ totalUserRoleCount: number; userRoleList: UserRole[] }>;
    addUserRoleToUser(userID: number, userRoleID: number): Promise<void>;
    removeUserRoleFromUser(userID: number, userRoleID: number): Promise<void>;
    getUserRoleListFromUserList(userIDList: number[]): Promise<UserRole[][]>;
}

export class UserRoleManagementOperatorImpl
    implements UserRoleManagementOperator
{
    constructor(
        private readonly userRoleDataAccessor: UserRoleDataAccessor,
        private readonly userDataAccessor: UserDataAccessor,
        private readonly userHasUserRoleDataAccessor: UserHasUserRoleDataAccessor,
        private readonly logger: Logger
    ) {}

    public async createUserRole(
        displayName: string,
        description: string
    ): Promise<UserRole> {
        displayName = this.sanitizeUserRoleDisplayName(displayName);
        if (!this.isValidUserRoleDisplayName(displayName)) {
            this.logger.error("invalid display name", { displayName });
            throw new ErrorWithStatus(
                "invalid display name",
                status.INVALID_ARGUMENT
            );
        }

        description = this.sanitizeUserRoleDescription(description);
        if (!this.isValidUserRoleDescription(description)) {
            this.logger.error("invalid description", { description });
            throw new ErrorWithStatus(
                "invalid description",
                status.INVALID_ARGUMENT
            );
        }

        const userRoleID = await this.userRoleDataAccessor.createUserRole(
            displayName,
            description
        );
        return {
            id: userRoleID,
            displayName: displayName,
            description: description,
        };
    }

    public async updateUserRole(userRole: UserRole): Promise<UserRole> {
        if (userRole.id === undefined) {
            this.logger.error("user_role.id is required");
            throw new ErrorWithStatus(
                "user_role.id is required",
                status.INVALID_ARGUMENT
            );
        }
        const userRoleID = userRole.id;

        if (userRole.displayName !== undefined) {
            userRole.displayName = this.sanitizeUserRoleDisplayName(
                userRole.displayName
            );
            if (!this.isValidUserRoleDisplayName(userRole.displayName)) {
                this.logger.error("invalid display name", {
                    displayName: userRole.displayName,
                });
                throw new ErrorWithStatus(
                    "invalid display name",
                    status.INVALID_ARGUMENT
                );
            }
        }

        if (userRole.description !== undefined) {
            userRole.description = this.sanitizeUserRoleDescription(
                userRole.description
            );
            if (!this.isValidUserRoleDescription(userRole.description)) {
                this.logger.error("invalid description", {
                    description: userRole.description,
                });
                throw new ErrorWithStatus(
                    "invalid description",
                    status.INVALID_ARGUMENT
                );
            }
        }

        return this.userRoleDataAccessor.withTransaction(async (dm) => {
            const userRoleRecord = await dm.getUserRoleWithXLock(userRoleID);
            if (userRoleRecord === null) {
                this.logger.error("no user_role with user_role_id found", {
                    userRoleID,
                });
                throw new ErrorWithStatus(
                    `no user role with user_role_id ${userRoleID}`,
                    status.NOT_FOUND
                );
            }

            if (userRole.displayName !== undefined) {
                userRoleRecord.displayName = userRole.displayName;
            }
            if (userRole.description !== undefined) {
                userRoleRecord.description = userRole.description;
            }

            await dm.updateUserRole(userRoleRecord);
            return userRoleRecord;
        });
    }

    public async deleteUserRole(id: number): Promise<void> {
        await this.userRoleDataAccessor.deleteUserRole(id);
    }

    public async getUserRoleList(
        offset: number,
        limit: number,
        sortOrder: _UserRoleListSortOrder_Values
    ): Promise<{ totalUserRoleCount: number; userRoleList: UserRole[] }> {
        const dmSortOrder = this.getUserRoleListSortOrder(sortOrder);
        const dmResults = await Promise.all([
            this.userRoleDataAccessor.getUserRoleCount(),
            this.userRoleDataAccessor.getUserRoleList(
                offset,
                limit,
                dmSortOrder
            ),
        ]);
        return {
            totalUserRoleCount: dmResults[0],
            userRoleList: dmResults[1],
        };
    }

    public async addUserRoleToUser(
        userID: number,
        userRoleID: number
    ): Promise<void> {
        const userRecord = await this.userDataAccessor.getUserByUserID(userID);
        if (userRecord === null) {
            this.logger.error("no user with user_id found", { userID });
            throw new ErrorWithStatus(
                `no user with user_id ${userID} found`,
                status.NOT_FOUND
            );
        }

        const userRoleRecord = await this.userRoleDataAccessor.getUserRole(
            userRoleID
        );
        if (userRoleRecord === null) {
            this.logger.error("no user role with user_role_id found", {
                userRoleID,
            });
            throw new ErrorWithStatus(
                `no user role with user_role_id ${userRoleID} found`,
                status.NOT_FOUND
            );
        }

        return this.userHasUserRoleDataAccessor.withTransaction(async (dm) => {
            const userHasUserRole = await dm.getUserHasUserRoleWithXLock(
                userID,
                userRoleID
            );
            if (userHasUserRole !== null) {
                this.logger.error(
                    "user already has user role",
                    { userID },
                    { userRoleID }
                );
                throw new ErrorWithStatus(
                    `user ${userID} already has user role ${userRoleID}`,
                    status.ALREADY_EXISTS
                );
            }

            await dm.createUserHasUserRole(userID, userRoleID);
        });
    }

    public async removeUserRoleFromUser(
        userID: number,
        userRoleID: number
    ): Promise<void> {
        const userRecord = await this.userDataAccessor.getUserByUserID(userID);
        if (userRecord === null) {
            this.logger.error("no user with user_id found", { userID });
            throw new ErrorWithStatus(
                `no user with user_id ${userID} found`,
                status.NOT_FOUND
            );
        }

        const userRoleRecord = await this.userRoleDataAccessor.getUserRole(
            userRoleID
        );
        if (userRoleRecord === null) {
            this.logger.error("no user role with user_role_id found", {
                userRoleID,
            });
            throw new ErrorWithStatus(
                `no user role with user_role_id ${userRoleID} found`,
                status.NOT_FOUND
            );
        }

        return await this.userHasUserRoleDataAccessor.deleteUserHasUserRole(
            userID,
            userRoleID
        );
    }

    public async getUserRoleListFromUserList(
        userIDList: number[]
    ): Promise<UserRole[][]> {
        return await this.userHasUserRoleDataAccessor.getUserRoleListOfUserList(
            userIDList
        );
    }

    private sanitizeUserRoleDisplayName(displayName: string): string {
        return validator.escape(validator.trim(displayName));
    }

    private isValidUserRoleDisplayName(displayName: string): boolean {
        return validator.isLength(displayName, { min: 1, max: 256 });
    }

    private sanitizeUserRoleDescription(description: string): string {
        return validator.escape(validator.trim(description));
    }

    private isValidUserRoleDescription(description: string): boolean {
        return validator.isLength(description, { min: 0, max: 256 });
    }

    private getUserRoleListSortOrder(
        sortOrder: _UserRoleListSortOrder_Values
    ): UserRoleListSortOrder {
        switch (sortOrder) {
            case _UserRoleListSortOrder_Values.ID_ASCENDING:
                return UserRoleListSortOrder.ID_ASCENDING;
            case _UserRoleListSortOrder_Values.ID_DESCENDING:
                return UserRoleListSortOrder.ID_DESCENDING;
            case _UserRoleListSortOrder_Values.DISPLAY_NAME_ASCENDING:
                return UserRoleListSortOrder.DISPLAY_NAME_ASCENDING;
            case _UserRoleListSortOrder_Values.DISPLAY_NAME_DESCENDING:
                return UserRoleListSortOrder.DISPLAY_NAME_DESCENDING;
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
    UserRoleManagementOperatorImpl,
    USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_DATA_ACCESSOR_TOKEN,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN,
    LOGGER_TOKEN
);

export const USER_ROLE_MANAGEMENT_OPERATOR_TOKEN =
    token<UserRoleManagementOperator>("UserRoleManagementOperator");
