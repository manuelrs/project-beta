const express = require("express");
const router = express.Router();
const User = require("../models/user");
const Service = require("../models/service");
const PatientCard = require("../models/patientCard");
const passport = require("passport");
const bcrypt = require("bcrypt");
const saltRounds = 14;
const { ensureLoggedIn, ensureLoggedOut } = require("connect-ensure-login");
const moment = require("moment");

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
    {
      role: "careGiver",
      service: service,
      city: city,
      bookedDates: { $ne: bookedDate }
    },
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
      const careGiverName = updatedCareGiver.name;
      User.findById(careTakerId, (err, careTaker) => {
        if (err) return next(err);
        const careTakerName = careTaker.name;

        const serviceInfo = {
          careGiver: caregiverId,
          careTaker: careTakerId,
          address: address,
          country: country,
          zipCode: zipCode,
          service: service,
          city: city,
          price: price,
          bookedDates: bookedDate,
          careTakerName: careTakerName,
          careGiverName: careGiverName
        };

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
      User.find({}, (err, users) => {
        if (err) next(err);
        res.render("services/dashboard", {
          services: services,
          req: req,
          moment: moment,
          users: users
        });
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
      User.findById(service.careTaker, (err, careTaker) => {
        if (err) next(err);
        res.render("services/confirm", {
          service: service,
          careTaker: careTaker,
          moment: moment
        });
      });
    });
});

router.post("/services/:id/confirm/final", (req, res, next) => {
  const serviceId = req.params.id;
  Service.findByIdAndUpdate(serviceId, { confirmed: true }, (err, service) => {
    if (err) next(err);
    User.findByIdAndUpdate(
      service.careGiver,
      {
        $push: { patients: service.careTaker }
      },
      (err, user) => {
        if (err) next(err);
        res.render("services/confirmation", { message: "your confirmation." });
      }
    );
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
        service: service,
        moment: moment
      });
    });
  });
});

router.post("/services/:id/complete", (req, res, next) => {
  Service.findById(req.params.id, (err, service) => {
    if (err) next(err);
    User.findById(service.careGiver, (err, careGiver) => {
      if (err) next(err);
      PatientCard.find(
        { careTakerId: service.careTaker },
        (err, patientCard) => {
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
                  comments: req.body.comments,
                  careGiver: careGiver.name,
                  careGiverPictures: careGiver.pictures,
                  date: Date.now()
                },
                heartRateArray: req.body.heartRate,
                oxigenationArray: req.body.oxigenation
              },
              $set: {
                completed: true
              }
            },
            (err, patientCard) => {
              if (err) next(err);
              Service.findByIdAndUpdate(
                req.params.id,
                { logged: true },
                (err, service) => {
                  if (err) {
                    next(err);
                  }
                  res.render("services/confirmation", {
                    message: "updating the patient's info."
                  });
                }
              );
            }
          );
        }
      );
    });
  });
});

router.get("/services/:id/rate", (req, res, next) => {
  Service.findById(req.params.id, (err, service) => {
    if (err) next(err);
    User.findById(service.careGiver, (err, careGiver) => {
      if (err) next(err);
      res.render("services/rate", {
        service: service,
        careGiver: careGiver
      });
    });
  });
});

router.post("/services/:id/rate", (req, res, next) => {
  const serviceId = req.params.id;
  const comment = req.body.comment;
  const rating = req.body.rating;
  const careTakerName = req.user.name;
  const careTakerPicture = req.user.pictures[0];
  Service.findByIdAndUpdate(
    serviceId,
    { $set: { rated: true } },
    (err, service) => {
      if (err) next(err);
      User.findByIdAndUpdate(
        service.careGiver,
        {
          $push: {
            feedback: {
              comment: comment,
              rating: rating,
              date: Date.now(),
              careTaker: careTakerName,
              careTakerPicture: careTakerPicture
            }
          }
        },
        (err, careGiver) => {
          if (err) next(err);
          res.render("services/confirmation", {
            message: "for your feedback."
          });
        }
      );
    }
  );
});

router.post("/services/:id/skip", (req, res, next) => {
  const serviceId = req.params.id;
  Service.findByIdAndUpdate(
    serviceId,
    { $set: { rated: true } },
    (err, service) => {
      if (err) next(err);
      res.redirect("/dashboard");
    }
  );
});

router.get("/services/:id/history", ensureLoggedIn(), (req, res, next) => {
  PatientCard.find({ careTakerId: req.params.id }, (err, patientCard) => {
    if (err) next(err);
    res.render("services/history", {
      patientCard: patientCard,
      moment: moment
    });
  });
});

module.exports = router;
