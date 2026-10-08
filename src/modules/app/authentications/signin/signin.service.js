const crypto = require("crypto")
const bcrypt = require("bcrypt")
const responses = require("../../../../data/responses.js")
const db = require("../../../../data/models/index.js")
const { OTP_CODE_SOURCES, MAX_LOGIN_ATTEMPS_MINUTES, MAX_LOGIN_ATTEMPS } = require("../../../../data/constants.js")
const otpCodeMail = require("../../../../services/otpcode.mail.js")

const User = db.users
const OtpCode = db.otpCodes
const LoginAttempt = db.loginAttemps
const History = db.histories

function tooManyAttempts(res, attempt) {
    return res.status(responses.HTTP_CODES.VALIDATION_ERROR).json({
        responseCode: responses.CALL_BACK_MESSAGES.LOGIN_ATTEMPS_OUT_OF_BOUND.CODE,
        responseMessage: responses.CALL_BACK_MESSAGES.LOGIN_ATTEMPS_OUT_OF_BOUND.MESSAGE,
        data: [{ attemps: attempt.attemps, leftAttemps: 0 }],
    })
}

async function signInService(req, res) {
    try {
        const { email, password } = req.body

        // ---------- Blocage après trop d'échecs ----------
        let attempt = await LoginAttempt.findOne({ where: { email } })
        if (attempt) {
            const ageMinutes = (Date.now() - new Date(attempt.updatedAt).getTime()) / (1000 * 60)
            if (ageMinutes > MAX_LOGIN_ATTEMPS_MINUTES) {
                await attempt.destroy()
                attempt = null
            } else if (attempt.attemps >= MAX_LOGIN_ATTEMPS) {
                return tooManyAttempts(res, attempt)
            }
        }

        // ---------- Vérification du mot de passe ----------
        const user = await User.findOne({ where: { email } })
        const passwordOk = user && (await bcrypt.compare(password, user.password))

        if (passwordOk) {
            const code = String(crypto.randomInt(100000, 1000000)) // 6 chiffres
            const saltRounds = parseInt(process.env.BCRYPT_SALT, 10) || 10

            await OtpCode.destroy({ where: { email, source: OTP_CODE_SOURCES.SIGN_IN } })
            await OtpCode.create({
                email,
                code: await bcrypt.hash(code, saltRounds),
                source: OTP_CODE_SOURCES.SIGN_IN,
            })
            if (attempt) await attempt.destroy()

            await otpCodeMail(email, code)

            await History.create({ wording: "Mot de passe validé, code de confirmation envoyé.", userId: user.id })

            return res.status(responses.HTTP_CODES.RESULT_OK).json({
                responseCode: responses.CALL_BACK_MESSAGES.SUCCESS.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.SUCCESS.MESSAGE,
                data: [],
            })
        }

        // ---------- Échec : on compte la tentative ----------
        if (attempt) await attempt.update({ attemps: attempt.attemps + 1 })
        else attempt = await LoginAttempt.create({ email })

        if (attempt.attemps >= MAX_LOGIN_ATTEMPS) return tooManyAttempts(res, attempt)

        return res.status(responses.HTTP_CODES.VALIDATION_ERROR).json({
            responseCode: responses.CALL_BACK_MESSAGES.INVALID_USER_CREDENTIALS.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.INVALID_USER_CREDENTIALS.MESSAGE,
            data: [{ attemps: attempt.attemps, leftAttemps: MAX_LOGIN_ATTEMPS - attempt.attemps }],
        })
    } catch (error) {
        console.error(error)
        return res.status(responses.HTTP_CODES.SERVER_ERROR).json({
            responseCode: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.MESSAGE,
            data: [],
        })
    }
}

module.exports = signInService