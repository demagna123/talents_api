const constants = {
  ACCESS_TOKEN_EXPIRY: 20 * 60 * 1000,
  REFRESH_TOKEN_EXPIRY: 24 * 60 * 60 * 1000,
  ACCESS_TOKEN_NAME: "accessToken",

  MAX_LOGIN_ATTEMPS: 5,
  MAX_LOGIN_ATTEMPS_MINUTES: 15,

  LENGTHS: {
    STRING: {
      MIN: 2,
      MAX: 255,
    },
    NAMES: {
      MIN: 2,
      MAX: 64,
    },
    OTP_CODE: 6,
    PASSWORD: {
      MIN: 8,
      MAX: 64,
    },
    PHONE_NUMBER: {
      MIN: 6,
      MAX: 32,
    },
    OTP_CODE: 6,
  },

  OTP_CODE_EXPIRY_MINUTES: 5,
  OTP_CODE_SOURCES: {
    REGISTRATION: "registration",
    SIGN_IN: "sign-in",
    FORGOTTEN_PASSWORD: "forgotten-password",
    RESET_PASSWORD: "reset-password",
  },
};

module.exports = constants;