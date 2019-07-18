'use strict';

const YoutubeSearchResultsService = {
  findByVideoId(knex, video_id) {
    return knex('youtube_search_results')
      .where({video_id})
      .first('data');
  },

  insert(knex, searchResults) {
    return knex('youtube_search_results')
      .insert(searchResults)
      .returning('*')
      .then(rows => rows[0]);
  },

  delete(knex, video_id) {
    return knex('youtube_search_results')
      .where({video_id})
      .delete('*');
  }
};

module.exports = YoutubeSearchResultsService;