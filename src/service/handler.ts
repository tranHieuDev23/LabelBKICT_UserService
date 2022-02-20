import UserService from "../proto/gen/service/userservice_pb";

export interface UserServiceHandler {
    CreateUser(
        req: UserService.CreateUserRequest
    ): UserService.CreateUserResponse;
    UpdateUser(
        req: UserService.UpdateUserRequest
    ): UserService.UpdateUserResponse;
    GetUserList(
        req: UserService.GetUserListRequest
    ): UserService.GetUserListResponse;
    CreateUserPassword(
        req: UserService.CreateUserPasswordRequest
    ): UserService.CreateUserPasswordResponse;
    UpdateUserPassword(
        req: UserService.UpdateUserPasswordRequest
    ): UserService.UpdateUserPasswordResponse;
    LoginWithPassword(
        req: UserService.LoginWithPasswordRequest
    ): UserService.LoginWithPasswordResponse;
    GetUserFromToken(
        req: UserService.GetUserFromTokenRequest
    ): UserService.GetUserFromTokenResponse;
    BlacklistToken(
        req: UserService.BlacklistTokenRequest
    ): UserService.BlacklistTokenResponse;
    CreateUserRole(
        req: UserService.CreateUserRoleRequest
    ): UserService.CreateUserRoleResponse;
    UpdateUserRole(
        req: UserService.UpdateUserRoleRequest
    ): UserService.UpdateUserRoleResponse;
    DeleteUserRole(
        req: UserService.DeleteUserRoleRequest
    ): UserService.DeleteUserRoleResponse;
    GetUserRoleList(
        req: UserService.GetUserRoleListRequest
    ): UserService.GetUserRoleListResponse;
    AddUserRoleToUser(
        req: UserService.AddUserRoleToUserRequest
    ): UserService.AddUserRoleToUserResponse;
    RemoveUserRoleFromUser(
        req: UserService.RemoveUserRoleFromUserRequest
    ): UserService.RemoveUserRoleFromUserResponse;
    GetUserRoleListOfUserList(
        req: UserService.GetUserRoleListOfUserListRequest
    ): UserService.GetUserRoleListOfUserListResponse;
    CreateUserPermission(
        req: UserService.CreateUserPermissionRequest
    ): UserService.CreateUserPasswordResponse;
    UpdateUserPermission(
        req: UserService.UpdateUserPermissionRequest
    ): UserService.UpdateUserPermissionResponse;
    DeleteUserPermission(
        req: UserService.DeleteUserPermissionRequest
    ): UserService.DeleteUserPermissionResponse;
    GetUserPermissionList(
        req: UserService.GetUserPermissionListRequest
    ): UserService.GetUserPermissionListResponse;
    AddUserPermissionToUserRole(
        req: UserService.AddUserPermissionToUserRoleRequest
    ): UserService.AddUserPermissionToUserRoleResponse;
    RemoveUserPermissionFromUserRole(
        req: UserService.RemoveUserPermissionFromUserRoleRequest
    ): UserService.RemoveUserPermissionFromUserRoleResponse;
    GetUserPermissionListOfUserRoleList(
        req: UserService.GetUserPermissionListOfUserRoleListRequest
    ): UserService.GetUserPermissionListOfUserRoleListResponse;
    GetUserPermissionListOfUser(
        req: UserService.GetUserPermissionListOfUserRequest
    ): UserService.GetUserPermissionListOfUserResponse;
}
