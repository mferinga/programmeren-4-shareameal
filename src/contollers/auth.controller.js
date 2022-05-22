const assert = require('assert');
const dbconnection = require('../../database/dbconnection')
const jwt = require ('jsonwebtoken')
const jwtSecretKey = require('../config/config').jwtSecretKey

module.exports = {
    login:(req, res, next)=>{
        const {emailAdress, password} = req.body
        console.log(`${emailAdress} ${password}`)

        const queryString = 'SELECT id, firstName, emailAdress, password FROM user WHERE emailadress =?'

        dbconnection.getConnection((err, connection) => {
            if (err) { 
                next(err)
            } // not connected!

            if(connection){
                console.log("Database connected!")
            } else {
                console.log("No connection!")
            }

            //Use the connection
            connection.query(
                queryString,
                [emailAdress],
                function (error, results, fields) {
                    //release the connection
                    connection.release()
                    
                    //handle errors after rhe release
                    if(error) next(error)

                    if(results && results.length === 1){
                        console.log(results)

                        const user = results[0]
                        if(user.password === password) {
                            // email and password are correct !
                            jwt.sign({ userid: user.id }, process.env.JWT_SECRET, function(err, token) {
                                if(err) console.log(err)
                                if(token) {
                                    console.log(token)
                                    res.status(200).json({
                                        statusCode: 200,
                                        resuls: {...user, token},
                                    })
                                };
                            })
                        } else {
                            console.log("password is incorrect");
                            res.status(401).json({
                                status : 401,
                                results : 'username or password is incorrect'
                            })
                        }
                    } else {
                        console.log('email is not found')
                        res.status(404).json({
                            status : 404,
                            results : 'username or password is incorrect'
                        })
                    }
                }
            )
        })
    },
    validateToken(req, res, next) {
        console.log('ValidateToken called')
        const authHeader = req.headers.authorization;
        if(!authHeader){
            console.log('no authorization header!');
            res.status(401).json({
                error: 'No authorization header',
                dateTime: new Data().toISOString(),
            })
        } else {
            const token = authHeader.substring(7, authHeader.length)

            jwt.verify(token, jwtSecretKey, (err, payload) => {
                if (err) {
                    console.log('Not authorized')
                    res.status(401).json({
                        error: 'Not authorized',
                        datetime: new Date().toISOString(),
                    })
                }
                if (payload) {
                    console.log('token is valid', payload)
                    // User heeft toegang. Voeg UserId uit payload toe aan
                    // request, voor ieder volgend endpoint.
                    req.userId = payload.userid
                    console.log('userId = ' , payload.userid);
                    next()
                }
            })

        }
    },
}