const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const createError = require('http-errors');

// Connecting mongoDB
// Connecting mongoDB
const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri || 'mongodb://127.0.0.1:27017/signalementsdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((x) => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );

    // Seed observations
    seedObservations();
  })
  .catch((err) => {
    console.error('Error connecting to mongo', err.reason);
  });

// Set up express js port
const signalementRoute = require('./routes/signalement.route');

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cors());

// Setting up static directory
app.use(express.static(path.join(__dirname, 'dist/mobireport-test')));

// RESTful API root
app.use('/api', signalementRoute);

// PORT
const port = process.env.PORT || 8001;

app.listen(port, () => {
  console.log('Connected to port ' + port);
});

// Find 404 and hand over to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Index Route
app.get('/', (req, res) => {
  res.send('invaild endpoint');
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/mobireport-test/index.html'));
});

// error handler
app.use(function (err, req, res, next) {
  console.error(err.message);
  if (!err.statusCode) err.statusCode = 500;
  res.status(err.statusCode).send(err.message);
});

async function seedObservations() {
  const Observation = require('./model/Observation');
  const observations = [
    { name: 'Observation 1' },
    { name: 'Observation 2' },
    { name: 'Observation 3' },
  ];

  try {
    const existingObservations = await Observation.countDocuments();
    if (existingObservations === 0) {
      await Observation.insertMany(observations);
      console.log('Observations seeded successfully!');
    } else {
      console.log('Observations already exist, skipping seeding.');
    }
  } catch (error) {
    console.error('Error seeding observations:', error);
  }
}
