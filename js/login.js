
window.urls = "http://www.oa.video88.cc"
// window.urls = "http://10.20.11.152";
//
// window.urls = "http://oa-company.com"
// window.urls = "http://oa-group.com"
// window.urls = "http://oa-company-699.com";
// window.urls =   window.location.host;//当前域名
// console.log(window.urls);
try{
    if( typeof($)!="undefined" && typeof($)!="null" && typeof(_user_) != "object" )
    {
        window._user_ = {
            isLogin: "false", //// 是否登录,"true":登录；  "false":未登录
            userName: "",  //当前用户的登录 用户名
            ajax_timeout: 30000,  //ajax请求超时时间
            doLogin:function(async_) {
                var username_login = $.trim($('#userName').val());
				var passwd_login = $.trim($('#userPassword').val());
                if (username_login == '') {
                     alert('用户名不能为空!');
                    return false;
              	}
				if (passwd_login == '') {
					alert('密码不能为空!');
					return false;
				}
				var param = {
					name: username_login,
					password: passwd_login,
					// form_submit: "ok"
				};
                if( !async_ )
                {
                    async_ = true;
                }
                $.ajax({
                    url: window.urls+"/gateway/login",
                    type: 'post',
                    data: param,
					async: async_,
                    beforeSend: function () {
                        $("#btnLogin").attr("disabled", true);
                    },
                    complete: function () {
                        $("#btnLogin").attr("disabled", false);
                    },
                    'timeout': _user_.ajax_timeout,
                    dataType: 'JSON',
                    error: function (XMLHttpRequest, status) {
                        if (status == 'timeout') {
                            alert('系统繁忙,请重新操作!');
                        }
                    }
                }).done(function( data ){
                    if (data.hasOwnProperty('status_code') && data.status_code===200) {
						//登陆成功
                        console.log("登录成功");
                        _user_.isLogin = true;
                        //cookie中储存登录状态
                        window.location.href='index.html?user='+param.name+'';
                    }
                    else
                    {
                       // 登陆错误
                       alert(data.message);
                        //
                    }
                });
    }
        };
    }
}catch( e ){ console.log(e); }

$("#btnLogin").on("click",function(){
	// var username_login = $.trim($('#userName').val());
	// var passwd_login = $.trim($('#userPassword').val());
	// console.log(username_login,passwd_login);
	_user_.doLogin();
});
$("body").keydown(function() {
    if (event.keyCode == "13") {//keyCode=13是回车键
        $("#btnLogin").click();
    }
});
