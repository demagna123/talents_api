const { Op } = require("sequelize")
const db = require("../../../../data/models/index.js")
const responses = require("../../../../data/responses.js")

const Application = db.applications
const Candidate = db.candidates
const Program = db.programs

// Valeurs autorisées (doivent correspondre aux ENUM du modèle Application)
const STATUSES = ["new", "under_review", "shortlisted", "rejected", "accepted"]
const PRIORITY_LEVELS = ["priority", "to_review", "low"]
const SORTABLE_FIELDS = ["score", "createdAt", "yearsOfExperience", "projectsCount"]

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

function invalidData(res, details = []) {
    return res.status(responses.HTTP_CODES.BAD_REQUEST).json({
        responseCode: responses.CALL_BACK_MESSAGES.INVALID_DATA.CODE,
        responseMessage: responses.CALL_BACK_MESSAGES.INVALID_DATA.MESSAGE,
        data: details,
    })
}

async function listService(req, res) {
    try {
        const {
            programId,
            status,
            priorityLevel,
            minScore,
            search,
            sortBy = "score",
            order = "DESC",
        } = req.query

        // ---------- Validation des paramètres ----------
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
        const limit = Math.min(
            Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1),
            MAX_LIMIT
        )
        const sortOrder = String(order).toUpperCase()

        if (!SORTABLE_FIELDS.includes(sortBy)) {
            return invalidData(res, [{ field: "sortBy", message: `Valeurs possibles : ${SORTABLE_FIELDS.join(", ")}` }])
        }
        if (!["ASC", "DESC"].includes(sortOrder)) {
            return invalidData(res, [{ field: "order", message: "ASC ou DESC" }])
        }
        if (status && !STATUSES.includes(status)) {
            return invalidData(res, [{ field: "status", message: `Valeurs possibles : ${STATUSES.join(", ")}` }])
        }
        if (priorityLevel && !PRIORITY_LEVELS.includes(priorityLevel)) {
            return invalidData(res, [{ field: "priorityLevel", message: `Valeurs possibles : ${PRIORITY_LEVELS.join(", ")}` }])
        }
        if (programId && !Number.isInteger(Number(programId))) {
            return invalidData(res, [{ field: "programId", message: "Entier attendu" }])
        }
        if (minScore !== undefined && Number.isNaN(Number(minScore))) {
            return invalidData(res, [{ field: "minScore", message: "Nombre attendu" }])
        }

        // ---------- Filtres sur la candidature ----------
        const where = {}
        if (programId) where.programId = Number(programId)
        if (status) where.status = status
        if (priorityLevel) where.priorityLevel = priorityLevel
        if (minScore !== undefined) where.score = { [Op.gte]: Number(minScore) }

        // ---------- Recherche sur le candidat (nom, prénom, email) ----------
        const candidateInclude = {
            model: Candidate,
            as: "candidate",
            attributes: [
                "id", "firstName", "lastName", "email",
                "country", "city", "educationLevel", "githubUrl", "portfolioUrl",
            ],
        }
        if (search && String(search).trim()) {
            const term = `%${String(search).trim()}%`
            candidateInclude.required = true
            candidateInclude.where = {
                [Op.or]: [
                    { firstName: { [Op.like]: term } },
                    { lastName: { [Op.like]: term } },
                    { email: { [Op.like]: term } },
                ],
            }
        }

        // ---------- Tri : le critère demandé, puis les plus anciennes d'abord ----------
        const orderBy = [[sortBy, sortOrder]]
        if (sortBy !== "createdAt") orderBy.push(["createdAt", "ASC"])

        // ---------- Requête ----------
        const { count, rows } = await Application.findAndCountAll({
            where,
            attributes: [
                "id", "status", "score", "priorityLevel", "availability",
                "yearsOfExperience", "projectsCount", "createdAt",
            ],
            include: [
                candidateInclude,
                { model: Program, as: "program", attributes: ["id", "title"] },
            ],
            order: orderBy,
            limit,
            offset: (page - 1) * limit,
        })

        return res.status(responses.HTTP_CODES.RESULT_OK).json({
            responseCode: responses.CALL_BACK_MESSAGES.SUCCESS.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.SUCCESS.MESSAGE,
            data: rows,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
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

module.exports = listService