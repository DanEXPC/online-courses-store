const { Router } = require('express')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const router = Router()

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
            req.flash('registerError', 'User with such email already registred')
            res.redirect('/auth/login#register')
        } else {
            const hashPassword = await bcrypt.hash(password, 10)
            const user = new User({
                email, name, password: hashPassword, cart: { items: [] }
            })
            await user.save()
            res.redirect('/auth/login#login')
        }

    } catch (err) {
        console.log(err)
    }
})

module.exports = router