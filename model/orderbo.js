/**
 * 订单bo
 * Created by duanying on 2016/4/9.
 */
var mongoose = require('../db/db');

var orderSchema = mongoose.Schema({
    "no":String,//订单号
    "name":String,//礼品名称
    "credit":Number,//需要的积分
    "customer_id":String,//客户id
    "customer_name": String,//"<客户名称>",
    "to_name":String,//收件人姓名
    "to_addr":String,//收件人地址
    "to_tel":String, //收件人电话
    "op_id":String,//处理人id
    "op_name":String,//处理人姓名
    "op_at":String,//处理时间
    "express":String,//快递公司名称
    "express_no": String,//"快递单号",
    "other":String,//其他送货方式
    "status":Number,//<订单状态 1待发货，2已发货>,
    "buy_at":Date//<兑换时间>

});

var order = mongoose.model('orders', orderSchema);

module.exports = order;