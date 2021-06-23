const router = require('express').Router();

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const Superadmin = require('../models/superadmin');

const auth = require('../middleware/auth');



// Login

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: 'Not all fields are filled' });
    }

    const checkUser = await Superadmin.findOne({ email: email });

    if (!checkUser) {
      return res.status(400).json({ msg: "This user doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, checkUser.password);
    console.log(password);
    console.log(checkUser.password);
    console.log(isMatch)
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: checkUser._id }, process.env.SECRET);
    console.log(token)
    res.json({
      token,
      user: {
        id: checkUser._id,
        displayName: checkUser.displayName,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// token validity

router.post('/tokenIsValid', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    console.log(token)
    if (!token) {
      return res.json(false);
    }

    const verified = jwt.verify(token, process.env.SECRET);

    if (!verified) {
      return res.json(false);
    }

    const user = await Superadmin.findById(verified.id);

    if (!user) {
      return res.json(false);
    }

    return res.json(true);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  const user = await Superadmin.findById(req.user);
  res.json({
    displayName: user.displayName,
    id: user._id,
  });
});

//

router.use(function (req, res) {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

module.exports = router;