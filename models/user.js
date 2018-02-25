const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  familyName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  zipCode: {
    type: Number,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  facebookID: {
    type: String,
    default: ""
  },
  role: {
    type: String,
    enum: ["careGiver", "careTaker"],
    required: true
  },
  bookedDates: {
    type: Array,
    default: []
  },
  service: {
    type: String,
    enum: ["activity", "company", "support", "professionalCare"],
    default: "company"
  },
  price: {
    type: Number,
    default: 0
  },
  mobility: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    default: ""
  },
  feedback: {
    type: Array
  },
  rating: {
    type: Array
  },
  pictures: {
    type: Array
  },
  medicament1: {
    type: String
  },
  medicament2: {
    type: String
  },
  medicament3: {
    type: String
  },
  medicament4: {
    type: String
  },
  medicament5: {
    type: String
  },
  patients: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model("User", userSchema);
