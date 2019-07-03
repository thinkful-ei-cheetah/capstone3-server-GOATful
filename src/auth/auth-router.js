'use strict';

const express = require('express');
const bodyParser = express.json();
const authRouter = express.Router();
const AuthService = require('./auth-service');
const UserService = require('../users/user-service');

authRouter
  .route('/login')
  .post(bodyParser, async (req, res, next) => {
    // send google auth token
    const googleToken = req.body.id_token;
    try {
      const decodedToken = await AuthService.verifyGoogleToken(googleToken);
      let savedUser = await AuthService.findByEmail(req.app.get('db'), decodedToken.email);
      if (!savedUser) {
        const newUser = {full_name: decodedToken.name, avatar: decodedToken.picture, email: decodedToken.email};
        savedUser = await UserService.insert(req.app.get('db'), newUser);
      }
      
      // create our internal JWT
      const sub = savedUser.email;
      const payload = { user_id: savedUser.id };
      const authToken = await AuthService.createJwt(sub, payload);
      return res.json({authToken});
    } catch(err) {
      return next({status: 500, message: err.message});
    }
  });


module.exports = authRouter;

