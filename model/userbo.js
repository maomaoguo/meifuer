/**
 * 用户BO
 * @type {mongoose|exports}
 */
var mongoose = require('../db/db');

var userSchema = mongoose.Schema({
    "login":String,//登录名
    "psw":String,//密码
    "name": String,//"<用户名称>",
    "role":Number,//用户角色，1超级管理员（只有一个），可添加管理员，2普通管理员（无增删改查管理员的权限），3，客户
    "contact":String,//联系人
    "tel":String, //联系电话，可以多个
    "qq":String,//联系qq，可以多个
    "addr":String,//地址
    "amaldar":String,//经理
    "credit":Number,//积分
    "desc": String,//"<用户描述>",
    "status":Number,//<用户状态 0无效|1有效>,
    "creat_at":Date//<用户注册时间>
    
},{versionKey:false});

var user = mongoose.model('users', userSchema,'users');

module.exports = user;