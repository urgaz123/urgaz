const mongoose = require('mongoose');

const SmsCodeSchema = new mongoose.Schema(
  {
    phone: {
      required: true,
      type: String,
      unique: true
    },
    code: {
      type: String,
      required: true
    },
    smsId: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const SmsCode = mongoose.models.SmsCodeSchema || mongoose.model('SmsCode', SmsCodeSchema);

module.exports = SmsCode;
