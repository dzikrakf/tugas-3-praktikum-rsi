import bcrypt from 'bcryptjs';
import { AppError } from '../errors/AppError.ts';
import { UserRepository } from '../repositories/userRepository.ts';
import {
  signToken,
  type AuthUser,
} from './tokenService.ts';
import type { LoginInput, RegisterInput } from '../schemas/authSchema.ts';

function getSaltRounds(): number {
  const rounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

  if (!Number.isInteger(rounds) || rounds < 4 || rounds > 31) {
    throw new Error('BCRYPT_SALT_ROUNDS harus berupa angka 4 sampai 31');
  }

  return rounds;
}

function toAuthUser(user: {
  id: number;
  name: string;
  email: string;
  role: string;
}): AuthUser {
  if (!['admin', 'owner', 'customer'].includes(user.role)) {
    throw new AppError(500, 'Role pengguna tidak valid');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as AuthUser['role'],
  };
}

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository = new UserRepository(),
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.userRepository.findByEmail(input.email);

    if (existing) {
      throw new AppError(409, 'Email sudah terdaftar');
    }

    const passwordHash = await bcrypt.hash(input.password, getSaltRounds());

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
    });

    if (!user) {
      throw new AppError(500, 'Gagal membuat pengguna');
    }

    const authUser = toAuthUser(user);

    return authUser;
  }

  async login(input: LoginInput) {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw new AppError(401, 'Email atau password salah');
    }

    const authUser = toAuthUser(user);
    const token = signToken(authUser);

    return {
      user: authUser,
      token,
    };
  }
}
