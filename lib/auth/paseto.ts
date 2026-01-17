import { generateKeys, encrypt, decrypt } from 'paseto-ts/v4';
import { AuthResult } from './types'

const localKey = generateKeys('local');

export async function issuePASETO(payload: AuthResult) {
  return await encrypt(localKey, Object(payload));
}

export async function verifyPASETO(token: string): Promise<AuthResult> {
  return (await decrypt(localKey, token)) as AuthResult
}