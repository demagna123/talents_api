const jwt = require("jsonwebtoken");

function generateTokens(payload) {
  if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET)
    throw new Error("Ficher .env non chargé.");

  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });

  const refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });

  return { accessToken, refreshToken };
}

function refreshToken(payload) {
  if (!process.env.ACCESS_TOKEN_SECRET)
    throw new Error("Ficher .env non chargé.");

  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

  const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
    expiresIn: "10m",
  });

  return { accessToken };
}

function generatePasswordToken(payload) {
  if (!process.env.PASSWORD_TOKEN_SECRET)
    throw new Error("Ficher .env non chargé.");

  const PASSWORD_TOKEN_SECRET = process.env.PASSWORD_TOKEN_SECRET;

  const resetPasswordToken = jwt.sign(payload, PASSWORD_TOKEN_SECRET, {
    expiresIn: "5m",
  });

  const updatePasswordToken = resetPasswordToken;

  return { resetPasswordToken, updatePasswordToken };
}

module.exports = {
  generateTokens,
  refreshToken,
  generatePasswordToken,
};