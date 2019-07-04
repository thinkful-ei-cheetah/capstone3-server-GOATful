'use strict';
/*global supertest, expect*/
const app = require ('../../src/app');
const helpers = require('../test-helpers');
const knex = require('knex');
require('dotenv').config();

describe('Previews Endpoints', ()=> {
  let db;
  
  const {
    testUsers,
    testVideos,
    testPreviews,
  } = helpers.makeFixtures();


  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  beforeEach('seed tables', () => 
    helpers.seedTables(
      db,
      testUsers,
      testVideos,
      testPreviews
    ));

  afterEach('cleanup', () => helpers.cleanTables(db));

  context('GET endpoint working with seeded data', () =>{
    
    it('resolves no videos with given id', () => {
      return supertest(app)
        .get('/api/videos/100/previews')
        .expect(200, []);
    });
    
    it('resolves a valid request and returns previews', () => {
      return supertest(app)
        .get('/api/videos/1/previews')
        .expect(200, testPreviews);
    });
  });

  context('POST endpoint working with seeded data', () => {
    const newPreview = 
    it('locates a user with the right username but wrong password', () => {
      return supertest(app)
        .post('/api/videos/1')
        .send({user_name: 'jamster1', password: 'password1'})
        .expect(401, {message: 'invalid username or password'});
    });

    it('Sends a JWT Token to the authorized client', () => {
      
      const expectedToken = jwt.sign({'user_id': 1,}, process.env.JWT_SECRET, {
        subject: 'jamster1',
        algorithm: 'HS256',
        expiresIn: process.env.JWT_EXPIRATION
      });

      const expiredToken = jwt.sign({'user_id': 1,}, process.env.JWT_SECRET, {
        subject: 'jamster1',
        algorithm: 'HS256',
        expiresIn: '-1s'
      });

      return request(app)
        .post('/api/auth/login')
        .send({user_name: 'jamster1', password: 'password'})
        .expect(200)
        .then( res => {
          expect(res.body).to.have.property('token');
        });

    });

    it('handles no token', () => {
      return request(app)
        .post('/api/auth/refresh')
        .set('token', 'bad')
        .send({user_name: 'jamster1', password: 'password'})
        .expect(401);
    });

    it('handles good token', () => {
      return request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'bearer test')
        .send({user_name: 'jamster1', password: 'password'})
        .expect(200);
    });  
  });
});

