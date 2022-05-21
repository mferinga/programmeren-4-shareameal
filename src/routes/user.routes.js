const express = require("express");
const router = express.Router();
const userController = require('../contollers/user.contoller')

console.log("inside this user.routes.js file")

router.get("/user", userController.getAllUsers);

router.post("/user",userController.validateUser, userController.addUser);

router.get("/user/:userId", userController.getUserById);

router.put("/user/:userId", userController.updateUserById);

router.delete("/user/:userId", userController.deleteUserById)

module.exports = router;