const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const { Schema } = mongoose;

const FoodSchema = new Schema(
  {
    name: { type: String, required: true },
    protein: { type: Number, required: true },
    calories: { type: Number, required: true },
    created: { type: Date, required: true },
    __v: { type: Number, select: false},
  }, {
    toJSON: { virtuals: true },
  },
);

FoodSchema
  .virtual('createdFormat')
  .get(function cb() {
    return DateTime.fromJSDate(this.created).toLocaleString(DateTime.DATE_MED);
  });

// Export model
module.exports = mongoose.model('Food', FoodSchema);