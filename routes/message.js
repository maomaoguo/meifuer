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
                mes_name: ret.mes_name,
                mes_at: ret.mes_at ? ret.mes.at.getTime() : null,
                message: ret.message,
                op_id: ret.op_id,
                op_name: ret.op_name,
                type: ret.type,
                op_note: ret.op_note,
                op_at: ret.op_at ? ret.op_at.getTime() : null
            }
        }
    });
    return result;
}


router.route('/')
    .get(function (req, res, next) { //分页查询
        var rm = new RestMsg();

        var query = {};
        var type = req.param('type');
        var mesName = req.param('mesName');
        var opName = req.param('opName');
        var message = req.param('message');

        if (type) {
            query.type = type;
        }
        if (mesName) {
            query.mes_name = new RegExp(mesName, 'i'); //不区分大小写模糊查询
        }
        if (opName) {
            query.op_name = new RegExp(opName, 'i'); //不区分大小写模糊查询
        }
        if (message) {
            query.message = new RegExp(message, 'i'); //不区分大小写模糊查询
        }

        var options = {'$slice': 2};
        var row = req.param('row');
        var start = req.param('start');
        if (row) {
            options['limit'] = Number(row);
        }
        if (start) {
            options['skip'] = Number(start);
        }
        options['sort'] = {create_at: -1};

        var page = new Page();
        Message.count(query, function (err, count) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            page.setPageAttr(count);
            Message.find(query, null, options, function (err, ret) {
                if (err) {
                    rm.errorMsg(err);
                    res.send(rm);
                    return;
                }
                if (ret !== null && ret.length > 0) {
                    page.setData(ret.map(_privateFun.prsBO2VO));
                }
                rm.setResult(page);
                rm.successMsg();
                res.send(rm);
            });
        });
    })
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