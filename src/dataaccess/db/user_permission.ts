export class UserPermission {
    constructor(
        public id: number,
        public permissionName: string,
        public description: string
    ) {}
}

export interface UserPermissionDataAccessor {
    createUserPermission(
        permissionName: string,
        description: string
    ): Promise<number>;
    updateUserPermission(userPermission: UserPermission): Promise<void>;
    deleteUserPermission(id: number): Promise<void>;
    getUserPermissionList(): Promise<UserPermission[]>;
}

export class UserPermissionDataAccessorImpl
    implements UserPermissionDataAccessor
{
    public async createUserPermission(
        permissionName: string,
        description: string
    ): Promise<number> {
        throw new Error("Method not implemented.");
    }

    public async updateUserPermission(
        userPermission: UserPermission
    ): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async deleteUserPermission(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async getUserPermissionList(): Promise<UserPermission[]> {
        throw new Error("Method not implemented.");
    }
}
