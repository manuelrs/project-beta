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
    res.render("services/caregivers", {
      careGiversList: careGiversList
    });
  });
});

router.get("/services/:id", (req, res, next) => {
  const caregiverId = req.params.id;
  User.findById(caregiverId, (err, careGiver) => {
    if (err) {
      next(err);
      return;
    }
    res.render("services/profile", {
      careGiver: careGiver
    });
  });
});

router.get("/services/:id/book", ensureLoggedOut(), (req, res, next) => {
  res.render("services/book");
});

// router.post("/services/:id/book", (req, res, next) => {
//   const serviceInfo = {
//     bookedDates: req.body.bookedDate,
//     careGiver: req.body.careGiverId,
//     careTaker: req.session.currentUser._id
//   };

//   const newService = new Service(serviceInfo);

//   newService.save(err => {
//     if (err) {
//       next(err);
//       return;
//     }

//     res.redirect("/services");
//   });
// });

module.exports = router;
