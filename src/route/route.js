// /url/shorten
const express = require('express');
const Router = express.Router();
const urlController = require('../controller/controller')

Router.post('/url/shorten',urlController.createUrl);
Router.get('/:urlCode',urlController.getUrl)

module.exports = Router;