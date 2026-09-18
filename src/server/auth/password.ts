import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

export async function verifyPassword(plainText: string, hashed: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainText, hashed);
  } catch {
    return false;
  }
}
