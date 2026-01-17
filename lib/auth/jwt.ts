import { sign, verify } from 'jsonwebtoken'
import { AuthResult } from './types'
import { generateKeyPairSync, createPrivateKey, createPublicKey } from 'crypto'

const alg = 'RS256'

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
})

const privKey = createPrivateKey(privateKey)
const pubKey = createPublicKey(publicKey)

export async function issueJWT(payload: AuthResult) {
  return await sign(payload, privKey, { algorithm: alg })
}

export async function verifyJWT(token: string): Promise<AuthResult> {
  const payload = await verify(token, pubKey, {
    algorithms: [alg],
  })
  console.log(`Verified user via JWT`);
  return payload as AuthResult
}