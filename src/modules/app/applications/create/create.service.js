const db = require("../../../../data/models/index.js")
const responses = require("../../../../data/responses.js")
const { calculateScore } = require("../../../../services/scoring.service.js")

const Candidate = db.candidates
const Program = db.programs
const Skill = db.skills
const Application = db.applications
const ApplicationSkill = db.applicationskills
const ProgramSkill = db.programskills


// Erreur métier : porte la clé de réponse à renvoyer
class BusinessError extends Error {
    constructor(httpCode, callback) {
        super(callback.MESSAGE)
        this.httpCode = httpCode
        this.callback = callback
    }
}

// Champs autorisés (on ne prend JAMAIS score, status, priorityLevel du client)
const CANDIDATE_FIELDS = [
    "firstName", "lastName", "email", "phone", "country", "city",
    "educationLevel", "fieldOfStudy", "githubUrl", "portfolioUrl",
]

function pick(source, fields) {
    const result = {}
    for (const field of fields) {
        if (source[field] !== undefined) result[field] = source[field]
    }
    return result
}

async function createService(req, res) {
    try {
        const { programId, candidate: candidateInput, skills = [] } = req.body

        // 0. Présence des données essentielles
        if (!programId || !candidateInput || !candidateInput.email) {
            throw new BusinessError(
                responses.HTTP_CODES.BAD_REQUEST,
                responses.CALL_BACK_MESSAGES.INVALID_DATA
            )
        }
        if (!Array.isArray(skills)) {
            throw new BusinessError(
                responses.HTTP_CODES.BAD_REQUEST,
                responses.CALL_BACK_MESSAGES.INVALID_DATA
            )
        }

        const candidateData = pick(candidateInput, CANDIDATE_FIELDS)
        candidateData.email = String(candidateData.email).trim().toLowerCase()

        const applicationData = {
            motivation: req.body.motivation,
            availability: req.body.availability,
            yearsOfExperience: req.body.yearsOfExperience,
            projectsCount: req.body.projectsCount,
        }

        // Compétences sans doublon : [{ skillId, level }]
        const uniqueSkills = [
            ...new Map(skills.map((s) => [Number(s.skillId), s])).values(),
        ]

        const application = await db.sequelize.transaction(async (t) => {
            // 1. Le programme existe et accepte les candidatures
            const program = await Program.findByPk(programId, { transaction: t })
            if (!program) {
                throw new BusinessError(
                    responses.HTTP_CODES.NOT_FOUND,
                    responses.CALL_BACK_MESSAGES.PROGRAM_NOT_FOUND
                )
            }

            const deadlinePassed =
                program.deadline && new Date(program.deadline) < new Date()
            if (program.status !== "open" || deadlinePassed) {
                throw new BusinessError(
                    responses.HTTP_CODES.BAD_REQUEST,
                    responses.CALL_BACK_MESSAGES.PROGRAM_CLOSED
                )
            }

            // 2. Les compétences envoyées existent bien
            if (uniqueSkills.length) {
                const ids = uniqueSkills.map((s) => Number(s.skillId))
                const found = await Skill.count({
                    where: { id: ids },
                    transaction: t,
                })
                if (found !== ids.length) {
                    throw new BusinessError(
                        responses.HTTP_CODES.BAD_REQUEST,
                        responses.CALL_BACK_MESSAGES.INVALID_DATA
                    )
                }
            }

            // 3. Candidat : trouvé par email, sinon créé
            const [candidate, created] = await Candidate.findOrCreate({
                where: { email: candidateData.email },
                defaults: candidateData,
                transaction: t,
            })
            if (!created) {
                await candidate.update(candidateData, { transaction: t })
            }

            // 4. Doublon : déjà postulé à ce programme ?
            const existing = await Application.findOne({
                where: { candidateId: candidate.id, programId: program.id },
                transaction: t,
            })
            if (existing) {
                throw new BusinessError(
                    responses.HTTP_CODES.CONFLICT,
                    responses.CALL_BACK_MESSAGES.ALREADY_APPLIED
                )
            }

            // 5. Candidature
            const newApplication = await Application.create(
                {
                    ...applicationData,
                    candidateId: candidate.id,
                    programId: program.id,
                },
                { transaction: t }
            )

            // 6. Compétences déclarées
            if (uniqueSkills.length) {
                await ApplicationSkill.bulkCreate(
                    uniqueSkills.map((s) => ({
                        applicationId: newApplication.id,
                        skillId: Number(s.skillId),
                        level: s.level,
                    })),
                    { transaction: t, validate: true }
                )
            }

            // 7. Scoring
            const programSkills = await ProgramSkill.findAll({
                where: { programId: program.id },
                raw: true,
                transaction: t,
            })

            const result = calculateScore({
                application: newApplication,
                candidate,
                skills: uniqueSkills,
                programSkills,
                program,
            })

            await newApplication.update(
                {
                    score: result.total,
                    priorityLevel: result.level,
                    scoreBreakdown: result.breakdown,
                },
                { transaction: t }
            )

            return newApplication
        })

        return res.status(responses.HTTP_CODES.RESULT_OK).json({
            responseCode: responses.CALL_BACK_MESSAGES.SUCCESS.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.SUCCESS.MESSAGE,
            data: [{ id: application.id, status: application.status }],
        })

    } catch (error) {
        // Erreurs métier prévues
        if (error instanceof BusinessError) {
            return res.status(error.httpCode).json({
                responseCode: error.callback.CODE,
                responseMessage: error.callback.MESSAGE,
                data: [],
            })
        }

        // Données refusées par les validations Sequelize
        if (error.name === "SequelizeValidationError") {
            return res.status(responses.HTTP_CODES.BAD_REQUEST).json({
                responseCode: responses.CALL_BACK_MESSAGES.INVALID_DATA.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.INVALID_DATA.MESSAGE,
                data: error.errors.map((e) => ({ field: e.path, message: e.message })),
            })
        }

        // Doublon détecté par l'index unique (cas de deux requêtes simultanées)
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(responses.HTTP_CODES.CONFLICT).json({
                responseCode: responses.CALL_BACK_MESSAGES.ALREADY_APPLIED.CODE,
                responseMessage: responses.CALL_BACK_MESSAGES.ALREADY_APPLIED.MESSAGE,
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