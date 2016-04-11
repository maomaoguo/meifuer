/**
 * Created by maomaoguo on 2016/4/9
 * @type {*|exports|module.exports}
 */


var express = require('express');
var router = express.Router();
var fs = require('fs');
var RestMsg = require('../common/restmsg');
var Page = require('../common/page');
var uuid = require('node-uuid');
var Product = require('../model/productbo');

var _privateFun = router.prototype
//BO转VO方法，并且进行相关字段的扩展和删除
_privateFun.prsBO2VO = function (obj) {
    var result = obj.toObject({
        transform: function (doc, ret, options) {
            return {
                name: ret.name,
                num: ret.Number,
                url: ret.url,
                create_at: ret.create_at ? ret.create_at.getTime() : null
            }
        }
    });
    return result;
}

router.route('/')
    .get(function (req, res, next) {
        var rm = new RestMsg();
        var query = {};
        var name = req.param('name');
        if (name) {
            query.name = new RegExp(name, 'i');
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
        Product.count(query, function (err, count) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            page.setPageAttr(count);
            Product.find(query, null, options, function (err, ret) {
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

    .post(function(req,res,next){
        var rm = new RestMsg();

        var name = req.param('name');
        if(!name){
            rm.errorMsg('����������!');
            res.send(restmsg);
            return;
        }
        var url = req.param('url');
        var product = new Product();

        product.creat_at = new Date();
        product.name = name;
        product.url = url;
        product.save(function(err, bo) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            if(bo){
                if (bo._id) {
                    var pid = bo._id;
                    if (!fs.existsSync('public/img/product')) {
                        fs.mkdirSync('public/img/product');
                    }
                    if (!fs.existsSync('public/img/product/' + pid)) {
                        fs.mkdirSync('public/img/product/' + pid);
                    }

                }

            }

        });
    })
module.exports = router;