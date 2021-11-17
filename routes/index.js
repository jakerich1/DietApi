var express = require('express');
const { body, validationResult } = require('express-validator');
const async = require('async');
const Food = require('../Models/FoodModel.js');
const Water = require('../Models/WaterModel.js');
const { DateTime } = require("luxon");
var router = express.Router();

// Get all food and water for specific date
router.get('/', function(req, res, next) {

  const dateInput = DateTime.fromISO(req.body.date);

  if (dateInput.isValid) {
    const start = dateInput.toJSDate();
    const end = dateInput.plus({days: 1}).toJSDate();
    async.parallel({
      food_diary(callback) {
        Food.find({ 
          created: {
            $gte: start,
            $lte: end,
          }
        }, callback);
      },
      water_diary(callback) {
        Water.find({ 
          created: {
            $gte: start,
            $lte: end,
          }
        }, callback);
      },
    }, (err, results) => {
      if (err) { return res.status(500).send(err); }
      res.json(results);
    });
  } else {
    res.status(400).send('Supplied date is not valid')
  }

});

// Get specific food entry
router.get('/food/:id', function(req, res, next) {
  // Find food entry by id
  Food.findById(req.params.id, (err, foodResult) => {
    if (err) { return res.status(500).send('Error locating entry'); }
    if (foodResult) {
      res.json(foodResult);
    } else {
      res.status(500).send('Error locating entry');
    }
  });
});

// Get specific water entry
router.get('/water/:id', function(req, res, next) {
  // Find water entry by id
  Water.findById(req.params.id, (err, waterResult) => {
    if (err) { return res.status(500).send('Error locating entry'); }
    if (waterResult) {
      res.json(waterResult);
    } else {
      res.status(500).send('Error locating entry');
    }
  });
});

// Delete specific food entry
router.delete('/food/:id', function(req, res, next) {

  Food.findByIdAndDelete(req.params.id, (deleteErr) => {
    // Handle db error
    if (deleteErr) res.status(500).send('unable to remove entry');
    // If successfull
    res.status(202).send('Entry removed');
  });
  
});

// Delete specific water entry
router.delete('/water/:id', function(req, res, next) {
  Water.findByIdAndDelete(req.params.id, (deleteErr) => {
    // Handle db error
    if (deleteErr) res.status(500).send('unable to remove entry');
    // If successfull
    res.status(202).send('Entry removed');
  });
});

// Post food entry for specified date
router.post('/food', [
  // Validate and sanitise fields.
  body('name')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Food name must be specified')
    .isLength({ max: 124 })
    .withMessage('Food name exceeds maximum length of 124 characters')
    .escape(),

  body('calories')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Calories must be specified')
    .isLength({ max: 10 })
    .withMessage('Calories exceeds maximum length'),

  body('protein')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Protein must be specified')
    .isLength({ max: 10 })
    .withMessage('Protein exceeds maximum length'),

  // Process request
  (req, res) => {
    // Extract the validation errors from a request.
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors);
    } else {
      // If no validation errors
      const newFood = new Food({
        created: new Date(),
        name: req.body.name,
        protein: req.body.protein,
        calories: req.body.calories,
      });

      newFood.save((err) => {
        if (err) return res.status(500);
        res.status(201).send('Food entry submitted');
      });
    }
  },
]);

// Post water entry for specified date
router.post('/water', [
  // Validate and sanitise fields.
  body('amount')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Water amount must be specified')
    .isLength({ max: 124 })
    .withMessage('Water amount exceeds maximum length')
    .escape(),

  // Process request
  (req, res) => {
    // Extract the validation errors from a request.
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
      res.status(400).json(validationErrors);
    } else {
      // If no validation errors
      const newWater = new Water({
        created: new Date(),
        amount: req.body.amount,
      });

      newWater.save((err) => {
        if (err) return res.status(500);
        res.status(201).send('Water entry submitted');
      });
    }
  },
]);

module.exports = router;
