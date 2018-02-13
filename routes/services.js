const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Service = require("../models/service");
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
  console.log("user" + req.user._id);
  const careTakerId = req.user._id;
  const address = req.user.address;
  const country = req.user.country;
  const zipCode = req.user.zipCode;
  const price = req.body.price;
  const service = req.body.service;
  const city = req.user.city;
  const bookedDate = req.body.bookedDate;

  console.log(price);

  const serviceInfo = {
    careGiver: caregiverId,
    careTaker: careTakerId,
    address: address,
    country: country,
    zipCode: zipCode,
    service: service,
    city: city,
    price: price
  };

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

      const newService = new Service(serviceInfo);

      newService.save(err => {
        if (err) {
          next(err);
          return;
        }
        res.render("services/confirm", {
          careGiver: updatedCareGiver
        });
      });
    }
  );
});

router.get("/dashboard", (req, res, next) => {
  let query;

  if (req.user.role === "careGiver") {
    query = { careGiver: req.user._id };
  } else {
    query = { careTaker: req.user._id };
  }

  Service.find(query)
    .populate("careGiver", "name")
    .populate("careTaker", "name")
    .sort("bookedDate")
    .exec((err, services) => {
      if (err) {
        next(err);
        return;
      }
      res.render("services/dashboard", {
        services: services,
        req: req
      });
    });
});

module.exports = router;
