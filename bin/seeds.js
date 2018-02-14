/*jshint esversion: 6 */
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const bcryptSalt = 14;
const User = require("../models/user");

mongoose.connect("mongodb://localhost/project-beta");
var salt = bcrypt.genSaltSync(bcryptSalt);
const password = "a";
var encryptedPass = bcrypt.hashSync(password, salt);

const admin = new User({
  username: "admin",
  name: "Manuel",
  familyName: "Rojas",
  email: "mr.manuell@gmail.com",
  password: encryptedPass,
  address: "Rue Lafayette 33, 75009 Paris",
  phoneNumber: +4917642087448,
  role: "admin"
});

User.create(admin, (err, user) => {
  if (err) {
    throw err;
  }
  console.log(user);
  mongoose.connection.close();
});
