/**
 * Created by duanying on 2015/9/9.
 */
var express = require('express');
var router = express.Router();
var RestMsg = require('../common/restmsg');
var encrypt = require('../common/encrypt');
var UserBO = require('../model/userbo');
var LogBO = require('../model/logbo');


/**
 * 访问首页
 */
router.get('/', function(req, res) {
    if (req.session.uid) {
        //已登录
        var restmsg = new RestMsg();
        UserBO.findOne({_id:req.session.uid},function(err,bo){
            if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }
            if(bo){
                bo.toObject();
                bo.pwd ="****";
                bo.login ="****";
                res.render('home',{
                    "user": bo
                });
            }
        });
    }else {
        res.render('home',{"user":null});
    }
});

/**
 * 登录相关
 */
router.route('/login')
    .post(function(req, res) {
        var restmsg = new RestMsg();
        UserBO.findOne({login:req.body.username,pwd:encrypt.md5Hash(req.body.pwd),status:1},function(err,bo){
            if (err){
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }
            if(!bo) {
                restmsg.errorMsg('用户名或密码错误！');
                res.send(restmsg);
            }else{
                req.session.uid = bo["_id"];
                req.session.role = bo["role"];
                req.session.name = bo["name"];
                res.redirect('/');
            }
        })

    });

/**
 * 退出登录
 */
router.get('/logout', function (req, res, next) {
    if (req.session) {
        req.session.uid = null;
        req.session.role = null;
        req.session.name = null;
        res.clearCookie('uid');
        res.clearCookie('role');
        res.clearCookie('name');
        req.session.destroy();
    }
    res.redirect('/');
});

/**
 * 进入管理员页面
 */
router.get('/index', function (req, res, next) {
    if (req.session.uid) {
        //已登录
        var restmsg = new RestMsg();
        UserBO.findOne({_id:req.session.uid},function(err,bo){
            if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }
            if(bo){
                bo.toObject();
                bo.pwd ="****";
                bo.login ="****";
                res.render('index',{
                    "user": bo
                });
            }
        });
    }else {
        res.render('home',{"user":null});
    }
});

module.exports = router;