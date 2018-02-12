const express = require("express");
const router = express.Router();
const User = require("../models/user");
const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRounds = 14;
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");

router.get("/signup", ensureLoggedOut(), (req, res, next) => {
  res.render("auth/signup");
});

router.post("/signup", ensureLoggedOut(), (req, res, next) => {
  const username = req.body.username;
  const name = req.body.name;
  const familyName = req.body.familyName;
  const email = req.body.email;
  const password = req.body.password;
  const address = req.body.address;
  const phoneNumber = req.body.phoneNumber;
  const facebookID = req.body.facebookID;
  const role = req.body.role;
  const bookedDates = req.body.bookedDates;
  const service = req.body.service;
  const price = req.body.price;
  const mobility = req.body.mobility;
  const nationality = req.body.nationality;
  const description = req.body.description;
  const feedback = req.body.feedback;

  if (!password) {
    req.flash("error", "Password is required");
    return res.redirect("/signup");
  }

  bcrypt.genSalt(saltRounds, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) return next(err);
      const user = new User({
        username,
        name: name,
        familyName: familyName,
        email: email,
        password: hash,
        address: address,
        phoneNumber: phoneNumber,
        facebookID: facebookID,
        role: role,
        bookedDates: bookedDates,
        service: service,
        price: price,
        mobility: mobility,
        description: description,
        feedback: feedback
      });

      user.save(err => {
        if (err) {
          if (err.code === 11000) {
            req.flash(
              "error",
              `A user with username ${username} already exists`
            );
            return res.redirect("/signup");
          } else if (user.errors) {
            Object.values(user.errors).forEach(error => {
              req.flash("error", error.message);
            });
            return res.redirect("/signup");
          }
        }
        if (err) {
          return next(err);
        }
        res.redirect("/login");
      });
    });
  });
});

router.get("/login", ensureLoggedOut(), (req, res, next) => {
  res.render("auth/login");
});

router.post(
  "/login",
  ensureLoggedOut(),
  passport.authenticate("local-login", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
  })
);

router.get("/logout", ensureLoggedIn(), (req, res, next) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;
