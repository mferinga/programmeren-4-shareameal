process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'

const chai = require("chai");
const chaiHttp = require("chai-http");
const server = require("../../index");
require('dotenv').config();
const dbconnection = require("../../database/dbconnection");
const { assert } = require("chai");
const logger = require('../../src/config/config').logger
const jwt = require('jsonwebtoken');
const jwtSecretKey = require('../../src/config/config').jwtSecretKey

chai.should();
chai.use(chaiHttp)

const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyaWQiOjIsImlhdCI6MTY1NjYyOTg1OX0.hQwWyjveQzzj7JCMxJOpurRWnu3-2qq4sMrO69o4N_M";

describe('UC-user', () => {
    before((done) => {
        dbconnection.getConnection(function(err, connection) {
            if (err) throw err;
            connection.query('DELETE FROM `meal`;', function(error, results, fields){
                connection.query('DELETE FROM `user`;', function(error, results, fields){
                    connection.query('INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phonenumber`, `street`, `city` ) VALUES' +
                    '(1, "Matthijs", "Feringa", 1 "matthijs.fernga@gmail.com", "superSecret1!", "0636025385", "hoekakker", "Breda");',function (error, results, fields){
                        connection.query( 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phonenumber`, `street`, `city` ) VALUES' +
                        '(2, "Kris", "Dekkers", 0, "kris.dekkers@hotmail.com", "NotHackable0!", "0648896235", "Acedemiesingel", "Breda");', function (error, restult, fields){
                            connection.query('INSERT INTO `meal` (`id`, `isActive`, `isVega` , `isVegan` , `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`,  `price`, `imageUrl`, `name`, `description`, `cookId`) VALUES' +
                            "(1, 1, 0, 0, 1, '2022-04-07 18:10:00', 5, 8.50, 'test.jpg', 'Kip kerrie', 'stukjes kip met kerriesaus', 1);", function (error, results, fields){
                                connection.query('INSERT INTO `meal` (`id`, `isActive`, `isVega` , `isVegan` , `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`,  `price`, `imageUrl`, `name`, `description`, `cookId`) VALUES' +
                                "(2, 1, 0, 0, 1, '2022-04-07 18:12:00', 5, 4.50, 'test.jpg', 'Sperziebonen', 'Sperziebonen met aardappelen en een gehaktbal', 2);", function (error, results, fields){
                                    if(error) throw error;
                                    connection.release();
                                    done();
                                })
                            })
                        })
                    })          
                })
            });
        })
        console.log("before done is completed");
    })

    //test cases posting a new user
    describe("UC-301 add meal POST /api/user", () => {
        
    beforeEach((done) => {
        dbconnection.getConnection(function(err, connection) {
            if(err) throw err;
            connection.query('ALTER TABLE user AUTO_INCEMENT = 1;', (error, result, field) => {
                connection.query('DELETE FROM `meal`;', function(error, results, fields){
                    connection.query('DELETE FROM `user`;', function(error, results, fields){
                        connection.query('INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phonenumber`, `street`, `city` ) VALUES' +
                        '(1, "Matthijs", "Feringa", 1 "matthijs.fernga@gmail.com", "superSecret1!", "0636025385", "hoekakker", "Breda");',function (error, results, fields){
                            connection.query( 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phonenumber`, `street`, `city` ) VALUES' +
                            '(2, "Kris", "Dekkers", 0, "kris.dekkers@hotmail.com", "NotHackable0!", "0648896235", "Acedemiesingel", "Breda");', function (error, restult, fields){
                                connection.query('INSERT INTO `meal` (`id`, `isActive`, `isVega` , `isVegan` , `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`,  `price`, `imageUrl`, `name`, `description`, `cookId`) VALUES' +
                                "(1, 1, 0, 0, 1, '2022-04-07 18:10:00', 5, 8.50, 'test.jpg', 'Kip kerrie', 'stukjes kip met kerriesaus', 1);", function (error, results, fields){
                                    connection.query('INSERT INTO `meal` (`id`, `isActive`, `isVega` , `isVegan` , `isToTakeHome`, `dateTime`, `maxAmountOfParticipants`,  `price`, `imageUrl`, `name`, `description`, `cookId`) VALUES' +
                                    "(2, 1, 0, 0, 1, '2022-04-07 18:12:00', 5, 4.50, 'test.jpg', 'Sperziebonen', 'Sperziebonen met aardappelen en een gehaktbal', 2);", function (error, results, fields){
                                        if(error) throw error;
                                        connection.release();
                                        done();
                                    })
                                })
                            })
                        })          
                    })
                });
            })           
        })

        it('TC-301-1 Verplicht veld ontbreekt (prijs ontbreekt', (done) => {
            chai
                .request(server)
                .post("/api/meal")
                .auth(validToken, { type: 'bearer' })
                .send({
                    isActive : 1,
                    isVega : 0,
                    isVegan : 0,
                    isToTakeHome : 1,
                    dateTime : "2022-05-25 16:30:00",
                    maxAmountOfParticipants : 4,
                    //price : 8.50,
                    imageUrl : "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    name : "Kip kerrie",
                    description : "Kip en kerriesaus",
                    allergenes : ""
                })
                .end((err, res) => {
                    res.should.be.an("object");
                    let {status, result} = res.body;
                    status.should.equals(400);
                    result.should.be.a("string").that.equals("price must be a number");
                    done();
                })
        })
        // it('TC-301-2 Niet Ingelogd', (done) => {
        //     chai
        //         .request(server)
        //         .post("/api/meal")
        //         .send({
        //             isActive : 1,
        //             isVega : 0,
        //             isVegan : 0,
        //             isToTakeHome : 1,
        //             dateTime : "2022-05-25 16:30:00",
        //             maxAmountOfParticipants : 4,
        //             price : 8.50,
        //             imageUrl : "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
        //             name : "Kip kerrie",
        //             description : "Kip en kerriesaus",
        //             allergenes : ""
        //         })
        //         .end((err, res) => {
        //             res.should.be.an("object");
        //             let {status, error} = res.body;
        //             status.should.equals(201);
        //             error.should.be.a("string").that.equals("Not authorized");
        //             done();
        //         })
        // })
        it('TC-301-3 Meal succesvol toegevoegd', (done) => {
            chai
                .request(server)
                .post("/api/meal")
                .auth(validToken, { type: 'bearer' })
                .send({
                    isActive : 1,
                    isVega : 0,
                    isVegan : 0,
                    isToTakeHome : 1,
                    dateTime : "2022-05-25 16:30:00",
                    maxAmountOfParticipants : 4,
                    price : 8.50,
                    imageUrl : "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                    name : "Kip kerrie",
                    description : "Kip en kerriesaus",
                    allergenes : ""
                })
                .end((err, res) => {
                    res.should.be.an("object");
                    let {status, results} = res.body;
                    status.should.equals(201);
                    assert.deepEqual(results, {
                        isActive : 1,
                        isVega : 0,
                        isVegan : 0,
                        isToTakeHome : 1,
                        dateTime : "2022-05-25 16:30:00",
                        maxAmountOfParticipants : 4,
                        price : 8.50,
                        imageUrl : "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
                        name : "Kip kerrie",
                        description : "Kip en kerriesaus",
                        allergenes : ""
                });
                done();
            })
        })
      })
    })

    describe('UC-303 Maaltijden opvragen', () => {
        it('TC-303-1 all meal weergeven', (done) => {
            chai
                .request(server)
                .get("/api/meal/")
                .end((err, res) => {
                    res.should.be.an("object");
                    let {status, results} = res.body;
                    status.should.equals(200);
                    assert.deepEqual(results, [
                        // {
                        //     id : 1,
                        //     name : "Kip kerrie",
                        //     description : "stukjes kip met kerriesaus",
                        //     price : 8.50,
                        // },
                        {
                            id : 2,
                            name : "Sperziebonen",
                            description : "Sperziebonen met aardappelen en een gehaktbal",
                            price : 4.50
                        }
                    ])
                    done();
                })
        })
    })

    
})