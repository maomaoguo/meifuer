/**
 * 日志bo
 * Created by duanying on 2016/4/9.
 */
var mongoose = require('../db/db');

var logSchema = mongoose.Schema({
    "op_id":String,//操作人id
    "op_name": String,//"操作人姓名,
    "oped_id":String,//被操作人id
    "oped_name": String,//"被操作人姓名,
    "type":Number,//<日志类型>，1客户积分赚取，2客户积分消费，3客户注册，4客户删除，
    "op_credit":Number,//积分，增加积分用正数，消费积分用负数
    "pre_credit":Number,//操作前积分
    "credit":Number,//操作后积分
    "desc":String,//日志描述
    "creat_at":Date//<时间>
});

var log = mongoose.model('logs', logSchema);

module.exports = log;