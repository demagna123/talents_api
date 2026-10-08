const express = require("express");
const listController = require("./list/list.controller");
const { requireAuth } = require("../../../middlewares/user.middleware");
const candidateRouter = express.Router();

candidateRouter.get("/", requireAuth, listController)

module.exports = candidateRouter;