const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const homeRoutes = require('./routes/home') 
const addRoutes = require('./routes/add') 
const cartRoutes = require('./routes/cart') 
const coursesRoutes = require('./routes/courses')
const User = require('./models/User') 

const app = express()

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
      }
})

app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')

app.use(async (req, res, next) => {
    try {
        const user = await User.findById('600abb2a330a820b2883c8b0')
        req.user = user
        next()
    } catch (err) {
        console.log(err)
    }  
})

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))

app.use('/', homeRoutes)
app.use('/add', addRoutes)
app.use('/courses', coursesRoutes)
app.use('/cart', cartRoutes)

const PORT = process.env.PORT || 3000


async function start() {
    try {
        const url = 'mongodb+srv://danylo:T4mMQ0F5aDSJziYq@cluster0.r3a4j.mongodb.net/shop?retryWrites=true&w=majority'
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        })
        const candidate = await User.findOne()
        if (!candidate) {
            const user = new User({
                email: 'danylosmahliuk@gmail.com',
                name: 'Danylo',
                cart: {items: []}
            })
            await user.save()
        }
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    } catch (err) {
        console.log(err)
    }
    
}

start()

