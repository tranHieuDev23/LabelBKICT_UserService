import { status } from "@grpc/grpc-js";
import { AsyncFactory, injected, token } from "brandi";
import jwt, { SignOptions, VerifyOptions } from "jsonwebtoken";
import { Logger } from "winston";
import { TokenConfig, TOKEN_CONFIG_TOKEN } from "../../config";
import { ErrorWithStatus, LOGGER_TOKEN, ID_GENERATOR_TOKEN } from "../../utils";
import { IdGenerator } from "../../utils/id";
import { TOKEN_PUBLIC_KEY_DATA_ACCESSOR_TOKEN, TokenPublicKeyDataAccessor } from "../../dataaccess/db";
import { generateKeyPairSync } from "crypto";
import { TOKEN_PUBLIC_KEY_CACHE_DM_TOKEN, TokenPublicKeyCacheDM } from "../../dataaccess/cache/token_public_key";

export class DecodeTokenResult {
    constructor(public readonly tokenId: number, public readonly userId: number, public readonly expireAt: number) {}
}

export interface TokenGenerator {
    generate(userId: number): Promise<string>;
    decode(token: string): Promise<DecodeTokenResult>;
}

export class JWTGenerator implements TokenGenerator {
    private tokenPrivateKey = "";
    private tokenPublicKeyId = 0;

    private constructor(
        private readonly tokenPublicKeyDataAccessor: TokenPublicKeyDataAccessor,
        private readonly tokenPublicKeyCacheDM: TokenPublicKeyCacheDM,
        private readonly idGenerator: IdGenerator,
        private readonly tokenConfig: TokenConfig,
        private readonly logger: Logger
    ) {}

    public static async New(
        tokenPublicKeyDataAccessor: TokenPublicKeyDataAccessor,
        tokenPublicKeyCacheDM: TokenPublicKeyCacheDM,
        idGenerator: IdGenerator,
        tokenConfig: TokenConfig,
        logger: Logger
    ): Promise<JWTGenerator> {
        const jwtGenerator = new JWTGenerator(
            tokenPublicKeyDataAccessor,
            tokenPublicKeyCacheDM,
            idGenerator,
            tokenConfig,
            logger
        );

        const keyPair = generateKeyPairSync("rsa", {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: "spki",
                format: "pem",
            },
            privateKeyEncoding: {
                type: "pkcs8",
                format: "pem",
            },
        });
        jwtGenerator.tokenPrivateKey = keyPair.privateKey;
        jwtGenerator.tokenPublicKeyId = await tokenPublicKeyDataAccessor.createTokenPublicKey(keyPair.publicKey);

        return jwtGenerator;
    }

    public async generate(userId: number): Promise<string> {
        const jti = await this.idGenerator.Generate();
        const signOptions: SignOptions = {
            algorithm: "RS512",
            jwtid: jti.toString(),
            subject: userId.toString(),
            expiresIn: this.tokenConfig.jwtExpireTime,
            keyid: `${this.tokenPublicKeyId}`,
        };
        return new Promise<string>((resolve, reject) => {
            jwt.sign({}, this.tokenPrivateKey, signOptions, (error, jwt) => {
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

    private async getTokenPublicKey(keyID: number): Promise<string> {
        try {
            const tokenPublicKey = await this.tokenPublicKeyCacheDM.get(keyID);
            return tokenPublicKey;
        } catch (error) {
            this.logger.warn("failed to get token public key from cache, falling back to db", { keyID, error });
        }

        const tokenPublicKey = await this.tokenPublicKeyDataAccessor.getTokenPublicKey(keyID);
        if (tokenPublicKey === null) {
            throw new ErrorWithStatus("no token public key found", status.UNAUTHENTICATED);
        }

        try {
            await this.tokenPublicKeyCacheDM.set(keyID, tokenPublicKey.data);
        } catch (error) {
            this.logger.warn("failed to set token public key into cache", { keyID, error });
        }

        return tokenPublicKey.data;
    }

    public async decode(token: string): Promise<DecodeTokenResult> {
        const verifyOptions: VerifyOptions = {
            algorithms: ["RS512"],
        };
        return new Promise<DecodeTokenResult>((resolve, reject) => {
            jwt.verify(
                token,
                (headers, callback) => {
                    if (headers.kid === undefined) {
                        callback(new ErrorWithStatus("no kid header found", status.UNAUTHENTICATED));
                        return;
                    }

                    this.getTokenPublicKey(+headers.kid).then(
                        (tokenPublicKey) => {
                            callback(null, tokenPublicKey);
                        },
                        (error) => {
                            callback(error);
                        }
                    );
                },
                verifyOptions,
                (error, decoded: any) => {
                    if (error !== null) {
                        if (error instanceof jwt.TokenExpiredError) {
                            return reject(new ErrorWithStatus("token expired", status.UNAUTHENTICATED));
                        }

                        return reject(new ErrorWithStatus("invalid token", status.UNAUTHENTICATED));
                    }

                    resolve(new DecodeTokenResult(+decoded["jti"], +decoded["sub"], +decoded["exp"] * 1000));
                }
            );
        });
    }
}

injected(
    JWTGenerator.New,
    TOKEN_PUBLIC_KEY_DATA_ACCESSOR_TOKEN,
    TOKEN_PUBLIC_KEY_CACHE_DM_TOKEN,
    ID_GENERATOR_TOKEN,
    TOKEN_CONFIG_TOKEN,
    LOGGER_TOKEN
);

export const TOKEN_GENERATOR_TOKEN = token<TokenGenerator>("TokenGenerator");
export const TOKEN_GENERATOR_FACTORY_TOKEN = token<AsyncFactory<TokenGenerator>>("AsyncFactory<TokenGenerator>");
