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

router.post("/search", (req, res, next) => {
  const service = req.body.service;
  const city = req.body.city;
  const bookedDate = req.body.bookedDate;
  console.log(bookedDate);
  User.find(
    { service: service, city: city, bookedDates: { $ne: bookedDate } },
    (err, careGiversList) => {
      if (err) {
        next(err);
        return;
      }
      res.render("services/caregivers", {
        careGiversList: careGiversList
      });
    }
  );
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

router.post("/services/:id/book", ensureLoggedIn(), (req, res, next) => {
  const caregiverId = req.params.id;
  const service = req.body.service;
  const city = req.body.city;
  const bookedDate = req.body.bookedDate;
  User.findByIdAndUpdate(
    caregiverId,
    {
      $push: { bookedDates: bookedDate }
    },
    (err, updatedCareGiver) => {
      if (err) {
        next(err);
        return;
      }

      res.render("services/confirm", {
        careGiver: updatedCareGiver
      });
    }
  );
});

module.exports = router;
