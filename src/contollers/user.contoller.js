const assert = require('assert');
const dbconnection = require('../../database/dbconnection')

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
    getAllUsers:(req, res, next)=>{
        console.log("inside the get all users")

        const queryParams = req.query;
        console.log(queryParams);

        let {firstName, isActive} = req.query;
        console.log(`name = ${firstName} isActive = ${isActive}`);

        let queryString = 'SELECT * FROM user'
        if(firstName || isActive){
            queryString += ' WHERE ';
            if(firstName){
                queryString += `firstName LIKE ?`;
            }
            if(firstName && isActive) {
                queryString += ' AND '
            }
            if(isActive){
                queryString += `isActive = ?`;
            }
        }
        queryString += ';'
        console.log(queryString);

        firstName = '%' + firstName + '%'

        dbconnection.getConnection(function(err, connection) {
            if (err) next(err); // not connected!
           
            // Use the connection
            connection.query(queryString,[firstName, isActive], function (error, results, fields) {
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
        dbconnection.getConnection(function(err, connection) {
            if(err) throw err;
            let user = req.body;
            const userId = req.params.userId;

            let userFirstName = user.firstname;
            let userLastName = user.lastname;
            let userPhoneNumber = user.phonenumber;

            connection.query(
                `UPDATE user SET firstName = '${userFirstName}', lastName = '${userLastName}', isActive = '${user.isActive}', emailAdress = '${user.emailAdress}', password = '${user.password}', phoneNumber = '${userPhoneNumber}', street = '${user.street}', city = '${user.city}' WHERE id = ${userId}`,
                function (error, result, fields){
                    connection.release();
                    if(result.length == 0){
                        res.status(404).json({
                            status : 404,
                            result : `User with Id ${userId} is not found`,
                        })
                    } else {
                        res.status(205).json({
                            status : 205,
                            result : user,
                        })
                    }
                }
            )
        })
    },
    deleteUserById:(req, res) =>{

        dbconnection.getConnection(function (err, connection) {
            if(err) throw err;
            const userId = req.params.userId;
            connection.query(
                `DELETE FROM user WHERE id = ${userId}`,
                function (error, result, fields){
                    connection.release();
                    res.status(206).json({
                        status : 206,
                        result : `user with id ${userId} has been deleted`
                    })
                }
            )
        })
    }
}

module.exports = controller;