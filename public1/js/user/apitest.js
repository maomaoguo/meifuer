// 请求路径
var url = 'api/users';
// 传参
var data = {};

// 左侧POST /api/users 点击事件
// 新增user
function saveRequest() {
    // 修改url路径
    $('#url').val(window.location + 'api/users');
    // 修改请求方式
    $('#method').val('POST');

    // 传参设为空
    data = {};
    data.name = '';
    data.desc = '';

    // 重置输入的form表单
    initFormData();
}

// 重置输入的form表单
function initFormData() {

    // 清空传参
    $('.bs-example').empty();

    // 设置输入框
    for (var name in data) {
        $('.bs-example').append('<div class="row"><div class="col-md-4 key"><input class="index-input" placeholder="Key" value="'+ name +'" readonly="readonly"></div>'
            +'<div class="col-md-4 value"><input class="index-input" placeholder="Value" id="'+ name +'"></div></div>');
    }
}

// reset按钮点击事件
// 清空class为value的input框中的值
function resetFormData() {
    $('.value input').each(function() {
        $(this).val('');
    });
}

// 左侧GET /api/users 点击事件
// 分页查询user
function pageRequest() {

    // 修改url路径
    $('#url').val(window.location + 'api/users');
    // 修改请求方式
    $('#method').val('GET');

    // 传参设为空
    data = {};
    data.name = '';
    data.minctime = '';
    data.maxctime = '';
    data.start = '';
    data.row = '';

    // 重置输入的form表单
    initFormData();
}

// 左侧PUT/api/users/:uid 点击事件
// 修改用户
function putRequest() {
    $('#url').removeAttr('readonly');
    // 修改url路径
    $('#url').val(window.location + 'api/users/:uid');
    // 修改请求方式
    $('#method').val('PUT');

    // 传参设为空
    data = {};
    data.name = '';
    data.desc = '';

    // 重置输入的form表单
    initFormData();
}

// 左侧PUT/api/users/:uid 点击事件
// 修改用户
function delRequest() {

    $('#url').removeAttr('readonly');
    // 修改url路径
    $('#url').val(window.location + 'api/users/:uid');
    // 修改请求方式
    $('#method').val('DELETE');

    // 传参设为空
    data = {};

    // 重置输入的form表单
    initFormData();
}

// send按钮点击事件
// ajax请求后台
function sendRequest() {

    // 组装向后台传的参数
    for (var name in data) {
        data[name] = $('#' + name).val();
    }

    // 请求方式
    var method = $('#method').val();
    var url = $('#url').val();

    // ajax请求
    $.ajax({
        type: method, // POST、GET、DELETE等方式
        url: url, // 请求路径
        data: data, // 传参，格式为：{key:value,key:value}，java中以request.getParameter(key)来获取前台传的数据
        dataType: 'json', // 数据形式
        success: function(data) { // 请求成功后回调函数，data为后台给前台返回的数据

            // 将返回的数据显示到id为response的元素中
            $('#response').html(JSON.stringify(data, null, '\t'));
        }
    });
}