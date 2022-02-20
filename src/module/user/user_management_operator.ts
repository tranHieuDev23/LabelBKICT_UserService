import { UserDataAccessor } from "../../dataaccess/db";
import { User } from "../../proto/gen/User";
import { _UserListSortOrder_Values } from "../../proto/gen/UserListSortOrder";

export interface UserManagementOperator {
    createUser(username: string, displayName: string): Promise<User>;
    updateUser(user: User): Promise<User>;
    getUserList(
        offset: number,
        limit: number,
        sortOrder: _UserListSortOrder_Values
    ): Promise<{ totalUserCount: number; userList: User[] }>;
}

export class UserManagementOperatorImpl implements UserManagementOperator {
    constructor(private readonly userDM: UserDataAccessor) {}

    public async createUser(
        username: string,
        displayName: string
    ): Promise<User> {
        throw new Error("Method not implemented.");
    }

    public async updateUser(user: User): Promise<User> {
        throw new Error("Method not implemented.");
    }

    public async getUserList(
        offset: number,
        limit: number,
        sortOrder: _UserListSortOrder_Values
    ): Promise<{ totalUserCount: number; userList: User[] }> {
        throw new Error("Method not implemented.");
    }
}
