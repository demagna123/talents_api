const jwt = require("jsonwebtoken")
const responses = require("../data/responses.js")

// Lit le jeton "Bearer ..." et renvoie son contenu, ou null s'il est absent ou invalide
function readUser(req) {
    const [scheme, token] = (req.headers.authorization ?? "").split(" ")
    if (scheme !== "Bearer" || !token) return null
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    } catch {
        return null
    }
}

// Route publique, mais qui reconnaît le recruteur s'il est connecté (ex. GET /programs)
function optionalAuth(req, res, next) {
    req.user = readUser(req) ?? undefined
    next()
}

// Route réservée aux recruteurs connectés
function requireAuth(req, res, next) {
    const user = readUser(req)
    if (!user) {
        return res.status(responses.HTTP_CODES.UNAUTHORIZED ?? 401).json({
            responseCode: responses.CALL_BACK_MESSAGES.UNAUTHORIZED_USER.CODE,
            responseMessage: responses.CALL_BACK_MESSAGES.UNAUTHORIZED_USER.MESSAGE,
            data: [],
        })
    }
    req.user = user
    next()
}

module.exports = { optionalAuth, requireAuth }