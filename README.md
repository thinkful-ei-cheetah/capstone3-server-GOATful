# Laconic Api

Laconic enables Youtube creators to optimize their videos click rates by allowing them to rapidly test how their video appears on Youtube's search result page.  A creator can easily test out multiple custom thumbnails, titles, descriptions and more while seeing how the results render in desktop, iphone or android app.

This is the backend for `Laconic`.  A live version of the app can be found at [https://laconic.now.sh/](https://laconic.now.sh/)

The code for the front end client can be found at [https://github.com/thinkful-ei-cheetah/capstone3-client-GOATful](https://github.com/thinkful-ei-cheetah/capstone3-client-GOATful).
 
## Quick App Demo

![Imgur](https://i.imgur.com/Ljct8Of.gif)

## Team

Laconic was built with 💙 by the following:

* Michael Verdi: [https://github.com/verdi327](https://github.com/verdi327)
* Elan Green: [https://github.com/elang5](https://github.com/elang5)
* Kristof-Pierre Cummings: [https://github.com/jamster10](https://github.com/jamster10)
* Peter Pae: [https://github.com/Paendabear](https://github.com/Paendabear)
* David Nordeen: [https://github.com/DavidNordeen](https://github.com/DavidNordeen)

## Technology

#### Back End

* Node and Express
  * Authentication via Google OAuth and JWT
  * RESTful Api
* Testing
  * Supertest (integration)
  * Mocha and Chai (unit)
* Database
  * Postgres
  * Knex.js - SQL wrapper

#### Production

Deployed via Heroku


## Set up

Major dependencies for this repo include Postgres and Node.

To get setup locally, do the following:

1. Clone this repository to your machine, `cd` into the directory and run `npm install`
2. Create the dev and test databases: `createdb -U postgres laconic-dev` and `createdb -U postgres laconic-test`

3. Create a `.env` and a `.env.test` file in the project root

Inside these files you'll need the following:

````
NODE_ENV=development
PORT=8000

MIGRATION_DB_HOST=localhost
MIGRATION_DB_PORT=5432
MIGRATION_DB_NAME=laconic-dev
MIGRATION_DB_USER=postgres
DEV_DB_URL="postgresql://postgres@localhost/laconic-dev"

JWT_SECRET=laconic-jwt-secret
JWT_EXPIRY='1w'
````

Your `.env.test` will be the same except your database name will be `MIGRATION_DB_NAME=laconic-test` and database url will be called `TEST_DB_URL="postgresql://postgres@localhost/laconic-test"`

4. Run the migrations for dev - `npm run migrate`
5. Run the migrations for test - `NODE_ENV=test npm run migrate`
6. Seed the database for dev

* `psql -U postgres -d laconic-dev -f ./seeds/seed.user-video-preview.sql`

7. Run the tests - `npm t`
8. Start the app - `npm run dev`

## API Documentation

Base Url: `https://laconic-api.herokuapp.com/api`

### Authentication

* `POST /login` - expects id_token, returns JWT

### Videos

* `GET /videos` - returns all videos for a user
* `POST /videos` - expects a user_id, returns a new video obj
* `GET /videos/:video_id` - expects video_id, returns video obj
* `PATCH /videos/:video_id` - expects video_id, updates a video
* `DELETE /videos/:video_id` - expects video_id, deletes a video

### Previews

* `GET /videos/:video_id/previews` - returns all previews for a given video
* `POST /videos/:video_id/previews` - creates a new preview
* `PATCH /videos/:video_id/previews` - expects preview_id, updates a given preview
* `DELETE /videos/:video_id/previews` - expects a preview_id, deletes a preview
* `GET /videos/:video_id/previews/active` - returns the currently active preview for a video

### YoutubeSearchResults

* `GET /videos/:video_id/youtube-search-results` - returns array of YouTube search results
* `POST /videos/:video_id/youtube-search-results` - expects an array of YouTube search results

### PublicUsers

* `POST /public-users/create-video-and-preview` - expects a preview and video obj, returns a newly saved preview
