'use strict';

const PreviewService = {
  insert(knex, preview) {
    return knex('previews')
      .insert(preview)
      .returning('*')
      .then(rows => rows[0]);
  }
};

module.exports = PreviewService;