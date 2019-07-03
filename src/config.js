'use strict';

const setDatabaseUrl = (env) => {
  if (env === 'production') {
    return process.env.DATABASE_URL;
  } else if (env === 'development') {
    return process.env.DEV_DB_URL;
  } else {
    return process.env.TEST_DB_URL;
  }
};

module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: setDatabaseUrl(process.env.NODE_ENV)
};