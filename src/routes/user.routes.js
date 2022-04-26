const express = require("express");
const app = express();
const router = express.Router();

let userDatabase = [];
let id = 0;

app.get("/api/user", (req, res) => {
    res.status(202).json({
        status: 202,
        result: userDatabase,
    });
});

app.post("/api/user", (req, res) => {
    let user = req.body;
    user = {
        id,
        ...user,
    };
    id++;
    console.log(user);
    userDatabase.push(user);
    res.status(201).json({
        status: 201,
        result: userDatabase,
    });
});

app.get("/api/user/:userId", (req, res) => {
    const userId = req.params.userId;
    console.log(`User met ID ${userId} gezocht`);
    let user = userDatabase.filter((item) => item.id == userId);
    if(user.length > 0){
        console.log(user);
        res.status(204).json({
            status : 204,
            result: user,
        });
    } else {
        res.status(401).json({
        status: 401,
        result: `User with Id ${userId} is not found`
        });
    }
});

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