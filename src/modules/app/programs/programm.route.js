const express = require("express");
const createController = require("./create/create.controller");
const listController = require("./list/list.controller");
const { optionalAuth, requireAuth } = require("../../../middlewares/user.middleware");
const programRouter = express.Router();

programRouter.get("/", optionalAuth, listController)   // public, mais le recruteur voit tout
programRouter.post("/", requireAuth, createController)

module.exports = programRouter;