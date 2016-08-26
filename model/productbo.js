/**
 * 产品bo
 * Created by duanying on 2016/4/9.
 */
var mongoose = require('../db/db');
var productSchema = mongoose.Schema({
    "name":String,//系列名称
    "num": Number,//系列中的作品数
    "desc":String,//描述
    "create_at":Date,//<时间>
    "imgs":Array,//图片
},{versionKey:false});

var product = mongoose.model('products', productSchema,'products');

module.exports = product;