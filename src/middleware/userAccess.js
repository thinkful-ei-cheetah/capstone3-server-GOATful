'use strict';
const VideoService = require('../videos/video-service')

const checkAccess = async (req, res, next) => {
  const { video_id } = req.params;
  const user_id = req.user.id;

  try{
    const selectedVideo = await VideoService.getVideoById(req.app.get('db'), video_id)
    if(selectedVideo.user_id !== user_id){
      return res.status(401).json({message: 'unauthorized access'});
    }
    next()
  } catch(e){
    next({ status: 500, message: err.message })
  }
};

module.exports = checkAccess;