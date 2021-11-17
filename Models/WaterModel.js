const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const { Schema } = mongoose;

const WaterSchema = new Schema(
  {
    amount: { type: Number, required: true },
    created: { type: Date, required: true },
    __v: { type: Number, select: false},
  }, {
    toJSON: { virtuals: true },
  },
);

WaterSchema
  .virtual('createdFormat')
  .get(function cb() {
    return DateTime.fromJSDate(this.created).toLocaleString(DateTime.DATE_MED);
  });

// Export model
module.exports = mongoose.model('Water', WaterSchema);