import { injected, token } from "brandi";
import { UserPermission } from "./user_permission";

export interface UserRoleHasUserPermissionDataAccessor {
    createUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void>;
    deleteUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void>;
    getUserPermissionListOfUserRoleList(
        userRoleIDList: number[]
    ): Promise<UserPermission[][]>;
}

export class UserRoleHasUserPermissionDataAccessorImpl
    implements UserRoleHasUserPermissionDataAccessor
{
    public async createUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async deleteUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserPermissionListOfUserRoleList(
        userRoleIDList: number[]
    ): Promise<UserPermission[][]> {
        throw new Error("Method not implemented.");
    }
}

injected(UserRoleHasUserPermissionDataAccessorImpl);

export const USER_ROLE_HAS_USER_PERMISSION_DATA_ACCESSOR_TOKEN =
    token<UserRoleHasUserPermissionDataAccessor>(
        "UserRoleHasUserPermissionDataAccessor"
    );
