/**
 * API 请求路由
 * @type {exports}
 */
var express = require('express');
var router = express.Router();
var user = require('./user');
var activity = require('./activity');
var order = require('./order');
var log = require('./log');
var product = require('./product');
var message = require('./message');


//允许跨域访问资源，
//router.use(function(req, res, next) {
//    res.header('Access-Control-Allow-Origin', '*');
//    next();
//});

router.use('/users', user);
router.use('/activities', activity);
router.use('/products', product);
router.use('/logs', log);
router.use('/messages', message);

module.exports = router;