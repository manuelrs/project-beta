const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRounds = 14;
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");

router.get("/services", (req, res, next) => {
  User.find({ role: "careGiver" }, (err, careGiversList) => {
    if (err) {
      next(err);
      return;
    }

    console.log("DEBUG careGiversList", careGiversList);
    res.render("services/caregivers", {
      careGiversList: careGiversList
    });
  });
});

module.exports = router;
