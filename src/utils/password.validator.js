const validatePassword = (password) => {
    return String(password)
        .match(
            /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&?@ "]).*$/
        )
}

module.exports = validatePassword