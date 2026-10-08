const { Op } = require("sequelize");
const db = require("../../../../data/models/index.js");
const responses = require("../../../../data/responses.js");

const Candidate = db.candidates;

const EDUCATION_LEVELS = ["bac", "licence", "master", "doctorat", "autre"];
const SORTABLE_FIELDS = ["createdAt", "lastName", "firstName", "country"];

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
    const {
      search,
      country,
      educationLevel,
      sortBy = "createdAt",
      order = "DESC",
    } = req.query;

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
    if (educationLevel && !EDUCATION_LEVELS.includes(educationLevel)) {
      return invalidData(res, [
        {
          field: "educationLevel",
          message: `Valeurs possibles : ${EDUCATION_LEVELS.join(", ")}`,
        },
      ]);
    }

    // ---------- Filtres ----------
    const where = {};
    if (educationLevel) where.educationLevel = educationLevel;
    if (country && String(country).trim())
      where.country = String(country).trim();

    if (search && String(search).trim()) {
      const term = `%${String(search).trim()}%`;
      where[Op.or] = [
        { firstName: { [Op.like]: term } },
        { lastName: { [Op.like]: term } },
        { email: { [Op.like]: term } },
      ];
    }

    const { count, rows } = await Candidate.findAndCountAll({
      where,
      include: [
        {
          model: db.applications,
          as: "applications",
          attributes: ["id", "score"],
          required: false,
        },
      ],
      order: [
        [sortBy, sortOrder],
        ["id", "ASC"],
      ],
      limit,
      offset: (page - 1) * limit,
      distinct: true, // indispensable avec un include de type hasMany
    });

    const data = rows.map((candidate) => {
      const { applications, ...rest } = candidate.toJSON();
      const scores = applications.map((a) => a.score).filter((s) => s !== null);

      return {
        ...rest,
        applicationsCount: applications.length,
        bestScore: scores.length ? Math.max(...scores) : null,
      };
    });

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
