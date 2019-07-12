'use strict';
const xss = require('xss');
const VideoService = require('../videos/video-service');

module.exports = {
  //Get all previews for matching video ID
  getPreviews(knex, video_id){
    return knex
      .select('*')
      .from('previews')
      .where({video_id})
      .then(previews => {
        return  previews.map(this.serializePreview);
      });
  }, 
  deletePreview(knex, id){
    return knex
      .delete('*')
      .from('previews')
      .where({id});
  },
  setAllActivesToFalse(knex, video_id){
    return knex('previews')
    .where({ video_id })
    .update('is_active', false)
  }, 
  insertPreview(knex, newPreview){
    return knex
      .insert(newPreview)
      .into('previews')
      .returning('*')
      .then(async ([insertedPreview]) => {
        const videos = await VideoService.getVideoById(knex, insertedPreview.video_id);
        const video = videos[0];
        if (video.preview_count === 0) {
          video.active_thumbnail_url = insertedPreview.thumbnail_url;
          video.preview_count = 1;
          await VideoService.updateVideo(knex, video.id, video);
        } else {
          await VideoService.incrementVideo(knex, video.id);
        }
        return this.serializePreview(insertedPreview);
      });
  }, 
  updatePreview(knex, id, update){
    return knex('previews')
      .where({ id })
      .update(update)
      .returning('*')
      .then(([insertedPreview]) => this.serializePreview(insertedPreview));
  },
  getPreviewById(knex, id){
    return knex
    .select('*')
    .from('previews')
    .where({ id })
    .then(([preview]) => preview);  
  },
  deleteAllPreviews(knex, video_id){
    return knex 
      .delete('*')
      .from('previews')
      .where({video_id})
  },
  //handle xss problems
  serializePreview(preview) {
    return {
      id: preview.id,
      created_at: preview.created_at,
      updated_at: preview.updated_at,
      thumbnail_url: xss(preview.thumbnail_url),
      video_id: preview.video_id,
      is_active: preview.is_active,
      title: xss(preview.title),
      description: xss(preview.description)
    };
  }
};

