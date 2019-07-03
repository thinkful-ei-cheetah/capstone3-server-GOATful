BEGIN;

TRUNCATE
  users,
  videos,
  previews
  RESTART IDENTITY CASCADE;

INSERT INTO users (full_name, email, avatar)
VALUES
('foo bar', 'foo@bar.com', 'https://lh3.googleusercontent.com/-_OnV37Rs7ZQ/AAAAAAAAAAI/AAAAAAAAAFc/8kMCgV026ck/s96-c/photo.jpg');

INSERT INTO videos (title, active_thumbnail_url, preview_count, video_length, youtube_display_name, youtube_url, tags, user_id)
VALUES
('8 Odd Tricks to Get RIPPED!', 'https://cf.ltkcdn.net/exercise/images/std/201862-675x450-pushups.jpg', 2, '10:01', 'foo bar', 'https://www.youtube.com/watch?v=LYpE-heDZgE', ARRAY ['fitness', 'push-ups', 'exercise'], 1);

INSERT INTO previews (thumbnail_url, title, description, video_id)
VALUES
('https://ak5.picdn.net/shutterstock/videos/14428615/thumb/4.jpg', 'Get Ripped Super Fast', 'Follow our simple workout plan to get in the best shape of your life!', 1),
('http://dream-gym.net/wp-content/uploads/2018/07/459880391.jpg', 'Anyone Can Get Ripped', 'Tired of failing results? Not looking for another fad? Try our push-up program!', 1);

COMMIT;

