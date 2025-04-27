import jwt from 'jsonwebtoken';

/**
 * Calculates the number of days between a start date and the same day
 * in the next interval (monthly, bi-monthly, annually).
 *
 * @param {Date | string} date - Start date
 * @param {'monthly' | 'bi-monthly' | 'annually'} interval
 * @returns {number} Number of days in the interval
 */

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate random verification code
export const generateVerificationCode = () => {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 20 * 60 * 1000);
  const code = Math.floor(1000 + Math.random() * 9000).toString();

  return { code, expiresAt };
};

// Format error response
export const formatError = (error) => {
  return {
    message: error.message || 'An error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };
};

export function getIntervalLengthInDays(date, interval = 'monthly') {
  const start = new Date(date);
  const day = start.getDate();

  let addMonths = 1;
  if (interval === 'bi-annually') addMonths = 6;
  else if (interval === 'annually') addMonths = 12;

  let targetMonth = start.getMonth() + addMonths;
  let targetYear = start.getFullYear() + Math.floor(targetMonth / 12);
  targetMonth = targetMonth % 12;

  // Try the same day in the target month/year
  let target = new Date(targetYear, targetMonth, day);

  // Handle overflow (e.g. Feb 30 → Mar 2)
  if (target.getMonth() !== targetMonth) {
    target = new Date(targetYear, targetMonth + 1, 0); // last day of targetMonth
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const diffMs = target - start;

  return { no_of_days: Math.ceil(diffMs / msPerDay), date: target };
}
