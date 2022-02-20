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
