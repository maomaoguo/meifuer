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
        UserBO.find({_id:req.session.uid},function(err,bo){
            if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }
            if(bo){
                bo.password = '******';
                res.render('index',{
                    "user": bo
                });
            }
        });
    }else {
        res.redirect('/home');
    }
});

/**
 * 登录相关
 */
router.route('/login')
    .get(function(req, res) {
        if (req.session.uid) {
            res.redirect('/');
        } else {
            res.render('login');
        }
    })
    .post(function(req, res) {
        if (req.body.username == "admin" && req.body.pwd == 'admin') {
            req.session.uid = 1;
            res.redirect('/');
        } else {
            res.render('login');
        }

    });

/**
 * 退出登录
 */
router.get('/logout', function (req, res, next) {
    if (req.session) {
        req.session.uid = null;
        req.session.name = null;
        req.session.credit = null;
        res.clearCookie('uid');
        res.clearCookie('name');
        res.clearCookie('credit');
        req.session.destroy();
    }
    res.redirect('/home');
});

module.exports = router;