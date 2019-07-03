'use strict';

const UserService = {
  insert(knex, user) {
    return knex('users')
      .insert(user)
      .returning(['id','full_name', 'email', 'avatar'])
      .then(rows => rows[0]);
  }
};

module.exports = UserService;