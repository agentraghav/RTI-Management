const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
require('dotenv').config();

const admin = require('./routes/admin');

const app = express();

app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(bodyParser.json());

app.use(express.json());
app.use(cors());

mongoose.connect(
  process.env.MONGOOSE_CONNECTION_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (err) => {
    if (err) {
      return console.error(err);
    }
    console.log('MONGODB CONNECTION ESTABILSHED');
  }
);

app.use(passport.initialize());
require('./config/passport')(passport);

app.use('/api/admin', admin);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server connected on PORT ${PORT}`));
