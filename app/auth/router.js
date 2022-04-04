const express = require("express");
const router = express.Router();
const multer = require("multer");

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

const authController = require("../auth/controller");
passport.use(
  new LocalStrategy({ usernameField: "email" }, authController.localStrategy)
);

router.post("/register", multer().none(), authController.register);
router.post("/login", multer().none(), authController.login);
router.get("/profile", authController.profile);
router.post("/logout", authController.logout);

module.exports = router;
