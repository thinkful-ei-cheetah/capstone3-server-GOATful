'use strict';
/* globals supertest, expect */
const knex = require('knex');
const app = require('../../src/app');
const helpers = require('../test-helpers');

describe('YoutubeSearchResults Endpoints', function() {
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
  beforeEach('seed tables', async () => {
    await helpers.seedTables(db, testUsers, testVideos, testPreviews, testYoutubeResults);
  });

  afterEach('cleanup', () => helpers.cleanTables(db));
  
  describe('GET /api/videos/video_id/youtube-search-results', () => {
    it('returns an empty array when NO results exist', () => {
      return supertest(app)
        .get('/api/videos/2/youtube-search-results')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200, []);
    });

    it('returns array of search results', () => {
      return supertest(app)
        .get('/api/videos/1/youtube-search-results')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200)
        .then(res => {
          expect(res.body).to.eql(JSON.parse(testYoutubeResults[0].data));
        });
    });
  });

  describe('POST /api/videos/video_id/youtube-search-results', () => {
    it ('returns an error if invalid video id', () => {
      return supertest(app)
        .post('/api/videos/100/youtube-search-results')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400, {message: 'invalid video id'});
    });

    it ('returns an error if data key is missing from request body', () => {
      return supertest(app)
        .post('/api/videos/1/youtube-search-results')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400, {message: 'data field is required'});
    });

    it ('saves a new youtube search results successfully', () => {
      return supertest(app)
        .post('/api/videos/2/youtube-search-results')
        .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
        .send({data: helpers.fakeYoutubeSearchResults()})
        .expect(201)
        .then(res => {
          expect(res.body.video_id).to.equal(2);
          expect(res.body.data).to.equal(helpers.fakeYoutubeSearchResults());
        });
    });
  });
});