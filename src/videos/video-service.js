'use strict';

const VideoService = {
  list(knex, user_id) {
    return knex('videos').where({user_id}).select('*');
  }
};


module.exports = VideoService;