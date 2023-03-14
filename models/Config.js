const mongoose = require('mongoose');

const ConfigSchema = new mongoose.Schema(
  {
    key: {
      required: true,
      type: String,
      unique: true
    },
    value: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const Config = mongoose.models.ConfigSchema || mongoose.model('Config', ConfigSchema);

module.exports = Config;
