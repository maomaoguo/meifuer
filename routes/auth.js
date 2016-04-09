/**
 * Created by duanying on 2015/9/9.
 */
var express = require('express');
var router = express.Router();


//本示例的登录没有进行数据库中用户的验证，具体项目则需要进行数据库的用户校验
//用户名密码均为admin


/**
 * 访问首页
 */
router.get('/', function(req, res) {
    if (req.session.uid) {
        //已登录
        res.render('index',{"name": "admin"});
    }else {
        res.redirect('/login');
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
        res.clearCookie('uid');
        req.session.destroy();
    }
    res.redirect('/login');
});

module.exports = router;