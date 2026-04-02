import mongoose from 'mongoose';

/**
 * Middleware to validate MongoDB ObjectId route parameters.
 * Returns 400 if the param is not a valid ObjectId, preventing BSONTypeError crashes.
 * 
 * @param {string} paramName - The route parameter name to validate (default: 'id')
 * @returns {Function} Express middleware
 */
const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    next();
  };
};

export default validateObjectId;
