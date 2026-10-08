const db = require("../../../../data/models/index.js")
const responses = require("../../../../data/responses.js")

const Application = db.applications

const STATUSES = ["new", "under_review", "shortlisted", "rejected", "accepted"]

async function updateStatusService(req, res) {
    try {
        const id = Number(req.params.id)
        const { status } = req.body ?? {}

        // ---------- Validation ----------
        const errors = []
        if (!Number.isInteger(id) || id < 1) {
            errors.push({ field: "id", message: "Entier positif attendu" })
        }
        if (!STATUSES.includes(status)) {
            errors.push({ field: "status", message: `Valeurs possibles : ${STATUSES.join(", ")}` })
        }
        if (errors.length) {
            return res.status(responses.HTTP_CODES.BAD_REQUEST).json({
                responseCode: responses.CALL_BACK_MESSAGES.INVALID_DATA.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.INVALID_DATA.MESSAGE,
                data: errors,
            })
        }

        // ---------- Mise à jour ----------
        const application = await Application.findByPk(id)
        if (!application) {
            return res.status(responses.HTTP_CODES.NOT_FOUND).json({
                responseCode: responses.CALL_BACK_MESSAGES.APPLICATION_NOT_FOUND.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.APPLICATION_NOT_FOUND.MESSAGE,
                data: [],
            })
        }

        await application.update({ status })

        return res.status(responses.HTTP_CODES.RESULT_OK).json({
            responseCode: responses.CALL_BACK_MESSAGES.SUCCESS.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.SUCCESS.MESSAGE,
            data: [{ id: application.id, status: application.status }],
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

module.exports = updateStatusService