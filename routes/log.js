/**
 * 日志管理模块路由
 *
 * Created by maomaoguo on 2016/4/9.
 * @type {*|exports|module.exports}
 */

var express = require('express');
var router = express.Router();
var RestMsg = require('../common/restmsg');
var Page = require('../common/page');
var Log = require('../model/logbo');

var _privateFun = router.prototype
//BO转VO方法，并且进行相关字段的扩展和删除
_privateFun.prsBO2VO = function (obj) {
    var result = obj.toObject({
        transform: function (doc, ret, options) {
            return {
                id: ret.op_id,//操作人id
                name: ret.op_name,//操作人名字
                cid: ret.oped_id,//被操作人id
                cname: ret.oped_name,//被操作人名字
                type: ret.type,
                ocredit: ret.op_credit,
                pcredit: ret.pre_credit,
                credit: ret.credit,//操作后积分
                desc: ret.desc,//描述
                create_at: ret.create_at ? ret.create_at.getTime() : null
            }
        }
    });
    return result;
}
/**
 * 日志分页查询
 */
router.route('/')
    .get(function (req, res, next) { //分页查询
        var rm = new RestMsg();

        var query = {};
        var name = req.param('name');
        if (name) {
            query.oped_name = new RegExp(name, 'i'); //不区分大小写模糊查询
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
        Log.count(query, function (err, count) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            page.setPageAttr(count);
            Log.find(query, null, options, function (err, ret) {
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
module.exports = router;