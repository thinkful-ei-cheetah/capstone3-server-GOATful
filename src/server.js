'use strict';
const app = require('./app');
const { PORT, DB_URL, NODE_ENV } = require('./config');
const knex = require('knex');
const KnexQueryBuilder = require('knex/lib/query/builder');
require('./util/paginate-knex')(KnexQueryBuilder);

const db = knex({
  client: 'pg',
  connection: DB_URL
});

app.set('db', db);

app.listen(PORT, () => {
  if (NODE_ENV !== 'production') {
    console.log(`Server listening at http://localhost:${PORT}`);
  }
});