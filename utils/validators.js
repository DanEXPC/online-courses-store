const {body} = require('express-validator')

exports.registerValidators = [
    body('email').isEmail().withMessage('Enter correct email address'),
    body('password', 'Password must be at least 6 characters long').isLength({min: 6, max: 56}).isAlphanumeric(),
    body('confirm').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Passwords must be the same')
        }
        return true
    }),
    body('name').isLength({min: 3}).withMessage('Name must be at least 3 characters long')
]