/**
 * 用户controller
 * Created by duanying on 2016/4/11.
 */
var express = require('express');
var router = express.Router();
var RestMsg = require('../common/restmsg');
var encrypt = require('../common/encrypt');
var UserBO = require('../model/userbo');
var LogBO = require('../model/logbo');
var Page = require('../common/page');

var _privateFun = router.prototype

//BO 转 VO 继承BO的字段方法2，并且进行相关字段的扩展和删除
_privateFun.prsBO2VO = function(obj){
    var result = obj.toObject({ transform: function(doc, ret, options){
        var status = ret.status==undefined?1:ret.status;
        return {
            uid:ret._id,
            name: ret.name,
            "login":ret.login,//登录名
            "role":ret.role,//用户角色，1超级管理员（只有一个），可添加管理员，2普通管理员（无增删改查管理员的权限），3，客户
            "contact":ret.contact,//联系人
            "tel":ret.tel, //联系电话，可以多个
            "qq":ret.qq,//联系qq，可以多个
            "addr":ret.addr,//地址
            "amaldar":ret.amaldar,//经理
            "credit":ret.credit,//积分
            "desc": ret.desc,//"<用户描述>",
            "status":ret.status,//<用户状态 0无效|1有效>,
            "salesman":ret.salesman,//业务员
            "create_at":ret.creat_at//<用户注册时间>
        }
    } });
    return result;
}

router.route('/')
    //获取用户，不分页
    .get(function (req, res, next) {
        var query = {};
        var name = req.param('name');
        if(name){
            query.name = new RegExp(name,'i');//不区分大小写模糊查询条件
        }
        var status = req.param('status');
        if(status){
            query.status = Number(status);
        }
        var role = req.param('role');
        if(role){
            query.role = Number(role);
        }
        var salesman = req.param('salesman');
        if(salesman){
            query.salesman = new RegExp(salesman,'i');
        }

        //过滤掉自己
        query._id = {$ne: req.session.uid};
        var page = new Page();
        UserBO.find(query,function(err,list){
            if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }
            if(list!==null&&list.length>0){
                page.setData(list.map(_privateFun.prsBO2VO));
            }
            page.setPageAttr(list.length);
            var restmsg = new RestMsg();
            restmsg.successMsg();
            restmsg.setResult(page);
            res.send(restmsg);
        })
    })

    //增加用户信息
    .post(function (req, res, next) {
        var user = new UserBO();
        var restmsg = new RestMsg();
        var name = req.param('name');
        var login = req.param('login');
        var role = req.param('role');
        var credit = req.param('credit');

        if(!name || !login || !role){
            restmsg.errorMsg('有必填项未填写');
            res.send(restmsg);
            return;
        }
        if(!credit){
           user.credit = 0;
        }else{
            user.credit = Number(credit);
        }

        user.pwd = encrypt.md5Hash('123456');
        user.name = name;
        user.login = login;
        user.role = Number(role);
        user.contact = req.param('contact');
        user.tel = req.param('tel');
        user.qq = req.param('qq');
        user.amaldar = req.param('amaldar');
        user.desc = req.param('desc',null);
        user.status = 1;//有效
        user.creat_at = new Date();
        user.addr = req.param('addr');
        user.salesman = req.param("salesman");
        console.log(user);

        UserBO.count({login:login},function(err,num){
            if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }else if(num > 0){
                restmsg.errorMsg("登录名已存在！");
                res.send(restmsg);
                return;
            }else{
                UserBO.count({name:name},function(err,num){
                    if (err) {
                        restmsg.errorMsg(err);
                        res.send(restmsg);
                        return;
                    }else if(num > 0){
                        restmsg.errorMsg("用户名称已存在！");
                        res.send(restmsg);
                        return;
                    }else{
                        user.save(function(err,obj){

                            if (err) {
                                restmsg.errorMsg(err);
                                res.send(restmsg);
                                return;
                            }

                            if(user.role == 3){
                                var log = new LogBO();
                                log.op_credit = user.credit;
                                log.op_id = req.session.uid;
                                log.op_name = req.session.name;
                                log.oped_id = obj._id;
                                log.oped_name = user.name;
                                log.pre_credit = 0;
                                log.credit = user.credit;
                                log.type = 3;//客户注册；
                                log.creat_at = new Date();
                                log.desc = '成功注册1名客户,初始积分为['+user.credit+']。';
                                log.save(function(err,obj) {
                                    if (err) {
                                        restmsg.errorMsg(err);
                                        res.send(restmsg);
                                        return;
                                    }
                                    res.send(restmsg.successMsg());
                                });
                            }else{
                                res.send(restmsg.successMsg());
                            }
                        });
                    }
                })
            }
        })
    });

//改变积分
router.route('/:uid/credit')
    .put(function(req,res,next){
        var uid = req.params.uid;
        var credit = req.param('credit');
        var restmsg = new RestMsg();

        UserBO.findOne({_id:uid},function(err,pro){
            if (err){
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }

            if(pro) {
                var log = new LogBO();
                log.op_credit = Number(credit);
                UserBO.update({_id:uid},{credit:log.op_credit+pro.credit},function(err,obj){
                    if (err) {
                        restmsg.errorMsg(err);
                        res.send(restmsg);
                        return;
                    }


                    log.op_id = req.session.uid;
                    log.op_name = req.session.name;
                    log.oped_id = uid;
                    log.oped_name = pro.name;
                    log.pre_credit = pro.credit;
                    log.credit = log.op_credit+pro.credit;
                    log.type = 1;//积分攒取；
                    log.creat_at = new Date();
                    log.desc = '成功攒取'+credit+'积分';
                    log.save(function(err,obj) {
                        if (err) {
                            restmsg.errorMsg(err);
                            res.send(restmsg);
                            return;
                        }
                        res.send(restmsg.successMsg());
                    });

                });

            }else{
                restmsg.errorMsg('客户不存在');
                res.send(restmsg);
            }
        })

    });

router.route('/:uid')
    //修改用户
    .post(function (req, res, next) {
        var user = new Object();
        var restmsg = new RestMsg();

        user.contact = req.param('contact');
        user.tel = req.param('tel');
        user.qq = req.param('qq');
        user.amaldar = req.param('amaldar');
        user.desc = req.param('desc',null);
        user.creat_at = new Date();
        user.addr = req.param('addr');
        user.salesman = req.param("salesman");

        UserBO.findOne({_id:req.params.uid},function(err,pro){
            if (err){
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }
            if(pro) {
                UserBO.update({_id:req.params.uid},user,function(err,obj){
                    if (err) {
                        restmsg.errorMsg(err);
                        res.send(restmsg);
                        return;
                    }
                    res.send( restmsg.successMsg());
                });
            }else{
                restmsg.errorMsg('用户不存在');
                res.send(restmsg);
            }
        })
    })

    //激活or注销
    .put(function(req,res,next){
        var uid = req.params.uid;
        var status = req.param('status');
        var restmsg = new RestMsg();
        UserBO.update({_id:uid},{status:status},function(err,obj){
            if (err) {
                restmsg.errorMsg(err);
                res.send(restmsg);
                return;
            }
            res.send( restmsg.successMsg());
        });
    });

module.exports = router;