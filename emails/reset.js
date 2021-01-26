const keys = require('../keys')

module.exports = function(email, token) {
    return {
        to: email,
        from: keys.EMAIL_FROM,
        subject: 'Account recovery',
        html: `
            <h1>Do you forgot your password?</h1>
            <p>If not, ignore this letter</p>
            <p>Otherwise click on the link below:</p>
            <p><a href="${keys.BASE_URL}/auth/password/${token}">Reset password</a></p>
            <hr />
            <a href="${keys.BASE_URL}">Course Store</a>
        `
    }
}