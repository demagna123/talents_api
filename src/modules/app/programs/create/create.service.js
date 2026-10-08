const db = require("../../../../data/models/index.js")
const responses = require("../../../../data/responses.js")

const Program = db.programs
const Skill = db.skills
const ProgramSkill = db.programskills

const STATUSES = ["draft", "open", "closed"]
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

// Erreur métier : porte la clé de réponse à renvoyer
class BusinessError extends Error {
    constructor(httpCode, callback, details = []) {
        super(callback.MESSAGE)
        this.httpCode = httpCode
        this.callback = callback
        this.details = details
    }
}

function invalid(field, message) {
    return new BusinessError(
        responses.HTTP_CODES.BAD_REQUEST,
        responses.CALL_BACK_MESSAGES.INVALID_DATA,
        [{ field, message }]
    )
}

function isValidDate(value) {
    return DATE_REGEX.test(value) && !Number.isNaN(new Date(value).getTime())
}

async function createService(req, res) {
    try {
        const {
            title,
            description,
            status = "draft",
            startDate,
            deadline,
            maxSeats,
            priorityThreshold = 70,
            reviewThreshold = 40,
            skills = [],
        } = req.body

        // ---------- Validation ----------
        if (!title || !String(title).trim()) {
            throw invalid("title", "Le titre est obligatoire")
        }
        if (!STATUSES.includes(status)) {
            throw invalid("status", `Valeurs possibles : ${STATUSES.join(", ")}`)
        }
        if (startDate && !isValidDate(startDate)) {
            throw invalid("startDate", "Format attendu : AAAA-MM-JJ")
        }
        if (deadline && !isValidDate(deadline)) {
            throw invalid("deadline", "Format attendu : AAAA-MM-JJ")
        }
        if (startDate && deadline && new Date(deadline) > new Date(startDate)) {
            throw invalid("deadline", "La date limite doit précéder la date de début")
        }
        if (maxSeats !== undefined && maxSeats !== null &&
            (!Number.isInteger(maxSeats) || maxSeats < 1)) {
            throw invalid("maxSeats", "Entier supérieur ou égal à 1 attendu")
        }
        for (const [field, value] of [
            ["priorityThreshold", priorityThreshold],
            ["reviewThreshold", reviewThreshold],
        ]) {
            if (!Number.isInteger(value) || value < 0 || value > 100) {
                throw invalid(field, "Entier entre 0 et 100 attendu")
            }
        }
        if (reviewThreshold >= priorityThreshold) {
            throw invalid("reviewThreshold", "Doit être inférieur à priorityThreshold")
        }

        // Compétences attendues : [{ skillId, weight, isRequired }]
        if (!Array.isArray(skills)) {
            throw invalid("skills", "Tableau attendu")
        }
        const skillsMap = new Map()
        for (const s of skills) {
            const skillId = Number(s.skillId)
            const weight = s.weight === undefined ? 1 : s.weight
            if (!Number.isInteger(skillId)) {
                throw invalid("skills", "skillId invalide")
            }
            if (!Number.isInteger(weight) || weight < 1 || weight > 5) {
                throw invalid("skills", "weight doit être un entier entre 1 et 5")
            }
            skillsMap.set(skillId, { skillId, weight, isRequired: s.isRequired === true })
        }
        const uniqueSkills = [...skillsMap.values()]

        // ---------- Création (transaction : programme + compétences) ----------
        const program = await db.sequelize.transaction(async (t) => {
            const exists = await Program.findOne({
                where: { title: String(title).trim() },
                transaction: t,
            })
            if (exists) {
                throw new BusinessError(
                    responses.HTTP_CODES.CONFLICT,
                    responses.CALL_BACK_MESSAGES.PROGRAM_ALREADY_EXISTS
                )
            }

            if (uniqueSkills.length) {
                const ids = uniqueSkills.map((s) => s.skillId)
                const found = await Skill.count({ where: { id: ids }, transaction: t })
                if (found !== ids.length) {
                    throw invalid("skills", "Une ou plusieurs compétences n'existent pas")
                }
            }

            const newProgram = await Program.create(
                {
                    title: String(title).trim(),
                    description,
                    status,
                    startDate,
                    deadline,
                    maxSeats,
                    priorityThreshold,
                    reviewThreshold,
                },
                { transaction: t }
            )

            if (uniqueSkills.length) {
                await ProgramSkill.bulkCreate(
                    uniqueSkills.map((s) => ({ ...s, programId: newProgram.id })),
                    { transaction: t }
                )
            }

            return newProgram
        })

        return res.status(responses.HTTP_CODES.RESULT_OK).json({
            responseCode: responses.CALL_BACK_MESSAGES.SUCCESS.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.SUCCESS.MESSAGE,
            data: [program],
        })

    } catch (error) {
        if (error instanceof BusinessError) {
            return res.status(error.httpCode).json({
                responseCode: error.callback.CODE,
                responseMessage: error.callback.MESSAGE,
                data: error.details,
            })
        }

        if (error.name === "SequelizeValidationError") {
            return res.status(responses.HTTP_CODES.BAD_REQUEST).json({
                responseCode: responses.CALL_BACK_MESSAGES.INVALID_DATA.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.INVALID_DATA.MESSAGE,
                data: error.errors.map((e) => ({ field: e.path, message: e.message })),
            })
        }

        // Titre déjà pris (deux requêtes simultanées)
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(responses.HTTP_CODES.CONFLICT).json({
                responseCode: responses.CALL_BACK_MESSAGES.PROGRAM_ALREADY_EXISTS.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.PROGRAM_ALREADY_EXISTS.MESSAGE,
                data: [],
            })
        }

        console.error(error)
        return res.status(responses.HTTP_CODES.SERVER_ERROR).json({
            responseCode: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.MESSAGE,
            data: [],
        })
    }
}

module.exports = createService