import { BadRequestException } from '@/common/errors/catch-errors';

// Regex to validate email format 📧
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Regex to validate username format (letters, numbers, and underscores, starting with a letter) 📝
const usernameRegex = /^[a-z](?:[a-z0-9_]+)*$/;

// Helper function to format phone number 📱
export function formatPhoneNumber(phone: IUser['phone']) {
  // Remove any whitespace and non-digit characters except '+'
  let formattedPhone = phone.replace(/\s+/g, '').replace(/[^+\d]/g, '');

  // If the phone number starts with a plus sign, convert it to 00 (international format)
  if (formattedPhone.startsWith('+')) {
    formattedPhone = '00' + formattedPhone.substring(1); // Converts + to 00 for international phone number
  }

  return formattedPhone;
}

// Utility function to check if the input is a valid email, username, or phone and return only the relevant value ⚡
export function extractUserInfo(userInfo: string): { email?: string; username?: string; phone?: string } {
  // If the input matches the email regex, return it as an email 📧
  if (emailRegex.test(userInfo)) {
    return { email: userInfo }; // It's a valid email
  }

  // If the input matches the username regex, return it as a username 📝
  if (usernameRegex.test(userInfo)) {
    return { username: userInfo }; // It's a valid username
  }

  // Otherwise, treat the input as a phone number and format it 📱
  // Check if the phone number has valid digits (after formatting)
  const formattedPhone = formatPhoneNumber(userInfo);
  if (/^\d{10,15}$/.test(formattedPhone)) {
    // Optional: Check if the phone number is within valid length range
    return { phone: formattedPhone }; // Return formatted phone number if valid
  }

  // If the input doesn't match any valid pattern, return an empty object 🚫
  throw new BadRequestException('Invalid input: Must be a valid email, username, or phone number');
}
