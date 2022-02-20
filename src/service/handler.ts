import { handleUnaryCall, UntypedHandleCall } from "@grpc/grpc-js";
import { AddUserPermissionToUserRoleRequest__Output } from "../proto/gen/AddUserPermissionToUserRoleRequest";
import { AddUserPermissionToUserRoleResponse } from "../proto/gen/AddUserPermissionToUserRoleResponse";
import { AddUserRoleToUserRequest__Output } from "../proto/gen/AddUserRoleToUserRequest";
import { AddUserRoleToUserResponse } from "../proto/gen/AddUserRoleToUserResponse";
import { BlacklistTokenRequest__Output } from "../proto/gen/BlacklistTokenRequest";
import { BlacklistTokenResponse } from "../proto/gen/BlacklistTokenResponse";
import { CreateUserPasswordRequest__Output } from "../proto/gen/CreateUserPasswordRequest";
import { CreateUserPasswordResponse } from "../proto/gen/CreateUserPasswordResponse";
import { CreateUserPermissionRequest__Output } from "../proto/gen/CreateUserPermissionRequest";
import { CreateUserPermissionResponse } from "../proto/gen/CreateUserPermissionResponse";
import { CreateUserRequest__Output } from "../proto/gen/CreateUserRequest";
import { CreateUserResponse } from "../proto/gen/CreateUserResponse";
import { CreateUserRoleRequest__Output } from "../proto/gen/CreateUserRoleRequest";
import { CreateUserRoleResponse } from "../proto/gen/CreateUserRoleResponse";
import { DeleteUserPermissionRequest__Output } from "../proto/gen/DeleteUserPermissionRequest";
import { DeleteUserPermissionResponse } from "../proto/gen/DeleteUserPermissionResponse";
import { DeleteUserRoleRequest__Output } from "../proto/gen/DeleteUserRoleRequest";
import { DeleteUserRoleResponse } from "../proto/gen/DeleteUserRoleResponse";
import { GetUserFromTokenRequest__Output } from "../proto/gen/GetUserFromTokenRequest";
import { GetUserFromTokenResponse } from "../proto/gen/GetUserFromTokenResponse";
import { GetUserListRequest__Output } from "../proto/gen/GetUserListRequest";
import { GetUserListResponse } from "../proto/gen/GetUserListResponse";
import { GetUserPermissionListOfUserRequest__Output } from "../proto/gen/GetUserPermissionListOfUserRequest";
import { GetUserPermissionListOfUserResponse } from "../proto/gen/GetUserPermissionListOfUserResponse";
import { GetUserPermissionListOfUserRoleListRequest__Output } from "../proto/gen/GetUserPermissionListOfUserRoleListRequest";
import { GetUserPermissionListOfUserRoleListResponse } from "../proto/gen/GetUserPermissionListOfUserRoleListResponse";
import { GetUserPermissionListRequest__Output } from "../proto/gen/GetUserPermissionListRequest";
import { GetUserPermissionListResponse } from "../proto/gen/GetUserPermissionListResponse";
import { GetUserRoleListOfUserListRequest__Output } from "../proto/gen/GetUserRoleListOfUserListRequest";
import { GetUserRoleListOfUserListResponse } from "../proto/gen/GetUserRoleListOfUserListResponse";
import { GetUserRoleListRequest__Output } from "../proto/gen/GetUserRoleListRequest";
import { GetUserRoleListResponse } from "../proto/gen/GetUserRoleListResponse";
import { LoginWithPasswordRequest__Output } from "../proto/gen/LoginWithPasswordRequest";
import { LoginWithPasswordResponse } from "../proto/gen/LoginWithPasswordResponse";
import { RemoveUserPermissionFromUserRoleRequest__Output } from "../proto/gen/RemoveUserPermissionFromUserRoleRequest";
import { RemoveUserPermissionFromUserRoleResponse } from "../proto/gen/RemoveUserPermissionFromUserRoleResponse";
import { RemoveUserRoleFromUserRequest__Output } from "../proto/gen/RemoveUserRoleFromUserRequest";
import { RemoveUserRoleFromUserResponse } from "../proto/gen/RemoveUserRoleFromUserResponse";
import { UpdateUserPasswordRequest__Output } from "../proto/gen/UpdateUserPasswordRequest";
import { UpdateUserPasswordResponse } from "../proto/gen/UpdateUserPasswordResponse";
import { UpdateUserPermissionRequest__Output } from "../proto/gen/UpdateUserPermissionRequest";
import { UpdateUserPermissionResponse } from "../proto/gen/UpdateUserPermissionResponse";
import { UpdateUserRequest__Output } from "../proto/gen/UpdateUserRequest";
import { UpdateUserResponse } from "../proto/gen/UpdateUserResponse";
import { UpdateUserRoleRequest__Output } from "../proto/gen/UpdateUserRoleRequest";
import { UpdateUserRoleResponse } from "../proto/gen/UpdateUserRoleResponse";
import { UserServiceHandlers } from "../proto/gen/UserService";

export class UserServiceHandlerImpl implements UserServiceHandlers {
    [name: string]: UntypedHandleCall;

    AddUserPermissionToUserRole: handleUnaryCall<
        AddUserPermissionToUserRoleRequest__Output,
        AddUserPermissionToUserRoleResponse
    > = function (call, callback) {};

    AddUserRoleToUser: handleUnaryCall<
        AddUserRoleToUserRequest__Output,
        AddUserRoleToUserResponse
    > = function (call, callback) {};

    BlacklistToken: handleUnaryCall<
        BlacklistTokenRequest__Output,
        BlacklistTokenResponse
    > = function (call, callback) {};

    CreateUser: handleUnaryCall<CreateUserRequest__Output, CreateUserResponse> =
        function (call, callback) {};
    CreateUserPassword: handleUnaryCall<
        CreateUserPasswordRequest__Output,
        CreateUserPasswordResponse
    > = function (call, callback) {};

    CreateUserPermission: handleUnaryCall<
        CreateUserPermissionRequest__Output,
        CreateUserPermissionResponse
    > = function (call, callback) {};

    CreateUserRole: handleUnaryCall<
        CreateUserRoleRequest__Output,
        CreateUserRoleResponse
    > = function (call, callback) {};

    DeleteUserPermission: handleUnaryCall<
        DeleteUserPermissionRequest__Output,
        DeleteUserPermissionResponse
    > = function (call, callback) {};

    DeleteUserRole: handleUnaryCall<
        DeleteUserRoleRequest__Output,
        DeleteUserRoleResponse
    > = function (call, callback) {};

    GetUserFromToken: handleUnaryCall<
        GetUserFromTokenRequest__Output,
        GetUserFromTokenResponse
    > = function (call, callback) {};

    GetUserList: handleUnaryCall<
        GetUserListRequest__Output,
        GetUserListResponse
    > = function (call, callback) {};

    GetUserPermissionList: handleUnaryCall<
        GetUserPermissionListRequest__Output,
        GetUserPermissionListResponse
    > = function (call, callback) {};

    GetUserPermissionListOfUser: handleUnaryCall<
        GetUserPermissionListOfUserRequest__Output,
        GetUserPermissionListOfUserResponse
    > = function (call, callback) {};

    GetUserPermissionListOfUserRoleList: handleUnaryCall<
        GetUserPermissionListOfUserRoleListRequest__Output,
        GetUserPermissionListOfUserRoleListResponse
    > = function (call, callback) {};

    GetUserRoleList: handleUnaryCall<
        GetUserRoleListRequest__Output,
        GetUserRoleListResponse
    > = function (call, callback) {};

    GetUserRoleListOfUserList: handleUnaryCall<
        GetUserRoleListOfUserListRequest__Output,
        GetUserRoleListOfUserListResponse
    > = function (call, callback) {};

    LoginWithPassword: handleUnaryCall<
        LoginWithPasswordRequest__Output,
        LoginWithPasswordResponse
    > = function (call, callback) {};

    RemoveUserPermissionFromUserRole: handleUnaryCall<
        RemoveUserPermissionFromUserRoleRequest__Output,
        RemoveUserPermissionFromUserRoleResponse
    > = function (call, callback) {};

    RemoveUserRoleFromUser: handleUnaryCall<
        RemoveUserRoleFromUserRequest__Output,
        RemoveUserRoleFromUserResponse
    > = function (call, callback) {};

    UpdateUser: handleUnaryCall<UpdateUserRequest__Output, UpdateUserResponse> =
        function (call, callback) {};
    UpdateUserPassword: handleUnaryCall<
        UpdateUserPasswordRequest__Output,
        UpdateUserPasswordResponse
    > = function (call, callback) {};

    UpdateUserPermission: handleUnaryCall<
        UpdateUserPermissionRequest__Output,
        UpdateUserPermissionResponse
    > = function (call, callback) {};

    UpdateUserRole: handleUnaryCall<
        UpdateUserRoleRequest__Output,
        UpdateUserRoleResponse
    > = function (call, callback) {};
}
