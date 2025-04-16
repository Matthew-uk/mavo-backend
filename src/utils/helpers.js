import jwt from 'jsonwebtoken';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Generate random verification code
export const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Format error response
export const formatError = (error) => {
  return {
    message: error.message || 'An error occurred',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };
};
