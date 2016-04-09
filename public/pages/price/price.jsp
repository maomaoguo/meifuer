<%@ page contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<!DOCTYPE html>
<html>
	 <head>
	 </head>
 	 <body>
          <section class="wrapper">
              <div class="mail-box">
                      <div class="inbox-head">
                          <h3>会员价目管理</h3>
                          <form class="pull-right position" >
                              <div class="input-append">
                                  <input type="text"  placeholder="查询" class="sr-input">
                                  <button type="button" class="btn sr-btn"><i class="icon-search"></i></button>
                              </div>
                          </form>
                      </div>
                      <div id="sperson-feedlists" class="sperson-feedlist"></div>
              </div>
          </section>
  </body>

  <script type="text/x-jquery-tmpl" id="conTemplate">
	<dl class="feed_list" model-node="following_list_item" id="{{= vid}}">
		<dd class="person-info">
			<div class="info-left">
				<p class="hd">
					<a class="follow_uname" href="javascript:void(0);"
						style="font-size: 14px; cursor: default;">{{= name}}</a>
				</p>
				<p class="area" style="margin-top: 12px; margin-bottom: 0;">
					<span></i>&nbsp;介绍：{{= introduce}}</span>
				</p>
			</div>
		</dd>
	</dl>
  </script>
  <script>
  
  $(document).ready(function() {
	  initData();
	});
//获取列表
  function initData() {
  	$.get("api/prices", function(r) {
  		if (r.code == 1) {
  			var data = r.result;
  			$("#conTemplate").tmpl(data).appendTo("#sperson-feedlists");
  		} else {
  			ui.error(r.msg);
  		}
  	});
  }
  </script>
</html>
