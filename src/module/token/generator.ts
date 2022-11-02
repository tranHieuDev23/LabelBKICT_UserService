import { status } from "@grpc/grpc-js";
import { injected, token } from "brandi";
import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { Logger } from "winston";
import { TokenConfig, TOKEN_CONFIG_TOKEN } from "../../config";
import { ErrorWithStatus, LOGGER_TOKEN, ID_GENERATOR_TOKEN } from "../../utils";
import { IdGenerator } from "../../utils/id";

export class DecodeTokenResult {
    constructor(public readonly tokenId: number, public readonly userId: number, public readonly expireAt: number) {}
}

export interface TokenGenerator {
    generate(userId: number): Promise<string>;
    decode(token: string): Promise<DecodeTokenResult>;
}

export class JWTGenerator implements TokenGenerator {
    constructor(
        private readonly idGenerator: IdGenerator,
        private readonly tokenConfig: TokenConfig,
        private readonly logger: Logger
    ) {}

    public async generate(userId: number): Promise<string> {
        const jti = await this.idGenerator.Generate();
        const signOptions: SignOptions = {
            algorithm: "RS512",
            jwtid: jti.toString(),
            subject: userId.toString(),
            expiresIn: this.tokenConfig.jwtExpireTime,
        };
        return new Promise<string>((resolve, reject) => {
            jwt.sign({}, this.tokenConfig.jwtPrivateKey, signOptions, (error, jwt) => {
                if (error !== null) {
                    this.logger.error("failed to generate token", {
                        error,
                    });
                    return reject(new ErrorWithStatus("failed to generate token", status.INTERNAL));
                }
                resolve(String(jwt));
            });
        });
    }

    public async decode(token: string): Promise<DecodeTokenResult> {
        const verifyOptions: VerifyOptions = {
            algorithms: ["RS512"],
        };
        return new Promise<DecodeTokenResult>((resolve, reject) => {
            jwt.verify(token, this.tokenConfig.jwtPublicKey, verifyOptions, (error, decoded: any) => {
                if (error !== null) {
                    if (error instanceof jwt.TokenExpiredError) {
                        return reject(new ErrorWithStatus("token expired", status.UNAUTHENTICATED));
                    }

                    return reject(new ErrorWithStatus("invalid token", status.UNAUTHENTICATED));
                }

                resolve(new DecodeTokenResult(+decoded["jti"], +decoded["sub"], +decoded["exp"] * 1000));
            });
        });
    }
}

injected(JWTGenerator, ID_GENERATOR_TOKEN, TOKEN_CONFIG_TOKEN, LOGGER_TOKEN);

export const TOKEN_GENERATOR_TOKEN = token<TokenGenerator>("TokenGenerator");
