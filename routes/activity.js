/**
 * 积分兑换活动模块路由
 *
 * Created by zither on 2016/4/9.
 * @type {*|exports|module.exports}
 */
var express = require('express');
var router = express.Router();
var fs = require('fs');
var RestMsg = require('../common/restmsg');
var Page = require('../common/page');
var uuid = require('node-uuid');
var Activity = require('../model/activitybo');

var _privateFun = router.prototype

//BO转VO方法，并且进行相关字段的扩展和删除
_privateFun.prsBO2VO = function(obj) {
    var result = obj.toObject({transform: function(doc, ret, options) {
        return {
            aid: ret._id,
            name: ret.name,
            start_at: ret.start_at ? ret.start_at.getTime() : null,
            end_at: ret.end_at ? ret.end_at.getTime() : null,
            goods: ret.goods,
            create_at: ret.create_at ? ret.create_at.getTime() : null
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

        var options = {'$slice':2};
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
        Activity.count(query, function(err, count) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            page.setPageAttr(count);
            Activity.find(query, null, options, function(err, ret) {
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

        var name = req.param('name');
        var start_at = req.param('start_at');
        var end_at = req.param('end_at');
        if (!name) {
            rm.errorMsg('未获取到活动名称！');
            res.send(rm);
            return;
        }
        if (!start_at) {
            rm.errorMsg('未获取到活动开始时间！');
            res.send(restmsg);
            return;
        }
        if (!end_at) {
            rm.errorMsg('未获取到活动结束时间！');
            res.send(rm);
            return;
        }

        //保存活动信息
        var activity = new Activity();
        activity.name = name;
        activity.start_at = start_at;
        activity.end_at = end_at;
        activity.create_at = new Date();
        activity.save(function(err, bo) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            if (bo) {
                if (bo._id) {
                    var aid = bo._id;

                    //图片保存路径，若不存在则先创建
                    if (!fs.existsSync('public/img/present')) {
                        fs.mkdirSync('public/img/present');
                    }
                    if (!fs.existsSync('public/img/present/' + aid)) {
                        fs.mkdirSync('public/img/present/' + aid);
                    }

                    var files = req.files['present-img'];
                    if (!files) {
                        rm.errorMsg('未获取到礼品图片！');
                        res.send(rm);
                        return;
                    }

                    //保存图片并拼装活动礼品信息
                    var goods = [];
                    if (files.length) {
                        var names = req.param('present-name');
                        var credits = req.param('present-credit');
                        var totals = req.param('present-total');
                        for (var i=0; i<files.length; i++) {
                            var no = uuid.v4();
                            var good = {
                                no: no,
                                name: names[i],
                                url: 'img/present/' + aid + '/' + no + '.' + files[i].extension,
                                credit: Number(credits[i]),
                                num: Number(totals[i]),
                                total: Number(totals[i])
                            };
                            goods.push(good);

                            //校验上传文件格式
                            if (['jpg','png','jpeg'].indexOf(files[i].extension) == -1) {
                                rm.errorMsg('图片格式错误！');
                                res.send(rm);
                                return;
                            }

                            //重命名图片
                            var newName = 'public/img/present/' + aid + '/' + no + '.' + files[i].extension;
                            fs.renameSync(files[i].path, newName, function(err) {
                                if (err) {
                                    console.log(err);
                                    rm.errorMsg(err);
                                    res.send(rm);
                                }
                            })
                        }
                    } else {
                        var no = uuid.v4();
                        var good = {
                            no: no,
                            name: req.param('present-name'),
                            url: 'img/present/' + aid + '/' + no + '.' + files.extension,
                            credit: Number(req.param('present-credit')),
                            num: Number(req.param('present-total')),
                            total: Number(req.param('present-total'))
                        };
                        goods.push(good);

                        //校验图片格式
                        if (['jpg','png','jpeg'].indexOf(files.extension) == -1) {
                            rm.errorMsg('图片格式错误！');
                            res.send(rm);
                            return;
                        }

                        //重命名图片
                        var newName = 'public/img/present/' + aid + '/' + no + '.' + files.extension;
                        fs.renameSync(files.path, newName, function(err) {
                            if (err) {
                                console.log(err);
                                rm.errorMsg(err);
                                res.send(rm);
                                return;
                            }
                        })
                    }

                    //将礼品信息更新到活动中
                    Activity.update({_id: aid}, {goods: goods}, function(err, ret) {
                        if (err) {

                            //若更新失败则删除活动和礼品图片
                            Activity.findOneAndRemove({_id: aid}, function(err, res) {
                                if (err) {
                                    rm.errorMsg(err);
                                    res.send(rm);
                                    return;
                                }
                                var files = fs.readdirSync('public/img/present/' + aid);
                                files.forEach(function(file, index) {
                                    var curPath = 'public/img/present/' + aid + "/" + file;
                                    fs.unlinkSync(curPath);
                                })
                            });

                            rm.errorMsg(err);
                            res.send(rm);
                            return;
                        }
                        rm.successMsg();
                        res.send(rm);
                    });
                }
            }
        });
    });

router.route('/:aid')
    .get(function(req, res, next) { //获取详情
        var rm = new RestMsg();

        Activity.findById(req.params.aid, function(err, bo) {
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
    .post(function(req, res, next) { //更新
        var rm = new RestMsg();

        var aid = req.params.aid;
        var name = req.param('name');
        var start_at = req.param('start_at');
        var end_at = req.param('end_at');
        if (!name) {
            rm.errorMsg('未获取到活动名称！');
            res.send(rm);
            return;
        }
        if (!start_at) {
            rm.errorMsg('未获取到活动开始时间！');
            res.send(restmsg);
            return;
        }
        if (!end_at) {
            rm.errorMsg('未获取到活动结束时间！');
            res.send(rm);
            return;
        }

        var goods = req.param('goods');
        var files = req.files['present-img'];
        var newGoods = [];
        if (goods!=null && goods.length) {
            for (var i=0; i<goods.length; i++) {
                var good = goods[i];
                if (good.no) {
                    if (good.state) {
                        var file = files.shift();
                        good.url = 'img/present/' + aid + '/' + good.no + '.' + file.extension;

                        //处理图片
                        fs.unlinkSync('public/' + good.preUrl);
                        var newName = 'public/' + good.url;
                        fs.renameSync(file.path, newName, function(err) {
                            if (err) {
                                console.log(err);
                                rm.errorMsg(err);
                                res.send(rm);
                            }
                        });
                    } else {
                        good.url = good.preUrl;
                    }
                } else {
                    var no = uuid.v4();
                    good.no = no;
                    var file = files.shift();
                    good.url = 'img/present/' + aid + '/' + no + '.' + file.extension;

                    //处理图片
                    var newName = 'public/' + good.url;
                    fs.renameSync(file.path, newName, function(err) {
                        if (err) {
                            console.log(err);
                            rm.errorMsg(err);
                            res.send(rm);
                        }
                    });
                }
                delete good.preUrl;
                delete good.state;
                newGoods.push(good);
            }
        }

        //更新
        var obj = {};
        obj.name = name;
        obj.start_at = start_at;
        obj.end_at = end_at;
        obj.goods = newGoods;
        Activity.update({_id: aid}, obj, function(err, ret) {
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