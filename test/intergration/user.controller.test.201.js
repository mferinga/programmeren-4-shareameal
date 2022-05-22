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

describe('MEAL API', () => {
    //
    // informatie over before, after, beforeEach, afterEach:
    // https://mochajs.org/#hooks
    //
    before((done) => {
        logger.debug(
            'before: hier zorg je eventueel dat de precondities correct zijn'
        )
        logger.debug('before done')
        done()
    })

    describe('UC201 Create User', () => {
        beforeEach((done) => {
            logger.debug('beforeEach called')
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
                        logger.debug('beforeEach done')
                        done()
                    }
                )
            })
        })
    })

    it("TC-201 required value miss", (done) => {
        chai
            .request(server)
            .post("/api/user")
            .send({
                firstName : "testStrijder",
                //Lastname is missing
                isActive : 0,
                emailAdress : "ikben@teststrijder.com",
                password : "NoWarrior09!",
                phonenumber: "0612345678",
                street : "Ditisgeentest",
                city : "WeleenTest"
        })
        .end((err, res) => {
            console.log(res.body);
            res.should.be.an("object");
            let{status, result} = res.body;
            status.should.equals(400)
            res.body.results.should.be.a("string").that.equals("Not all the data is filled in or your emailadress is incorrect");
        done();
      });
  });
  it("TC-201 email is not valid", (done) => {
    chai
        .request(server)
        .post("/api/user")
        .send({
            firstName : "testStrijder",
            lastName : "Echthoor",
            isActive : 0,
            emailAdress : "ikbenteststrijder.com",
            password : "NoWarrior09!",
            phonenumber: "0612345678",
            street : "Ditisgeentest",
            city : "WeleenTest"
    })
    .end((err, res) => {
        console.log(res.body);
        res.should.be.an("object");
        let{status, result} = res.body;
        status.should.equals(400)
        res.body.results.should.be.a("string").that.equals("Not all the data is filled in or your emailadress is incorrect");
    done();
    });
  }); 

  it("TC-201 password is not valid", (done) => {
    chai
        .request(server)
        .post("/api/user")
        .send({
            firstName : "testStrijder",
            lastName : "Echthoor",
            isActive : 0,
            emailAdress : "ikbenteststrijder.com",
            password : "hoiwww",
            phonenumber: "0612345678",
            street : "Ditisgeentest",
            city : "WeleenTest"
    })
    .end((err, res) => {
        console.log(res.body);
        res.should.be.an("object");
        let{status, result} = res.body;
        status.should.equals(400)
        res.body.results.should.be.a("string").that.equals("Not all the data is filled in or your emailadress is incorrect");
    done();
    });
  });
  
  it("TC-201 email is already in use", (done) => {
    chai
        .request(server)
        .post("/api/user")
        .send({
            firstName : "Johny",
            lastName : "Does",
            isActive : 1,
            emailAdress : "j.doe@server.com",
            password : "secret48512!",
            phonenumber: "0612345678",
            street : "Ditisgeentest",
            city : "WeleenTest"
    })
    .end((err, res) => {
        console.log(res.body);
        res.should.be.an("object");
        let{status, result} = res.body;
        status.should.equals(401)
        res.body.results.should.be.a("string").that.equals("this emailadress is already in use");
    done();
    });
  });
})