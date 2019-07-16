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

function makeYoutubeSearchResultsArray(videos) {
  return [
    {
      id: 1,
      video_id: videos[0].id,
      data: fakeYoutubeSearchResults()
    }
  ];
}

function fakeYoutubeSearchResults() {
  const data = [
    {
      video_length: 'PT5M36S',
      video_id: 'abc-123',
      view_count: '100001',
      youtube_display_name: 'CSSNerd',
      published_at: '2019-07-08T18:28:49.514Z',
      description: 'Lorem ipsum dolor amet vegan godard prism snackwave fashion axe craft beer sustainable. Swag lomo taiyaki iPhone everyday carry. IPhone cronut disrupt kinfolk tumeric four loko, helvetica food truck freegan microdosing beard typewriter tbh biodiesel trust fund. Retro fixie biodiesel yuccie organic, blog shoreditch kogi roof party. Blog master cleanse beard woke raw denim, keytar pickled single-origin coffee pop-up prism organic franzen literally tilde.',
      title: '12 Ways to Land Your Next Tech Job',
      thumbnail_url: 'https://i.ytimg.com/vi/xCtmJogajxc/maxresdefault.jpg'
    },
    {
      video_length: 'PT8M12S',
      video_id: 'abc-124',
      view_count: '63000000000',
      youtube_display_name: 'TravelGuRu',
      published_at: '2018-07-08T18:28:49.514Z',
      description: 'Lorem ipsum dolor amet ethical tbh sint master cleanse, in sed occupy gluten-free readymade PBR&B ex non officia vice pour-over. Kogi everyday carry tumblr, retro squid literally cardigan selvage echo park occupy neutra hoodie. Offal organic brooklyn DIY, ramps meditation in chillwave. Artisan before they sold out distillery four loko portland. Pug eu cornhole labore viral, sint post-ironic dolor art party hot chicken leggings gastropub readymade velit.',
      title: 'How to Fly Anywhere for free',
      thumbnail_url: 'https://i.ytimg.com/vi/8YbZuaBP9B8/maxresdefault.jpg'
    },
    {
      video_length: 'PT15M4S',
      video_id: 'abc-125',
      view_count: '89123000',
      youtube_display_name: 'TheGreatGoatfulKite',
      published_at: '2019-03-08T18:28:49.514Z',
      description: 'Food truck actually glossier vexillologist sriracha meditation gochujang. Drinking vinegar offal before they sold out DIY affogato gentrify. Kogi skateboard tote bag four loko ugh try-hard godard cronut umami. Thundercats flannel kombucha chartreuse neutra 90\'s prism church-key tote bag vinyl typewriter activated charcoal cronut authentic coloring book. Health goth paleo forage man braid, yr pok pok listicle.',
      title: 'Don\'t Make Your next Kite Without Watching This',
      thumbnail_url: 'https://i.ytimg.com/vi/ReE87Wl6c4I/maxresdefault.jpg'
    },
    {
      video_length: 'PT36M19S',
      video_id: 'abc-126',
      view_count: '410',
      youtube_display_name: 'Christopher Lau',
      published_at: '2017-01-08T18:28:49.514Z',
      description: '2018 was the year I left my 9-5 to pursue the passion of travel and filmmaking. It was the most incredible year of my life as I met some amazing friends including the love of my life. I started off in Indonesia, Australia, Cambodia, Thailand, Vietnam, Laos, & The Philippines. Now I have made Thailand my home base and I couldn\'t be happier. This isn\'t a Sam Kolder type transition everywhere video, but a See Lau Travel type video ;) Enjoy! #SeeLauTravel',
      title: '12 Amazing Dinner Party Ideas to Wow Your Friends',
      thumbnail_url: 'https://i.ytimg.com/vi/4Yptevp7eeM/maxresdefault.jpg'
    }
  ];
  return JSON.stringify(data);
}

function makeFixtures() {
  const testUsers = makeUsersArray();
  const testVideos = makeVideosArray(testUsers);
  const testPreviews = makePreviewsArray(testVideos);
  const testYoutubeResults = makeYoutubeSearchResultsArray(testVideos);
  return { testUsers, testVideos, testPreviews, testYoutubeResults };
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      previews,
      youtube_search_results,
      videos,
      users
      RESTART IDENTITY CASCADE`
  );
}

function seedTables(db, users, videos, previews=[], youtubeResults=[]) {
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
    if (youtubeResults.length) {
      await trx.into('youtube_search_results').insert(youtubeResults);
      await trx.raw(
        // eslint-disable-next-line quotes
        `SELECT setval('youtube_search_results_id_seq', ?)`, [youtubeResults[youtubeResults.length-1].id]
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
  fakeYoutubeSearchResults,
  cleanTables,
  seedTables,
  makeAuthHeader,
  seedUsers
};