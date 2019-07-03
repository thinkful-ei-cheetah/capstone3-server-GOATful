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
    describe('POST /api/videos', () => {
      const testUsers = helpers.makeUsersArray()
      beforeEach('insert users', () => {
        helpers.seedUsers(db, testUsers)
      })
      it('creates a video, responding with 201 and the new video', () => {
        const newVideo = {
          title: 'test',
          video_length: '03:30',
          youtube_display_name: 'tester',
          tags: ['test1', 'test2', 'test3']
        }
        return supertest(app)
          .post('/api/videos')
          .send(newVideo)
          .expect(201)
          .expect(res => {
            expect(res.body.title).to.eql(newVideo.title)
            expect(res.body.video_length).to.eql(newVideo.video_length)
            expect(res.body.youtube_display_name).to.eql(newVideo.youtube_display_name)
            expect(res.body.tags).to.eql(newVideo.tags)
            expect(res.body).to.have.property('id')
          })
      })
      
      const requiredFields = ['title', 'video_length', 'youtube_display_name', 'tags']

      requiredFields.forEach(field => {
        const newVideo = {
          title: 'Test video',
          video_length: '03:30',
          youtube_display_name: 'elan',
          tags: ['test1', 'test2', 'test3']
        }

        it(`responds with 400 and an error message with the '${field}' is missing`, () => {
          delete newVideo[field]

          return supertest(app)
            .post('/api/videos')
            .send(newVideo)
            .expect(400, {
              error: { message: `Missing '${field}' in request body` }
            })
        })
      })
    })
    describe(`GET /api/videos/:video_id`, () => {
      context('Given there are videos in the database', () => {
        const testUsers = helpers.makeUsersArray()
        const testVideos = helpers.makeVideosArray(testUsers)

        beforeEach('insert videos', () => 
          helpers.seedTables(
            db,
            testUsers,
            testVideos
          )
        )

        it('responds with 200 and the specified video', () => {
          const videoId = 1
          const expectedVideo = testVideos[videoId - 1]
          return supertest(app)
            .get(`/api/videos/${videoId}`)
            .expect(200, expectedVideo)
        })
        it('responds with 404 and an error when the video does not exist', () => {
          const videoId = 12394
          return supertest(app)
            .get(`/api/videos/${videoId}`)
            .expect(404, {
              error: { message: `Video doesn't exist` }
            })
        })
      })
    })

    describe(`PATCH /api/videos/:video_id`, () => {
      context('Given there are videos in the database', () => {
        const testUsers = helpers.makeUsersArray()
        const testVideos = helpers.makeVideosArray(testUsers)

        beforeEach('insert videos', () => 
          helpers.seedTables(
            db,
            testUsers,
            testVideos
          )
        )

        it('responds with 204 and updates the article', () => {
          const idToUpdate = 1
          const updatedVideo = {
            title: 'New test title'
          }
          const expectedVideo = {
            ...testVideos[idToUpdate - 1],
            ...updatedVideo
          }
          return supertest(app)
            .patch(`/api/videos/${idToUpdate}`)
            .send(updatedVideo)
            .expect(204)
            .then(res => 
              supertest(app)
              .get(`/api/videos/${idToUpdate}`)
              .expect(expectedVideo))
        })

        it(`responds with 400 when no required fields are supplied`, () => {
          const idToUpdate = 1
          return supertest(app)
            .patch(`/api/videos/${idToUpdate}`)
            .send({ irrelevantField: 'foobar' })
            .expect(400, {
              error: { message: `Request body must contain either 'title', 'video_length', 'youtube_display_name', or 'tags'` }
            })
        })
      })
    })
  });
});