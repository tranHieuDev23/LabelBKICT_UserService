import { UserRole } from "./user_role";

export interface UserHasUserRoleDataAccessor {
    createUserHasUserRole(userID: number, userRoleID: number): Promise<void>;
    deleteUserHasUserRole(userID: number, userRoleID: number): Promise<void>;
    getUserRoleListOfUserList(userIDList: number[]): Promise<UserRole[][]>;
}

export class UserHasUserRoleDataAccessorImpl
    implements UserHasUserRoleDataAccessor
{
    public async createUserHasUserRole(
        userID: number,
        userRoleID: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async deleteUserHasUserRole(
        userID: number,
        userRoleID: number
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserRoleListOfUserList(
        userIDList: number[]
    ): Promise<UserRole[][]> {
        throw new Error("Method not implemented.");
    }
}
