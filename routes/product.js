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
var async = require('async');

var _privateFun = router.prototype
//BO转VO方法，并且进行相关字段的扩展和删除
_privateFun.prsBO2VO = function (obj) {
    var result = obj.toObject({
        transform: function (doc, ret, options) {
            return {
                pid:ret._id,
                name: ret.name,
                num: ret.Number,
                desc:ret.desc,
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

    .post(function (req, res, next) { //管理端图片新增
        var rm = new RestMsg();
        var name = req.param('name');
        if (!name) {
            rm.errorMsg('请输入产品名称!');
            res.send(rm);
            return;
        }
        var desc = req.param("desc");
        var product = new Product();
        product.create_at = new Date();
        product.name = name;
        product.desc = desc;
        product.save(function (err, bo) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            if (bo) {
                if (bo._id) {
                    var pid = bo._id;
                    //图片保存路径，若不存在则先创建
                    if (!fs.existsSync('./public/img/product')) {
                        fs.mkdirSync('./public/img/product');
                    }
                    if (!fs.existsSync('./public/img/product/' + pid)) {
                        fs.mkdirSync('./public/img/product/' + pid);
                    }

                    var files = req.files['product-img'];
                    if (!files) {
                        rm.errorMsg('未获取到产品图片！');
                        res.send(rm);
                        return;
                    }

                    //保存图片并拼装活动礼品信息
                    var imgs = [];
                    if (files.length) {
                        for (var i = 0; i < files.length; i++) {
                            var no = uuid.v4();
                            var img = {
                                no: no,
                                url: 'img/product/' + pid + '/' + no + '.' + files[i].extension,
                            };
                            imgs.push(img);

                            //校验上传文件格式
                            if (['jpg', 'png', 'jpeg'].indexOf(files[i].extension) == -1) {
                                rm.errorMsg('图片格式错误！');
                                res.send(rm);
                                return;
                            }

                            //重命名图片
                            var newName = './public/img/product/' + pid + '/' + no + '.' + files[i].extension;
                            fs.renameSync(files[i].path, newName, function (err) {
                                if (err) {
                                    console.log(err);
                                    rm.errorMsg(err);
                                    res.send(rm);
                                }
                            })
                        }
                    } else {
                        var no = uuid.v4();
                        var img = {
                            no: no,
                            url: 'img/product/' + pid + '/' + no + '.' + files.extension,
                        };
                        imgs.push(img);

                        //校验图片格式
                        if (['jpg', 'png', 'jpeg'].indexOf(files.extension) == -1) {
                            rm.errorMsg('图片格式错误！');
                            res.send(rm);
                            return;
                        }

                        //重命名图片
                        var newName = './public/img/product/' + pid + '/' + no + '.' + files.extension;
                        fs.renameSync(files.path, newName, function (err) {
                            if (err) {
                                console.log(err);
                                rm.errorMsg(err);
                                res.send(rm);
                                return;
                            }
                        })
                    }

                    //将礼品信息更新到活动中
                    Product.update({_id: pid}, {imgs: imgs}, function (err, ret) {
                        if (err) {

                            //若更新失败则删除活动和礼品图片
                            Product.findOneAndRemove({_id: pid}, function (err, res) {
                                if (err) {
                                    rm.errorMsg(err);
                                    res.send(rm);
                                    return;
                                }
                                var files = fs.readdirSync('./public/img/product/' + pid);
                                files.forEach(function (file, index) {
                                    var curPath = './public/img/product/' + pid + "/" + file;
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

router.route('/:pid')
    .get(function(req, res, next) { //管理端--获取详情
        var rm = new RestMsg();

        Product.findById(req.params.pid, function(err, bo) {
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
    .post(function(req, res, next) { //管理端--更新
        var rm = new RestMsg();
        var pid = req.params.pid;
        var name = req.param('name');
        var desc = req.param('desc');
        if (!name) {
            rm.errorMsg('请输入产品名称！');
            res.send(rm);
            return;
        }

        var goods = req.param('imgs');
        var files = req.files['product-img'];
        var newGoods = [];
        if (goods!=null && goods.length) {
            for (var i=0; i<goods.length; i++) {
                var good = goods[i];
                if (good.no) {
                    if (good.state) {
                        var file = {};
                        if (files.length) {
                            file = files.shift();
                        } else {
                            file = files;
                        }
                        good.url = 'img/product/' + pid + '/' + good.no + '.' + file.extension;

                        //处理图片
                        fs.unlinkSync('./public/' + good.preUrl);
                        var newName = './public/' + good.url;
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
                    var file = {};
                    if (files.length) {
                        file = files.shift();
                    } else {
                        file = files;
                    }
                    good.url = 'img/product/' + pid + '/' + no + '.' + file.extension;

                    //处理图片
                    var newName = './public/' + good.url;
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
        obj.desc = desc;
        obj.create_at = new Date();
        obj.imgs = newGoods;

        Product.update({_id:pid}, obj, function(err, ret) {
            if (err) {
                rm.errorMsg(err);
                res.send(rm);
                return;
            }
            rm.successMsg();
            res.send(rm);
        });
    })
    //删除（物理删除）
    .delete(function(req,res,next){ // 删除产品信息
        var pid = req.params.pid;
        var restmsg = new RestMsg();
        var path ='./public/img/product/' + pid;
        Product.findOneAndRemove({_id:pid},function(err,obj){
            if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }
            res.send( restmsg.successMsg());
        });
        deleteFolderRecursive(path);
    });

router.route('/list/list')
    .get(function(req, res, next) {
        var rm = new RestMsg();
        var path ='./public/img/product/';
        var folder = readFolderRecursive(path);
        var result = [];
        // 获取标题
         var idArr = [];
        for(var i=0; i<folder.length; i++) {
            var name = folder[i].name;
            idArr.push(name.substring(21,name.length));
        }
        var funcArr = [];
        funcArr = idArr.map(function(currentId) {
            return function (cb) {
                Product.findById(currentId, function(err, ret) {
                    console.log(ret);
                    if (err) {
                        rm.errorMsg(err);
                        res.send(rm);
                        return;
                    }
                    var tempArr = folder.map(function(currentFolder) {
                            // 查找到当前
                            if(currentFolder.name.search(currentId) != -1) {
                                var temp = {
                                    name: currentFolder.name,
                                    value: currentFolder.value,
                                    title: ret.name    // 返回标题
                                };
                                result.push(temp);
                            }
                    });

                    cb(null, ret);
                });
            }

        });
        funcArr.push(function() {
            rm.successMsg();
            rm.setResult(result);
            res.send(rm);
        });
        async.series(funcArr);
    });

/**
 * 递归的删除文件夹及文件夹面的所有文件
 * @param path
 */
function deleteFolderRecursive(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

//读取文件夹及文件夹面的所有文件
function readFolderRecursive(path) {
    var filejson={};
    var files = [];
    var temp = [];
    var folderJsonArr = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,i){
            var curPath = path  + file;
            if(fs.statSync(curPath).isDirectory()) {
             var  fileName = fs.readdirSync(curPath);
                fileName.forEach(function(file,j){
                    temp.push({
                       href:  'img/product/'+ files[i] +'/'+ file
                    });
                })
                folderJsonArr.push({
                    name: curPath,
                    value: temp,
                });

                temp = [];
            }
        });
    }
    return folderJsonArr;
};

module.exports = router;