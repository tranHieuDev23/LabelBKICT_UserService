import { injected, token } from "brandi";
import { sendUnaryData, status } from "@grpc/grpc-js";
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
import { _UserRoleListSortOrder_Values } from "../proto/gen/UserRoleListSortOrder";
import { UserRoleList } from "../proto/gen/UserRoleList";
import { UserPermissionList } from "../proto/gen/UserPermissionList";

const DEFAULT_USER_LIST_LIMIT = 10;
const DEFAULT_USER_ROLE_LIST_LIMIT = 10;

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
                if (req.username === undefined) {
                    return callback({
                        message: "username is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.displayName === undefined) {
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
                    return callback(null, { user: createdUser });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            UpdateUser: async (call, callback) => {
                const req = call.request;
                if (req.user === undefined) {
                    return callback({
                        message: "user is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    const updatedUser =
                        await this.userManagementOperator.updateUser(req.user);
                    return callback(null, { user: updatedUser });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            GetUserList: async (call, callback) => {
                const req = call.request;
                if (req.offset === undefined) {
                    req.offset = 0;
                }
                if (req.limit === undefined) {
                    req.limit = DEFAULT_USER_LIST_LIMIT;
                }
                if (req.sortOrder === undefined) {
                    req.sortOrder = _UserListSortOrder_Values.ID_ASCENDING;
                }

                try {
                    const { totalUserCount, userList } =
                        await this.userManagementOperator.getUserList(
                            req.offset,
                            req.limit,
                            req.sortOrder
                        );
                    return callback(null, { totalUserCount, userList });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            GetUser: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({
                        message: "id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    const user = await this.userManagementOperator.getUser(
                        req.id
                    );
                    callback(null, { user });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            SearchUser: async (call, callback) => {
                const req = call.request;
                if (req.query === undefined) {
                    return callback({
                        message: "query is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                const limit = req.limit || DEFAULT_USER_LIST_LIMIT;
                const includedUserIDList = req.includedUserIdList || [];

                try {
                    const userList =
                        await this.userManagementOperator.searchUser(
                            req.query,
                            limit,
                            includedUserIDList
                        );
                    callback(null, { userList });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            CreateUserPassword: async (call, callback) => {
                const req = call.request;
                if (req.password === undefined) {
                    return callback({
                        message: "password is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password.ofUserId === undefined) {
                    return callback({
                        message: "password.of_user_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password.password === undefined) {
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
                    return callback(null, {});
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            UpdateUserPassword: async (call, callback) => {
                const req = call.request;
                if (req.password === undefined) {
                    return callback({
                        message: "password is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password.ofUserId === undefined) {
                    return callback({
                        message: "password.of_user_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password.password === undefined) {
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
                    return callback(null, {});
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            LoginWithPassword: async (call, callback) => {
                const req = call.request;
                if (req.username === undefined) {
                    return callback({
                        message: "username is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.password === undefined) {
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
                    return callback(null, { user, token });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            GetUserFromToken: async (call, callback) => {
                const req = call.request;
                if (req.token === undefined) {
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
                        user,
                        newToken: newToken === null ? undefined : newToken,
                    });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            BlacklistToken: async (call, callback) => {
                const req = call.request;
                if (req.token === undefined) {
                    return callback({
                        message: "token is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.tokenManagementOperator.blacklistToken(
                        req.token
                    );
                    return callback(null, {});
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            CreateUserRole: async (call, callback) => {
                const req = call.request;
                if (req.displayName === undefined) {
                    return callback({
                        message: "display_name is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.description === undefined) {
                    req.description = "";
                }

                try {
                    const createdUserRole =
                        await this.userRoleManagementOperator.createUserRole(
                            req.displayName,
                            req.description
                        );
                    return callback(null, { userRole: createdUserRole });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            UpdateUserRole: async (call, callback) => {
                const req = call.request;
                if (req.userRole === undefined) {
                    return callback({
                        message: "user_role is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    const updatedUserRole =
                        await this.userRoleManagementOperator.updateUserRole(
                            req.userRole
                        );
                    return callback(null, { userRole: updatedUserRole });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            DeleteUserRole: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({
                        message: "id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.userRoleManagementOperator.deleteUserRole(
                        req.id
                    );
                    return callback(null, {});
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            GetUserRoleList: async (call, callback) => {
                const req = call.request;
                if (req.offset === undefined) {
                    req.offset = 0;
                }
                if (req.limit === undefined) {
                    req.limit = DEFAULT_USER_ROLE_LIST_LIMIT;
                }
                if (req.sortOrder === undefined) {
                    req.sortOrder = _UserRoleListSortOrder_Values.ID_ASCENDING;
                }

                try {
                    const { totalUserRoleCount, userRoleList } =
                        await this.userRoleManagementOperator.getUserRoleList(
                            req.offset,
                            req.limit,
                            req.sortOrder
                        );
                    return callback(null, { totalUserRoleCount, userRoleList });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            AddUserRoleToUser: async (call, callback) => {
                const req = call.request;
                if (req.userId === undefined) {
                    return callback({
                        message: "user_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.userRoleId === undefined) {
                    return callback({
                        message: "user_role_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.userRoleManagementOperator.addUserRoleToUser(
                        req.userId,
                        req.userRoleId
                    );
                    return callback(null, {});
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            RemoveUserRoleFromUser: async (call, callback) => {
                const req = call.request;
                if (req.userId === undefined) {
                    return callback({
                        message: "user_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.userRoleId === undefined) {
                    return callback({
                        message: "user_role_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.userRoleManagementOperator.removeUserRoleFromUser(
                        req.userId,
                        req.userRoleId
                    );
                    return callback(null, {});
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            GetUserRoleListOfUserList: async (call, callback) => {
                const req = call.request;
                if (req.userIdList === undefined) {
                    req.userIdList = [];
                }

                try {
                    const userRoleListOfUserList =
                        await this.userRoleManagementOperator.getUserRoleListFromUserList(
                            req.userIdList
                        );
                    const userRoleListProtoList = userRoleListOfUserList.map(
                        (userRoleList) => {
                            const userRoleListProto: UserRoleList = {
                                userRoleList: userRoleList,
                            };
                            return userRoleListProto;
                        }
                    );
                    return callback(null, {
                        userRoleListOfUserList: userRoleListProtoList,
                    });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            CreateUserPermission: async (call, callback) => {
                const req = call.request;
                if (req.permissionName === undefined) {
                    return callback({
                        message: "permission_name is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.description === undefined) {
                    req.description = "";
                }

                try {
                    const createdUserPermission =
                        await this.userPermissionManagementOperator.createUserPermission(
                            req.permissionName,
                            req.description
                        );
                    return callback(null, {
                        userPermission: createdUserPermission,
                    });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            UpdateUserPermission: async (call, callback) => {
                const req = call.request;
                if (req.userPermission === undefined) {
                    return callback({
                        message: "user_permission is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    const updatedUserPermission =
                        await this.userPermissionManagementOperator.updateUserPermission(
                            req.userPermission
                        );
                    return callback(null, {
                        userPermission: updatedUserPermission,
                    });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            DeleteUserPermission: async (call, callback) => {
                const req = call.request;
                if (req.id === undefined) {
                    return callback({
                        message: "id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.userPermissionManagementOperator.deleteUserPermission(
                        req.id
                    );
                    return callback(null, {});
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            GetUserPermissionList: async (call, callback) => {
                try {
                    const userPermissionList =
                        await this.userPermissionManagementOperator.getUserPermissionList();
                    return callback(null, {
                        userPermissionList: userPermissionList,
                    });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            AddUserPermissionToUserRole: async (call, callback) => {
                const req = call.request;
                if (req.userRoleId === undefined) {
                    return callback({
                        message: "user_role_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.userPermissionId === undefined) {
                    return callback({
                        message: "user_permission_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.userPermissionManagementOperator.addUserPermissionToUserRole(
                        req.userRoleId,
                        req.userPermissionId
                    );
                    return callback(null, {});
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            RemoveUserPermissionFromUserRole: async (call, callback) => {
                const req = call.request;
                if (req.userRoleId === undefined) {
                    return callback({
                        message: "user_role_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }
                if (req.userPermissionId === undefined) {
                    return callback({
                        message: "user_permission_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    await this.userPermissionManagementOperator.removeUserPermissionFromUserRole(
                        req.userRoleId,
                        req.userPermissionId
                    );
                    return callback(null, {});
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            GetUserPermissionListOfUserRoleList: async (call, callback) => {
                const req = call.request;
                if (req.userRoleIdList === undefined) {
                    req.userRoleIdList = [];
                }

                try {
                    const userPermissionListOfUserRoleList =
                        await this.userPermissionManagementOperator.getUserPermissionListOfUserRoleList(
                            req.userRoleIdList
                        );
                    const userPermissionListProtoList =
                        userPermissionListOfUserRoleList.map(
                            (userPermissionList) => {
                                const userPermissionListProto: UserPermissionList =
                                    {
                                        userPermissionList: userPermissionList,
                                    };
                                return userPermissionListProto;
                            }
                        );
                    return callback(null, {
                        userPermissionListOfUserRoleList:
                            userPermissionListProtoList,
                    });
                } catch (e) {
                    this.handleError(e, callback);
                }
            },

            GetUserPermissionListOfUser: async (call, callback) => {
                const req = call.request;
                if (req.userId === undefined) {
                    return callback({
                        message: "user_id is required",
                        code: status.INVALID_ARGUMENT,
                    });
                }

                try {
                    const userPermissionList =
                        await this.userPermissionManagementOperator.getUserPermissionListOfUser(
                            req.userId
                        );
                    return callback(null, { userPermissionList });
                } catch (e) {
                    return this.handleError(e, callback);
                }
            },
        };
        return handler;
    }

    private handleError(e: unknown, callback: sendUnaryData<any>) {
        if (e instanceof ErrorWithStatus) {
            return callback({
                message: e.message,
                code: e.status,
            });
        } else if (e instanceof Error) {
            return callback({
                message: e.message,
                code: status.INTERNAL,
            });
        } else {
            return callback({
                code: status.INTERNAL,
            });
        }
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
