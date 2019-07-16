'use strict';
/* globals supertest */
const knex = require('knex');
const app = require('../../src/app');
const helpers = require('../test-helpers');

describe('Protected Endpoints', function() {
  let db;
  
  const {
    testUsers,
    testVideos,
    testPreviews,
    testYoutubeResults
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
  afterEach('cleanup', () => helpers.cleanTables(db));
  
  beforeEach('seed tables', () => helpers.seedTables(db, testUsers, testVideos, testPreviews, testYoutubeResults));
  

  const protectedEndpoints = [
    {
      name: 'POST /api/public-users/create-video-and-preview',
      path: '/api/public-users/create-video-and-preview',
      method: supertest(app).post
    },
    {
      name: 'POST /api/videos/1/youtube-search-results',
      path: '/api/videos/1/youtube-search-results',
      method: supertest(app).post
    },
    {
      name: 'GET /api/videos/1/youtube-search-results',
      path: '/api/videos/1/youtube-search-results',
      method: supertest(app).get
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
          .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '-1ms'))
          .expect(401, { message: 'Unauthorized request' });
      });

      it('returns 401 "Unauthorized request" when invalid email', () => {
        const invalidUser = testUsers[0];
        invalidUser.email = 'fake@fake.fake' + Math.floor(Math.random() * 10000);

        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(invalidUser))
          .expect(401, { message: 'Unauthorized request' });
      });
    });
  });
});