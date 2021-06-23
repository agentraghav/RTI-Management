const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const superadminSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 5 },
  displayName: { type: String },
});

module.exports = mongoose.model('Superadmin', superadminSchema);