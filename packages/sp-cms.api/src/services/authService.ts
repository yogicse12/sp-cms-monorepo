import * as bcrypt from 'bcryptjs';
import type { Env } from '../types/env';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: Omit<User, 'passwordHash'>;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: Omit<User, 'passwordHash'>;
}

export class AuthService {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  static validateRegistrationInput(data: RegisterRequest): string | null {
    if (!data.email || !data.password || !data.name) {
      return 'Email, password, and name are required';
    }

    if (!this.validateEmail(data.email)) {
      return 'Invalid email format';
    }

    if (!this.validatePassword(data.password)) {
      return 'Password must be at least 8 characters long';
    }

    return null;
  }

  static async registerUser(
    data: RegisterRequest,
    env: Env
  ): Promise<RegisterResponse> {
    const validationError = this.validateRegistrationInput(data);
    if (validationError) {
      throw new Error(validationError);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const userId = crypto.randomUUID();
    const normalizedEmail = data.email.toLowerCase().trim();
    const createdAt = new Date().toISOString();

    // Save to D1 database
    const result = await env.DB.prepare(
      `
      INSERT INTO users (id, email, name, password_hash, created_at)
      VALUES (?, ?, ?, ?, ?)
    `
    )
      .bind(userId, normalizedEmail, data.name, hashedPassword, createdAt)
      .run();

    console.log('DB insert result:', result);
    if (!result.success) {
      throw new Error(`Database error: ${result.error}`);
    }

    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: userId,
        email: normalizedEmail,
        name: data.name,
        createdAt,
      },
    };
  }

  static async login(data: LoginRequest, env: Env): Promise<LoginResponse> {
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }

    if (!this.validateEmail(data.email)) {
      throw new Error('Invalid email');
    }

    const normalizedEmail = data.email.toLowerCase().trim();

    // Find user by email in D1 database
    const user = await env.DB.prepare(
      `
      SELECT id, email, name, password_hash, created_at
      FROM users 
      WHERE email = ? AND is_active = 1
    `
    )
      .bind(normalizedEmail)
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(
      data.password,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Generate simple token (replace with JWT in production)
    const token = `token_${user.id}_${Date.now()}`;

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
    };
  }
}
