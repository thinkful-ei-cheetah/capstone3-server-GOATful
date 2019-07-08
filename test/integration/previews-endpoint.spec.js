'use strict';
/*global supertest, expect*/
const app = require ('../../src/app');
const helpers = require('../test-helpers');
const knex = require('knex');
require('dotenv').config();
const secret = process.env.JWT_SECRET;

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
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
        .expect(400, {message: 'No video found matching selected query'});
    });
    
    it('resolves a valid request and returns previews', () => {
      return supertest(app)
        .get('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
        .expect(200)
        .then( res => {
          expect(res.body.video).to.have.property('id');
          expect(res.body.video).to.have.property('tags');
          expect(res.body.video).to.have.property('youtube_display_name');
          expect(res.body.previews).to.be.an('array');
        });
    });
  });

  context('POST endpoint working with seeded data', () => {
    const newPreview1 = {is_active:false, title:'yes', description: 'trr', video_id:2 };
    it('prevents posting if missing fields(thumbnail)', () => {
      return supertest(app)
        .post('/api/videos/2/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
        .send(newPreview1)
        .expect(400, { message: '"thumbnail_url" is required' });
    });

    const newPreview2 = { thumbnail_url: 'present', title:'yes', description: 'trr' };
    it('prevents posting if missing fields(is_active)', () => {
      return supertest(app)
        .post('/api/videos/2/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
        .send(newPreview2)
        .expect(400, { message: '"video_id" is required' });
    });

    it('Handles invalid video_id', () => {
      const newPreview3 = { is_active: false, thumbnail_url: 'present', title:'yes', description: 'trr', video_id:300};
      return supertest(app)
        .post('/api/videos/2/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
        .send(newPreview3)
        .expect(400, {message: 'Invalid video ID'});
    });

    it('successfully inserts good data', () => {
      const newPreview4 = { is_active: true, thumbnail_url: 'present', title:'yes', description: 'trr', video_id:1};
      return supertest(app)
        .post('/api/videos/2/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
        .send(newPreview4)
        .expect(201)
        .then(res => {
          expect(res.body.preview[0].title).to.eql('yes');
          expect(res.body.video.title).to.eql('First test video!');
        });
    });

    it('increments video preview count', () => {
      const newPreview5 = { is_active: true, thumbnail_url: 'present', title:'yes', description: 'trr', video_id: 1};
      return supertest(app)
        .post('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
        .send(newPreview5)
        .expect(201)
        .then(res => {
          return supertest(app)
            .get('/api/videos/1')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
            .then(res =>{
              expect (res.body.preview_count).to.eql(3);
            });
        });
     
    });
  });

  context('PATCH endpoint working with seeded data', () => {
    const newPreview1 = {id: 1, is_active:false, title:'yes', description: 'trr', video_id:2 };
    it('prevents posting if missing fields(thumbnail)', () => {
      return supertest(app)
        .patch('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
        .send(newPreview1)
        .expect(400, { message: '"thumbnail_url" is required' });
    });
   
    const newPreview2 = {id: 1, is_active:false, description: 'trr', video_id:2 };
    it('prevents posting if missing fields(title)', () => {
      return supertest(app)
        .patch('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
        .send(newPreview2)
        .expect(400, { message: '"title" is required' });
    });

    const update = {id: 1, is_active: true, thumbnail_url: 'hello', title:'apps', description: 'trr', video_id: 1};
    it('Properly updates', () => {
      return supertest(app)
        .patch('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
        .send(update)
        .expect(201)
        .then(res => {
          return supertest(app)
            .get('/api/videos/1/previews')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0], secret, '10000ms'))
            .then(res =>{
              expect (res.body.previews[1].title).to.eql('apps');
              expect (res.body.previews[1].thumbnail_url).to.eql('hello');
            });
        });
    });
  });
});

