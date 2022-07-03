const assert = require('assert');
const { process_params } = require('express/lib/router');
const { exit } = require('process');
const dbconnection = require('../../database/dbconnection')
const jwt = require ('jsonwebtoken')

let controller = {
    validateMeal:(req, res, next)=>{
        console.log("i am in the validation")
        let meal = req.body;
        let{isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, name, description } = meal
        try{
            assert(typeof isActive === 'number', 'isActive must be a number');
            assert(isActive == 0 || isActive == 1, 'isActive must be 0 or 1');
            
            assert(typeof isVega === 'number', 'isVega must be a number');
            assert(isVega == 0 || isVega == 1, 'isActive must be 0 or 1');

            assert(typeof isVegan === 'number', 'isVegan must be a number');
            assert(isVegan == 0 || isVegan == 1, 'isVegan must be 0 or 1');

            assert(typeof isToTakeHome === 'number', 'isToTakeHome must be a number');
            assert(isToTakeHome == 0 || isToTakeHome == 1, 'isVegan must be 0 or 1');

            assert(typeof dateTime === 'string', 'dateTime must be a string');
            assert(dateTime.length != 0, 'dateTime must be filled in');

            assert(typeof maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number');
            assert(maxAmountOfParticipants >= 1, 'maxAmountOfParticipants must be at least 1');

            assert(typeof maxAmountOfParticipants === 'number', 'maxAmountOfParticipants must be a number');
            assert(maxAmountOfParticipants >= 1, 'maxAmountOfParticipants must be at least 1');

            assert(typeof price === 'number', 'price must be a number')
            assert(price >= 0, 'price must be at least 0');

            assert(typeof imageUrl === 'string', 'imageUrl must be a string');
            assert(imageUrl.length != 0, 'imageUrl must be filled in');

            assert(typeof name === 'string', 'name must be a string');
            assert(name.length != 0, 'name must be filled in')

            assert(typeof description === 'string', 'description must be a string');
            assert(description.length != 0, 'description must be filled in');
            next()

            assert(typeof allergenes === 'string', 'allergenes must be a string');
        } catch(err){
            res.status(400).json({
                status : 400,
                result : err.message,
            })
            console.log(err.message);
            next(error);
        }
    },
    addMeal:(req, res)=>{
        console.log(`getAll aangeroepen. req.userId = ${req.userId}`)

        if(req.userId > 0){
            dbconnection.getConnection(function(err, connection) {
                if(err) throw err; //there is no connection with the database!
    
                console.log("I am in the post")
                let meal = req.body;
    
                let isActive = meal.isActive;
                let isVega = meal.isVega;
                let isVegan = meal.isVegan;
                let isToTakeHome = meal.isToTakeHome;
                let dateTime = meal.dataTime;
                let maxAmountOfParticipants = meal.maxAmountOfParticipants;
                let price = meal.price;
                let imageUrl = meal.imageUrl;
                let cookId = req.userId
                let createDate = new Date().toLocaleString();
                let name = meal.name;
                let description = meal.description;
                let allergenes = meal.allegenes;
    
                console.log("De gegevens van de user: " + isActive + ", " + isVega + ", " + isVegan + ", " + isToTakeHome + ", " + dateTime + ", " + maxAmountOfParticipants + ", " + price + ", " + imageUrl + ", " + createDate + ", " + name + ", " + description + ", " + allergenes + ", " + cookId);
    
                connection.query(
                    `INSERT INTO meal (isActive, isVega, isVegan, isToTakeHome, dateTime, maxAmountOfParticipants, price, imageUrl, cookId, createDate, name, description, allergenes) VALUES ('${isActive}', '${isVega}', '${isVegan}', '${isToTakeHome}', '${dateTime}', '${maxAmountOfParticipants}', '${price}', '${imageUrl}', '${cookId}', '${createDate}', '${name}', '${description}', '${allergenes}');`,
                    function (error, results, fields) {
                        // When done with the connection, release it.
                        connection.release();
                        
                        // Handle error after the release.
                        if (error) {
                            console.log("SQK ERRIR:");
                            res.status(401).json({
                                status: 401,
                                result: "there occurred an error with inserting the data"
                            })
                        }
                        
                        // Don't use the connection here, it has been returned to the pool.
                        // console.log('results =' + results.length);
                        res.status(201).json({
                            status : 201,
                            results : meal
                        })
                    }
                )
            })
        } else {
            res.status(401).json({
                status: 401,
                result: "You must be logged in to create an user"
            })
        }
    },
    getAllMeals:(req, res, next)=>{
        console.log("inside the get all meals")
        const queryParams = req.query;
        console.log(queryParams);

        let {name, description} = req.query;
        console.log(`name = ${name} description = ${description}`);

        let queryString = 'SELECT id, name, description, price FROM meal'
        if(name || description){
            queryString += ' WHERE ';
            if(name){
                queryString += `name LIKE ?`;
            }
            if(name && description) {
                queryString += ' AND '
            }
            if(description){
                queryString += `description = ?`;
            }
        }
        queryString += ';'
        console.log(queryString);

        name = '%' + name + '%'
        description = '%' + description + '%'

        dbconnection.getConnection(function(err, connection) {
            if (err) next(err); // not connected!
            
            // Use the connection
            connection.query(queryString,[name, description], function (error, results, fields) {
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
    getMealById:(req, res, next) =>{
        dbconnection.getConnection(function(err, connection) {
            if(err) throw err;
            const mealId = req.params.mealId;

            connection.query(
                `SELECT name, description, price, datetime, allergenes, cookId, maxAmountOfParticipants, isActive, isVega, isVegan, isToTakeHome FROM meal WHERE id = ${mealId};`,
                function (error, result, fields) {
                    let meal = result;
                    console.log(meal);
                    connection.release();

                    if (meal.length == 0) {
                        res.status(404).json({
                            status : 404,
                            result : `meal with Id ${mealId} is not found`,
                        })
                    } else {
                        res.status(202).json({
                            status : 202,
                            restult : meal,
                        });
                    }
                } 
            )
        })

    },
    updateMealById:(req, res, next) =>{
        console.log(`getAll aangeroepen. req.userId = ${req.userId}`)
        let cookId = -1;
        dbconnection.getConnection(function(err, connection) {
            if(err) throw err;
            connection.query(`SELECT cookId FROM meal WHERE id = ${req.params.mealId}`, function (error, result, fields){
                if(result.length > 0){
                    cookId = result[0].cookId
                    console.log(cookId)

                    if(req.userId == cookId){
                        dbconnection.getConnection(function(err, connection) {
                            if(err) throw err;
                            let meal = req.body;
                            const mealId = req.params.mealId;
                
                            let updateDate = new Date().toLocaleString();
                            
                            connection.query(
                                 `UPDATE meal SET name = '${meal.name}', description = '${meal.description}', isActive = '${meal.isActive}', dateTime = '${meal.dateTime}', 
                                    allergenes = '${meal.allegenes}', maxAmountOfParticipants = '${meal.maxAmountOfParticipants}', isVega = '${meal.isVega}', 
                                        isVegan = '${meal.isVegan}', isToTakeHome = '${meal.isToTakeHome}', updateDate = '${updateDate}' WHERE id = ${mealId}`,
                                function (error, result, fields){
                                    connection.release();
                                    if(result.length == 0){
                                        res.status(404).json({
                                            status : 404,
                                            result : `Meal with Id ${mealId} is not found`,
                                        })
                                    } else {
                                        res.status(205).json({
                                            status : 205,
                                            result : meal,
                                        })
                                    }
                                }
                            )
                        })
                    } else {
                        console.log("This user is not authorized to edit this meal");
                        res.status(401).json({
                            status: 401,
                            result: "You are not authorized to edit this meal"
                        })
                    }  
                    
                } else {
                    console.log("there went something wrong!")
                } 
            })
        })
        console.log(`cookId = ${cookId}`);
    },
    deleteMealById:(req, res) =>{
        console.log(`getAll aangeroepen. req.userId = ${req.userId}`)
        let cookId = -1;
        dbconnection.getConnection(function(err, connection) {
            if(err) throw err;
            const meal = req.params.mealId;
            console.log("mealId = ", meal)
            connection.query(`SELECT cookId FROM meal WHERE id = ${meal}`, function (error, result, fields){
                console.log(result.length)
                if(result.length > 0){
                    cookId = result[0].cookId
                    console.log(cookId)

                    if(req.userId == cookId){
                        dbconnection.getConnection(function (err, connection) {
                            if(err) throw err;
                            
                            connection.query(
                                `DELETE FROM meal WHERE id = ${meal}`,
                                function (error, result, fields){
                                    connection.release();
                                    res.status(206).json({
                                        status : 206,
                                        result : `meal with id ${meal} has been deleted`
                                    })
                                }
                            )
                        })
                    } else {
                        console.log("This user is not authorized to edit this meal");
                        res.status(401).json({
                            status: 401,
                            result: "You are not authorized to edit this meal"
                        })
                    }  
                } else {
                    console.log("this id is not in use");
                    res.status(404).json({
                        status: 404,
                        result: `Id ${meal} is not in use`
                    })
                }
            })
        })
    },
}

module.exports = controller;