import { UserPermission } from "./user_permission";

export interface UserRoleHasUserPermissionDataAccessor {
    CreateUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void>;
    DeleteUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void>;
    GetUserPermissionListOfUserRoleList(
        userRoleIDList: number[]
    ): Promise<UserPermission[][]>;
}

export class UserRoleHasUserPermissionDataAccessorImpl
    implements UserRoleHasUserPermissionDataAccessor
{
    public async CreateUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async DeleteUserRoleHasUserPermission(
        userRoleID: number,
        userPermissionID: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async GetUserPermissionListOfUserRoleList(
        userRoleIDList: number[]
    ): Promise<UserPermission[][]> {
        throw new Error("Method not implemented.");
    }
}
