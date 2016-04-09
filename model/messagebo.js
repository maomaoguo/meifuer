/**
 * 留言 bo
 * Created by duanying on 2016/4/9.
 */
var messageSchema = mongoose.Schema({
    "mes_id":String,//留言人id
    "mes_name": String,//"留言人姓名,
    "mes_at": String,//留言时间,
    "message": String,//留言内容,
    "op_id":String,//操作人id
    "op_name": String,//"操作人姓名,
    "type":Number,//<类型>，1待处理，2已处理，3哦，知道了！，
    "op_note":String,//处理信息
    "op_at":Date,//处理时间
});

var message = mongoose.model('messages', messageSchema);

module.exports = message;