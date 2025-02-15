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
                    if(error) throw error;
                    connection.release();
                    done();
                })
            });
        })
        console.log("before done is completed");
    })

    //test cases posting a new user
    describe("UC-201 add user POST /api/user", () => {
        
        beforeEach((done) => {
            dbconnection.getConnection(function(err, connection) {
                if(err) throw err;
                connection.query('DELETE FROM user;', function(error, result, field) {
                    connection.query('ALTER TABLE user AUTO_INCEMENT = 1;', (error, result, field) => {
                        connection.query('INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phonenumber`, `street`, `city` ) VALUES' +
                        '(1, "Matthijs", "Feringa", 1 "matthijs.fernga@gmail.com", "superSecret1!", "0636025385", "hoekakker", "Breda");',function (error, results, fields){
                            connection.query( 'INSERT INTO `user` (`id`, `firstName`, `lastName`, `isActive`, `emailAdress`, `password`, `phonenumber`, `street`, `city` ) VALUES' +
                            '(2, "Kris", "Dekkers", 0, "kris.dekkers@hotmail.com", "NotHackable0!", "0648896235", "Acedemiesingel", "Breda");', function (error, restult, fields){
                                connection.release();
                                done();
                            })
                        })
                    })
                })
            })
        })

        it('TC-201-1 verplicht veld ontbreekt (firstname)', (done) => {
            chai
              .request(server)
              .post("/api/user")
              .send({
                // firstName : "Bad",
                lastName : "Eend",
                isActive : 1,
                emailAdress : "badeendje@gmail.com",
                password : "Badeendje3!",
                phoneNumber : "0698765432",
                street : "badderstraat",
                city : "dobberen"
            })
            .end((err, res) => {
                res.should.be.an("object");
                let {status, result} = res.body;
                status.should.equals(400);
                result.should.be.a("string").that.equals("There isnt enough information to create/update a new user");
                done();
            })
        })
        it('TC-201-2 Niet-valide email adres', (done) => {
            chai
                .request(server)
                .post("/api/user")
                .send({
                    firstname : "Bad",
                    lastname : "Eend",
                    isActive : 1,
                    emailAdress : "bad.eend#gmail.com",
                    password : "TestPass214@",
                    phonenumber : "0612345678",
                    street : "test",
                    city : "Breda"
                })
                .end((err, res) => {
                    res.should.be.an("object");
                    let {status, result} = res.body;
                    status.should.equals(400);
                    result.should.be.a("string").that.equals("invalid emailaddress");
                    done();
                })
        })
        it('TC-201-3 Niet-valide wachtwoord', (done) => {
            chai
                .request(server)
                .post("/api/user")
                .send({
                    firstname : "Bad",
                    lastname : "Eend",
                    isActive : 1,
                    emailAdress : "bad.eend@gmail.com",
                    password : "toweak",
                    phonenumber : "0612345678",
                    street : "test",
                    city : "Breda"
                })
                .end((err, res) => {
                    res.should.be.an("object");
                    let {status, result} = res.body;
                    status.should.equals(400);
                    result.should.be.a("string").that.equals("Password is not strong enough");
                    done();
                })
        })
        
        // it('TC-201-4 emailadres bestaat al', (done) => {
        //     chai
        //         .request(server)
        //         .post("/api/user")
        //         .send({
        //             firstname : "Job",
        //             lastname : "Feringa",
        //             isActive : 1,
        //             emailAdress : "kris.dekkers@hotmail.com",
        //             password : "superSecret1!",
        //             phonenumber : "0636025385",
        //             street : "hoekakker",
        //             city : "Breda"
        //         })
        //         .end((err, res) => {
        //             res.should.be.an("object");
        //             let {status, result} = res.body;
        //             status.should.equals(409);
        //             result.should.be.a("string").that.equals("this emailadress is already in use");
        //             done();
        //         })
        // })
        
        // it('TC-201-5 Gebruiker succesvol geregistreerd', (done) => {
        //     chai
        //         .request(server)
        //         .post("/api/user")
        //         .send({
        //             firstname : "Bad",
        //             lastname : "Eend",
        //             isActive : 1,
        //             emailAdress : "bad.eend@gmail.com",
        //             password : "Password11!",
        //             phonenumber : "0612345678",
        //             street : "test",
        //             city : "Breda"
        //         })
        //         .end((err, res) => {
        //             res.should.be.an("object");
        //             let {status, result} = res.body;
        //             status.should.equals(201);
        //             assert.deepEqual(result , {
        //                 firstname : "Bad",
        //                 lastname : "Eend",
        //                 isActive : 1,
        //                 emailAdress : "bad.eend@gmail.com",
        //                 password : "Password11!",
        //                 phonenumber : "0612345678",
        //                 street : "test",
        //                 city : "Breda"
        //             })
        //             done();
        //         })
        // })
    })
    

    describe("UC-202 Overview of all users /api/user", ()=> {

        it("TC-202-1 legen lijst van user terug geven ", (done) => {
            chai
                .request(server)
                .get("/api/user/?firstName=vuelta")
                .auth(validToken, { type: 'bearer' })
                .end((err,res) => {
                    res.should.be.an("object")
                    let {status, results} = res.body;
                    status.should.equals(200)
                    results.should.be.an('array').that.lengthOf(0);
                    done();
                });
        });

        // it("TC-202-2 beide users weergeven", (done) => {
        //     chai
        //         .request(server)
        //         .get("/api/user/?firstname=Matthijs")
        //         .auth(validToken, { type: 'bearer' })
        //         .end((err,res) => {
        //             res.should.be.an("object")
        //             let {status, results} = res.body;
        //             status.should.equals(200)
        //             results.should.be.an('array').that.lengthOf(2);
        //             done();
        //         });
        // });

        it("TC-202-3 Search for non-existing name while getting all users", (done) => {
            chai
                .request(server)
                .get("/api/user?firstName=TourDeFrance")
                .auth(validToken, { type: 'bearer' })
                .end((err,res) => {
                    res.should.be.an("object")
                    let {status, results} = res.body;
                    status.should.equals(200)
                    results.should.be.an('array').that.lengthOf(0);
                    done();
                });
        });

        it("TC-202-4 zoeken doormiddel van isActive op false te zetten", (done) => {
            chai
                .request(server)
                .get("/api/user?isActive=0")
                .auth(validToken, { type: 'bearer' })
                .end((err,res) => {
                    res.should.be.an("object")
                    let {status, results} = res.body;
                    status.should.equals(200)
                    results.should.be.an('array').that.lengthOf(1);
                    done();
                });
        });

        it("TC-202-5 zoeken doormiddel van isActive op true te zetten", (done) => {
            chai
                .request(server)
                .get("/api/user?isActive=1")
                .auth(validToken, { type: 'bearer' })
                .end((err,res) => {
                    res.should.be.an("object")
                    let {status, results} = res.body;
                    status.should.equals(200)
                    results.should.be.an('array').that.lengthOf(1);
                    done();
                });
        });

        it("TC-202-6 Zoeken op een bestaande naam in de lijst", (done) => {
            chai
                .request(server)
                .get("/api/user?firstName=kris")
                .auth(validToken, { type: 'bearer' })
                .end((err,res) => {
                    res.should.be.an("object")
                    let {status, results} = res.body;
                    status.should.equals(200)
                    results.should.be.an('array').that.lengthOf(1);
                    done();
                });
        });
    });

    describe("UC-203 get users profile /api/user/profile", () => {
        it("TC-203-1 Token is niet geldig", (done) => {
            chai
                .request(server)
                .get("/api/user/profile")
                .auth("fakeToken", {type : 'bearer'})
                .end((err, res) => {
                    res.should.be.an("object");
                    let {status, error} = res.body;
                    status.should.equals(401);
                    error.should.be.a("string").that.equals("Not authorized");
                    done();
                })
        })
        // it('TC-203-2 Valide token en gebruiker bestaat', () => {
        //     chai
        //         .request(server)
        //         .get("/api/user/profile")
        //         .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        //         .end((err, res) => {
        //             res.should.be.an("object");
        //             let {status, result} = res.body;
        //             status.should.equals(202);
        //             result.deepEqual({
        //                id: 1,
        //                firstName: "Matthijs",
        //                lastName: "Feringa",
        //                isActive: 1,
        //                emailAdress: "matthijs.fernga@gmail.com",
        //                password: "superSecret1!",
        //                phoneNumber: "0636025385",
        //                roles: "editor, guest",
        //                street : "hoekakker",
        //                city : "Breda",
        //             });
        //             done();
        //         })
        // })
    }) 
    describe("UC-204 get a specific user by id api/user/(userid)", () => {

        it("TC-204-1 ongeldigtoken", (done) => {
            chai
                .request(server)
                .get("/api/user/1")
                .auth("fakeToken", {type : 'bearer'})
                .end((err, res) => {
                    res.should.be.an("object");
                    let {status, error} = res.body;
                    status.should.equals(401);
                    error.should.be.a("string").that.equals("Not authorized");
                    done();
                })
        })
        it("TC-204-2 id bestaat niet", (done) => {
            chai
                .request(server)
                .get("/api/user/1001")
                .auth(validToken, { type: 'bearer' })
                .end((err,res) => {
                    res.should.be.an("object")
                    let {status, result} = res.body;
                    status.should.equals(404)
                    result.should.be.a("string").that.equals("User with Id 1001 is not found");
                    done();
            });
        });
        // it('TC-204-3 id bestaat', (done) => {
        //     chai
        //         .request(server)
        //         .get("/api/user/1")
        //         .set("authorization", "Bearer " + jwt.sign({ userId: 1 }, jwtSecretKey))
        //         .end((err, res) => {
        //             res.should.be.an("object");
        //             let {status, result} = res.body;
        //             status.should.equals(202);
        //             result.deepEqual({
        //                 id: 1,
        //                 firstName: "Matthijs",
        //                 lastName: "Feringa",
        //                 isActive: 1,
        //                 emailAdress: "matthijs.fernga@gmail.com",
        //                 password: "superSecret1!",
        //                 phoneNumber: "0636025385",
        //                 roles: "editor, guest",
        //                 street : "hoekakker",
        //                 city : "Breda",
        //             });
        //             done();
        //         })
        // })
    }) 

    describe("UC-205 Updating a user /api/user", ()=> {

        it("TC-205-1 user updaten zonder alle gegevens", (done) => {
            chai
                .request(server)
                .put("/api/user/2")
                .auth(validToken, { type: 'bearer' })
                .send({
                    // firstName : "Bad",
                    lastName : "Eend",
                    isActive : 1,
                    emailAdress : "badeendje@gmail.com",
                    password : "Badeendje3!",
                    phoneNumber : "0698765432",
                    street : "badderstraat",
                    city : "dobberen"
            })
            .end((err,res) => {
                res.should.be.an("object")
                let {status, result} = res.body;
                status.should.equals(400)
                result.should.be.a("string").that.equals("There isnt enough information to create/update a new user");
                done();
            });
        });

        it("TC-205-3 Telefoonnummer is niet geldig", (done) => {
            chai
                .request(server)
                .put("/api/user/2")
                .auth(validToken, { type: 'bearer' })
                .send({
                    firstName : "Bad",
                    lastName : "Eend",
                    isActive : 1,
                    emailAdress : "badeendje@gmail.com",
                    password : "Badeendje3!",
                    phoneNumber : "112",
                    street : "badderstraat",
                    city : "dobberen"
            })
            .end((err,res) => {
                res.should.be.an("object")
                let {status, result} = res.body;
                status.should.equals(400)
                result.should.be.a("string").that.equals("Firstname must be a string");
                done();
            });
        });

    });
})