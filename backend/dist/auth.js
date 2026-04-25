import dotenv from "dotenv";
dotenv.config();
import { createRemoteJWKSet, jwtVerify } from "jose";
const region = process.env.AWS_REGION;
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;
if (!region || !userPoolId || !clientId) {
    throw new Error("Missing Cognito environment variables");
}
const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
const jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
export async function verifyToken(token) {
    const { payload } = await jwtVerify(token, jwks, { issuer });
    if (payload.token_use && payload.token_use !== "id" && payload.token_use !== "access") {
        throw new Error("Invalid token_use");
    }
    if (payload.aud && payload.aud !== clientId) {
        throw new Error("Invalid audience");
    }
    if (payload.client_id && payload.client_id !== clientId) {
        throw new Error("Invalid client_id");
    }
    return payload;
}
export async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization ?? "";
        const [scheme, token] = authHeader.split(" ");
        if (scheme !== "Bearer" || !token) {
            return res.status(401).json({ message: "Missing or invalid Authorization header" });
        }
        const payload = await verifyToken(token);
        req.user = payload;
        next();
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unauthorized";
        console.error("Auth error:", message);
        return res.status(401).json({ message: "Unauthorized" });
    }
}
