const express = require("express");
const signInController = require("./signin/signin.controller");
const multer = require("multer");
const verifyOtpController = require("./verifyotp/verifyotp.controller");
const upload = multer();
const authRouter = express.Router();


authRouter.post(`/signin`, upload.none(), signInController);
authRouter.post("/verify-otp", verifyOtpController)

// authRouter.post(`/registration`, upload.none(), registrat);


module.exports = authRouter;