const { Op } = require("sequelize");
const db = require("../../../../data/models/index.js");
const responses = require("../../../../data/responses.js");

const Program = db.programs;
const ProgramSkill = db.programskills;
const Skill = db.skills;
const Application = db.applications;

const STATUSES = ["draft", "open", "closed"];
const SORTABLE_FIELDS = ["createdAt", "title", "deadline", "startDate"];

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function invalidData(res, details = []) {
  return res.status(responses.HTTP_CODES.BAD_REQUEST).json({
    responseCode: responses.CALL_BACK_MESSAGES.INVALID_DATA.CODE,
    responseMessage: responses.CALL_BACK_MESSAGES.INVALID_DATA.MESSAGE,
    data: details,
  });
}

async function listService(req, res) {
  try {
    // Adaptez cette ligne à votre middleware d'authentification :
    // le formulaire de candidature (public) doit pouvoir lister les
    // programmes ouverts, sans voir les données internes.
    const isRecruiter = Boolean(req.user);

    const { status, search, sortBy = "createdAt", order = "DESC" } = req.query;

    // ---------- Validation des paramètres ----------
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || DEFAULT_LIMIT, 1),
      MAX_LIMIT,
    );
    const sortOrder = String(order).toUpperCase();

    if (!SORTABLE_FIELDS.includes(sortBy)) {
      return invalidData(res, [
        {
          field: "sortBy",
          message: `Valeurs possibles : ${SORTABLE_FIELDS.join(", ")}`,
        },
      ]);
    }
    if (!["ASC", "DESC"].includes(sortOrder)) {
      return invalidData(res, [{ field: "order", message: "ASC ou DESC" }]);
    }
    if (status && !STATUSES.includes(status)) {
      return invalidData(res, [
        {
          field: "status",
          message: `Valeurs possibles : ${STATUSES.join(", ")}`,
        },
      ]);
    }

    // ---------- Filtres ----------
    const where = {};
    const andConditions = [];

    if (isRecruiter) {
      if (status) where.status = status;
    } else {
      // Public : uniquement les programmes ouverts et non expirés
      where.status = "open";
      const today = new Date().toISOString().slice(0, 10);
      andConditions.push({
        [Op.or]: [{ deadline: null }, { deadline: { [Op.gte]: today } }],
      });
    }

    if (search && String(search).trim()) {
      andConditions.push({
        title: { [Op.like]: `%${String(search).trim()}%` },
      });
    }
    if (andConditions.length) where[Op.and] = andConditions;

    // ---------- Colonnes renvoyées ----------
    const publicAttributes = [
      "id",
      "title",
      "description",
      "status",
      "startDate",
      "deadline",
      "maxSeats",
       "createdAt",
    ];
    // Recruteur : toutes les colonnes (seuils compris).
    // Public : colonnes publiques seulement.
    const attributes = isRecruiter ? undefined : publicAttributes;

    // ---------- Requête ----------
    const { count, rows } = await Program.findAndCountAll({
      where,
      attributes,
      include: [
        {
          model: ProgramSkill,
          as: "programskills",
          required: false,
          attributes: ["weight", "isRequired"],
          include: [
            {
              model: Skill,
              as: "skill",
              attributes: ["id", "name", "category"],
            },
          ],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit,
      offset: (page - 1) * limit,
      distinct: true, // sinon le total est gonflé par la jointure sur les compétences
    });

    // ---------- Nombre de candidatures (recruteur seulement) ----------
    let data = rows;
    if (isRecruiter && rows.length > 0) {
      const counts = await Application.count({
        where: { programId: rows.map((p) => p.id) },
        group: ["programId"],
      });
      // counts = [{ programId: 1, count: 4 }, ...]
      const countByProgram = new Map(
        counts.map((c) => [c.programId, c.count]),
      );

      data = rows.map((program) => ({
        ...program.toJSON(),
        applicationsCount: countByProgram.get(program.id) ?? 0,
      }));
    }

    return res.status(responses.HTTP_CODES.RESULT_OK).json({
      responseCode: responses.CALL_BACK_MESSAGES.SUCCESS.CODE,
      responseMessage: responses.CALL_BACK_MESSAGES.SUCCESS.MESSAGE,
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(responses.HTTP_CODES.SERVER_ERROR).json({
      responseCode: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.CODE,
      responseMessage: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.MESSAGE,
      data: [],
    });
  }
}

module.exports = listService;