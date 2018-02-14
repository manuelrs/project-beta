const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Service = require("../models/service");
const PatientCard = require("../models/patientCard");
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
  const careTakerId = req.user._id;
  const address = req.user.address;
  const country = req.user.country;
  const zipCode = req.user.zipCode;
  const price = req.body.price;
  const service = req.body.service;
  const city = req.user.city;
  const bookedDate = req.body.bookedDate;

  const serviceInfo = {
    careGiver: caregiverId,
    careTaker: careTakerId,
    address: address,
    country: country,
    zipCode: zipCode,
    service: service,
    city: city,
    price: price,
    bookedDates: bookedDate
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
        res.render("services/booked", {
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

router.get("/services/:id/edit", (req, res, next) => {
  const caregiverId = req.params.id;
  User.findById(caregiverId, (err, careGiver) => {
    if (err) {
      next(err);
      return;
    }
    res.render("services/edit", {
      careGiver: careGiver
    });
  });
});

router.post("/services/:id/", (req, res, next) => {
  User.findByIdAndUpdate(
    req.params.id,
    {
      username: req.body.username,
      name: req.body.name,
      familyName: req.body.familyName,
      email: req.body.email,
      address: req.body.address,
      country: req.body.country,
      city: req.body.city,
      zipCode: req.body.zipCode,
      phoneNumber: req.body.phoneNumber,
      role: req.body.role,
      service: req.body.service,
      price: req.body.price,
      mobility: req.body.mobility,
      nationality: req.body.nationality,
      description: req.body.description,
      pictures: req.body.pictures,
      medicament1: req.body.medicament1,
      medicament2: req.body.medicament2,
      medicament3: req.body.medicament3,
      medicament4: req.body.medicament4,
      medicament5: req.body.medicament5
    },
    (err, user) => {
      if (err) next(err);
      res.redirect("/services/" + req.params.id);
    }
  );
});

router.get("/services/:id/confirm", (req, res, next) => {
  const serviceId = req.params.id;
  Service.findById(serviceId)
    .populate("careGiver", "name")
    .populate("careTaker", "name")
    .exec((err, service) => {
      if (err) {
        next(err);
        return;
      }

      res.render("services/confirm", {
        service: service
      });
    });
});

router.post("/services/:id/confirm/final", (req, res, next) => {
  const serviceId = req.params.id;
  Service.findByIdAndUpdate(serviceId, { confirmed: true }, (err, service) => {
    if (err) next(err);
    res.render("services/confirmation");
  });
});

router.get("/services/:id/decline", (req, res, next) => {
  const serviceId = req.params.id;
  Service.findById(serviceId)
    .populate("careGiver", "name")
    .populate("careTaker", "name")
    .exec((err, service) => {
      if (err) {
        next(err);
        return;
      }

      res.render("services/decline", {
        service: service
      });
    });
});

router.post("/services/:id/decline/final", (req, res, next) => {
  const serviceId = req.params.id;
  Service.findByIdAndUpdate(serviceId, { declined: true }, (err, service) => {
    if (err) next(err);
    res.render("services/declined");
  });
});

router.get("/services/:id/complete", (req, res, next) => {
  const serviceId = req.params.id;
  Service.findById(serviceId, (err, service) => {
    if (err) next(err);
    User.findById(service.careTaker, (err, careTaker) => {
      if (err) next(err);
      res.render("services/complete", {
        careTaker: careTaker,
        service: service
      });
    });
  });
});

router.post("/services/:id/complete", (req, res, next) => {
  Service.findById(req.params.id, (err, service) => {
    if (err) next(err);
    PatientCard.find({ careTakerId: service.careTaker }, (err, patientCard) => {
      if (err) next(err);
      PatientCard.findByIdAndUpdate(
        patientCard[0]._id,
        {
          $push: {
            patientInfo: {
              heartRate: req.body.heartRate,
              oxigenation: req.body.oxigenation,
              mood: req.body.mood,
              medicament1: req.body.medicament1,
              medicament2: req.body.medicament2,
              medicament3: req.body.medicament3,
              medicament4: req.body.medicament4,
              medicament5: req.body.medicament5,
              comments: req.body.comments
            }
          }
        },
        (err, patientCard) => {
          if (err) next(err);
          Service.findByIdAndUpdate(
            req.params.id,
            { logged: true },
            (err, service) => {
              if (err) next(err);
              res.render("/dashboard/");
            }
          );
        }
      );
    });
  });
});

router.get("/services/:id/history", ensureLoggedIn(), (req, res, next) => {
  PatientCard.find({ careTakerId: req.params.id }, (err, patientCard) => {
    if (err) next(err);
    res.render("services/history", { patientCard: patientCard[0] });
  });
});

module.exports = router;
