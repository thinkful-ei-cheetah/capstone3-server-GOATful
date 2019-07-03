'use strict';
const { expect } = require('chai');
const supertest = require('supertest');

require('dotenv').config({path: '.env.test'});
global.expect = expect;
global.supertest = supertest;