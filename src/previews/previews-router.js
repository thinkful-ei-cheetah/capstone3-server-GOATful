'use strict';
const express = require('express');
const previewRouter = express.Router({mergeParams: true});
const PreviewService = require('./preview-service');
const VideoService = require('../videos/video-service');

//need user authentication middlware before implementation this will also handle 401 if not authenticated
previewRouter
  .route('/')
  .get(async (req, res, next) => {
    const { video_id } = req.params;

    //if no videoId, reject request
    if(!video_id){
      return res.status(400).json({message: 'No video ID received'})
    }

    const db = req.app.get('db')
    //grab all previews from db with matching video_id as well as the video
    try{
      const [selectedVideo] = await VideoService.getVideoById(db, video_id)
      const previewsArray = await PreviewService.getPreviews(db, video_id)

      if (!selectedVideo){
        return res.status(400).json({message: 'No video found matching selected query'})
      }
      if (!previewsArray){
        return res.status(200).json({video: selectedVideo, previews: []})
      }
      return res.status(200).json({video: selectedVideo, previews: previewsArray})
    } catch (e){
      next({status: 500, message: err.message});
    }
  })
  .post(express.json(), async (req, res, next) => {
    const newPreview = generateReceivedPreview(req, 'post')
    
    // ensure all fields are present
    for(let key in newPreview){
      if(!newPreview[key]){
        return res.status(400).json({message: `missing data for field: ${key}`})
      }
    }
    
    //NEED CODE FO VALIDATIONS OF FIELDS. 
    //OUTSIDE LIBRARY?

    try{
      //ensure the video ID is legit amd grab the video file
      const db = req.app.get('db')
      const [selectedVideo] = await VideoService.getVideoById(db, newPreview.video_id)
      console.log(selectedVideo)
      if (!selectedVideo){
        return res.status(400).json({message: 'Invalid video ID'})
      }

      //insert the preview then increment the video count
      const insertedPreview = await PreviewService.insertPreview(db, newPreview);
      await VideoService.incrementVideo(db, insertedPreview.video_id)

      selectedVideo.preview_count = selectedVideo.preview_count + 1;
      return res.status(201).json({video: selectedVideo, preview: [insertedPreview]})
    } catch (e){
      next({status: 500, message: e.message});
    }
  })
  .patch(express.json, async (req, res, next) =>{
    const updatedPreview = generateReceivedPreview(req)

   // ensure all fields are present need to use JOI for this
    for(let key in updatedPreview){
      if(!updatedPreview[key]){
        return res.status(400).json({message: `missing data for field: ${key}`})
      }
    }
    //cant update the id.
    const previewId = updatedPreview.id
    delete updatedPreview.id

    try{
    const returnedUpdatedPreview = await PreviewService.updatePreview(req.app.get('db'), previewId, updatedPreview);
    return res.status(201).json(returnedUpdatedPreview);
    } catch (e){
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
  }

  if (type = 'post') delete newPreview.id;
  return newPreview
}

module.exports =  previewRouter;