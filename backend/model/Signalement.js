const mongoose = require('mongoose');
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
signalementSchema.pre('save', function (next) {
  const Signalement = mongoose.model('Signalement', signalementSchema);
  const signalement = this;
  const email = signalement.author.email;
  const query = Signalement.findOne({
    'author.email': email,
    _id: { $ne: signalement._id }, // exclude current signalement being updated
  });
  query.exec(function (err, existingSignalement) {
    if (err) {
      return next(err);
    }

    if (existingSignalement) {
      const error = new Error(
        JSON.stringify({
          author: { email: ['This value already exists'] },
        })
      );
      error.statusCode = 400; // add status property with value 400
      return next(error);
    }

    next();
  });
});
signalementSchema.pre('findOneAndUpdate', function (next) {
  const Signalement = mongoose.model('Signalement', signalementSchema);
  const query = this.getQuery();
  const email = this.getUpdate().$set.author.email;
  const signalementId = this._conditions._id; // get the ID of the signalement being updated
  query['author.email'] = email;
  query._id = { $ne: signalementId }; // exclude current signalement being updated
  //query.author.email = { $set: email }; // exclude current signalement being updated */
  const update = this.getUpdate();
  Signalement.findOne(query, function (err, existingSignalement) {
    if (err) {
      return next(err);
    }
    if (existingSignalement) {
      const error = new Error(
        JSON.stringify({
          author: { email: ['This value already exists'] },
        })
      );
      error.statusCode = 400; // add status property with value 400
      return next(error);
    }
    // No existing signalement found, update the signalement

    const options = { new: true };
    const updatedSignalement = async () => {
      await Signalement.findOneAndUpdate(query, update, options);
    };

    next();
  });
});

module.exports = mongoose.model('Signalement', signalementSchema);
