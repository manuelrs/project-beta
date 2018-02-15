const express = require("express");
const router = express.Router();
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");

router.get("/", ensureLoggedOut("/dashboard"), (req, res, next) => {
  res.render("index");
});

module.exports = router;
