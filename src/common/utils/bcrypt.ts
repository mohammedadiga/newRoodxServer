import bcrypt from 'bcrypt';

/**
 * Hashes a value using bcrypt with the given salt rounds. 🔐
 * @param value The value to be hashed (e.g., password). 🔑
 * @param saltRounds The number of salt rounds to use for hashing (default is 10). 🌀
 * @returns The hashed value. 🧑‍🔬
 */
export const hashValue = async (value: string, saltRounds: number = 10) => {
  // Hashing the value using bcrypt
  const hashedValue = await bcrypt.hash(value, saltRounds);
  return hashedValue;
};

/**
 * Compares a value with a hashed value to see if they match. 🔍
 * @param value The value to compare (e.g., password entered by the user). ✋
 * @param hashedValue The previously hashed value to compare against. 🧮
 * @returns True if the values match, otherwise false. ✅❌
 */
export const compareValue = async (value: string, hashedValue: string) => {
  // Comparing the value with the hashed value
  const isMatch = await bcrypt.compare(value, hashedValue);
  return isMatch;
};
