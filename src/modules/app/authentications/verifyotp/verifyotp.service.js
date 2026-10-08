const bcrypt = require("bcrypt")
const responses = require("../../../../data/responses.js")
const db = require("../../../../data/models/index.js")
const { OTP_CODE_SOURCES, OTP_CODE_EXPIRY_MINUTES } = require("../../../../data/constants.js")
const { generateTokens } = require("../../../../utils/createtokens.js")

const User = db.users
const OtpCode = db.otpCodes
const History = db.histories

const MAX_OTP_ATTEMPTS = 5 // essais ratés autorisés sur un même code

function invalidCode(res) {
    return res.status(responses.HTTP_CODES.VALIDATION_ERROR).json({
        responseCode: responses.CALL_BACK_MESSAGES.INVALID_OTP_CODE.CODE,
        responseMessage: responses.CALL_BACK_MESSAGES.INVALID_OTP_CODE.MESSAGE,
        data: [],
    })
}

async function verifyOtpService(req, res) {
    try {
        const { email } = req.body
        const code = String(req.body.code)

        const otp = await OtpCode.findOne({ where: { email, source: OTP_CODE_SOURCES.SIGN_IN } })
        if (!otp) return invalidCode(res)

        // Code expiré
        const ageMinutes = (Date.now() - new Date(otp.createdAt).getTime()) / (1000 * 60)
        if (ageMinutes > OTP_CODE_EXPIRY_MINUTES) {
            await otp.destroy()
            return res.status(responses.HTTP_CODES.VALIDATION_ERROR).json({
                responseCode: responses.CALL_BACK_MESSAGES.EXPIRED_SESSION.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.EXPIRED_SESSION.MESSAGE,
                data: [],
            })
        }

        // Trop d'essais ratés : le code est détruit, il faut se reconnecter
        if (otp.attempts >= MAX_OTP_ATTEMPTS) {
            await otp.destroy()
            return invalidCode(res)
        }

        if (!(await bcrypt.compare(code, otp.code))) {
            await otp.increment("attempts")
            return invalidCode(res)
        }

        // Code bon : il ne sert qu'une fois
        await otp.destroy()

        const user = await User.findOne({ where: { email } })
        if (!user) return invalidCode(res)

        const { accessToken, refreshToken } = generateTokens({ id: user.id, role: user.role })

        await History.create({ wording: "Connexion réussie.", userId: user.id })

        return res.status(responses.HTTP_CODES.RESULT_OK).json({
            responseCode: responses.CALL_BACK_MESSAGES.SUCCESS.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.SUCCESS.MESSAGE,
            data: [
                {
                    accessToken,
                    refreshToken,
                    user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
                },
            ],
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

module.exports = verifyOtpService