'use strict';
/* globals supertest */
const knex = require('knex');
const app = require('../../src/app');
const helpers = require('../test-helpers');

describe('Protected Endpoints', function() {
  let db;
  let testUsers = helpers.makeUsersArray();

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

  beforeEach('seed users', () => helpers.seedUsers(db, testUsers));

  const protectedEndpoints = [
    {
      name: 'POST /api/public-users/create-video-and-preview',
      path: '/api/public-users/create-video-and-preview',
      method: supertest(app).post
    },
  ];

  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {
      it('returns 401 "Missing bearer token" if no token provided', () => {
        return endpoint.method(endpoint.path)
          .expect(401, {message: 'Missing bearer token'});
      });

      it('returns 401 "Unauthorized request" when invalid JWT secret', () => {
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], 'badSecret'))
          .expect(401, { message: 'Unauthorized request' });
      });

      it('returns 401 "Unauthorized request" when JWT is expired', () => {
        const secret = process.env.JWT_SECRET;
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '1ms'))
          .expect(401, { message: 'Unauthorized request' });
      });

      it('returns 401 "Unauthorized request" when invalid email', async () => {
        const invalidUser = testUsers[0];
        invalidUser.email = 'fake@fake.fake';

        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { message: 'Unauthorized request' });
      });
    });
  });
});