import UserService from "../proto/gen/service/userservice_pb";

export interface UserServiceHandler {
    createUser(
        req: UserService.CreateUserRequest
    ): UserService.CreateUserResponse;
    updateUser(
        req: UserService.UpdateUserRequest
    ): UserService.UpdateUserResponse;
    getUserList(
        req: UserService.GetUserListRequest
    ): UserService.GetUserListResponse;
    createUserPassword(
        req: UserService.CreateUserPasswordRequest
    ): UserService.CreateUserPasswordResponse;
    updateUserPassword(
        req: UserService.UpdateUserPasswordRequest
    ): UserService.UpdateUserPasswordResponse;
    loginWithPassword(
        req: UserService.LoginWithPasswordRequest
    ): UserService.LoginWithPasswordResponse;
    getUserFromToken(
        req: UserService.GetUserFromTokenRequest
    ): UserService.GetUserFromTokenResponse;
    blacklistToken(
        req: UserService.BlacklistTokenRequest
    ): UserService.BlacklistTokenResponse;
    createUserRole(
        req: UserService.CreateUserRoleRequest
    ): UserService.CreateUserRoleResponse;
    updateUserRole(
        req: UserService.UpdateUserRoleRequest
    ): UserService.UpdateUserRoleResponse;
    deleteUserRole(
        req: UserService.DeleteUserRoleRequest
    ): UserService.DeleteUserRoleResponse;
    getUserRoleList(
        req: UserService.GetUserRoleListRequest
    ): UserService.GetUserRoleListResponse;
    addUserRoleToUser(
        req: UserService.AddUserRoleToUserRequest
    ): UserService.AddUserRoleToUserResponse;
    removeUserRoleFromUser(
        req: UserService.RemoveUserRoleFromUserRequest
    ): UserService.RemoveUserRoleFromUserResponse;
    getUserRoleListOfUserList(
        req: UserService.GetUserRoleListOfUserListRequest
    ): UserService.GetUserRoleListOfUserListResponse;
    createUserPermission(
        req: UserService.CreateUserPermissionRequest
    ): UserService.CreateUserPasswordResponse;
    updateUserPermission(
        req: UserService.UpdateUserPermissionRequest
    ): UserService.UpdateUserPermissionResponse;
    deleteUserPermission(
        req: UserService.DeleteUserPermissionRequest
    ): UserService.DeleteUserPermissionResponse;
    getUserPermissionList(
        req: UserService.GetUserPermissionListRequest
    ): UserService.GetUserPermissionListResponse;
    addUserPermissionToUserRole(
        req: UserService.AddUserPermissionToUserRoleRequest
    ): UserService.AddUserPermissionToUserRoleResponse;
    removeUserPermissionFromUserRole(
        req: UserService.RemoveUserPermissionFromUserRoleRequest
    ): UserService.RemoveUserPermissionFromUserRoleResponse;
    getUserPermissionListOfUserRoleList(
        req: UserService.GetUserPermissionListOfUserRoleListRequest
    ): UserService.GetUserPermissionListOfUserRoleListResponse;
    getUserPermissionListOfUser(
        req: UserService.GetUserPermissionListOfUserRequest
    ): UserService.GetUserPermissionListOfUserResponse;
}
