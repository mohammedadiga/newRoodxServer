import { v4 as uuidv4 } from 'uuid';

export const generateUniqueCode = (length: number = 25): string => {
  return uuidv4().replace(/-/g, '').substring(0, length);
};
