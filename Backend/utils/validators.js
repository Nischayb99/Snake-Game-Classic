import { body, validationResult } from 'express-validator';

export const validateGameData = [
    body('score')
        .isInt({ min: 0, max: 100000 })
        .withMessage('Score must be between 0 and 100,000')
        .toInt(),

    body('snakeLength')
        .isInt({ min: 1, max: 1000 })
        .withMessage('Snake length must be between 1 and 1,000')
        .toInt(),

    body('playTime')
        .isInt({ min: 1, max: 7200 })
        .withMessage('Play time must be between 1 second and 2 hours')
        .toInt(),

    body('foodEaten')
        .optional()
        .isInt({ min: 0, max: 10000 })
        .toInt(),

    body('moveCount')
        .optional()
        .isInt({ min: 1, max: 100000 })
        .toInt(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Invalid input data',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg,
                    value: err.value
                }))
            });
        }
        next();
    }
];

export const validateUserData = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .escape(),

    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array().map(err => ({
                    field: err.path,
                    message: err.msg
                }))
            });
        }
        next();
    }
];