import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import type { Env } from '../types/env';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  ChangePasswordRequestSchema,
  ResetPasswordRequestSchema,
  UpdateProfileImageRequestSchema,
  UserIdSchema,
  AdminActionRequestSchema,
  type RegisterRequest,
  type LoginRequest,
  type ChangePasswordRequest,
  type ResetPasswordRequest,
  type UpdateProfileImageRequest,
  type LoginResponse,
  type RegisterResponse,
  type ChangePasswordResponse,
  type ResetPasswordResponse,
  type UpdateProfileImageResponse,
  type RemoveProfileImageResponse,
  type DeactivateUserResponse,
  type ActivateUserResponse,
  type User,
  type PublicUser,
} from '../models/User';

export class AuthService {
  static validateRegistrationInput(data: any): RegisterRequest {
    return RegisterRequestSchema.parse(data);
  }

  static validateLoginInput(data: any): LoginRequest {
    return LoginRequestSchema.parse(data);
  }

  static validateChangePasswordInput(data: any): ChangePasswordRequest {
    return ChangePasswordRequestSchema.parse(data);
  }

  static validateResetPasswordInput(data: any): ResetPasswordRequest {
    return ResetPasswordRequestSchema.parse(data);
  }

  static validateUpdateProfileImageInput(data: any): UpdateProfileImageRequest {
    return UpdateProfileImageRequestSchema.parse(data);
  }

  static validateUserId(data: any): string {
    const { id } = UserIdSchema.parse({ id: data });
    return id;
  }

  static async registerUser(
    requestData: any,
    env: Env
  ): Promise<RegisterResponse> {
    const data = this.validateRegistrationInput(requestData);

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
        isActive: true,
        createdAt,
      },
    };
  }

  static async login(requestData: any, env: Env): Promise<LoginResponse> {
    const data = this.validateLoginInput(requestData);

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
        isActive: user.is_active as boolean,
        createdAt: user.created_at as string,
      },
    };
  }

  static async changePassword(
    userIdData: any,
    passwordRequestData: any,
    env: Env
  ): Promise<ChangePasswordResponse> {
    const userId = this.validateUserId(userIdData);
    const passwordData = this.validateChangePasswordInput(passwordRequestData);

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
    userIdData: any,
    adminUserIdData: any,
    env: Env
  ): Promise<DeactivateUserResponse> {
    const userId = this.validateUserId(userIdData);
    const adminUserId = this.validateUserId(adminUserIdData);

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
    userIdData: any,
    adminUserIdData: any,
    env: Env
  ): Promise<ActivateUserResponse> {
    const userId = this.validateUserId(userIdData);
    const adminUserId = this.validateUserId(adminUserIdData);

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

  static async resetPassword(
    passwordRequestData: any,
    adminUserIdData: any,
    env: Env
  ): Promise<ResetPasswordResponse> {
    const passwordData = this.validateResetPasswordInput(passwordRequestData);
    const adminUserId = this.validateUserId(adminUserIdData);

    // Get user by email
    const user = await env.DB.prepare(
      `
      SELECT id, email, name
      FROM users 
      WHERE email = ?
    `
    )
      .bind(passwordData.email.toLowerCase().trim())
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(passwordData.newPassword, 10);

    // Update password
    const result = await env.DB.prepare(
      `
      UPDATE users 
      SET password_hash = ?, updated_at = ?
      WHERE id = ?
    `
    )
      .bind(hashedPassword, new Date().toISOString(), user.id)
      .run();

    if (!result.success) {
      throw new Error('Failed to reset password');
    }

    return {
      message: 'Password reset successfully',
    };
  }

  static async updateProfileImage(
    userIdData: any,
    imageRequestData: any,
    env: Env
  ): Promise<UpdateProfileImageResponse> {
    const userId = this.validateUserId(userIdData);
    const imageData = this.validateUpdateProfileImageInput(imageRequestData);

    // Get user
    const user = await env.DB.prepare(
      `
      SELECT id, email, name, image_url
      FROM users 
      WHERE id = ?
    `
    )
      .bind(userId)
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    try {
      // Generate unique filename with user ID and timestamp
      const timestamp = Date.now();
      const fileExtension = imageData.fileName.split('.').pop() || 'jpg';
      const fileName = `profile-images/${userId}/${timestamp}.${fileExtension}`;

      // Upload to Cloudflare R2
      const uploadResult = await env.BUCKET.put(fileName, imageData.file, {
        httpMetadata: {
          contentType: imageData.contentType,
        },
      });

      if (!uploadResult) {
        throw new Error('Failed to upload image to storage');
      }

      // Generate URL to serve the image through our API
      const imageUrl = `/api/auth/image/${fileName}`;

      // Delete old image if it exists
      if ((user as any).image_url) {
        try {
          // Extract filename from URL path
          const oldFileName = (user as any).image_url.replace(
            '/api/auth/image/',
            ''
          );
          await env.BUCKET.delete(oldFileName);
        } catch (deleteError) {
          // Log but don't fail if old image deletion fails
          console.warn('Failed to delete old profile image:', deleteError);
        }
      }

      // Update user with new image URL
      const updateResult = await env.DB.prepare(
        `
        UPDATE users 
        SET image_url = ?, updated_at = ?
        WHERE id = ?
      `
      )
        .bind(imageUrl, new Date().toISOString(), userId)
        .run();

      if (!updateResult.success) {
        throw new Error('Failed to update user profile image');
      }

      // Return updated user data
      const updatedUser = await env.DB.prepare(
        `
        SELECT id, email, name, image_url, created_at
        FROM users 
        WHERE id = ?
      `
      )
        .bind(userId)
        .first();

      if (!updatedUser) {
        throw new Error('Failed to retrieve updated user data');
      }

      return {
        success: true,
        message: 'Profile image updated successfully',
        imageUrl: imageUrl,
        user: {
          id: (updatedUser as any).id,
          email: (updatedUser as any).email,
          name: (updatedUser as any).name,
          imageUrl: (updatedUser as any).image_url,
          isActive: (updatedUser as any).is_active,
          createdAt: (updatedUser as any).created_at,
        },
      };
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to update profile image'
      );
    }
  }

  static async removeProfileImage(
    userIdData: any,
    env: Env
  ): Promise<RemoveProfileImageResponse> {
    const userId = this.validateUserId(userIdData);

    // Get user with current image
    const user = await env.DB.prepare(
      `
      SELECT id, email, name, image_url
      FROM users 
      WHERE id = ?
    `
    )
      .bind(userId)
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    try {
      // Delete image from R2 if it exists
      if ((user as any).image_url) {
        try {
          // Extract filename from URL path
          const fileName = (user as any).image_url.replace(
            '/api/auth/image/',
            ''
          );
          await env.BUCKET.delete(fileName);
        } catch (deleteError) {
          // Log but don't fail if image deletion fails
          console.warn('Failed to delete profile image from R2:', deleteError);
        }
      }

      // Update user to remove image URL
      const updateResult = await env.DB.prepare(
        `
        UPDATE users 
        SET image_url = NULL, updated_at = ?
        WHERE id = ?
      `
      )
        .bind(new Date().toISOString(), userId)
        .run();

      if (!updateResult.success) {
        throw new Error('Failed to remove profile image from database');
      }

      // Return updated user data
      const updatedUser = await env.DB.prepare(
        `
        SELECT id, email, name, image_url, created_at
        FROM users 
        WHERE id = ?
      `
      )
        .bind(userId)
        .first();

      if (!updatedUser) {
        throw new Error('Failed to retrieve updated user data');
      }

      return {
        success: true,
        message: 'Profile image removed successfully',
        user: {
          id: (updatedUser as any).id,
          email: (updatedUser as any).email,
          name: (updatedUser as any).name,
          imageUrl: (updatedUser as any).image_url, // Should be null
          isActive: (updatedUser as any).is_active,
          createdAt: (updatedUser as any).created_at,
        },
      };
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to remove profile image'
      );
    }
  }
}
