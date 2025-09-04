import * as bcrypt from 'bcryptjs';

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

// Mock user store (replace with actual database)
const userStore: User[] = [];

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

  static async registerUser(data: RegisterRequest): Promise<RegisterResponse> {
    const validationError = this.validateRegistrationInput(data);
    if (validationError) {
      throw new Error(validationError);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user: User = {
      id: crypto.randomUUID(),
      email: data.email.toLowerCase().trim(),
      name: data.name,
      passwordHash: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    // Save to mock store (replace with database)
    userStore.push(user);

    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    };
  }

  static async login(data: LoginRequest): Promise<LoginResponse> {
    if (!data.email || !data.password) {
      throw new Error('Email and password are required');
    }

    if (!this.validateEmail(data.email)) {
      throw new Error('Invalid email');
    }

    const normalizedEmail = data.email.toLowerCase().trim();

    // Find user by email
    const user = userStore.find(u => u.email === normalizedEmail);
    if (!user) {
      throw new Error('User not found');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(
      data.password,
      user.passwordHash
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
        createdAt: user.createdAt,
      },
    };
  }
}
