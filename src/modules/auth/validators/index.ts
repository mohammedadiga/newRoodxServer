import { z } from 'zod';

// Company name validation: must be between 2 and 30 characters, allows letters (both English and Arabic) and spaces
const companynameSchema = z
  .string()
  .min(2, { message: 'Company name should be at least 2 characters long.' }) // Min length of 2 characters
  .max(30, { message: 'Company name should not exceed 30 characters.' }) // Max length of 30 characters
  .regex(/^[a-zA-Z\u0621-\u064A\s]+$/, { message: 'Company name can only contain letters (English & Arabic) and spaces.' }); // Allows letters (English & Arabic) and spaces

// First name validation: must be between 2 and 30 characters, allows letters (both English and Arabic) and spaces
const firstnameSchema = z
  .string()
  .min(2, { message: 'First name should be at least 2 characters long.' }) // Min length of 2 characters
  .max(30, { message: 'First name should not exceed 30 characters.' }) // Max length of 30 characters
  .regex(/^[a-zA-Z\u0621-\u064A\s]+$/, { message: 'First name can only contain letters (English & Arabic) and spaces.' }); // Allows letters (English & Arabic) and spaces

// Last name validation: must be between 2 and 30 characters, allows letters (both English and Arabic) and spaces
const lastnameSchema = z
  .string()
  .min(2, { message: 'Last name should be at least 2 characters long.' }) // Min length of 2 characters
  .max(30, { message: 'Last name should not exceed 30 characters.' }) // Max length of 30 characters
  .regex(/^[a-zA-Z\u0621-\u064A\s]+$/, { message: 'Last name can only contain letters (English & Arabic) and spaces.' }); // Allows letters (English & Arabic) and spaces

// User name validation schema
const userNameSchema = z
  .string()
  .trim() // Remove extra spaces from input
  .regex(/^[A-Za-z](?:[A-Za-z0-9_]+)*$/, { message: 'Username can only contain letters, numbers, and underscores, and must start with a letter.' }) // Valid username format
  .min(3, { message: 'Username should be at least 3 characters long.' }) // Min length of 3 characters for username
  .max(20, { message: 'Username should not exceed 20 characters.' }); // Max length of 20 characters for username

// Define phone number validation: it should be between 10 and 15 characters
const phoneSchema = z
  .string()
  .min(10, { message: 'Phone number must be at least 10 characters long.' })
  .max(15, { message: 'Phone number must be at most 15 characters long.' })
  .regex(/^\+?[0-9]\d{0,14}$/, { message: 'Phone number must be valid and can start with a "+"' });

// Email validation schema
const emailSchema = z
  .string()
  .trim() // Remove extra spaces from input
  .email({ message: 'Invalid email format.' }) // Custom error message for invalid email format
  .min(5, { message: 'Email must be at least 5 characters long.' }) // Min length of 5 characters for email
  .max(255, { message: 'Email should not exceed 255 characters.' }); // Max length of 255 characters for email

// User name validation schema for email or phone
const emailOrPhone = z.union([emailSchema, phoneSchema]).refine(
  (value) => {
    // Check if the value matches either the email or phone number
    return emailSchema.safeParse(value).success || phoneSchema.safeParse(value).success;
  },
  {
    message: 'Invalid email or phone number.', // Error message if validation fails
  }
);

// Use z.union to check if the value is either a valid email or a valid phone number or  a valid username
const emailOrPhoneOrUsername = z.union([emailSchema, phoneSchema, userNameSchema]).refine(
  (value) => {
    // Check if the value matches either the email, phone number, or username
    return emailSchema.safeParse(value).success || phoneSchema.safeParse(value).success || userNameSchema.safeParse(value).success;
  },
  {
    message: 'Invalid Email, Phone Number, or Username', // Error message if validation fails
  }
);

// Password validation schema
const passwordSchema = z
  .string()
  .trim() // Remove extra spaces from input
  .nonempty({ message: 'Password cannot be empty.' }) // Ensure password is not empty
  .min(6, { message: 'Password must be at least 6 characters long.' }) // Min length of 6 characters
  .max(255, { message: 'Password should not exceed 255 characters.' }) // Max length of 255 characters
  .regex(/^(?=.*[A-Z])/, { message: 'Password must contain at least one uppercase letter.' }) // Uncomment to enforce uppercase letter requirement
  .regex(/^(?=.*[a-z])/, { message: 'Password must contain at least one lowercase letter.' }) // Uncomment to enforce lowercase letter requirement
  .regex(/^(?=.*\d)/, { message: 'Password must contain at least one number.' }) // Uncomment to enforce number requirement
  .regex(/^(?=.*[!@#$%^&*(),.?":{}|<>])/, { message: 'Password must contain at least one special character.' }); // Uncomment to enforce special character requirement

const birthdaySchema = z
  .string()
  .min(1, { message: 'Birthday is required.' }) // Ensure the birthday is provided
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format.', // Validate if it's a correct date format
  })
  .refine((val) => new Date(val) <= new Date(), {
    message: 'Birthday cannot be in the future.', // Ensure the birthday is not in the future
  })
  .refine(
    (val) => {
      const birthDate = new Date(val);
      const minAge = 13;
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // If age is greater than minAge, it's valid. If exactly minAge, ensure the birthdate is before today
      return age > minAge || (age === minAge && today >= new Date(birthDate.setFullYear(today.getFullYear())));
    },
    {
      message: 'You must be at least 13 years old.', // Ensure user is at least 13 years old
    }
  );

const dateSchema = z
  .string()
  .min(1, { message: 'Date is required.' }) // Check if the date is provided
  .refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format.', // Validate if the date is a valid date format
  })
  .refine((val) => new Date(val) <= new Date(), {
    message: 'The date cannot be in the future.', // Ensure the date is not in the future
  });

// Exporting schemas
export { companynameSchema, firstnameSchema, lastnameSchema, userNameSchema, emailSchema, phoneSchema, emailOrPhone, emailOrPhoneOrUsername, passwordSchema, dateSchema, birthdaySchema };
//
