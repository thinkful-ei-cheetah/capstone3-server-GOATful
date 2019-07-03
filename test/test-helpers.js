'use strict';
const jwt = require('jsonwebtoken');

function makeUsersArray() {
  return [
    {
      id: 1,
      email: 'test1@test.com',
      full_name: 'Test One',
      avatar: 'https://lh3.googleusercontent.com/-_OnV37Rs7ZQ/AAAAAAAAAAI/AAAAAAAAAFc/8kMCgV026ck/s96-c/photo.jpg',
    },
    {
      id: 2,
      email: 'test2@test.com',
      full_name: 'Test Two',
      avatar: 'https://pickaface.net/gallery/avatar/944256_161115_0939_yp1o8.png',
    },
    {
      id: 3,
      email: 'test3@test.com',
      full_name: 'Test Three',
      avatar: 'https://pickaface.net/gallery/avatar/acrovin559439058dc7f.png',
    }
  ];
}

function seedUsers(db, users) {
  return db('users').insert(users)
    .then(() => {
      db.raw('SELECT setval("users_id_seq", ?)', [users[users.length-1].id]);
    });
}

function makeVideosArray(users) {
  return [
    {
      id: 1,
      title: 'First test video!',
      active_thumbnail_url: 'http://placehold.it/500x500',
      preview_count: 2,
      is_active: true,
      video_length: '10:01',
      youtube_display_name: users[0].full_name,
      youtube_url: 'https://www.youtube.com/watch?v=wJ0QXCTqjUs',
      tags: ['foo', 'bar', 'baz'],
      user_id: users[0].id,
    },
    {
      id: 2,
      title: 'Second test video!',
      preview_count: 0,
      is_active: false,
      video_length: '5:47',
      youtube_display_name: users[1].full_name,
      tags: ['magic', 'talent'],
      user_id: users[1].id
    }
  ];
}

function makePreviewsArray(videos) {
  return [
    {
      id: 1,
      video_id: videos[0].id,
      thumbnail_url: 'http://placehold.it/500x500',
      is_active: true,
      title: 'Test preview one!',
      description: 'here is a catchy description for test preview one!'
    },
    {
      id: 2,
      video_id: videos[0].id,
      thumbnail_url: 'http://placehold.it/400x400',
      is_active: false,
      title: 'Test preview two!',
      description: 'here is a catchy description for test preview two!'
    }
  ];
}

function makeFixtures() {
  const testUsers = makeUsersArray();
  const testVideos = makeVideosArray(testUsers);
  const testPreviews = makePreviewsArray(testVideos);
  return { testUsers, testVideos, testPreviews };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      previews,
      videos,
      users
      RESTART IDENTITY CASCADE`
  );
}

function seedTables(db, users, videos, previews=[]) {
  return db.transaction(async trx => {
    await seedUsers(trx, users);
    await trx.into('videos').insert(videos);
    await trx.raw(
      // eslint-disable-next-line quotes
      `SELECT setval('videos_id_seq', ?)`, [videos[videos.length-1].id]
    );
    if (previews.length) {
      await trx.into('previews').insert(previews);
      await trx.raw(
        // eslint-disable-next-line quotes
        `SELECT setval('previews_id_seq', ?)`, [previews[previews.length-1].id]
      );
    }
  });
}


function makeAuthHeader(user, secret = process.env.JWT_SECRET, expiry = process.env.JWT_EXPIRY) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.email,
    expiresIn: expiry,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeVideosArray,
  makePreviewsArray,
  makeFixtures,
  cleanTables,
  seedTables,
  makeAuthHeader,
  seedUsers
};