const express = require("express");
const router = express.Router();
const userController = require('../contollers/user.contoller')
const authController = require('../contollers/auth.controller')

console.log("inside this user.routes.js file")

router.get("/user",authController.validateToken, userController.getAllUsers);

router.post("/user",userController.validateUser, userController.addUser);

router.get("/user/profile",authController.validateToken, userController.getUserProfile);

router.get("/user/:userId",authController.validateToken, userController.getUserById);

router.put("/user/:userId",authController.validateToken, userController.validateUser, userController.updateUserById);

router.delete("/user/:userId",authController.validateToken, userController.deleteUserById)

module.exports = router;