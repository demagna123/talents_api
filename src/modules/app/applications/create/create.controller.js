const responses = require("../../../../data/responses.js")
const createService = require("./create.service.js")


async function createController(req, res) {
    try {

       await createService(req,res)

        return res.status(responses.HTTP_CODES.RESULT_OK).json({
            responseCode: responses.CALL_BACK_MESSAGES.SUCCESS.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.SUCCESS.MESSAGE,
            data: [],
        })

    } catch (error) {  
        console.log(error)      
        return res.status(responses.HTTP_CODES.SERVER_ERROR).json({
            responseCode: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.MESSAGE,
            data: [],
        })
    }
}

module.exports = createController
