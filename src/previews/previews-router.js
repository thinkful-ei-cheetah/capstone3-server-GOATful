'use strict';
const express = require('express');
const previewRouter = express.Router({mergeParams: true});
const PreviewService = require('./preview-service');
const VideoService = require('../videos/video-service');
const PreviewSchema = require('./preview-schema');
const { requireAuth } = require('../middleware/jwt-auth');
const bodyParser = express.json();

//need user authentication middlware before implementation this will also handle 401 if not authenticated
previewRouter
  .route('/')
  .get(requireAuth,  async (req, res, next) => {
    const { video_id } = req.params;  
    //if no videoId, reject request
    if(!video_id){
      return res.status(400).json({message: 'No video ID received'});
    }

    const db = req.app.get('db');
    //grab all previews from db with matching video_id as well as the video
    try{
      const [selectedVideo] = await VideoService.getVideoById(db, video_id);
      const previewsArray = await PreviewService.getPreviews(db, video_id);

      if (!selectedVideo){
        return res.status(400).json({message: 'No video found matching selected query'});
      }
      if (!previewsArray){
        return res.status(200).json({video: selectedVideo, previews: []});
      }
      return res.status(200).json({video: selectedVideo, previews: previewsArray});
    } catch (err){
      next({status: 500, message: err.message});
    }
  })
  .post(requireAuth, bodyParser, async (req, res, next) => {
    const newPreview = generateReceivedPreview(req, 'post');

    const validPreview = PreviewSchema.validate(newPreview);
    if (validPreview.error) {
      return next({status: 400, message: validPreview.error.details[0].message});
    }
    
    try{
      //ensure the video ID is legit amd grab the video file
      const db = req.app.get('db');
      let [selectedVideo] = await VideoService.getVideoById(db, newPreview.video_id);
      
      if (!selectedVideo){
        return res.status(400).json({message: 'Invalid video ID'});
      }

      // insert the preview (automatically increments preview_count and sets active_thumbnail_url when first preview)
      const insertedPreview = await PreviewService.insertPreview(db, newPreview);
      [selectedVideo] = await VideoService.getVideoById(db, insertedPreview.video_id);

      return res.status(201).json({video: selectedVideo, preview: [insertedPreview]});
    } catch (e){
      next({status: 500, message: e.message});
    }
  })
  .patch(requireAuth, express.json(), async (req, res, next) =>{
    const updatedPreview = generateReceivedPreview(req);


    const { changeActive } = req.body; //Boolean to determine if batch update necessary.

    // ensure all fields are present and valid

    const validPreview = PreviewSchema.validate(updatedPreview);
    if (validPreview.error) {
      return next({status: 400, message: validPreview.error.details[0].message});
    }

    //cant update the id.
    const previewId = validPreview.value.id;
    delete updatedPreview.id;

    const db = req.app.get('db')

    //if changing active thumbnail, set all others to false. and update video to have right thumbnail.
    if (changeActive){
      try{
        //this should be a batch request 
        await PreviewService.setAllActivesToFalse(db, updatedPreview.video_id);
        await VideoService.updateActiveVideo(db, updatedPreview.video_id, updatedPreview.thumbnail_url)
      } catch (e){
        next({status: 500, message: e.message})
        return;
      }
    };
  updatedPreview.updated_at = 'now';
    try{
      const returnedUpdatedPreview = await PreviewService.updatePreview(db, previewId, updatedPreview);
      //change the updated_at field
     

      return res.status(201).json(returnedUpdatedPreview);

    } catch (e){
      next({status: 500, message: e.message});
    }
  })
  .delete(requireAuth, express.json(), async (req, res, next) =>{
    const { id, video_id } = req.body;

    //ensure we got required fields
    if(!id || !video_id){
      return res.status(400).json({message: 'Missing required fields' });
    }
    //db connection
    const db = req.app.get('db');
    try{
      //check if a preview exists with that id and attributed video_id
      const selectedPreview = await PreviewService.getPreviewById(db, id);
      if(!selectedPreview || selectedPreview.video_id !== video_id){
        return res.status(400).json({message: 'Invalid Request, preview does not exist' });
      }
      //should change this to a batch function but removes and decrements video service
      await VideoService.decrementVideo(db, video_id)
      try{
        await PreviewService.deletePreview(db, id)
        return res.status(200).json({message: 'Resource deleted'})
      } catch(e){
        await VideoService.incrementVideo(db, video_id)
    }} catch (e) {
      next({status: 500, message: e.message});
    }
  });

previewRouter
  .route('/active')
  .get(requireAuth,  async (req, res, next) => {
    const { video_id } = req.params;
    if(!video_id){
      return res.status(400).json({message: 'No video ID received'});
    }

    try {
      const activePreview = await PreviewService.getActivePreview(req.app.get('db'), video_id);
      if (!activePreview) {
        return next({status: 400, message: 'no active preview for video'});
      }
      res.json(activePreview);
    } catch(err) {
      next({status: 500, message: err.message});
    }
  });


function generateReceivedPreview(req, type){
  //destructure data from request body
  const { id, thumbnail_url, is_active, title, description, video_id } = req.body;
  //create new object with received data

  let newPreview = {
    id,
    thumbnail_url,
    is_active,
    title,
    description,
    video_id
  };

  if (type === 'post') delete newPreview.id;
  return newPreview; 
}

module.exports =  previewRouter;