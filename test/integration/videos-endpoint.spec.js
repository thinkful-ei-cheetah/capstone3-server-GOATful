'use strict';
/* globals supertest */
const knex = require('knex');
const app = require('../../src/app');
const helpers = require('../test-helpers');
const VideoService = require('../../src/videos/video-service');

describe('Videos Endpoints', function() {
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

  describe('GET /api/videos', () => {
    context('Given no videos', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/videos')
          .expect(200, []);
      });
    });

    context('Given videos', () => {
      beforeEach('insert videos', () =>
        helpers.seedTables(
          db,
          testUsers,
          testVideos,
          testPreviews,
        )
      );
      it('responds with 200 and array of video objects', () => {
        return supertest(app)
          .get('/api/videos')
          .expect(200)
          .then(async res => {
            const videos = await VideoService.list(db, testUsers[0].id);
            // delete videos[0].created_at;
            // delete videos[0].updated_at;
            expect(res.body.length).to.equal(videos.length);
            expect(res.body[0].id).to.equal(videos[0].id);
          });
      });
    });
  });
});