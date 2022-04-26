const express = require("express");
const router = express.Router();
const userController = require('../contollers/user.contoller')

let userDatabase = [];
let id = 0;

router.get("/api/user", userController.getAllUsers);

router.post("/api/user",userController.validateUser, userController.addUser);

router.get("/api/user/:userId", userController.getUserById);

router.put("/api/user/:userId", userController.updateUserById);

router.delete("/api/user/:userId", userController.deleteUserById)

module.exports = router;