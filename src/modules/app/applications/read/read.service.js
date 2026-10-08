const { Op } = require("sequelize")
const db = require("../../../../data/models/index.js")
const responses = require("../../../../data/responses.js")

const Application = db.applications
const Candidate = db.candidates
const Program = db.programs
const ApplicationSkill = db.applicationskills
const Skill = db.skills

async function readService(req, res) {
    try {
        const id = Number(req.params.id)
        if (!Number.isInteger(id) || id < 1) {
            return res.status(responses.HTTP_CODES.BAD_REQUEST).json({
                responseCode: responses.CALL_BACK_MESSAGES.INVALID_DATA.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.INVALID_DATA.MESSAGE,
                data: [{ field: "id", message: "Entier positif attendu" }],
            })
        }

        const application = await Application.findByPk(id, {
            include: [
                { model: Candidate, as: "candidate" },
                {
                    model: Program,
                    as: "program",
                    attributes: ["id", "title", "status", "priorityThreshold", "reviewThreshold"],
                },
                {
                    model: ApplicationSkill,
                    as: "applicationSkills",
                    attributes: ["level"],
                    include: [{ model: Skill, as: "skill", attributes: ["id", "name", "category"] }],
                },
            ],
        })

        if (!application) {
            return res.status(responses.HTTP_CODES.NOT_FOUND).json({
                responseCode: responses.CALL_BACK_MESSAGES.APPLICATION_NOT_FOUND.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.APPLICATION_NOT_FOUND.MESSAGE,
                data: [],
            })
        }

        // ---------- Rang dans le programme (même règle que le classement :
        // score décroissant, puis candidature la plus ancienne d'abord) ----------
        const totalInProgram = await Application.count({
            where: { programId: application.programId },
        })

        let rank = null
        if (application.score !== null) {
            const better = await Application.count({
                where: {
                    programId: application.programId,
                    [Op.or]: [
                        { score: { [Op.gt]: application.score } },
                        { score: application.score, createdAt: { [Op.lt]: application.createdAt } },
                    ],
                },
            })
            rank = better + 1
        }

        // ---------- Noms des compétences requises manquantes ----------
        const missingIds = application.scoreBreakdown?.skills?.missingRequired ?? []
        const missingRequiredSkills = missingIds.length
            ? await Skill.findAll({ where: { id: missingIds }, attributes: ["id", "name"] })
            : []

        return res.status(responses.HTTP_CODES.RESULT_OK).json({
            responseCode: responses.CALL_BACK_MESSAGES.SUCCESS.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.SUCCESS.MESSAGE,
            data: [{
                ...application.toJSON(),
                rank,
                totalInProgram,
                missingRequiredSkills,
            }],
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

module.exports = readService