const express = require("express");
const createController = require("./create/create.controller");
const listController = require("./list/list.controller");
const { requireAuth } = require("../../../middlewares/user.middleware");
const skillRouter = express.Router();

skillRouter.post("/create", requireAuth, createController)
skillRouter.get("/", listController)   // public : le formulaire de candidature en a besoin

module.exports = skillRouter;