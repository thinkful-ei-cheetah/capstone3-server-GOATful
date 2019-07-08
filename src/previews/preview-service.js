'use strict';
const xss = require('xss');

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
  insertPreview(knex, newPreview){
    return knex
      .insert(newPreview)
      .into('previews')
      .returning('*')
      .then(([insertedPreview]) => this.serializePreview(insertedPreview));
  }, 
  updatePreview(knex, id, update){
    return knex('previews')
      .where({ id })
      .update(update)
      .returning('*')
      .then(([insertedPreview]) => this.serializePreview(insertedPreview));
  },
  //handle xss problems
  serializePreview(preview) {
    return {
      id: preview.id,
      created_at: preview.created_at,
      updated_at: preview.updated_at,
      thumbnail_url: preview.thumbnail_url,
      video_id: preview.video_id,
      is_active: preview.is_active,
      title: xss(preview.title),
      description: xss(preview.description)
    };
  }
};

