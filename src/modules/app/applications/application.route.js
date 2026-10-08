const express = require("express");
const createController = require("./create/create.controller");
const listController = require("./list/list.controller");
const readController = require("./read/read.controller");
const updateStatusController = require("./updateStatus/updateStatus.controller");
const { requireAuth } = require("../../../middlewares/user.middleware");
const applicationRouter = express.Router();

applicationRouter.post("/", createController)                              // public : le candidat postule
applicationRouter.get("/", requireAuth, listController)
applicationRouter.get("/:id", requireAuth, readController)
applicationRouter.patch("/:id/status", requireAuth, updateStatusController)

module.exports = applicationRouter;