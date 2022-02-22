import { injected, token } from "brandi";
import {
    UserHasUserRoleDataAccessor,
    UserRoleDataAccessor,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_ROLE_DATA_ACCESSOR_TOKEN,
} from "../../dataaccess/db";
import { UserRole } from "../../proto/gen/UserRole";
import { _UserRoleListSortOrder_Values } from "../../proto/gen/UserRoleListSortOrder";

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
        private readonly userHasUserRoleDataAccessor: UserHasUserRoleDataAccessor
    ) {}

    createUserRole(
        displayName: string,
        description: string
    ): Promise<UserRole> {
        throw new Error("Method not implemented.");
    }

    updateUserRole(userRole: UserRole): Promise<UserRole> {
        throw new Error("Method not implemented.");
    }

    deleteUserRole(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    getUserRoleList(
        offset: number,
        limit: number,
        sortOrder: _UserRoleListSortOrder_Values
    ): Promise<{ totalUserRoleCount: number; userRoleList: UserRole[] }> {
        throw new Error("Method not implemented.");
    }

    addUserRoleToUser(userID: number, userRoleID: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    removeUserRoleFromUser(userID: number, userRoleID: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    getUserRoleListFromUserList(userIDList: number[]): Promise<UserRole[][]> {
        throw new Error("Method not implemented.");
    }
}

injected(
    UserRoleManagementOperatorImpl,
    USER_ROLE_DATA_ACCESSOR_TOKEN,
    USER_HAS_USER_ROLE_DATA_ACCESSOR_TOKEN
);

export const USER_ROLE_MANAGEMENT_OPERATOR_TOKEN =
    token<UserRoleManagementOperator>("UserRoleManagementOperator");
