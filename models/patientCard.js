const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const patientCardSchema = new Schema({
  careTaker: { type: Schema.Types.ObjectId, ref: "User" },
  service: { type: Schema.Types.ObjectId, ref: "Service" },
  patientInfo: { type: Array },
  heartRate: {
    type: String
  },
  oxigenation: {
    type: String
  },
  mood: {
    type: String
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
  comments: {
    type: String
  },
  careTakerId: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  heartRateArray: {
    type: Array
  },
  oxigenationArray: {
    type: Array
  },
  careTakerName: {
    type: String
  },
  careGiverName: {
    type: String
  }
});

module.exports = mongoose.model("PatientCard", patientCardSchema);
