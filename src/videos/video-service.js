'use strict';

const VideoService = {
  list(knex, user_id) {
    return knex('videos')
      .where({user_id})
      .select('*');
  },
  getVideoById(knex, id) {
    return knex('videos')
      .where({ id })
      .select('*');
  },
  insertVideo(knex, video) {
    return knex
      .insert(video)
      .into('videos')
      .returning('*')
      .then(rows => rows[0]);
  },
  updateVideo(knex, id, newVideo) {
    return knex('videos')
      .where({ id })
      .update(newVideo);
  },
  incrementVideo(knex, id){
    return knex('videos')
      .where({id})
      .increment('preview_count');
      
  }
};


module.exports = VideoService;