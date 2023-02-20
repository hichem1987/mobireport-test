const mongoose = require("mongoose");

const observationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const Observation = mongoose.model("Observation", observationSchema);

module.exports = Observation;
