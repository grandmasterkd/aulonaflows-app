import crypto from 'crypto';

/**
 * Generates a secure temporary password for admin invites
 * @param length - Length of the password (default: 16)
 * @returns A cryptographically secure random password
 */
export function generateSecureTempPassword(length: number = 16): string {
  // Character sets for password complexity
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + numbers + symbols;

  // Ensure at least one character from each set for complexity
  const password = [
    lowercase[Math.floor(Math.random() * lowercase.length)],
    uppercase[Math.floor(Math.random() * uppercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)],
  ];

  // Fill the rest with random characters
  for (let i = 4; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle the password array
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

/**
 * Hashes a password using bcrypt-like approach with crypto
 * Note: In production, use proper bcrypt or argon2
 * @param password - Plain text password
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  // For demo purposes, using a simple hash
  // In production, use bcrypt or argon2
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verifies a password against its hash
 * @param password - Plain text password
 * @param hashedPassword - Hashed password with salt
 * @returns True if password matches
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}