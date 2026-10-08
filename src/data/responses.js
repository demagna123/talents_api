const constants = require("./constants.js");

const responses = {
  HTTP_CODES: {
    RESULT_OK: 200,
    CREATED: 201,
    ALREADY_REPORTED: 208,
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500,
    BAD_REQUEST: 400,
    CONFLICT: 409,
  },

  CALL_BACK_MESSAGES: {
    SUCCESS: {
      CODE: "0",
      MESSAGE: "Succès !",
    },
    UNKNOWN_PROBLEM: {
      CODE: "ERC-00000-24082025",
      MESSAGE:
        "Un problème d'origine inconnue est survenu lors du traitement de votre demande. réessayez !",
    },
    INVALID_NAME_LENGTH: {
      CODE: "ERC-00001-24082025",
      MESSAGE: `Les champs noms doivent doit contenir entre ${constants.LENGTHS.NAMES.MIN} et ${constants.LENGTHS.NAMES.MAX} caractères.`,
    },
    INVALID_GENDER: {
      CODE: "ERC-00002-24082025",
      MESSAGE: `Le genre est invalide. Seuls les genres Masculin et Féminin sont acceptés`,
    },
    INVALID_OTP_CODE_SOURCE: {
      CODE: "ERC-00003-24082025",
      MESSAGE: `La source du code de confirmation est invalide.`,
    },
    LOGIN_ATTEMPS_OUT_OF_BOUND: {
      CODE: "ERC-00004-24082025",
      MESSAGE: `Nombre de tentatives de connexion atteint. Patientez un moment (15 minutes) avant réessayer.`,
    },
    ALL_FIELDS_EMPTY: {
      CODE: "ERC-00005-24082025",
      MESSAGE: `Aucun champs n'a été fourni.`,
    },
    UNAUTHORIZED_USER: {
      CODE: "ERC-00006-24082025",
      MESSAGE: "Utilisateur non autorisé.",
    },
    EMAIL_IS_REQUIRED: {
      CODE: "ERC-00007-24082025",
      MESSAGE: "Le champs e-mail est requis.",
    },
    INVALID_EMAIL: {
      CODE: "ERC-00008-24082025",
      MESSAGE: "L'adresse e-mail est invalide",
    },
    INVALID_PASSWORD: {
      CODE: "ERC-00009-24082025",
      MESSAGE:
        "Le mot de passe doit contenir au moins 8 caractères, au moin un nombre, un caractère spécial, au moins une lettre.",
    },
    EMAIL_IN_USE: {
      CODE: "ERC-00010-24082025",
      MESSAGE: "L'adresse e-mail est déjà prise.",
    },
    RECORD_NOT_FOUND: {
      CODE: "ERC-00011-24082025",
      MESSAGE: "L'enregistrement n'a pas été trouvé.",
    },
    INVALID_OTP_CODE: {
      CODE: "ERC-00012-24082025",
      MESSAGE: "Code de confirmation invalide.",
    },
    EXPIRED_SESSION: {
      CODE: "ERC-000013-25082025",
      MESSAGE: "Session expirée. vous devez vous reconnecter.",
    },
    INVALID_USER_CREDENTIALS: {
      CODE: "ERC-00014-24082025",
      MESSAGE: "E-mail ou mot de passe invalide(s).",
    },
    INVALID_DESCRIPTION: {
      CODE: "ERC-00001-27082025",
      MESSAGE: `La description doit contenir au plus ${constants.LENGTHS.STRING.MAX} caractères.`,
    },
    SAME_RECORD_NAME_EXISTS: {
      CODE: "ERC-00002-27082025",
      MESSAGE: "Un enregistrement avec ce nom existe déjà.",
    },

    INVALID_PHONE_NUMBER: {
      CODE: "ERC-00001-21092025",
      MESSAGE: `Le numéro de téléphone doit être compris entre ${constants.LENGTHS.PHONE_NUMBER.MIN} et ${constants.LENGTHS.PHONE_NUMBER.MAX} caractères.`,
    },

    INVALID_GENDER: {
      CODE: "ERC-00005-21092025",
      MESSAGE: `Le genre est invalide.`,
    },

    PHONE_NUMBER_IN_USE: {
      CODE: "ERC-00007-21092025",
      MESSAGE: "Le numéro de téléphone est déjà pris.",
    },
    INVALID_DOCUMENT_TYPE: {
      CODE: "ERC-00008-21092025",
      MESSAGE: "Le type de fichier fourni est invalide.",
    },
    INVALID_DOCUMENT_TYPE_IMPORTED: {
      CODE: "ERC-00009-21092025",
      MESSAGE: "Le format de votre fichier ne correspond pas au modèle requis.",
    },
    INVALID_DOCUMENT_SIZE: {
      CODE: "ERC-0001-28092025",
      MESSAGE: `Le la taille du fichier n'est pas autorisée MAX ${constants.FILE_MAX_SIZE} Mo.`,
    },

    // CALL_BACK_MESSAGES
    INVALID_DATA: { CODE: "...", MESSAGE: "Données invalides" },
    PROGRAM_NOT_FOUND: { CODE: "...", MESSAGE: "Programme introuvable" },
    PROGRAM_CLOSED: {
      CODE: "...",
      MESSAGE: "Les candidatures sont fermées pour ce programme",
    },
    ALREADY_APPLIED: {
      CODE: "...",
      MESSAGE: "Vous avez déjà postulé à ce programme",
    },

    PROGRAM_ALREADY_EXISTS: {
      CODE: "...",
      MESSAGE: "Un programme avec ce titre existe déjà",
    },

    SKILL_ALREADY_EXISTS: {
      CODE: "...",
      MESSAGE: "Cette compétence existe déjà",
    },
    APPLICATION_NOT_FOUND: {
       CODE: "...", MESSAGE: "Candidature introuvable" 
      },
  },
};

module.exports = responses;
