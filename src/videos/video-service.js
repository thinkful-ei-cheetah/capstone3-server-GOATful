'use strict';

const VideoService = {
  list(knex, page, user_id) {
    return knex('videos')
      .where({user_id})
      .paginate(9, page, 'desc');
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
  deleteVideo(knex, id){
    return knex
      .delete('*')
      .where({id})
      .from('videos');
  },
  updateActiveVideo(knex, id, active_thumbnail_url){
    return knex('videos')
      .where({id})
      .update({active_thumbnail_url});
  },
  incrementVideo(knex, id){
    return knex('videos')
      .where({id})
      .increment('preview_count');   
  },
  decrementVideo(knex, id){
    return knex('videos')
      .where({id})
      .decrement('preview_count');   
  }
};


module.exports = VideoService;