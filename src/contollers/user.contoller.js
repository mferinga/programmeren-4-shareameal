const assert = require('assert');
const pool = require('../../database/dbconnection');
const dbconnection = require('../../database/dbconnection')
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
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err; // not connected!
           
            // Use the connection
            connection.query(
              'SELECT * FROM user;', 
              function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
            
                // Handle error after the release.
                if (error) throw error;
            
                // Don't use the connection here, it has been returned to the pool.
                console.log('results =' + results.length);
                res.status(200).json({
                    status : 200,
                    results : results
                })
        
                // pool.end((err) => {
                //     console.log('pool was closed.');
                // })
            });
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