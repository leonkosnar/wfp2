export interface AuthResult {
    [propName: string]: unknown;
    iss?: string | undefined;
    sub?: string | undefined;
    aud?: string | string[] | undefined;
    jti?: string | undefined;
    nbf?: number | undefined;
    exp?: number | undefined;
    iat?: number | undefined;
}