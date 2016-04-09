
function nohidenotify(style,position,message,text) {
 	if(style == "error"){
		icon = "icon-exclamation";
	}else if(style == "warning"){
		icon = "icon-warning-sign";
	}else if(style == "success"){
		icon = "icon-ok";
	}else if(style == "info"){
		icon = " icon-question";
	}else{
		icon = "icon-circle-blank";
	}   
    $.notify({
        title: message,
        text: text,
        image: "<i class='"+icon+"'></i>"
    }, {
        style: 'metro',
        className: style,
        globalPosition:position,
        showAnimation: "show",
        showDuration: 0,
        hideDuration: 0,
        autoHide: false,
        clickToHide: true
    });
}

//弹出提示信息
function yeshidenotify(style, position, message, text, time) {
	if(style == "error"){
		icon = "icon-exclamation";
	}else if(style == "warning"){
		icon = "icon-warning-sign";
	}else if(style == "success"){
		icon = "icon-ok";
	}else if(style == "info"){
		icon = " icon-question";
	}else{
		icon = "icon-circle-blank";
	}   
    $.notify({
        title: message,
        text: text,
        image: '<i class="' + icon + '"></i>'
    }, {
        style: 'metro',
        className: style,
        globalPosition: position,
        showAnimation: 'show',
        showDuration: 0,
        hideDuration: 0,
        autoHideDelay: time,
        autoHide: true,
        clickToHide: true
    });
}

function confirm(style, position, message, text, yesCallback) {
	$.notify({
        title: message,
        text: text + '<div class="clearfix"></div><br><a id="a1" class="btn btn-sm btn-default yes">确定</a><a class="btn btn-sm btn-danger no">取消</a>',
        image: "<i class='icon-warning-sign'></i>"
    }, {
        style: 'metro',
        className: style,
        globalPosition:position,
        showAnimation: "show",
        showDuration: 0,
        hideDuration: 0,
        autoHide: false,
        clickToHide: false
    });
	$('.notifyjs-metro-base .yes').on('click', function() {
		$(this).trigger('notify-hide');
		yesCallback();
	});
	
}

$(function(){
	//listen for click events from this style
	$(document).on('click', '.notifyjs-metro-base .no', function() {
	  //programmatically trigger propogating hide event
	  $(this).trigger('notify-hide');
	});
})