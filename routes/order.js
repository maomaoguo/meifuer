/**
 * 积分兑换订单模块路由
 *
 * Created by zither on 2016/4/10.
 * @type {*|exports|module.exports}
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var RestMsg = require('../common/restmsg');
var Page = require('../common/page');
var Order = require('../model/orderbo');

var _privateFun = router.prototype

//BO转VO方法，并且进行相关字段的扩展和删除
_privateFun.prsBO2VO = function(obj) {
    var result = obj.toObject({transform: function(doc, ret, options) {
        return {
            oid: ret._id,
            no: ret.no,
            name: ret.name,
            credit: ret.credit,
            customer_id: ret.customer_id,
            customer_name: ret.customer_name,
            to_name: ret.to_name,
            to_addr: ret.to_addr,
            to_tel: ret.to_tel,
            op_id: ret.op_id,
            op_name: ret.op_name,
            //op_at: ret.op_at ? ret.op_at.getTime() : null,
            express: ret.express,
            express_no: ret.express_no,
            other: ret.other,
            status: ret.status,
            buy_at: ret.buy_at ? ret.buy_at.getTime() : null
        }
    } });
    return result;
}

router.route('/')
    .get(function (req, res, next) { //分页查询
        var rm = new RestMsg();

        var query = {};
        var name = req.param('name');
        if (name) {
            query.name = new RegExp(name, 'i'); //不区分大小写模糊查询
        }
        var customer = req.param('customer');
        if (customer) {
            query.customer_name = new RegExp(customer, 'i'); //不区分大小写模糊查询
        }
        var to = req.param('to');
        if (to) {
            query.to_name = new RegExp(to, 'i'); //不区分大小写模糊查询
        }

        var options = {'$slice':2};
        var row = req.param('row');
        var start = req.param('start');
        if (row) {
            options['limit'] = Number(row);
        }
        if (start) {
            options['skip'] = Number(start);
        }
        options['sort'] = {status: 1, buy_at: 1};

        var page = new Page();
        Order.count(query, function(err, count) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            page.setPageAttr(count);
            Order.find(query, null, options, function(err, ret) {
                if (err) {
                    rm.errorMsg(err);
                    res.send(rm);
                    return;
                }
                if (ret!==null && ret.length>0) {
                    page.setData(ret.map(_privateFun.prsBO2VO));
                }
                rm.setResult(page);
                rm.successMsg();
                res.send(rm);
            });
        });
    })
    .post(function(req, res, next) { //新增
        var rm = new RestMsg();

        var order = new Order();
        order.name = req.param('name');
        order.credit = Number(req.param('credit'));
        order.status = 1;
        order.buy_at = new Date();
        order.save(function(err, bo) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            rm.successMsg();
            res.send(rm);
        });
    });

router.route('/:oid')
    .get(function(req, res, next) { //获取详情
        var rm = new RestMsg();

        Order.findById(req.params.oid, function(err, bo) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            rm.setResult(bo);
            rm.successMsg();
            res.send(rm);
        });
    })
    .put(function(req, res, next) { //处理订单
        var rm = new RestMsg();

        var op_id = req.param('op_id');
        var op_name = req.param('op_name');
        var express = req.param('express');
        var express_no = req.param('express_no');
        var other = req.param('other');
        if (!express) {
            rm.errorMsg('未获取到快递公司名称！');
            res.send(rm);
            return;
        }
        if (!express_no) {
            rm.errorMsg('未获取到快递单号！');
            res.send(rm);
            return;
        }

        //更新
        var obj = {};
        obj.op_id = op_id;
        obj.op_name = op_name;
        obj.op_at = new Date();
        obj.express = express;
        obj.express_no = express_no;
        obj.other = other;
        obj.status = 2;
        Order.update({_id: req.params.oid}, obj, function(err, ret) {
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