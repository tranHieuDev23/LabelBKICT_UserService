import { injected, token } from "brandi";
import { status } from "@grpc/grpc-js";
import {
    UserPasswordManagementOperator,
    USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN,
} from "../module/password";
import {
    UserPermissionManagementOperator,
    USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN,
} from "../module/permission";
import {
    UserRoleManagementOperator,
    USER_ROLE_MANAGEMENT_OPERATOR_TOKEN,
} from "../module/role";
import {
    TokenManagementOperator,
    TOKEN_MANAGEMENT_OPERATOR_TOKEN,
} from "../module/token";
import {
    UserManagementOperator,
    USER_MANAGEMENT_OPERATOR_TOKEN,
} from "../module/user";
import { UserServiceHandlers } from "../proto/gen/UserService";
import { ErrorWithStatus } from "../utils";
import { _UserListSortOrder_Values } from "../proto/gen/UserListSortOrder";

const DEFAULT_USER_LIST_LIMIT = 10;

export class UserServiceHandlersFactory {
    constructor(
        private readonly userManagementOperator: UserManagementOperator,
        private readonly userPasswordManagementOperator: UserPasswordManagementOperator,
        private readonly tokenManagementOperator: TokenManagementOperator,
        private readonly userRoleManagementOperator: UserRoleManagementOperator,
        private readonly userPermissionManagementOperator: UserPermissionManagementOperator
    ) {}

    public getUserServiceHandlers(): UserServiceHandlers {
        const handler: UserServiceHandlers = {
            CreateUser: async (call, callback) => {
                const req = call.request;
                if (!req.username) {
                    return callback({
                        message: "username is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (!req.displayName) {
                    return callback({
                        message: "display_name is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    const createdUser =
                        await this.userManagementOperator.createUser(
                            req.username,
                            req.displayName
                        );
                    return callback(null, {
                        user: {
                            id: createdUser.id,
                            username: createdUser.username,
                            displayName: createdUser.displayName,
                        },
                    });
                } catch (e) {
                    if (e instanceof ErrorWithStatus) {
                        return callback({
                            message: e.error.message,
                            code: e.status,
                        });
                    }
                }
            },

            UpdateUser: async (call, callback) => {
                const req = call.request;
                if (!req.user) {
                    return callback({
                        message: "user is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    const updatedUser =
                        await this.userManagementOperator.updateUser(req.user);
                    return callback(null, {
                        user: {
                            id: updatedUser.id,
                            username: updatedUser.username,
                            displayName: updatedUser.displayName,
                        },
                    });
                } catch (e) {
                    if (e instanceof ErrorWithStatus) {
                        return callback({
                            message: e.error.message,
                            code: e.status,
                        });
                    }
                }
            },

            GetUserList: async (call, callback) => {
                const req = call.request;
                if (req.startFrom === null) {
                    req.startFrom = 0;
                }
                if (req.limit === null) {
                    req.limit = DEFAULT_USER_LIST_LIMIT;
                }
                if (req.sortOrder === null) {
                    req.sortOrder = _UserListSortOrder_Values.ID_ASCENDING;
                }

                try {
                    const { totalUserCount, userList } =
                        await this.userManagementOperator.getUserList(
                            req.startFrom,
                            req.limit,
                            req.sortOrder
                        );
                    return callback(null, {
                        totalUserCount: totalUserCount,
                        userList: userList,
                    });
                } catch (e) {
                    if (e instanceof ErrorWithStatus) {
                        return callback({
                            message: e.error.message,
                            code: e.status,
                        });
                    }
                }
            },

            CreateUserPassword: async (call, callback) => {
                const req = call.request;
                if (req.password === null) {
                    return callback({
                        message: "password is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password.ofUserId === null) {
                    return callback({
                        message: "password.of_user_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password.password === null) {
                    return callback({
                        message: "password.password is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.userPasswordManagementOperator.createUserPassword(
                        req.password.ofUserId,
                        req.password.password
                    );
                    return callback(null);
                } catch (e) {
                    if (e instanceof ErrorWithStatus) {
                        return callback({
                            message: e.error.message,
                            code: e.status,
                        });
                    }
                }
            },

            UpdateUserPassword: async (call, callback) => {
                const req = call.request;
                if (req.password === null) {
                    return callback({
                        message: "password is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password.ofUserId === null) {
                    return callback({
                        message: "password.of_user_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password.password === null) {
                    return callback({
                        message: "password.password is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.userPasswordManagementOperator.updateUserPassword(
                        req.password.ofUserId,
                        req.password.password
                    );
                    return callback(null);
                } catch (e) {
                    if (e instanceof ErrorWithStatus) {
                        return callback({
                            message: e.error.message,
                            code: e.status,
                        });
                    }
                }
            },

            LoginWithPassword: async (call, callback) => {
                const req = call.request;
                if (req.username === null) {
                    return callback({
                        message: "username is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password === null) {
                    return callback({
                        message: "password is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    const { user, token } =
                        await this.userPasswordManagementOperator.loginWithPassword(
                            req.username,
                            req.password
                        );
                    return callback(null, {
                        user: user,
                        token: token,
                    });
                } catch (e) {
                    if (e instanceof ErrorWithStatus) {
                        return callback({
                            message: e.error.message,
                            code: e.status,
                        });
                    }
                }
            },

            GetUserFromToken: async (call, callback) => {
                const req = call.request;
                if (req.token === null) {
                    return callback({
                        message: "token is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    const { user, newToken } =
                        await this.tokenManagementOperator.getUserFromToken(
                            req.token
                        );
                    return callback(null, {
                        user: user,
                        newToken: newToken,
                    });
                } catch (e) {
                    if (e instanceof ErrorWithStatus) {
                        return callback({
                            message: e.error.message,
                            code: e.status,
                        });
                    }
                }
            },

            BlacklistToken: async (call, callback) => {
                const req = call.request;
                if (req.token === null) {
                    return callback({
                        message: "token is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.tokenManagementOperator.blacklistToken(
                        req.token
                    );
                    return callback(null);
                } catch (e) {
                    if (e instanceof ErrorWithStatus) {
                        return callback({
                            message: e.error.message,
                            code: e.status,
                        });
                    }
                }
            },

            CreateUserRole: async (call, callback) => {},

            UpdateUserRole: async (call, callback) => {},

            DeleteUserRole: async (call, callback) => {},

            GetUserRoleList: async (call, callback) => {},

            AddUserRoleToUser: async (call, callback) => {},

            RemoveUserRoleFromUser: async (call, callback) => {},

            GetUserRoleListOfUserList: async (call, callback) => {},

            CreateUserPermission: async (call, callback) => {},

            UpdateUserPermission: async (call, callback) => {},

            DeleteUserPermission: async (call, callback) => {},

            GetUserPermissionList: async (call, callback) => {},

            AddUserPermissionToUserRole: async (call, callback) => {},

            RemoveUserPermissionFromUserRole: async (call, callback) => {},

            GetUserPermissionListOfUserRoleList: async (call, callback) => {},

            GetUserPermissionListOfUser: async (call, callback) => {},
        };
        return handler;
    }
}

injected(
    UserServiceHandlersFactory,
    USER_MANAGEMENT_OPERATOR_TOKEN,
    USER_PASSWORD_MANAGEMENT_OPERATOR_TOKEN,
    TOKEN_MANAGEMENT_OPERATOR_TOKEN,
    USER_ROLE_MANAGEMENT_OPERATOR_TOKEN,
    USER_PERMISSION_MANAGEMENT_OPERATOR_TOKEN
);

export const USER_SERVICE_HANDLERS_FACTORY_TOKEN =
    token<UserServiceHandlersFactory>("UserServiceHandlersFactory");
