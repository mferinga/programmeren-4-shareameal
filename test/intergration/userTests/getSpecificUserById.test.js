process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb'
process.env.LOGLEVEL = 'warn'

const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../../../index')
const assert = require('assert')
require('dotenv').config()
const dbconnection = require('../../../database/dbconnection')
const jwt = require('jsonwebtoken')
const { jwtSecretKey, logger } = require('../../../src/config/config')

chai.should()
chai.use(chaiHttp)

let fakeToken = "ditIsEenNepToken12121";

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

const INSERT_USER2 =
    'INSERT INTO `user` (`id`, `firstName`, `lastName`, `emailAdress`, `password`, `street`, `city` ) VALUES' +
    '(2, "second", "latest", "second.latest@server.nl", "supersecret", "streets", "cities");'

/**
 * Query om twee meals toe te voegen. Let op de cookId, die moet matchen
 * met een bestaande user in de database.
 */
const INSERT_MEALS =
    'INSERT INTO `meal` (`id`, `name`, `description`, `imageUrl`, `dateTime`, `maxAmountOfParticipants`, `price`, `cookId`) VALUES' +
    "(1, 'Meal A', 'description', 'image url', NOW(), 5, 6.50, 1)," +
    "(2, 'Meal B', 'description', 'image url', NOW(), 5, 6.50, 1);"

describe('UC204 get specificuser', () => {
    let token;

    beforeEach((done) => {
        console.log('beforeEach called')
        // maak de testdatabase leeg zodat we onze testen kunnen uitvoeren.
        dbconnection.getConnection(function (err, connection) {
            if (err) throw err // not connected!

            // Use the connection
            connection.query(
                CLEAR_DB + INSERT_USER + INSERT_USER2,
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
        chai
            .request(server)
            .post("/api/auth/login")
            .send({
                emailAdress : "name@server.nl",
                password : "secret"
            })
            .end((err, res) => {
                if(res.body.results.token){
                    token = res.body.results.token;
                }
            })
    })
    it('TC-204-1 ongeldigtoken', () => {
        chai
            .request(server)
            .get("/api/user/?firstName=qwerty")
            .set("authorization", "Bearer " + jwt.sign({ id: 1 }, fakeToken))
            .end((err, res) => {
                res.should.be.an("object");
                let {status, result} = res.body;
                status.should.equals(401);
                res.body.error.should.eql("Not authorized");
                done();
            })
    })
    it('TC-204-2 id bestaat niet', () => {
        chai
            .request(server)
            .get("/api/user/10")
            .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
            .end((err, res) => {
                res.should.be.an("object");
                let {status, result} = res.body;
                status.should.equals(404);
                res.body.error.should.eql("User with Id 10 is not found");
                done();
            })
    })
    it('TC-204-3 id bestaat', () => {
        chai
            .request(server)
            .get("/api/user/1")
            .set("authorization", "Bearer " + jwt.sign({ id: 1 }, jwtSecretKey))
            .end((err, res) => {
                res.should.be.an("object");
                let {status, result} = res.body;
                status.should.equals(202);
                res.body.error.should.eql({
                    id: 1,
                    firstName: "first",
                    lastName: "last",
                    isActive: 1,
                    emailAdress: "name@server.nl",
                    password: "secret",
                    phoneNumber: "",
                    roles: "editor, guest",
                    street : "street",
                    city : "city",
                });
                done();
            })
    })

})
