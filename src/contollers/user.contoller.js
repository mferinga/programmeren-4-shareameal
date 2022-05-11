const assert = require('assert');
const pool = require('../../database/dbconnection');
const dbconnection = require('../../database/dbconnection')
let userDatabase = [];
let id = 0;

let controller = {
    validateUser:(req, res, next)=>{
        console.log("i am in the validation")
        let user = req.body;
        let{firstname, lastname, isActive, emailAdress, password, phonenumber, street, city } = user
        try{
            assert(typeof firstname === 'string', 'Firstname must be a string');
            assert(typeof lastname === 'string', 'Lastname must be a string');
            assert(typeof isActive === 'number', 'isActive must be a string');
            assert(typeof emailAdress === 'string', 'Email must be a string');
            assert(typeof password === 'string', 'Password must be a string');
            assert(typeof phonenumber === 'string', 'phonenumber must be a string');
            assert(typeof street === 'string', 'street must be a string');
            assert(typeof city === 'string', 'city must be a string');
            next()
        } catch(err){
            const error = {
                status : 400,
                result : err.message,
            }
            console.log(err.message);
            next(error);
        }
    },
    addUser:(req, res)=>{
        dbconnection.getConnection(function(err, connection) {
            if(err) throw err; //there is no connection with the database!

            console.log("I am in the post")
            let user = req.body;

            let userFirstName = user.firstname;
            let userLastName = user.lastname;
            let userisActive = user.isActive;
            let userEmailAdress = user.emailAdress;
            let userPassword = user.password;
            let userPhoneNumber = user.phonenumber;
            let userStreet = user.street;
            let userCity = user.city;

            console.log("De gegevens van de user: " + userFirstName + ", " + userLastName + ", " + userisActive + ", " + userEmailAdress + ", " + userPassword + ", " + userPhoneNumber + ", " + userStreet + ", " + userCity);

            connection.query(
                    `INSERT INTO user (firstName, lastName, isActive, emailAdress, password, phoneNumber, street, city) VALUES ('${userFirstName}', '${userLastName}', '${userisActive}', '${userEmailAdress}', '${userPassword}', '${userPhoneNumber}', '${userStreet}', '${userCity}');`,
                    function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release();
                    
                    // Handle error after the release.
                    if (error) throw error;
                    
                    // Don't use the connection here, it has been returned to the pool.
                    console.log('results =' + results.length);
                    res.status(201).json({
                            status : 201,
                            results : user
                    })
                })
        })
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
            });
        });
    },
    getUserById:(req, res, next) =>{
        dbconnection.getConnection(function(err, connection) {
            if(err) throw err;
            const userId = req.params.userId;

            connection.query(
                `SELECT * FROM user WHERE id = ${userId};`,
                function (error, result, fields) {
                    let user = result;
                    console.log(user);
                    connection.release();

                    if (user.length == 0) {
                        res.status(404).json({
                            status : 404,
                            result : `User with Id ${userId} is not found`,
                        })
                    } else {
                        res.status(202).json({
                            status : 202,
                            restult : user,
                        });
                    }
                } 
            )
        })

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