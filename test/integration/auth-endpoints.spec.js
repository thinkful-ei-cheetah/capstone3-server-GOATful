'use strict';
/* globals supertest */
const knex = require('knex');
const app = require('../../src/app');
const helpers = require('../test-helpers');
const AuthService = require('../../src/auth/auth-service');

describe('Auth Endpoints', function() {
  let db;

  const testUsers = helpers.makeUsersArray();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/auth/login', () => {
    context('Given the user does not exist', () => {
      it('creates a new user and responds with an auth token', () => {
        const fakeGoogleResponse = {name: 'foo bar', picture: 'https://some-pic.com', email: 'fake@fake.com'};
        AuthService.verifyGoogleToken = () => fakeGoogleResponse;

        return supertest(app)
          .post('/api/auth/login')
          .set('Content-Type', 'application/json')
          .send({id_token: 'foobar'})
          .expect(200)
          .then(async res => {
            const user = await db('users').where({email: 'fake@fake.com'}).first('*');
            const userPayload = {
              user_id: user.id,
              full_name: user.full_name,
              email: user.email,
              avatar: user.avatar
            };
            const expectedToken = AuthService.createJwt(user.email, userPayload);
            expect(res.body.authToken).to.equal(expectedToken);
          });
      });
    });

    context('given the user does exist', () => {
      beforeEach(() => helpers.seedUsers(db, testUsers));

      it('finds the user and returns an auth token', () => {
        const fakeGoogleResponse = {email: testUsers[0].email};
        AuthService.verifyGoogleToken = () => fakeGoogleResponse;

        return supertest(app)
          .post('/api/auth/login')
          .set('Content-Type', 'application/json')
          .send({id_token: 'foobar'})
          .expect(200)
          .then(async res => {
            const user = await db('users').where({email: testUsers[0].email}).first('*');
            const userPayload = {
              user_id: user.id,
              full_name: user.full_name,
              email: user.email,
              avatar: user.avatar
            };
            const expectedToken = AuthService.createJwt(user.email, userPayload);
            expect(res.body.authToken).to.equal(expectedToken);
          });
      });
    });

  });
});