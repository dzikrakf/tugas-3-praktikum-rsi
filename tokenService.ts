import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'owner' | 'customer';
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET minimal 32 karakter');
  }

  return secret;
}

function getExpiresIn(): jwt.SignOptions['expiresIn'] {
  return (process.env.JWT_EXPIRES_IN || '2h') as jwt.SignOptions['expiresIn'];
}

export function signToken(user: AuthUser): string {
  return jwt.sign(user, getJwtSecret(), {
    expiresIn: getExpiresIn(),
  });
}


export function verifyToken(token: string): AuthUser {
  const payload = jwt.verify(token, getJwtSecret());

  if (
    typeof payload === 'string' ||
    typeof payload.id !== 'number' ||
    typeof payload.name !== 'string' ||
    typeof payload.email !== 'string' ||
    !['admin', 'owner', 'customer'].includes(String(payload.role))
  ) {
    throw new Error('Token tidak valid');
  }

  return {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    role: payload.role as AuthUser['role'],
  };
}