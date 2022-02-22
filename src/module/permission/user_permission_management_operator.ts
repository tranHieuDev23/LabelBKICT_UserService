import { injected, token } from "brandi";
import {
    UserHasUserRoleDataAccessor,
    UserPermissionDataAccessor,
    UserRoleHasUserPermissionDataAccessor,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_PERMISSION_DATA_ACCESSOR_TOKEN,
    USER_ROLE_HAS_USER_PERMISSION_DATA_ACCESSOR_TOKEN,
} from "../../dataaccess/db";
import { UserPermission } from "../../proto/gen/UserPermission";

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
        idList: number[]
    ): Promise<UserPermission[][]>;
    getUserPermissionListOfUser(userID: number): Promise<UserPermission[]>;
}

export class UserPermissionManagementOperatorImpl
    implements UserPermissionManagementOperator
{
    constructor(
        private readonly userPermissionDM: UserPermissionDataAccessor,
        private readonly userRoleHasUserPermissionDM: UserRoleHasUserPermissionDataAccessor,
        private readonly userHasUserRoleDM: UserHasUserRoleDataAccessor
    ) {}

    createUserPermission(
        permissionName: string,
        description: string
    ): Promise<UserPermission> {
        throw new Error("Method not implemented.");
    }

    updateUserPermission(
        userPermission: UserPermission
    ): Promise<UserPermission> {
        throw new Error("Method not implemented.");
    }

    deleteUserPermission(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    getUserPermissionList(): Promise<UserPermission[]> {
        throw new Error("Method not implemented.");
    }

    addUserPermissionToUserRole(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    removeUserPermissionFromUserRole(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    getUserPermissionListOfUserRoleList(
        idList: number[]
    ): Promise<UserPermission[][]> {
        throw new Error("Method not implemented.");
    }

    getUserPermissionListOfUser(userID: number): Promise<UserPermission[]> {
        throw new Error("Method not implemented.");
    }
}

injected(
    UserPermissionManagementOperatorImpl,
    USER_PERMISSION_DATA_ACCESSOR_TOKEN,
    USER_ROLE_HAS_USER_PERMISSION_DATA_ACCESSOR_TOKEN,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN
);

export const USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN =
    token<UserPermissionManagementOperator>("UserPermissionManagementOperator");
