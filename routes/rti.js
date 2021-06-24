const express = require('express');
const router = express.Router();
const multer = require('multer');
const Rti = require('../models/Rti');
const { v4: uuidv4 } = require('uuid');
let path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public');
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
});

const upl = (req, res) => {
  const college = req.body.college;
  const name = req.body.name;
  const gender = req.body.gender;
  const address = req.body.address;
  const pincode = req.body.pincode;
  const country = req.body.country;
  const state = req.body.state;
  const phone = req.body.phone;
  const email = req.body.email;
  const text = req.body.text;
  const file_data = req.file.filename;

  const newRtiData = {
    college,
    name,
    gender,
    address,
    pincode,
    country,
    state,
    phone,
    email,
    text,
    file_data,
  };

  const newRti = new Rti(newRtiData);

  newRti
    .save()
    .then(() => res.json('Rti Added'))
    .catch((err) => res.status(400).json('Error: ' + err));
};

router.post('/upload', upload.single('file_data'), upl);

module.exports = router;
