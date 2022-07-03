process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
process.env.LOGLEVEL = 'warn'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../index')
const assert = require('assert')
require('dotenv').config()
const dbconnection = require('../../src/database/dbconnection')
const jwt = require('jsonwebtoken')
const { jwtSecretKey, logger } = require('../../src/config/config')

chai.should()
chai.use(chaiHttp)

/**
 * Db queries to clear and fill the test database before each test.
 */
const CLEAR_MEAL_TABLE = 'DELETE IGNORE FROM `meal`;'
const CLEAR_PARTICIPANTS_TABLE = 'DELETE IGNORE FROM `meal_participants_user`;'
const CLEAR_USERS_TABLE = 'DELETE IGNORE FROM `user`;'
const CLEAR_DB = CLEAR_MEAL_TABLE + CLEAR_PARTICIPANTS_TABLE + CLEAR_USERS_TABLE

/**
 * Voeg een user toe aan de database. Deze user heeft id 1.
 * Deze id kun je als foreign key gebruiken in de andere queries, bv insert meal.
 */
const INSERT_USER =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(1, "first", "last", "name@server.nl", "secret", "street", "city");'

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"
    

describe('UC201 Create user', () => {
    beforeEach((done) => {
        console.log('beforeEach called')
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err // not connected!

            // Use the connection
            connection.query(
                CLEAR_DB + INSERT_USER,
                function (error, results, fields) {
                    // When done with the connection, release it.
                    connection.release()

                    // Handle error after the release.
                    if (error) throw error
                    // Let op dat je done() pas aanroept als de query callback eindigt!
                    console.log('beforeEach done')
                    done()
                }
            )
        })
    })
    it('TC-201-1 verplicht veld ontbreekt', (done) => {
        chai
            .request(server)
            .post("/api/user")
            .send({
                firstName : "Matthijs",
                lastName : "Feringa",
                emailAdress : "mt.feringa@student.avans.nl",
                // password : "SuperSecret001!"
            })
            .end((err, res) => {
                res.should.be.an("object");
                let {status, result} = res.body;
                status.should.equals(400);
                res.body.should.be.a("string").that.equals("Password must be a string");
                done();
            })
    })
    
    it('TC-201-2 Niet-valide email adres', (done) => {
        chai
            .request(server)
            .post("/api/user")
            .send({
                firstName : "Matthijs",
                lastName : "Feringa",
                emailAdress : "matthijs.feringa#gmail.com",
                password : "SuperSecret001!"
            })
            .end((err, res) => {
                res.should.be.an("object");
                let {status, result} = res.body;
                status.should.equals(400);
                res.body.should.be.a("string").that.equals("invalid emailaddress");
                done();
            })
    })
    
    it('TC-201-3 Niet-valide wachtwoord', (done) => {
        chai
            .request(server)
            .post("/api/user")
            .send({
                firstName : "Matthijs",
                lastName : "Feringa",
                emailAdress : "matthijs.feringa#gmail.com",
                password : "toweak"
            })
            .end((err, res) => {
                res.should.be.an("object");
                let {status, result} = res.body;
                status.should.equals(400);
                res.body.should.be.a("string").that.equals("Password is not strong enough");
                done();
            })
    })
    
    it('TC-201-4 Gebruiker bestaat al', (done) => {
        chai
            .request(server)
            .post("/api/user")
            .send({
                firstName : "first",
                lastName : "last",
                emailAdress : "name@server.nl",
                password : "secret"
            })
            .end((err, res) => {
                res.should.be.an("object");
                let {status, result} = res.body;
                status.should.equals(409);
                res.body.should.be.a("string").that.equals("this emailadress is already in use");
                done();
            })
    })
    
    it('TC-201-5 Gebruiker succesvik geregistreerd', (done) => {
        chai
            .request(server)
            .post("/api/user")
            .send({
                firstName : "Matthijs",
                lastName : "Feringa",
                emailAdress : "matthijs.feringa@gmail.com",
                password : "SuperSecret001!",
                street : "hoekakker",
                city : "Breda"
            })
            .end((err, res) => {
                res.should.be.an("object");
                let {status, result} = res.body;
                status.should.equals(201);
                assert.deepEqual(result , {
                    id : 2,
                    firstName : "Matthijs",
                    lastName : "Feringa",
                    emailAdress : "matthijs.feringa@gmail.com",
                    password : "SuperSecret001!",
                    street : "hoekakker",
                    city : "Breda"
                })
                done();
            })
    })
    
})




    