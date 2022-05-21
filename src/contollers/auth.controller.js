const assert = require('assert');
const dbconnection = require('../../database/dbconnection')
const jwt = require ('jsonwebtoken')

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
                                        resuls: token,
                                    })
                                };
                            })
                        }
                    } else {
                        console.log('user is not found')
                        res.status(404).json({
                            status : 404,
                            results : 'email is not found'
                        })
                    }
                }
            )
        })
    }
}










// let controller = {
//     login:(req, res, next)=>{
//         console.log("inside the login")
//         //Assert voor validatie

//         dbconnection.getConnection(function(err, connection) {
//             if(err) {
//                 logger.error('Error getting connection from dbconnection')
//                 res.status(500).json({
//                     error: err.toString(),
//                     datetime: new Date().toISOString(),
//                 })
//             }
//             if(connection){
//                 connection.query(
//                     'SELECT `id`, `firstName`, `lastName`, `emailAdress`, `password` FROM `user` WHERE `emailadress`=?',
//                     [req.body.emailAdress],
//                     (error, results, fields) => {
//                     // When done with the connection, release it.
//                         connection.release();
                    
//                         // Handle error after the release.
//                         if (error){
//                             logger.error('Error: ', err.toString())
//                             res.status(500).json({
//                                 error: err.toString(),
//                                 datetime: new Date().toISOString(),
//                             })
//                         } 
//                         if (results){
//                             if(results && results.length === 1 && results[0].password == req.body.password) {
//                                 logger.info('password is correct')
    
//                                 const {password, ...userinfo} = results[0]
//                                 const payload = {
//                                     userId: userinfo.id,
//                                 }
//                                 jwt.sign(
//                                     payload,
//                                     'process.env.JWT_SECRET',
//                                 {expiresIn : '7d'},
//                                 function(err, token) {
//                                     if(err) console.log(err)
//                                     if(token) {
//                                         console.log(token);
//                                         res.status(200).json({
//                                             statusCode : 200,
//                                             results : token,
//                                         })
//                                     } 
//                                 })
//                             } else {
//                                 console.log('user is not found')
//                                 res.status(404).json({
//                                     status : 404,
//                                     results : 'email is not found'
//                                 })
//                             }
//                         }

//                     }
//                 )
//             }
//         })
//     },
// }

// module.exports = controller;