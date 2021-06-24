const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Create Schema

const AnswerSchema = new Schema({
  rti_id: { type: Schema.Types.ObjectId, ref: 'Rti' },
  answer: {
    type: String,
    required: true,
  },
  admin_id: { type: Schema.Types.ObjectId, ref: 'Admin' },
  doc: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('Answer', AnswerSchema);
