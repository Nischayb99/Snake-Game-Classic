import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 
import config from '../config/config.js'; 
import { asyncHandler } from '../utils/asyncHandler.js';
import { 
  AuthenticationError, 
  ForbiddenError,
  ServerError 
} from '../utils/customErrors.js';

/**
 * Middleware to protect routes that require authentication
 * Verifies the JWT token from cookies and attaches the user to the request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const protect = asyncHandler(async (req, res, next) => {
  // Get token from cookie
  const token = req.cookies[config.jwt.cookieName];

  // Check if token exists
  if (!token) {
    throw new AuthenticationError('Access token required. Please log in.');
  }

  // Verify JWT_SECRET is configured
  if (!process.env.JWT_SECRET) {
    throw new ServerError('JWT configuration error');
  }

  let decoded;
  try {
    // Verify token
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (jwtError) {
    // Handle specific JWT errors
    if (jwtError.name === 'TokenExpiredError') {
      throw new AuthenticationError('Your session has expired. Please log in again.');
    } else if (jwtError.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid authentication token. Please log in again.');
    } else if (jwtError.name === 'NotBeforeError') {
      throw new AuthenticationError('Token not active yet.');
    } else {
      throw new AuthenticationError('Authentication failed. Please log in again.');
    }
  }

  // Validate decoded token structure
  if (!decoded.id) {
    throw new AuthenticationError('Invalid token payload. Please log in again.');
  }

  // Get user from database
  const user = await User.findById(decoded.id).select('-password');
  
  if (!user) {
    throw new AuthenticationError('User account no longer exists. Please create a new account.');
  }

  // Check if user account is still verified
  if (!user.isVerified) {
    throw new ForbiddenError('Account not verified. Please check your email and verify your account.');
  }

  // Attach user to request
  req.user = user;
  
  // Continue to next middleware/route handler
  next();
});

/**
 * Middleware to check if user is admin (optional - for future use)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requireAdmin = asyncHandler(async (req, res, next) => {
  // First check if user is authenticated
  if (!req.user) {
    throw new AuthenticationError('Authentication required');
  }

  // Check if user has admin role (you can add this field to User model later)
  if (!req.user.isAdmin) {
    throw new ForbiddenError('Admin access required');
  }

  next();
});

/**
 * Middleware to check if user owns the resource or is admin (optional - for future use)
 * @param {String} resourceUserField - Field name that contains the user ID in the resource
 */
export const requireOwnership = (resourceUserField = 'user') => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user) {
      throw new AuthenticationError('Authentication required');
    }

    // Get resource ID from params
    const resourceId = req.params.id;
    
    if (!resourceId) {
      throw new ValidationError('Resource ID required');
    }

    // For user profile routes, check if accessing own profile
    if (resourceUserField === 'self') {
      if (req.user._id.toString() !== resourceId) {
        throw new ForbiddenError('You can only access your own profile');
      }
    } else {
      // For other resources, you would fetch the resource and check ownership
      // This is a template for future use
      throw new ForbiddenError('Access denied: insufficient permissions');
    }

    next();
  });
};

/**
 * Optional middleware to extract user info without requiring authentication
 * Useful for routes that can work both with and without authentication
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies[config.jwt.cookieName];

  // If no token, continue without user
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.id) {
      // Get user from database
      const user = await User.findById(decoded.id).select('-password');
      
      // Only attach if user exists and is verified
      if (user && user.isVerified) {
        req.user = user;
      } else {
        req.user = null;
      }
    } else {
      req.user = null;
    }
  } catch (error) {
    // If token is invalid, continue without user (don't throw error)
    req.user = null;
  }

  next();
});

/**
 * Middleware to validate ObjectId parameters
 * @param {String} paramName - Name of the parameter to validate
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!id) {
      throw new ValidationError(`${paramName} parameter is required`);
    }

    // Check if it's a valid ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ValidationError(`Invalid ${paramName} format`);
    }

    next();
  };
};

export default {
  protect,
  requireAdmin,
  requireOwnership,
  optionalAuth,
  validateObjectId
};