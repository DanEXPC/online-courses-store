const { Router } = require('express')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const sendgrid = require('nodemailer-sendgrid-transport')
const User = require('../models/user')
const keys = require('../keys')
const reqEmail = require('../emails/registration')
const resetEmail = require('../emails/reset')
const router = Router()

const transporter = nodemailer.createTransport(sendgrid({
    auth: {api_key: keys.SENDGRID_API_KEY}
}))

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Authorization',
        isLogin: true,
        loginError: await req.consumeFlash('loginError'),
        registerError: await req.consumeFlash('registerError')
    })
})

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login')
    })
})

router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        const candidate = await User.findOne( {email} )

        if (candidate) {
            const areSame = await bcrypt.compare(password, candidate.password)

            if (areSame) {
                req.session.user = candidate
                req.session.isAuthenticated = true
                req.session.save(err => {
                    if (err) {
                        throw err
                    }
                    res.redirect('/')
                })
            } else {
                await req.flash('loginError', 'Password is incorrect')
                res.redirect('/auth/login#login')
            }
        } else {
            await req.flash('loginError', 'The user with such email does not exist')
            res.redirect('/auth/login#login')
        }

    } catch (err) {
        console.log(err)
    }
})

router.post('/register', async (req, res) => {
    try {
        const {email, password, repeat, name} = req.body
        const candidate= await User.findOne({ email })

        if (candidate) {
            await req.flash('registerError', 'User with such email already registred')
            res.redirect('/auth/login#register')
        } else {
            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User({
                email, name, password: hashPassword, cart: { items: [] }
            })
            await user.save()
            await transporter.sendMail(reqEmail(email))
            res.redirect('/auth/login#login')
            
        }

    } catch (err) {
        console.log(err)
    }
})

router.get('/reset', async (req, res) => {
    res.render('auth/reset', {
        title: 'Reset Password',
        error: await req.consumeFlash('error')
    })
})

router.post('/reset', (req, res) => {
    try {
        crypto.randomBytes(32, async (err, buffer) => {
            if (err) {
                await req.flash('error', 'Something goes wrong. Please try again later.')
                return res.redirect('/auth/reset')
            }

            const token = buffer.toString('hex')
            const candidate = await User.findOne({ email: req.body.email })
            
            if (candidate) {
                candidate.resetToken = token
                candidate.resetTokenExp = Date.now() + 60 * 60 * 1000
                await candidate.save()
                await transporter.sendMail(resetEmail(candidate.email, token))
                res.redirect('auth/login')
            } else {
                await req.flash('error', 'User with entered email address does not exist')
                return res.redirect('/auth/reset')
            }
        })
    } catch (err) {
        console.log(err)
    }
})

module.exports = router