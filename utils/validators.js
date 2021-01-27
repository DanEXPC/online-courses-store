const {body} = require('express-validator')
const User = require('../models/user')

exports.registerValidators = [
    body('email').isEmail().withMessage('Enter correct email address').custom( async (value, {req}) => {
        try {
            const user = await User.findOne({ email: value })
            if (user) {
                return Promise.reject('User with such email already registred')
            }
        } catch (err) {
                console.log(err)
        }
    }),
    body('password', 'Password must be at least 6 characters long').isLength({min: 6, max: 56}).isAlphanumeric(),
    body('confirm').custom((value, {req}) => {
        if (value !== req.body.password) {
            throw new Error('Passwords must be the same')
        }
        return true
    }),
    body('name').isLength({min: 3}).withMessage('Name must be at least 3 characters long')
]