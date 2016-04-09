/**
 * 用户模块服务层
 * @type {user|exports}
 */
var User = require('./model/userbo');
var Page = require('../../common/page');

function UserService(){

}
//保存用户
UserService.save = function(bo,callback){
    bo.creatDate = new Date();
    bo.save(function (err, bo) {
        if (err) {
            callback(err);
            return console.error(err);
        }
        callback(null, bo);
    });
}

//查询用户列表
UserService.findList = function(query,callback){
    if(!query){
        query = {};
    }
    if(query.status==undefined||query.status==null){
        query.status ={ $ne: 0 }//状态不等于删除状态


    }
    //处理分页
    var row = query.row;
    var start = query.start;
    var options = {'$slice':2};
    options['limit'] = row;
    options['skip'] = start;
    delete query.row;
    delete query.start;
    var page = new Page();
    User.count(query,function(err,count){
        if (err){
            callback(err);
            return console.error(err);
        }
        if(count===0){//无数据
            callback(null,page);
            return;
        }
        User.find(query,null,options,function (err, bos) {
            if (err){
                callback(err);
                return console.error(err);
            }
            page.setPageAttr(count);
            page.setData(bos);
            callback(null,page);
        });
    });

}

//更新用户信息
UserService.update = function(bo,callback){
    //如果直接使用bo对象需要转换对象并且删除_id属性
    User.findOne({_id:bo._id},function(err,pro){
        if (err){
            callback(err);
            return console.error(err);
        }
        if(pro){
            bo = bo.toObject();
            var id = bo._id;
            delete bo._id;
            delete bo.creatDate;//新建用户时间不变
            User.update({_id:id},bo,function (err, bos) {
                if (err){
                    return console.error(err);
                }else{
                    callback();
                }
            });
        }else{
            callback("不存在该用户");
        }
    });
}


//删除用户
UserService.remove = function(id,callback){
    //逻辑删除
    User.update({_id:id},{status:0},function (err, bos) {
        if (err){
            return console.error(err);
        }
        callback(null,bos);
    });
    //物理删除
//    User.findOneAndRemove({_id:rid},function (err, bo) {
//        if (err){
//            callback(err);
//            return console.error(err);
//        }
//        callback(null,bo);
//    });
}


module.exports = UserService;