const constants = require("../../../../data/constants.js")
const responses = require("../../../../data/responses.js")
const validateEmail = require("../../../../utils/email.validator.js")
const signInService = require("./signin.service.js")

async function signInController(req, res) {
    try {

        const {
            email,
            password,
        } = req.body

        if (!email)
            return res.status(responses.HTTP_CODES.VALIDATION_ERROR).json({
                responseCode: responses.CALL_BACK_MESSAGES.EMAIL_IS_REQUIRED.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.EMAIL_IS_REQUIRED.MESSAGE,
                data: [],
            })

        if (!validateEmail(email))
            return res.status(responses.HTTP_CODES.VALIDATION_ERROR).json({
                responseCode: responses.CALL_BACK_MESSAGES.INVALID_EMAIL.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.INVALID_EMAIL.MESSAGE,
                data: [],
            })

            if (!password || password?.length < constants.LENGTHS.PASSWORD.MIN || password?.length > constants.LENGTHS.PASSWORD.MAX)
                return res.status(responses.HTTP_CODES.VALIDATION_ERROR).json({
                    responseCode: responses.CALL_BACK_MESSAGES.INVALID_PASSWORD.CODE,
                    responseMessage: responses.CALL_BACK_MESSAGES.INVALID_PASSWORD.MESSAGE,
                    data: [],
                })

        await signInService(req, res)
    } catch (err) {
        return res.status(responses.HTTP_CODES.SERVER_ERROR).json({
            responseCode: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.MESSAGE,
            data: [],
        })
    }
}

module.exports = signInController
