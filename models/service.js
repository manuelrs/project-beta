const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceSchema = new Schema({
  careGiver: { type: Schema.Types.ObjectId, ref: "User" },
  careTaker: { type: Schema.Types.ObjectId, ref: "User" },
  bookedDates: {
    type: Array,
    default: []
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
  service: {
    type: String,
    enum: ["activity", "company", "support", "professionalCare"],
    default: "company"
  },
  price: {
    type: Number,
    default: 0
  },
  feedback: {
    type: Array,
    default: []
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  declined: {
    type: Boolean,
    default: false
  },
  logged: {
    type: Boolean,
    default: false
  },
  rated: {
    type: Boolean,
    default: false
  }
});

const Service = mongoose.model("Service", serviceSchema);

module.exports = Service;
