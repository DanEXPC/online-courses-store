const keys = require('../keys')

module.exports = function(email) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Account has been created successfully',
        html: `
            <h1>Welcome to our store</h1>
            <p>Your account - ${email} has been created successfully</p>
            <hr />
            <a href="${keys.BASE_URL}">Course Store</a>
        `
    }
}