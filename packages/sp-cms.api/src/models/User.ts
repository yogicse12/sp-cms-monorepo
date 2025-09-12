import { z } from 'zod';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Base User Schema
export const UserSchema = z.object({
  id: z.uuid(),
  email: z.email('Invalid email format').toLowerCase(),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  passwordHash: z.string(),
  imageUrl: z.url().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime().optional(),
});

// User without sensitive data (for API responses)
export const PublicUserSchema = UserSchema.omit({ passwordHash: true });

// Register Request Schema
export const RegisterRequestSchema = z.object({
  email: z
    .email('Invalid email format')
    .toLowerCase()
    .trim()
    .refine(email => emailRegex.test(email), 'Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters'),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
});

// Login Request Schema
export const LoginRequestSchema = z.object({
  email: z.email('Invalid email format').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

// Change Password Request Schema
export const ChangePasswordRequestSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .max(128, 'New password must be less than 128 characters'),
});

// Reset Password Request Schema
export const ResetPasswordRequestSchema = z
  .object({
    email: z.email('Invalid email format').toLowerCase().trim(),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .max(128, 'New password must be less than 128 characters'),
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters long')
      .max(128, 'Confirm password must be less than 128 characters'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match',
    path: ['confirmPassword'],
  });

// Update Profile Image Request Schema
export const UpdateProfileImageRequestSchema = z.object({
  file: z.instanceof(ArrayBuffer).or(z.instanceof(File)),
  fileName: z
    .string()
    .min(1, 'File name is required')
    .regex(
      /\.(jpg|jpeg|png|gif|webp)$/i,
      'Invalid file type. Only images are allowed'
    ),
  contentType: z
    .string()
    .regex(
      /^image\/(jpeg|jpg|png|gif|webp)$/i,
      'Invalid content type. Only images are allowed'
    ),
});

// User ID Schema for validation
export const UserIdSchema = z.object({
  id: z.uuid('Invalid user ID format'),
});

// Admin Action Request Schema (for activate/deactivate)
export const AdminActionRequestSchema = z.object({
  userId: z.uuid('Invalid user ID format'),
  adminUserId: z.uuid('Invalid admin user ID format'),
});

// Response Schemas
export const LoginResponseSchema = z.object({
  message: z.string(),
  token: z.string(),
  user: PublicUserSchema,
});

export const RegisterResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: PublicUserSchema,
});

export const ChangePasswordResponseSchema = z.object({
  message: z.string(),
});

export const ResetPasswordResponseSchema = z.object({
  message: z.string(),
});

export const UpdateProfileImageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  imageUrl: z.string(),
  user: PublicUserSchema,
});

export const RemoveProfileImageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: PublicUserSchema,
});

export const DeactivateUserResponseSchema = z.object({
  message: z.string(),
});

export const ActivateUserResponseSchema = z.object({
  message: z.string(),
});

// Type exports (inferred from schemas for consistency)
export type User = z.infer<typeof UserSchema>;
export type PublicUser = z.infer<typeof PublicUserSchema>;
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type UpdateProfileImageRequest = z.infer<
  typeof UpdateProfileImageRequestSchema
>;
export type UserId = z.infer<typeof UserIdSchema>;
export type AdminActionRequest = z.infer<typeof AdminActionRequestSchema>;

// Response Types
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type ChangePasswordResponse = z.infer<
  typeof ChangePasswordResponseSchema
>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
export type UpdateProfileImageResponse = z.infer<
  typeof UpdateProfileImageResponseSchema
>;
export type RemoveProfileImageResponse = z.infer<
  typeof RemoveProfileImageResponseSchema
>;
export type DeactivateUserResponse = z.infer<
  typeof DeactivateUserResponseSchema
>;
export type ActivateUserResponse = z.infer<typeof ActivateUserResponseSchema>;
