const db = require("../../../../data/models/index.js");
const responses = require("../../../../data/responses.js");

const Skill = db.skills;

const CATEGORIES = ["frontend", "backend", "database", "tools", "other"];

function invalidData(res, details = []) {
  return res.status(responses.HTTP_CODES.BAD_REQUEST).json({
    responseCode: responses.CALL_BACK_MESSAGES.INVALID_DATA.CODE,
    responseMessage: responses.CALL_BACK_MESSAGES.INVALID_DATA.MESSAGE,
    data: details,
  });
}

async function createService(req, res) {
  try {
    const { name, category = "other" } = req.body;

    // ---------- Validation ----------
    if (!name || !String(name).trim()) {
      return invalidData(res, [
        { field: "name", message: "Le nom est obligatoire" },
      ]);
    }
    if (String(name).trim().length > 100) {
      return invalidData(res, [
        { field: "name", message: "100 caractères maximum" },
      ]);
    }
    if (!CATEGORIES.includes(category)) {
      return invalidData(res, [
        {
          field: "category",
          message: `Valeurs possibles : ${CATEGORIES.join(", ")}`,
        },
      ]);
    }

    // ---------- Doublon ----------
    const cleanName = String(name).trim();
    const exists = await Skill.findOne({ where: { name: cleanName } });
    if (exists) {
      return res.status(responses.HTTP_CODES.CONFLICT).json({
        responseCode: responses.CALL_BACK_MESSAGES.SKILL_ALREADY_EXISTS.CODE,
        responseMessage:
          responses.CALL_BACK_MESSAGES.SKILL_ALREADY_EXISTS.MESSAGE,
        data: [],
      });
    }

    // ---------- Création ----------
    const skill = await Skill.create({ name: cleanName, category });

    return res.status(responses.HTTP_CODES.RESULT_OK).json({
      responseCode: responses.CALL_BACK_MESSAGES.SUCCESS.CODE,
      responseMessage: responses.CALL_BACK_MESSAGES.SUCCESS.MESSAGE,
      data: [skill],
    });
  } catch (error) {
    // Doublon détecté par l'index unique (deux requêtes simultanées)
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(responses.HTTP_CODES.CONFLICT).json({
        responseCode: responses.CALL_BACK_MESSAGES.SKILL_ALREADY_EXISTS.CODE,
        responseMessage:
          responses.CALL_BACK_MESSAGES.SKILL_ALREADY_EXISTS.MESSAGE,
        data: [],
      });
    }

    console.error(error);
    return res.status(responses.HTTP_CODES.SERVER_ERROR).json({
      responseCode: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.CODE,
      responseMessage: responses.CALL_BACK_MESSAGES.UNKNOWN_PROBLEM.MESSAGE,
      data: [],
    });
  }
}

module.exports = createService;
