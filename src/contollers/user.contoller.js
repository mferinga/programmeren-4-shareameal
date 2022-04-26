const assert = require('assert');
let userDatabase = [];
let id = 0;

let controller = {
    validateUser:(req, res, next)=>{
        console.log("i am in the validation")
        let user = req.body;
        let{name, email, age, password } = user
        try{
            assert(typeof name === 'string', 'Name must be a string');
            assert(typeof email === 'string', 'Email must be a string');
            assert(typeof age === 'number', 'Age must be a number');
            assert(typeof password === 'string', 'Password must be a string');
            next()
        } catch(err){
            const error = {
                status : 400,
                result : err.message,
            }
            next(error);
        }
    },
    addUser:(req, res)=>{
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
    },
    getAllUsers:(req, res)=>{
        res.status(202).json({
            status: 202,
            result: userDatabase,
        });
    },
    getUserById:(req, res, next) =>{
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
            const error={
                status: 401,
                result: `User with Id ${userId} is not found`
            }
            next(error);
        }
    },
    updateUserById:(req, res) =>{
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
    },
    deleteUserById:(req, res) =>{
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
    }
}

module.exports = controller;