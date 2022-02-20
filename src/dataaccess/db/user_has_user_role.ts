import { UserRole } from "./user_role";

export interface UserHasUserRoleDataAccessor {
    CreateUserHasUserRole(userID: number, userRoleID: number): Promise<void>;
    DeleteUserHasUserRole(userID: number, userRoleID: number): Promise<void>;
    GetUserRoleListOfUserList(userIDList: number[]): Promise<UserRole[][]>;
}

export class UserHasUserRoleDataAccessorImpl
    implements UserHasUserRoleDataAccessor
{
    public async CreateUserHasUserRole(
        userID: number,
        userRoleID: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async DeleteUserHasUserRole(
        userID: number,
        userRoleID: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async GetUserRoleListOfUserList(
        userIDList: number[]
    ): Promise<UserRole[][]> {
        throw new Error("Method not implemented.");
    }
}
