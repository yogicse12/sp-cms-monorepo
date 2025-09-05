import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface DeactivateUserResponse {
  message: string;
}

export interface ActivateUserResponse {
  message: string;
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
      SELECT id, email, name, password_hash, created_at, is_active
      FROM users 
      WHERE email = ?
    `
    )
      .bind(normalizedEmail)
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new Error('User is not active');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(
      data.password,
      user.password_hash as string
    );
    if (!isValidPassword) {
      throw new Error('Invalid password');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        name: user.name,
      },
      env.TOKEN_SECRET || 'default-secret',
      { expiresIn: '24h' }
    );

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id as string,
        email: user.email as string,
        name: user.name as string,
        createdAt: user.created_at as string,
      },
    };
  }

  static async changePassword(
    userId: string,
    passwordData: ChangePasswordRequest,
    env: Env
  ): Promise<ChangePasswordResponse> {
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      throw new Error('Current password and new password are required');
    }

    if (!this.validatePassword(passwordData.newPassword)) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Find user by ID
    const user = await env.DB.prepare(
      `
      SELECT id, email, name, password_hash, created_at
      FROM users 
      WHERE id = ? AND is_active = 1
    `
    )
      .bind(userId)
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      passwordData.currentPassword,
      user.password_hash as string
    );
    if (!isValidPassword) {
      throw new Error('Invalid current password');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);

    // Update password in database
    const result = await env.DB.prepare(
      `
      UPDATE users 
      SET password_hash = ?, updated_at = ?
      WHERE id = ?
    `
    )
      .bind(hashedPassword, new Date().toISOString(), userId)
      .run();

    if (!result.success) {
      throw new Error(`Database error: ${result.error}`);
    }

    return {
      message: 'Password changed successfully',
    };
  }

  static async deactivateUser(
    userId: string,
    adminUserId: string,
    env: Env
  ): Promise<DeactivateUserResponse> {
    if (!adminUserId) {
      throw new Error('You are not authorized');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if the user to be deactivated exists and is currently active
    const userToDeactivate = await env.DB.prepare(
      `
      SELECT id, email, name, is_active
      FROM users 
      WHERE id = ?
    `
    )
      .bind(userId)
      .first();

    if (!userToDeactivate) {
      throw new Error('User not found');
    }

    // Update user to inactive
    const result = await env.DB.prepare(
      `
      UPDATE users 
      SET is_active = 0, updated_at = ?
      WHERE id = ?
    `
    )
      .bind(new Date().toISOString(), userId)
      .run();

    if (!result.success) {
      throw new Error('Failed to deactivate user');
    }

    return {
      message: 'User deactivated successfully',
    };
  }

  static async activateUser(
    userId: string,
    adminUserId: string,
    env: Env
  ): Promise<ActivateUserResponse> {
    if (!adminUserId) {
      throw new Error('You are not authorized');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    // Check if the user to be activated exists
    const userToActivate = await env.DB.prepare(
      `
      SELECT id, email, name, is_active
      FROM users 
      WHERE id = ?
    `
    )
      .bind(userId)
      .first();

    if (!userToActivate) {
      throw new Error('User not found');
    }

    // Update user to active
    const result = await env.DB.prepare(
      `
      UPDATE users 
      SET is_active = 1, updated_at = ?
      WHERE id = ?
    `
    )
      .bind(new Date().toISOString(), userId)
      .run();

    if (!result.success) {
      throw new Error('Failed to activate user');
    }

    return {
      message: 'User activated successfully',
    };
  }
}
