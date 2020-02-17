/** layuiAdmin.std-v1.1.0 LPPL License By http://www.layui.com/admin/ */ ;
layui.define(function (e) {
    var i = (layui.$, layui.layer, layui.laytpl, layui.setter, layui.view, layui.admin);
    i.events.logout = function () {
        i.req({
            url: ""+urls+"/gateway/logout",
            dataType: 'json',
            type: 'post',
            // done: function (e) {
            //     i.exit(function () {
            //         location.href = "user/login.html"
            //     })
            // }
            done: function (data) {
                if (data.status_code == 200 && data.message == "OK"){
                    //获取cookie中 语言变量
                    
                    window.location.href='login.html';
                    // $.menuInit(data.data,language);
                }else if(data.status_code===400&&data.message == "未登录"){
                    // 登陆错误
                    alert("登录已失效，请重新登录。");
                    window.location.href="login.html"	
                }else{
                    alert(data.message);
                    window.location.href='index.html';
                }
            }
        })
    }, e("common", {})
});