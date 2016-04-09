/**
 * 商品BO——兑换的
 * Created by duanying on 2016/4/9.
 */
var mongoose = require('../../../db/db');

var activitySchema = mongoose.Schema({
    "name":String,//活动名称
    "start_at":Date,//开始时间
    "end_at":Date,//结束时间
    "goods":Array,//
    /**
     * "no":String,//商品编码
     * "name":String，//名称
     * "url":String，//图片路径
     * "credit":Number,//需要的积分
     * "num":Number，//剩余数量
     * "total":Number,//总数量
     */
    "creat_at":Date//<时间>
});

var activity = mongoose.model('activits', activitySchema);

module.exports = activity;