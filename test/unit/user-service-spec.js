'use strict';
require('../setup');
const helpers = require('../test-helpers');
const UserService = require('../../src/users/user-service');
const knex = require('knex');

describe('UserService', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => helpers.cleanTables(db));
  afterEach('cleanup', () => helpers.cleanTables(db));

  describe('insert', () => {
    it('creates a new user', async () => {
      const newUser = {full_name: 'foo bar', email: 'foo@bar.com', avatar: 'https://placeholder.com/foobar'};

      const savedUser = await UserService.insert(db, newUser);
      expect(newUser.full_name).to.equal(savedUser.full_name);
      expect(newUser.email).to.equal(savedUser.email);
      expect(newUser.avatar).to.equal(savedUser.avatar);
      
    });
  });
});