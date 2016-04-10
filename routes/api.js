/**
 * API 请求路由
 * @type {exports}
 */
var express = require('express');
var router = express.Router();
var user = require('./user/user');
var activity = require('./activity');

//允许跨域访问资源，
//router.use(function(req, res, next) {
//    res.header('Access-Control-Allow-Origin', '*');
//    next();
//});

router.use('/users', user);
router.use('/activities', activity);

module.exports = router;