const express = require('express');
const router = express.Router();
const Rti = require('../models/Rti');
const Answer = require('../models/Answer');

router.get('/user/:rti_id', async (req, res) => {
  try {
    const query = await Rti.findOne({ rti_id: req.params.rti_id });
    const ans = await Answer.findOne({ rti_id: query._id })
      .populate('admin_id')
      .populate('rti_id');
    return res.json(ans);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

module.exports = router;
