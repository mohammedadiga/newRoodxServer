import { z } from 'zod';
import {
  birthdaySchema,
  companynameSchema,
  dateSchema,
  emailOrPhone,
  emailOrPhoneOrUsername,
  emailSchema,
  firstnameSchema,
  lastnameSchema,
  passwordSchema,
  phoneSchema,
  userNameSchema,
} from '@/modules/auth/validators';

// Required activation code: Must be between 1 and 6 characters
const activationCode = z.string().min(1, { message: 'Activation code is required' }).max(6, { message: 'Activation code must not exceed 6 characters' });

export const checkExistUserSchema = z.object({
  userInfo: emailOrPhone, // Define the field with the validation
});

export const registerSchema = z
  .object({
    email: emailSchema.optional(), // Optional, but required for users
    phone: phoneSchema.optional(), // Optional, but required for users
    firstname: firstnameSchema.optional(), // Optional, but required for users
    lastname: lastnameSchema.optional(), // Optional, but required for users
    username: userNameSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    accountType: z.enum(['personal', 'company'], { message: 'Account type must be either "user" or "company".' }),
    companyname: companynameSchema.optional(), // Optional, but required for companies
    date: dateSchema.optional(), // Required for companies
    birthday: birthdaySchema.optional(), // Required for users
  })
  .superRefine((data, ctx) => {
    if (!data.email && !data.phone) {
      ctx.addIssue({
        code: 'custom',
        path: ['email'],
        message: 'Email or phone is required.',
      });
      ctx.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'Email or phone is required.',
      });
    }

    // Validate 'date' if accountType is 'company'
    if (data.accountType === 'company') {
      if (!data.date) {
        ctx.addIssue({
          code: 'custom',
          path: ['date'],
          message: 'Company registration date is required.',
        });
      } else {
        const result = dateSchema.safeParse(data.date);
        if (!result.success) {
          ctx.addIssue({
            code: 'custom',
            path: ['date'],
            message: result.error.errors[0].message,
          });
        }
      }

      if (!data.companyname) {
        ctx.addIssue({
          code: 'custom',
          path: ['companyname'],
          message: 'Company name is required for companies.',
        });
      }
    }

    // Validate 'birthday' if accountType is 'user'
    if (data.accountType === 'personal') {
      if (!data.birthday) {
        ctx.addIssue({
          code: 'custom',
          path: ['birthday'],
          message: 'User birthday is required.',
        });
      } else {
        const result = birthdaySchema.safeParse(data.birthday);
        if (!result.success) {
          ctx.addIssue({
            code: 'custom',
            path: ['birthday'],
            message: result.error.errors[0].message,
          });
        }
      }

      if (!data.firstname) {
        ctx.addIssue({
          code: 'custom',
          path: ['firstname'],
          message: 'Firstname is required for users.',
        });
      }
      if (!data.lastname) {
        ctx.addIssue({
          code: 'custom',
          path: ['lastname'],
          message: 'Lastname is required for users.',
        });
      }
    }

    // Passwords must match
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export const activateSchema = z.object({
  // Optional userAgent (can be used for tracking device information)
  userAgent: z.string(),
  // Required activation code: Must be between 1 and 6 characters
  activationCode: activationCode,
  // Required activation token: Cannot be empty
  activationToken: z.string().min(1, { message: 'Activation token is required' }),
});

export const loginSchema = z.object({
  userInfo: emailOrPhoneOrUsername,
  password: passwordSchema,
  userAgent: z.string(),
});

export const forgotPasswordSchema = z.object({ userInfo: emailOrPhoneOrUsername });

export const activatePasswordSchema = z
  .object({
    userId: z.string().min(1, { message: 'User ID is required' }),
    token: z.string().min(1, { message: 'Verification token is required' }),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((val) => val.password === val.confirmPassword, {
    message: 'Passwords does not match',
    path: ['confirmPassword'],
  });
