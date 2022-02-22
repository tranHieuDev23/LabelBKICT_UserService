import { injected, token } from "brandi";
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
            CreateUser: function (call, callback) {},
            UpdateUser: function (call, callback) {},
            GetUserList: function (call, callback) {},
            CreateUserPassword: function (call, callback) {},
            UpdateUserPassword: function (call, callback) {},
            LoginWithPassword: function (call, callback) {},
            GetUserFromToken: function (call, callback) {},
            BlacklistToken: function (call, callback) {},
            CreateUserRole: function (call, callback) {},
            UpdateUserRole: function (call, callback) {},
            DeleteUserRole: function (call, callback) {},
            GetUserRoleList: function (call, callback) {},
            AddUserRoleToUser: function (call, callback) {},
            RemoveUserRoleFromUser: function (call, callback) {},
            GetUserRoleListOfUserList: function (call, callback) {},
            CreateUserPermission: function (call, callback) {},
            UpdateUserPermission: function (call, callback) {},
            DeleteUserPermission: function (call, callback) {},
            GetUserPermissionList: function (call, callback) {},
            AddUserPermissionToUserRole: function (call, callback) {},
            RemoveUserPermissionFromUserRole: function (call, callback) {},
            GetUserPermissionListOfUserRoleList: function (call, callback) {},
            GetUserPermissionListOfUser: function (call, callback) {},
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
