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
    createUserRole(displayName: string, description: string): Promise<number>;
    updateUserRole(userRole: UserRole): Promise<void>;
    deleteUserRole(id: number): Promise<void>;
    getUserRoleCount(): Promise<number>;
    getUserRoleList(
        offset: number,
        limit: number,
        sortOrder: UserRoleListSortOrder
    ): Promise<UserRole[]>;
}

export class UserRoleDataAccessorImpl implements UserRoleDataAccessor {
    public async createUserRole(
        displayName: string,
        description: string
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async updateUserRole(userRole: UserRole): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async deleteUserRole(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserRoleCount(): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async getUserRoleList(
        offset: number,
        limit: number,
        sortOrder: UserRoleListSortOrder
    ): Promise<UserRole[]> {
        throw new Error("Method not implemented.");
    }
}
