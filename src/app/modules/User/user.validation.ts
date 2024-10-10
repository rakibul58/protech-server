import { z } from 'zod';

// Validation for register
const userRegisterValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required!' }).trim(),
    email: z
      .string({ required_error: 'Email is required!' })
      .trim()
      .email({ message: 'Please enter a valid email' }),
    password: z
      .string({ required_error: 'Password is required!' })
      .max(20, "Password can't be more than 20 characters!"),
    phone: z.string().optional().nullable().default(null),
    preferences: z.string().optional().nullable().default(null),
    address: z.string().optional().nullable().default(null),
    isVerified: z.boolean().optional().default(false), // New field
  }),
});

//createAdminValidationSchema
const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required!' }).trim(),
    email: z
      .string({ required_error: 'Email is required!' })
      .trim()
      .email({ message: 'Please enter a valid email' }),
    password: z
      .string({ required_error: 'Password is required!' })
      .max(20, "Password can't be more than 20 characters!")
      .optional(),
    role: z.string().optional().default('user'),
    phone: z.string().optional().nullable().default(null),
    preferences: z.string().optional().nullable().default(null),
    address: z.string().optional().nullable().default(null),
    isVerified: z.boolean().optional().default(true),
    isDeleted: z.boolean().optional().default(false),
    isBlocked: z.boolean().optional().default(false),
  }),
});

// Validation for update profile
const updateUserValidation = z.object({
  body: z.object({
    name: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .email({ message: 'Please enter a valid email' })
      .optional(),
    role: z
      .enum(['admin', 'user'], {
        invalid_type_error: 'Enter a valid role',
      })
      .optional()
      .default('user'),
    phone: z.string().optional(),
    address: z.string().optional(),
    preferences: z.string().optional(),
    isDeleted: z.boolean().optional(),
    isVerified: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
  }),
});

// Validation for update profile
const profileUpdateValidation = z.object({
  body: z.object({
    name: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .email({ message: 'Please enter a valid email' })
      .optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    preferences: z.string().optional(),
  }),
});

// Validation for signIn
const signinValidationSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required.' })
      .trim()
      .email({ message: 'Please enter a valid email' }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

// refresh token cookie validation
const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required!',
    }),
  }),
});

const resetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required!',
    }),
    newPassword: z.string({
      required_error: 'User password is required!',
    }),
  }),
});

// exporting the schema
export const UserValidations = {
  userRegisterValidationSchema,
  signinValidationSchema,
  refreshTokenValidationSchema,
  profileUpdateValidation,
  updateUserValidation,
  createUserValidationSchema,
  forgetPasswordValidationSchema,
  resetPasswordValidationSchema,
};
