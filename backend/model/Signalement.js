const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const authorSchema = new Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  birth_date: {
    type: Date,
    required: true,
  },
  sex: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
  },
});

const signalementSchema = new Schema({
  author: {
    type: authorSchema,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  observations: [
    {
      type: [Schema.Types.ObjectId],
      required: true,
    },
  ],
});

module.exports = mongoose.model("Signalement", signalementSchema);
