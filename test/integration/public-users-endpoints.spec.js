'use strict';
/* globals supertest, expect */
const knex = require('knex');
const app = require('../../src/app');
const helpers = require('../test-helpers');

describe('Public Users Endpoints', function() {
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
  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('POST /api/public-users/create-video-and-preview', () => {
    beforeEach(() => helpers.seedUsers(db, testUsers));

    it('returns 400 if video obj missing from request', () => {
      return supertest(app)
        .post('/api/public-users/create-video-and-preview')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({preview: {}})
        .expect(400, {message: 'preview and video object required'});
    });

    it('returns 400 if preview obj missing from request', () => {
      return supertest(app)
        .post('/api/public-users/create-video-and-preview')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({video: {}})
        .expect(400, {message: 'preview and video object required'});
    });

    it('returns 400 if invalid video', () => {
      delete testVideos[0].title;
      return supertest(app)
        .post('/api/public-users/create-video-and-preview')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({video: testVideos[0], preview:{}})
        .expect(400);
    });

    it('returns 400 if invalid preview', () => {
      delete testPreviews[0].title;
      return supertest(app)
        .post('/api/public-users/create-video-and-preview')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({video: testVideos[0], preview: testPreviews[0]})
        .expect(400);
    });

    it('returns 201 with the saved preview object', () => {
      delete testVideos[1].id;
      delete testVideos[1].preview_count;
      delete testVideos[1].is_active;
      delete testPreviews[1].id;
      return supertest(app)
        .post('/api/public-users/create-video-and-preview')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({video: testVideos[1], preview: testPreviews[1]})
        .expect(201)
        .then(res => {
          expect(res.body.video_id).to.equal(1);
          expect(res.body.id).to.equal(1);
          expect(res.body.id).to.equal(1);
          expect(res.body.thumbnail_url).to.equal(testPreviews[1].thumbnail_url);
          expect(res.body.title).to.equal(testPreviews[1].title);
          expect(res.body.description).to.equal(testPreviews[1].description);
          expect(res.body.is_active).to.equal(true);
        });
    });
  });

});
