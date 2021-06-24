const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
let path = require('path');

const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');
const Admin = require('../models/Admin');
const Rti = require('../models/Rti');
const Answer = require('../models/Answer');

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

router.post('/register', (req, res) => {
  // Form validation
  const { errors, isValid } = validateRegisterInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  Admin.findOne({ email: req.body.email }).then((admin) => {
    if (admin) {
      return res.status(400).json({ email: 'Email already exists' });
    } else {
      const newAdmin = new Admin({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone,
      });
      // Hash password before saving in database
      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newAdmin.password, salt, (err, hash) => {
          if (err) throw err;
          newAdmin.password = hash;
          newAdmin
            .save()
            .then((admin) => res.json(admin))
            .catch((err) => console.log(err));
        });
      });
    }
  });
});

router.post('/login', (req, res) => {
  // Form validation
  const { errors, isValid } = validateLoginInput(req.body);
  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }
  const email = req.body.email;
  const password = req.body.password;
  // Find user by email
  Admin.findOne({ email }).then((admin) => {
    // Check if user exists
    if (!admin) {
      return res.status(404).json({ emailnotfound: 'Email not found' });
    }
    // Check password
    bcrypt.compare(password, admin.password).then((isMatch) => {
      if (isMatch) {
        // User matched
        // Create JWT Payload
        const payload = {
          id: admin.id,
          name: admin.name,
        };
        // Sign token
        jwt.sign(
          payload,
          process.env.SECRET,
          {
            expiresIn: 31556926, // 1 year in seconds
          },
          (err, token) => {
            res.json({
              success: true,
              token: 'Bearer ' + token,
            });
          }
        );
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: 'Password incorrect' });
      }
    });
  });
});

router.get('/pending/:college', async (req, res) => {
  try {
    const rti = await Rti.find({ college: req.params.college });
    if (rti.length === 0) {
      return res.status(400).json({ message: 'No Pending RTI' });
    }
    const pending = rti.filter(function (user) {
      return user.status === 0;
    });
    return res.json(pending);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.get('/answered/:college', async (req, res) => {
  try {
    const rti = await Rti.find({ college: req.params.college });
    if (rti.length === 0) {
      return res.status(400).json({ message: 'No Pending RTI' });
    }
    const pending = rti.filter(function (user) {
      return user.status !== 0;
    });
    return res.json(pending);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.post('/answer/:admin_id/:rti_id', upload.single('doc'), (req, res) => {
  try {
    var doc;
    const answer = req.body.answer;
    if (req.file === undefined) {
      doc = '';
    } else {
      doc = req.file.filename;
    }
    const admin_id = req.params.admin_id;
    const rti_id = req.params.rti_id;
    const newAnswer = new Answer({
      answer,
      doc,
      admin_id,
      rti_id,
    });
    newAnswer
      .save()
      .then(() => {
        Rti.findByIdAndUpdate(rti_id, { status: 1 }, function (err, docs) {
          if (err) {
            console.log(err);
          } else {
            console.log('Updated User : ', docs);
          }
        });
        res.json('RTI Answered');
      })
      .catch((err) => res.status(400).json('Error: ' + err));
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.post('/reject/:admin_id/:rti_id', upload.single('doc'), (req, res) => {
  try {
    var doc;
    const answer = req.body.answer;
    if (req.file === undefined) {
      doc = '';
    } else {
      doc = req.file.filename;
    }

    const admin_id = req.params.admin_id;
    const rti_id = req.params.rti_id;
    const newAnswer = new Answer({
      answer,
      doc,
      admin_id,
      rti_id,
    });
    newAnswer
      .save()
      .then(() => {
        Rti.findByIdAndUpdate(rti_id, { status: 2 }, function (err, docs) {
          if (err) {
            console.log(err);
          } else {
            console.log('Updated User : ', docs);
          }
        });
        res.json('RTI Answered');
      })
      .catch((err) => res.status(400).json('Error: ' + err));
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

router.get('/info/:rti_id', async (req, res) => {
  try {
    const query = await Rti.findOne({ rti_id: req.params.rti_id });
    return res.json(query);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

module.exports = router;
