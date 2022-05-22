const express = require("express");
const router = express.Router();
const mealController = require('../contollers/meal.controller')
const authController = require('../contollers/auth.controller')

console.log("inside this meal.routes.js file")

router.get("/meal", mealController.getAllMeals);

router.post("/meal", authController.validateToken, mealController.validateMeal, mealController.addMeal);

router.get("/meal/:mealId", mealController.getMealById);

router.put("/meal/:mealId", authController.validateToken, mealController.validateMeal, mealController.updateMealById);

router.delete("/meal/:mealId", authController.validateToken, mealController.deleteMealById)

module.exports = router;