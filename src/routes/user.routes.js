const express = require("express");
const app = express();
const router = express.Router();
const userController = require('../contollers/user.contoller')

let userDatabase = [];
let id = 0;

router.get("/api/user", userController.getAllUsers)

router.post("/api/user", userController.addUser);

router.get("/api/user/:userId", userController.getUserById)

app.put("/api/user/:userId", (req, res) => {
    const userId = req.params.userId;

    console.log(`User met ID ${userId} gezocht`);
    let oldUser = userDatabase.filter((item) => item.id == userId);
    if(oldUser.length > 0){
        console.log(oldUser);
        elementIndex = userDatabase.findIndex((obj => obj.id == userId));
        
        let user = req.body;
        newUser = {
            id,
         ...user,
        } 
        userDatabase[elementIndex] = newUser;

        res.status(205).json({
        status: 205,
        result: userDatabase,
        });
    } else {
        res.status(401).json({
            status: 401,
            result: `User with Id ${userId} is not found`
        });
    }
});

app.delete("/api/user/:userId", (req, res) => {
    const userId = req.params.userId;
    console.log(`User met ID ${userId} gezocht`);
    let user = userDatabase.filter((item) => item.id == userId);
    if(user.length > 0){
        console.log(userDatabase[userId]);

        const index = userDatabase.indexOf(user);
        userDatabase.splice(index, 1);
        res.status(206).json({
            status: 206,
            result: userDatabase,
        });
    } else {
        res.status(401).json({
            status: 401,
            result: `User with Id ${userId} is not found`
        });
    }
});

module.exports = router;