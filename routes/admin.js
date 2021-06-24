const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const validateRegisterInput = require('../validation/register');
const validateLoginInput = require('../validation/login');
const Admin = require('../models/Admin');
const Rti = require('../models/Rti');

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

router.get('/pending/:college', async (req,res)=>{
  try {
    const rti = await Rti.find({ college: req.params.college });
    if (rti.length === 0) {
      return res.status(400).json({ message: 'No Pending RTI' });
    }
    const pending = rti.filter(function(user){
      return user.status === 0;
    })
    return res.json(pending);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
})

router.get('/answered/:college', async (req,res)=>{
  try {
    const rti = await Rti.find({ college: req.params.college });
    if (rti.length === 0) {
      return res.status(400).json({ message: 'No Pending RTI' });
    }
    const pending = rti.filter(function(user){
      return user.status !== 0;
    })
    return res.json(pending);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
})


module.exports = router;
