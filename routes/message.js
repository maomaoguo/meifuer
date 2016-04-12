/**
 *留言管理模块路由
 *
 * Created by maomaoguo on 2016/4/9.
 * @type {*|exports|module.exports}
 */
var express = require('express');
var router = express.Router();
var RestMsg = require('../common/restmsg');
var Page = require('../common/page');
var Message = require('../model/messagebo');

var _privateFun = router.prototype

_privateFun.prsBO2VO = function (obj) {
    var result = obj.toObject({
        transform: function (doc, ret, options) {
            return {
                id: ret.mes_id,
                name: ret.mes_name,
                mes_at: ret.mes_at,
                message: ret.message,
                op_id: ret.op_id,
                op_name: ret.op_name,
                type: ret.type,
                op_note: ret.op_note,
                op_at: ret.op_at ? ret.create_at.getTime() : null
            }
        }
    });
    return result;
}


router.route('/')
    .post(function (req, res, next) {
        var rm = new RestMsg();
        var name = req.param('name');
        if (!name) {
            rm.errorMsg('请先登录!');
            res.send(restmsg);
            return;
        }
        var msg = req.param('message');
        if (!msg) {
            rm.errorMsg('请输入留言信息!');
            res.send(restmsg);
            return;

        }
        var message = new Message();

        message.mes_name = name;
        message.mes_at = new Date();
        message.message = msg;
        message.save(function (err, bo) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            rm.successMsg();
            res.send(rm);
        });
    });
module.exports = router;