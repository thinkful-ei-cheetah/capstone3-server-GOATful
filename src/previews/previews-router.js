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
    console.log('here')

    //if no videoId, reject request
    if(!video_id){
      return res.status(400).json({message: 'No video ID received'})
    }

    //grab all previews from db with matching video_id
    try{
      const previewsArray = await PreviewService.getPreviews(req.app.get('db'), video_id)
      if (!previewsArray){
        return res.status(200).json([])
      }
      return res.status(200).json(previewsArray)
    } catch (e){
      next({status: 500, message: err.message});
    }
  })
  .post(express.json(), async (req, res, next) => {
    const newPreview = generateReceivedPreview(req)

    // ensure all fields are present
    for(let key in newPreview){
      if(!newPreview[key]){
        return res.status(400).json({nessage: `missing data for field: ${key}`})
      }
    }
    //NEED CODE FO VALIDATIONS OF FIELDS. 
    //OUTSIDE LIBRARY?
    try{
      const db = req.app.get('db')
      const insertedPreview = await PreviewService.insertPreview(req.app.get(db), newPreview);
      await VideoService.incrementVideo(db, insertedPreview.video_id)
      return res.status(201).json(insertedPreview)
    } catch (e){
      next({status: 500, message: err.message});
    }
  })
  .patch(express.json, async (req, res, next) =>{
    const updatedPreview = generateReceivedPreview(req)

   // ensure all fields are present
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

function generateReceivedPreview(req){
    //destructure data from request body
    const { id, thumbnail_url, is_active, title, description, video_id } = req.body;
    //create new object with received data
  return {
    id,
    thumbnail_url,
    is_active,
    title,
    description
  }
}

module.exports =  previewRouter;