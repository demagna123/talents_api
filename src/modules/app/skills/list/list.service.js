const { Op } = require("sequelize");
const db = require("../../../../data/models/index.js");
const responses = require("../../../../data/responses.js");

const Skill = db.skills;

const CATEGORIES = ["frontend", "backend", "database", "tools", "other"];

async function listService(req, res) {
  try {
    const { category, search } = req.query;

    // ---------- Validation ----------
    if (category && !CATEGORIES.includes(category)) {
      return res.status(responses.HTTP_CODES.BAD_REQUEST).json({
        responseCode: responses.CALL_BACK_MESSAGES.INVALID_DATA.CODE,
        responseMessage: responses.CALL_BACK_MESSAGES.INVALID_DATA.MESSAGE,
        data: [
          {
            field: "category",
            message: `Valeurs possibles : ${CATEGORIES.join(", ")}`,
          },
        ],
      });
    }

    // ---------- Filtres ----------
    const where = {};
    if (category) where.category = category;
    if (search && String(search).trim()) {
      where.name = { [Op.like]: `%${String(search).trim()}%` };
    }

    // ---------- Requête ----------
    const skills = await Skill.findAll({
      where,
      attributes: ["id", "name", "category"],
      order: [
        ["category", "ASC"],
        ["name", "ASC"],
      ],
    });

    return res.status(responses.HTTP_CODES.RESULT_OK).json({
      responseCode: responses.CALL_BACK_MESSAGES.SUCCESS.CODE,
      responseMessage: responses.CALL_BACK_MESSAGES.SUCCESS.MESSAGE,
      data: skills,
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
