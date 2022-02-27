import { token } from "brandi";

export class TokenConfig {
    public jwtPrivateKey = "";
    public jwtPublicKey = "";
    public jwtExpireTime = "7d";

    public static fromEnv(): TokenConfig {
        const config = new TokenConfig();
        if (process.env.JWT_PRIVATE_KEY !== undefined) {
            config.jwtPrivateKey = process.env.JWT_PRIVATE_KEY;
        }
        if (process.env.JWT_PUBLIC_KEY !== undefined) {
            config.jwtPublicKey = process.env.JWT_PUBLIC_KEY;
        }
        if (process.env.JWT_EXPIRE_TIME !== undefined) {
            config.jwtExpireTime = process.env.JWT_EXPIRE_TIME;
        }
        return config;
    }
}

export const TOKEN_CONFIG_TOKEN = token<TokenConfig>("TokenConfig");
