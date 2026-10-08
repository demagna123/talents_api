const constants = require("../../../../data/constants.js")
const responses = require("../../../../data/responses.js")
const validateEmail = require("../../../../utils/email.validator.js")
const verifyOtpService = require("./verifyotp.service.js")

async function verifyOtpController(req, res) {
    try {
        const { email, code } = req.body ?? {}

        if (!email || !validateEmail(email))
            return res.status(responses.HTTP_CODES.VALIDATION_ERROR).json({
                responseCode: responses.CALL_BACK_MESSAGES.INVALID_EMAIL.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.INVALID_EMAIL.MESSAGE,
                data: [],
            })

        if (!code || !new RegExp(`^\\d{${constants.LENGTHS.OTP_CODE}}$`).test(String(code)))
            return res.status(responses.HTTP_CODES.VALIDATION_ERROR).json({
                responseCode: responses.CALL_BACK_MESSAGES.INVALID_OTP_CODE.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.INVALID_OTP_CODE.MESSAGE,
                data: [],
            })

        await verifyOtpService(req, res)
    } catch (err) {
        console.error(err)
        return res.status(responses.HTTP_CODES.SERVER_ERROR).json({
            responseCode: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.MESSAGE,
            data: [],
        })
    }
}

module.exports = verifyOtpController