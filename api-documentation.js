/**
 * Mavo API Documentation
 *
 * This file documents all API endpoints, required parameters, and response formats.
 */

/**
 * Authentication Endpoints
 */

/**
 * Register a new user
 *
 * POST /api/auth/register
 *
 * Request Body:
 * {
 *   "firstName": "John",                  // Required: User's first name
 *   "lastName": "Doe",                    // Required: User's last name
 *   "email": "john@example.com",          // Required: User's email address
 *   "password": "password123",            // Required: User's password (min 6 characters)
 *   "phoneNumber": "+2348023456789",      // Required: User's phone number
 *   "address": "123 Main St, City",       // Required: User's address
 *   "role": "car_owner"                   // Required: User's role (car_owner or driver)
 * }
 *
 * Success Response (201):
 * {
 *   "message": "User registered successfully. Verification code sent to your email.",
 *   "userId": "60d21b4667d0d8992e610c85"  // MongoDB ObjectId of the created user
 * }
 *
 * Error Responses:
 * - 400: User with this email already exists
 * - 500: Server error during registration
 */

/**
 * Verify email with code
 *
 * POST /api/auth/verify
 *
 * Request Body:
 * {
 *   "userId": "60d21b4667d0d8992e610c85", // Required: User's MongoDB ObjectId
 *   "code": "1234"                        // Required: Verification code sent to email
 * }
 *
 * Success Response (200):
 * {
 *   "message": "Email verified successfully",
 *   "token": "jwt_token_here",            // JWT token for authentication
 *   "user": {
 *     "_id": "60d21b4667d0d8992e610c85",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "email": "john@example.com",
 *     "phoneNumber": "+2348023456789",
 *     "role": "car_owner"
 *   }
 * }
 *
 * Error Responses:
 * - 400: User is already verified / No verification code found / Verification code has expired / Invalid verification code
 * - 404: User not found
 * - 500: Server error during verification
 */

/**
 * Resend verification code
 *
 * POST /api/auth/resend-code
 *
 * Request Body:
 * {
 *   "userId": "60d21b4667d0d8992e610c85"  // Required: User's MongoDB ObjectId
 * }
 *
 * Success Response (200):
 * {
 *   "message": "Verification code resent successfully"
 * }
 *
 * Error Responses:
 * - 400: User is already verified
 * - 404: User not found
 * - 500: Server error while resending code
 */

/**
 * Login user
 *
 * POST /api/auth/login
 *
 * Request Body:
 * {
 *   "email": "john@example.com",          // Required: User's email
 *   "password": "password123"             // Required: User's password
 * }
 *
 * Success Response (200):
 * {
 *   "message": "Login successful",
 *   "token": "jwt_token_here",            // JWT token for authentication
 *   "user": {
 *     "_id": "60d21b4667d0d8992e610c85",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "email": "john@example.com",
 *     "phoneNumber": "+2348023456789",
 *     "role": "car_owner"
 *   }
 * }
 *
 * Error Responses:
 * - 401: Invalid email or password / Account not verified
 * - 500: Server error during login
 */

/**
 * Get current user profile
 *
 * GET /api/auth/me
 *
 * Headers:
 * Authorization: Bearer jwt_token_here    // Required: JWT token from login
 *
 * Success Response (200):
 * {
 *   "user": {
 *     "_id": "60d21b4667d0d8992e610c85",
 *     "firstName": "John",
 *     "lastName": "Doe",
 *     "email": "john@example.com",
 *     "phoneNumber": "+2348023456789",
 *     "address": "123 Main St, City",
 *     "role": "car_owner",
 *     "profileImage": "",
 *     "isVerified": true,
 *     "createdAt": "2023-06-19T12:00:00.000Z",
 *     "updatedAt": "2023-06-19T12:00:00.000Z"
 *   }
 * }
 *
 * Error Responses:
 * - 401: Authentication required / Invalid or expired token
 * - 500: Server error while fetching profile
 */

/**
 * User Management Endpoints
 */

/**
 * Update user profile
 *
 * PUT /api/users/profile
 *
 * Headers:
 * Authorization: Bearer jwt_token_here    // Required: JWT token from login
 *
 * Request Body (all fields optional):
 * {
 *   "firstName": "John",                  // Optional: Updated first name
 *   "lastName": "Smith",                  // Optional: Updated last name
 *   "address": "456 New St, City",        // Optional: Updated address
 *   "profileImage": "image_url_here"      // Optional: URL to profile image
 * }
 *
 * Success Response (200):
 * {
 *   "message": "Profile updated successfully",
 *   "user": {
 *     "_id": "60d21b4667d0d8992e610c85",
 *     "firstName": "John",
 *     "lastName": "Smith",
 *     "email": "john@example.com",
 *     "phoneNumber": "+2348023456789",
 *     "address": "456 New St, City",
 *     "role": "car_owner",
 *     "profileImage": "image_url_here"
 *   }
 * }
 *
 * Error Responses:
 * - 401: Authentication required / Invalid or expired token
 * - 404: User not found
 * - 500: Server error while updating profile
 */

/**
 * Change password
 *
 * PUT /api/users/change-password
 *
 * Headers:
 * Authorization: Bearer jwt_token_here    // Required: JWT token from login
 *
 * Request Body:
 * {
 *   "currentPassword": "password123",     // Required: Current password
 *   "newPassword": "newpassword456"       // Required: New password (min 6 characters)
 * }
 *
 * Success Response (200):
 * {
 *   "message": "Password changed successfully"
 * }
 *
 * Error Responses:
 * - 401: Authentication required / Invalid or expired token / Current password is incorrect
 * - 404: User not found
 * - 500: Server error while changing password
 */

/**
 * Get all drivers (for car owners)
 *
 * GET /api/users/drivers
 *
 * Headers:
 * Authorization: Bearer jwt_token_here    // Required: JWT token from login (must be car_owner)
 *
 * Success Response (200):
 * {
 *   "drivers": [
 *     {
 *       "_id": "60d21b4667d0d8992e610c85",
 *       "firstName": "Jane",
 *       "lastName": "Doe",
 *       "email": "jane@example.com",
 *       "phoneNumber": "+2348023456789",
 *       "address": "123 Main St, City",
 *       "role": "driver",
 *       "profileImage": "",
 *  "+2348023456789",
 *       "address": "123 Main St, City",
 *       "role": "driver",
 *       "profileImage": "",
 *       "isVerified": true,
 *       "createdAt": "2023-06-19T12:00:00.000Z",
 *       "updatedAt": "2023-06-19T12:00:00.000Z"
 *     },
 *     // More driver objects...
 *   ]
 * }
 *
 * Error Responses:
 * - 401: Authentication required / Invalid or expired token
 * - 403: You do not have permission to perform this action
 * - 500: Server error while fetching drivers
 */

/**
 * Get all car owners (for drivers)
 *
 * GET /api/users/car-owners
 *
 * Headers:
 * Authorization: Bearer jwt_token_here    // Required: JWT token from login (must be driver)
 *
 * Success Response (200):
 * {
 *   "carOwners": [
 *     {
 *       "_id": "60d21b4667d0d8992e610c85",
 *       "firstName": "John",
 *       "lastName": "Doe",
 *       "email": "john@example.com",
 *       "phoneNumber": "+2348023456789",
 *       "address": "123 Main St, City",
 *       "role": "car_owner",
 *       "profileImage": "",
 *       "isVerified": true,
 *       "createdAt": "2023-06-19T12:00:00.000Z",
 *       "updatedAt": "2023-06-19T12:00:00.000Z"
 *     },
 *     // More car owner objects...
 *   ]
 * }
 *
 * Error Responses:
 * - 401: Authentication required / Invalid or expired token
 * - 403: You do not have permission to perform this action
 * - 500: Server error while fetching car owners
 */
