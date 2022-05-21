const express = require("express");
const router = express.Router();
const authController = require("../contollers/auth.controller");

console.log("inside the auth.routes.js file")

router.post("/auth/login", authController.login);

module.exports = router;