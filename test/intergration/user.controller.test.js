process.env.DB_DATABASE = process.env.DB_DATABASE || 'share-a-meal-testdb' 

const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../../index');
let database = [];

chai.should();
chai.use(chaiHttp);

describe('Manage users',()=>{
    describe('UC-201 add movies /api/user', ()=> {
        beforeEach((done) => {
            database= [];
            done();
        });
        it('TC-201When a required input is missing, a valid error should be returned',(done)=>{
            chai
            .request(server)
            .post('/api/user')
            .send({
                // name is missing
                email : 'testmail@gmail.com',
                age : 18,
                password : 'password123',
            })
            .end((err, res) => {
                res.should.be.an('object');
                let { status, result } = res.body;
                status.should.equals(400)
                result.should.be.a('string').that.equals('Name must be a string');
                done();
            });
        });
    });
});