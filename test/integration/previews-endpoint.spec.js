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


  context('GET /api/videos/:video_id/previews/active', () => {
    it('returns title and description of the active preview', () => {
      return supertest(app)
        .get('/api/videos/1/previews/active')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(200)
        .then(async res => {
          expect(res.body.title).to.equal(testPreviews[0].title);
          expect(res.body.description).to.equal(testPreviews[0].description);
        });
    });

    it('returns error message if NO active preview', () => {
      return supertest(app)
        .get('/api/videos/2/previews/active')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400, {message: 'no active preview for video'});
    });
  });
  
  context('GET endpoint working with seeded data', () =>{
    it('resolves no videos with given id', () => {
      return supertest(app)
        .get('/api/videos/100/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400, {message: 'No video found matching selected query'});
    });
    
    it('resolves a valid request and returns previews', () => {
      return supertest(app)
        .get('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
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
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newPreview1)
        .expect(400, { message: '"thumbnail_url" is required' });
    });

    const newPreview2 = { thumbnail_url: 'present', title:'yes', description: 'trr' };
    it('prevents posting if missing fields(is_active)', () => {
      return supertest(app)
        .post('/api/videos/2/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newPreview2)
        .expect(400, { message: '"video_id" is required' });
    });

    it('Handles invalid video_id', () => {
      const newPreview3 = { is_active: false, thumbnail_url: 'present', title:'yes', description: 'trr', video_id:300};
      return supertest(app)
        .post('/api/videos/2/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newPreview3)
        .expect(400, {message: 'Invalid video ID'});
    });

    it('successfully inserts good data', () => {
      const newPreview4 = { is_active: true, thumbnail_url: 'present', title:'yes', description: 'trr', video_id:1};
      return supertest(app)
        .post('/api/videos/2/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
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
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newPreview5)
        .expect(201)
        .then(res => {
          return supertest(app)
            .get('/api/videos/1')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .then(res =>{
              expect (res.body.preview_count).to.eql(3);
            });
        });
    });

    context('when a video has no previews', () => {
      it('sets active_thumbnail_url to the preview\'s thumbnail_url', () => {
        const newPreview = { is_active: true, thumbnail_url: 'present', title:'yes', description: 'trr', video_id:2};
        return supertest(app)
          .post('/api/videos/2/previews')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .send(newPreview)
          .expect(201)
          .then(res => {
            expect(res.body.preview[0].title).to.eql('yes');
            expect(res.body.video.title).to.eql(testVideos[1].title);
            expect(res.body.video.active_thumbnail_url).to.equal(newPreview.thumbnail_url);
          });
      });
    });
    
  });

  context('PATCH endpoint working with seeded data', () => {
    const newPreview1 = {id: 1, is_active:false, title:'yes', description: 'trr', video_id:2 };
    it('prevents posting if missing fields(thumbnail)', () => {
      return supertest(app)
        .patch('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newPreview1)
        .expect(400, { message: '"thumbnail_url" is required' });
    });
   
    const newPreview2 = {id: 1, is_active:false, description: 'trr', video_id:2 };
    it('prevents posting if missing fields(title)', () => {
      return supertest(app)
        .patch('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newPreview2)
        .expect(400, { message: '"title" is required' });
    });

    const update = {id: 2, is_active: true, thumbnail_url: 'hello', title:'apps', description: 'trr', video_id: 1, changeActive: true};
    it('Properly updates', () => {
      return supertest(app)
        .patch('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(update)
        .expect(201)
        .then(res => {
          return supertest(app)
            .get('/api/videos/1/previews')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .then(res =>{
              expect (res.body.previews[1].title).to.eql('apps');
              expect (res.body.previews[1].thumbnail_url).to.eql('hello');
            });
        });
    });
    it('updates the active status only if necessary', () => {
      return supertest(app)
        .get('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .then(res =>{
          expect (res.body.previews[1].id).to.eql(2);
          expect (res.body.previews[1].is_active).to.eql(false);
          expect (res.body.previews[0].id).to.eql(1);
          expect (res.body.previews[0].is_active).to.eql(true);
          return supertest(app)
            .patch('/api/videos/1/previews')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(update)
            .expect(201)
            .then(res => {
              return supertest(app)
                .get('/api/videos/1/previews')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .then(res =>{
                  expect (res.body.previews[1].id).to.eql(2);
                  expect (res.body.previews[1].is_active).to.eql(true);
                  expect (res.body.previews[0].id).to.eql(1);
                  expect (res.body.previews[0].is_active).to.eql(false);
                });
            });
        });
    });
    it('updates the video to the new URL', () => {
      return supertest(app)
        .get('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .then(res =>{
          expect (res.body.video.active_thumbnail_url).to.eql('http://placehold.it/500x500');
          return supertest(app)
            .patch('/api/videos/1/previews')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(update)
            .expect(201)
            .then(res => {
              return supertest(app)
                .get('/api/videos/1/previews')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .then(res =>{
                  expect (res.body.video.active_thumbnail_url).to.eql('hello');
                });
            });
        });
    });
  });

  context('Delete endpoint working', () => {
    it('deletes the right preview', ()=>{
      return supertest(app)
        .delete(('/api/videos/1/previews'))
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({id: 1, video_id: 1})
        .expect(200);  
    });
    it('decrements the video count', ()=>{
      return supertest(app)
        .get('/api/videos/1/previews')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .then(res => {
          expect(res.body.video.preview_count).to.eql(2);
          return supertest(app)
            .delete(('/api/videos/1/previews'))
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send({id: 1, video_id: 1})
            .expect(200)
            .then( res =>{
              return supertest(app)
                .get('/api/videos/1/previews')
                .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                .then(res => {
                  expect(res.body.video.preview_count).to.eql(1);
                });
            });       
        });
    });
    it('handles bad request (bad video_id)', ()=>{
      return supertest(app)
        .delete(('/api/videos/1/previews'))
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({id: 1, video_i: 1})
        .expect(400);  
    });
    it('handles bad request (bad id)', ()=>{
      return supertest(app)
        .delete(('/api/videos/1/previews'))
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send({isd: 1, video_id: 1})
        .expect(400);  
    });
    it('prevents mismatch video_id with preview', ()=>{
      return supertest(app)
        .delete(('/api/videos/1/previews'))
        .send({id: 1, video_id: 9})
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400);  
    });
    it('prevents delete if preview id not found', ()=>{
      return supertest(app)
        .delete(('/api/videos/1/previews'))
        .send({id: 20, video_id: 9})
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .expect(400);  
    });  
  });
});