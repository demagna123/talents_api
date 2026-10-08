const express = require("express");
const authRouter = require("./authentications/authentication.route");
const applicationRouter = require("./applications/application.route");
const candidateRouter = require("./candidates/candidate.route");
const programRouter = require("./programs/programm.route");
const skillRouter = require("./skills/skill.route");
const appRouter = express.Router();

appRouter.use("/authentication", authRouter)
appRouter.use("/applications", applicationRouter)
appRouter.use("/candidates", candidateRouter)
appRouter.use("/programs", programRouter)
appRouter.use("/skills", skillRouter)

module.exports = appRouter;