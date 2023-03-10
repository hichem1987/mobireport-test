const express = require('express');
const mongoose = require('mongoose');
const app = express();
const signalementRoute = express.Router();

// Signalement model
let Signalement = require('../model/Signalement');
let Observation = require('../model/Observation');

// Add Signalement
signalementRoute.route('/add-signalement').post((req, res, next) => {
  Signalement.create(req.body, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Get all signalement
signalementRoute.route('/').get((req, res, next) => {
  Signalement.aggregate(
    [
      {
        $unwind: {
          path: '$observations',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'observations',
          localField: 'observations',
          foreignField: '_id',
          as: 'observations',
        },
      },
      {
        $group: {
          _id: '$_id',
          author: { $first: '$author' },
          description: { $first: '$description' },
          observations: { $push: '$observations' },
          __v: { $first: '$__v' },
        },
      },
    ],
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data);
      }
    }
  );
});
// Get all Observations
signalementRoute.route('/Observations').get((req, res) => {
  Observation.find((error, data) => {
    if (error) {
      return next(error);
    } else {
      res.json(data);
    }
  });
});

// Get single signalement
async function getSingleSignalement(id) {
  try {
    const signalement = await Signalement.findById(id)
      .populate('author')
      .populate('observations');
    const allObservations = await Observation.find();
    const observations = [];
    signalement.observations[0].forEach((obsSign) => {
      allObservations.forEach((obs) => {
        if (obs._id.equals(obsSign)) {
          observations.push(obs);
          return true;
        }
      });
    });
    return {
      _id: signalement._id,
      author: signalement.author,
      description: signalement.description,
      observations: observations,
      __v: signalement.__v,
    };
  } catch (error) {
    throw error;
  }
}

signalementRoute.route('/read-signalement/:id').get((req, res, next) => {
  const { id } = req.params; // extract the id parameter from the request
  getSingleSignalement(id)
    .then((signalement) => res.json(signalement))
    .catch((err) => next(err));
});

// Update signalement
signalementRoute.route('/update-signalement/:id').put((req, res, next) => {
  Signalement.findByIdAndUpdate(
    req.params.id,
    {
      $set: req.body,
    },
    (error, data) => {
      if (error) {
        return next(error);
      } else {
        res.json(data);
        console.log('Signalement successfully updated!');
      }
    }
  );
});

// Delete signalement
signalementRoute.route('/delete-signalement/:id').delete((req, res, next) => {
  Signalement.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data,
      });
    }
  });
});

module.exports = signalementRoute;
