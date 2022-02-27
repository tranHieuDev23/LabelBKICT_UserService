import { injected, token } from "brandi";
import {
    BlacklistedTokenDataAccessor,
    BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN,
    UserDataAccessor,
    USER_DATA_ACCESSOR_TOKEN,
} from "../../dataaccess/db";
import { User } from "../../proto/gen/User";
import { TokenGenerator, TOKEN_GENERATOR_TOKEN } from "./generator";

export interface TokenManagementOperator {
    getUserFromToken(
        token: string
    ): Promise<{ user: User; newToken: string | undefined }>;
    blacklistToken(token: string): Promise<void>;
}

export class TokenManagementOperatorImpl implements TokenManagementOperator {
    constructor(
        private readonly blacklistedTokenDM: BlacklistedTokenDataAccessor,
        private readonly userDM: UserDataAccessor,
        private readonly tokenGenerator: TokenGenerator
    ) {}

    public async getUserFromToken(
        token: string
    ): Promise<{ user: User; newToken: string | undefined }> {
        throw new Error("Method not implemented.");
    }

    public async blacklistToken(token: string): Promise<void> {}
}

injected(
    TokenManagementOperatorImpl,
    BLACKLISTED_TOKEN_DATA_ACCESSOR_TOKEN,
    USER_DATA_ACCESSOR_TOKEN,
    TOKEN_GENERATOR_TOKEN
);

export const TOKEN_MANAGEMENT_OPERATOR_TOKEN = token<TokenManagementOperator>(
    "TokenManagementOperator"
);
