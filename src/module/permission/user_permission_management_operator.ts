import { injected, token } from "brandi";
import { Logger } from "winston";
import validator from "validator";
import {
    UserHasUserRoleDataAccessor,
    UserPermissionDataAccessor,
    UserRoleDataAccessor,
    UserRoleHasUserPermissionDataAccessor,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_PERMISSION_DATA_ACCESSOR_TOKEN,
    USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_ROLE_HAS_USER_PERMISSION_DATA_ACCESSOR_TOKEN,
} from "../../dataaccess/db";
import { UserPermission } from "../../proto/gen/UserPermission";
import { ErrorWithStatus, LOGGER_TOKEN } from "../../utils";
import { status } from "@grpc/grpc-js";

export interface UserPermissionManagementOperator {
    createUserPermission(
        permissionName: string,
        description: string
    ): Promise<UserPermission>;
    updateUserPermission(
        userPermission: UserPermission
    ): Promise<UserPermission>;
    deleteUserPermission(id: number): Promise<void>;
    getUserPermissionList(): Promise<UserPermission[]>;
    addUserPermissionToUserRole(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void>;
    removeUserPermissionFromUserRole(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void>;
    getUserPermissionListOfUserRoleList(
        userRoleIDList: number[]
    ): Promise<UserPermission[][]>;
    getUserPermissionListOfUser(userID: number): Promise<UserPermission[]>;
}

export class UserPermissionManagementOperatorImpl
    implements UserPermissionManagementOperator
{
    constructor(
        private readonly userPermissionDM: UserPermissionDataAccessor,
        private readonly userRoleDM: UserRoleDataAccessor,
        private readonly userRoleHasUserPermissionDM: UserRoleHasUserPermissionDataAccessor,
        private readonly userHasUserRoleDM: UserHasUserRoleDataAccessor,
        private readonly logger: Logger
    ) {}

    public async createUserPermission(
        permissionName: string,
        description: string
    ): Promise<UserPermission> {
        if (!this.isValidUserPermissionPermissionName(permissionName)) {
            this.logger.error("invalid user permission name", {
                permissionName,
            });
            throw new ErrorWithStatus(
                "invalid user permission name",
                status.INVALID_ARGUMENT
            );
        }

        description = this.sanitizeUserPermissionDescription(description);
        if (!this.isValidUserPermissionDescription(description)) {
            this.logger.error("invalid user permission description", {
                description,
            });
            throw new ErrorWithStatus(
                "invalid user permission description",
                status.INVALID_ARGUMENT
            );
        }

        return this.userPermissionDM.withTransaction(async (dm) => {
            if (await this.isPermissionNameAlreadyTaken(dm, permissionName)) {
                this.logger.error(
                    "user permission name has already been taken",
                    { permissionName }
                );
                throw new ErrorWithStatus(
                    `user permission name ${permissionName} has already been taken`,
                    status.ALREADY_EXISTS
                );
            }

            const permissionID = await dm.createUserPermission(
                permissionName,
                description
            );
            return {
                id: permissionID,
                permissionName: permissionName,
                description: description,
            };
        });
    }

    public async updateUserPermission(
        userPermission: UserPermission
    ): Promise<UserPermission> {
        if (userPermission.id === undefined) {
            this.logger.error("user_permission.id is required");
            throw new ErrorWithStatus(
                "user_permission.id is required",
                status.INVALID_ARGUMENT
            );
        }
        const userPermissionID = userPermission.id;

        if (userPermission.permissionName !== undefined) {
            if (
                !this.isValidUserPermissionPermissionName(
                    userPermission.permissionName
                )
            ) {
                this.logger.error("invalid user permission name", {
                    permissionName: userPermission.permissionName,
                });
                throw new ErrorWithStatus(
                    "invalid user permission name",
                    status.INVALID_ARGUMENT
                );
            }
        }

        if (userPermission.description !== undefined) {
            userPermission.description = this.sanitizeUserPermissionDescription(
                userPermission.description
            );
            if (
                !this.isValidUserPermissionDescription(
                    userPermission.description
                )
            ) {
                this.logger.error("invalid user permission description", {
                    description: userPermission.description,
                });
                throw new ErrorWithStatus(
                    "invalid user permission description",
                    status.INVALID_ARGUMENT
                );
            }
        }

        return this.userPermissionDM.withTransaction(async (dm) => {
            const userPermissionRecord =
                await dm.getUserPermissionByIDWithXLock(userPermissionID);
            if (userPermissionRecord === null) {
                this.logger.error(
                    "no user permission with user_permission_id exists",
                    { userPermissionID }
                );
                throw new ErrorWithStatus(
                    `no user permission with user_permission_id ${userPermissionID} exists`,
                    status.ALREADY_EXISTS
                );
            }

            if (userPermission.permissionName !== undefined) {
                const permissionNameAlreadyTaken =
                    await this.isPermissionNameAlreadyTaken(
                        dm,
                        userPermission.permissionName
                    );
                if (permissionNameAlreadyTaken) {
                    this.logger.error(
                        "user permission name has already been taken",
                        { permissionName: userPermission.permissionName }
                    );
                    throw new ErrorWithStatus(
                        `user permission name ${userPermission.permissionName} has already been taken`,
                        status.ALREADY_EXISTS
                    );
                }

                userPermissionRecord.permissionName =
                    userPermission.permissionName;
            }

            if (userPermission.description !== undefined) {
                userPermissionRecord.description = userPermission.description;
            }

            await dm.updateUserPermission(userPermissionRecord);
            return userPermissionRecord;
        });
    }

    public async deleteUserPermission(id: number): Promise<void> {
        await this.userPermissionDM.deleteUserPermission(id);
    }

    public async getUserPermissionList(): Promise<UserPermission[]> {
        return await this.userPermissionDM.getUserPermissionList();
    }

    public async addUserPermissionToUserRole(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void> {
        const userRoleRecord = await this.userRoleDM.getUserRole(userRoleID);
        if (userRoleRecord === null) {
            this.logger.error("no user role with user_role_id found", {
                userRoleID,
            });
            throw new ErrorWithStatus(
                `no user role with user_role_id ${userRoleID} found`,
                status.NOT_FOUND
            );
        }

        const userPermissionRecord =
            await this.userPermissionDM.getUserPermissionByID(userPermissionID);
        if (userPermissionRecord === null) {
            this.logger.error(
                "no user permission with user_permission_id found",
                { userPermissionID }
            );
            throw new ErrorWithStatus(
                `no user permission with user_permission_id ${userPermissionID} found`,
                status.NOT_FOUND
            );
        }

        return this.userRoleHasUserPermissionDM.withTransaction(async (dm) => {
            const userRoleHasUserPermission =
                await dm.getUserRoleHasUserPermissionWithXLock(
                    userRoleID,
                    userPermissionID
                );
            if (userRoleHasUserPermission !== null) {
                this.logger.error(
                    "user role already has user permission",
                    { userRoleID },
                    { userPermissionID }
                );
                throw new ErrorWithStatus(
                    `user role ${userRoleID} already has user permission ${userPermissionID}`,
                    status.FAILED_PRECONDITION
                );
            }

            await dm.createUserRoleHasUserPermission(
                userRoleID,
                userPermissionID
            );
        });
    }

    public async removeUserPermissionFromUserRole(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void> {
        const userRoleRecord = await this.userRoleDM.getUserRole(userRoleID);
        if (userRoleRecord === null) {
            this.logger.error("no user role with user_role_id found", {
                userRoleID,
            });
            throw new ErrorWithStatus(
                `no user role with user_role_id ${userRoleID} found`,
                status.NOT_FOUND
            );
        }

        const userPermissionRecord =
            await this.userPermissionDM.getUserPermissionByID(userPermissionID);
        if (userPermissionRecord === null) {
            this.logger.error(
                "no user permission with user_permission_id found",
                { userPermissionID }
            );
            throw new ErrorWithStatus(
                `no user permission with user_permission_id ${userPermissionID} found`,
                status.NOT_FOUND
            );
        }

        return this.userRoleHasUserPermissionDM.withTransaction(async (dm) => {
            const userRoleHasUserPermission =
                await dm.getUserRoleHasUserPermissionWithXLock(
                    userRoleID,
                    userPermissionID
                );
            if (userRoleHasUserPermission === null) {
                this.logger.error(
                    "user role does not have user permission",
                    { userRoleID },
                    { userPermissionID }
                );
                throw new ErrorWithStatus(
                    `user role ${userRoleID} does not have user permission ${userPermissionID}`,
                    status.FAILED_PRECONDITION
                );
            }

            await this.userRoleHasUserPermissionDM.deleteUserRoleHasUserPermission(
                userRoleID,
                userPermissionID
            );
        });
    }

    public async getUserPermissionListOfUserRoleList(
        userRoleIDList: number[]
    ): Promise<UserPermission[][]> {
        return await this.userRoleHasUserPermissionDM.getUserPermissionListOfUserRoleList(
            userRoleIDList
        );
    }

    public async getUserPermissionListOfUser(
        userID: number
    ): Promise<UserPermission[]> {
        const userRoleIDList =
            await this.userHasUserRoleDM.getUserRoleIDListOfUser(userID);
        const userPermissionListOfUserRoleList =
            await this.userRoleHasUserPermissionDM.getUserPermissionListOfUserRoleList(
                userRoleIDList
            );

        const returnedUserPermissionIDSet = new Set<number>();
        const results: UserPermission[] = [];
        for (const userPermissionList of userPermissionListOfUserRoleList) {
            for (const userPermission of userPermissionList) {
                const id = userPermission.id;
                if (returnedUserPermissionIDSet.has(id)) {
                    continue;
                }

                returnedUserPermissionIDSet.add(id);
                results.push(userPermission);
            }
        }

        return results;
    }

    private isValidUserPermissionPermissionName(
        permissionName: string
    ): boolean {
        return (
            validator.isLength(permissionName, { min: 1, max: 256 }) &&
            /^[A-Za-z0-9_.]+$/.test(permissionName) &&
            !validator.contains(permissionName, "..") &&
            !permissionName.startsWith(".") &&
            !permissionName.endsWith(".")
        );
    }

    private async isPermissionNameAlreadyTaken(
        dm: UserPermissionDataAccessor,
        permissionName: string
    ): Promise<boolean> {
        const userPermissionRecord =
            await dm.getUserPermissionByPermissionNameWithXLock(permissionName);
        return userPermissionRecord !== null;
    }

    private sanitizeUserPermissionDescription(description: string): string {
        return validator.escape(validator.trim(description));
    }

    private isValidUserPermissionDescription(description: string): boolean {
        return validator.isLength(description, { min: 0, max: 256 });
    }
}

injected(
    UserPermissionManagementOperatorImpl,
    USER_PERMISSION_DATA_ACCESSOR_TOKEN,
    USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_ROLE_HAS_USER_PERMISSION_DATA_ACCESSOR_TOKEN,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN,
    LOGGER_TOKEN
);

export const USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN =
    token<UserPermissionManagementOperator>("UserPermissionManagementOperator");
