export class UserRole {
    constructor(
        public id: number,
        public displayName: string,
        public description: string
    ) {}
}

export enum UserRoleListSortOrder {
    ID_ASCENDING = 0,
    ID_DESCENDING = 1,
    DISPLAY_NAME_ASCENDING = 2,
    DISPLAY_NAME_DESCENDING = 3,
}

export interface UserRoleDataAccessor {
    CreateUserRole(displayName: string, description: string): Promise<number>;
    UpdateUserRole(userRole: UserRole): Promise<void>;
    DeleteUserRole(id: number): Promise<void>;
    GetUserRoleCount(): Promise<number>;
    GetUserRoleList(
        offset: number,
        limit: number,
        sortOrder: UserRoleListSortOrder
    ): Promise<UserRole[]>;
}

export class UserRoleDataAccessorImpl implements UserRoleDataAccessor {
    public async CreateUserRole(
        displayName: string,
        description: string
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async UpdateUserRole(userRole: UserRole): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async DeleteUserRole(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async GetUserRoleCount(): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async GetUserRoleList(
        offset: number,
        limit: number,
        sortOrder: UserRoleListSortOrder
    ): Promise<UserRole[]> {
        throw new Error("Method not implemented.");
    }
}
