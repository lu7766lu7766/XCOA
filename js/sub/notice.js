layui.config({
    base: '../../../layui/' //静态资源所在路径
}).extend({
    index: 'index' //主入口模块
}).use(['index','form','laydate','laypage','layedit','table','upload'], function(){
    var $ = layui.$
    ,admin = layui.admin
    ,element = layui.element
    ,table =layui.table
    ,router = layui.router();
    element.render();
    $.fetch({
        url:"/gateway/notice/showuser",
        type: 'post',
        cb:function(rs){
            var op='';
            if(rs.length==0){
                op+='<option value="">无审核人</option>';
                layer.msg("未设置审核人无法新建,请先设置指定审核人。",{icon:5});
                $("#subnotice").attr("disabled","disabled").addClass("layui-disabled");
            }
            for(var i=0;i<rs.length;i++){
                op+='<option value="'+rs[i].id+'">'+rs[i].name+'</option>'
            }
            $("#appro").html(op);
            form.render('select','component-form-notice');
        }
    });
    var laydate = layui.laydate
        ,form = layui.form
        ,laypage =layui.laypage
        ,layedit = layui.layedit;
    
    //执行一个laydate实例
    laydate.render({
       elem: '#StartEnd-item' //指定元素
      ,type: 'date'
      ,range: '~'
      ,format: 'yyyy-MM-dd'
    });
    form.render();
    var upload = layui.upload;
    var AttachsId=[];
    //执行实例
    // var  noDataHtml ='<tr><td colspan="8"><div class="layui-table-cell" style="text-align: center">暂无公告</div></td></tr>'
   
    var uploadInst = upload.render({
        elem: '#fileUpload' //绑定元素
        ,url: window.urls+'/gateway/notice/addattach' //上传接口
        ,accept:'file'
        ,before: function(obj){ //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
            layer.load(); //上传loading
        }
        ,done: function(res){
            //上传完毕回调
            layer.closeAll('loading'); //关闭loading
            AttachsId.push(res.data.attachId);
            $("#UploadNames").append('<a><span>'+res.data.attachName+'</span><i class="layui-icon layui-unselect layui-tab-close" data-id="'+res.data.attachId+'">ဆ</i></a>')
            
        }
        ,error: function(){
            layer.closeAll('loading'); //关闭loading
        //请求异常回调
        }
    });
   
    var noticedit = layedit.build("noticeEit", {
        tool: [
            'strong' //加粗
            ,'italic' //斜体
            ,'underline' //下划线
            ,'del' //删除线
            ,'|' //分割线
            ,'left' //左对齐
            ,'center' //居中对齐
            ,'right' //右对齐
            ,'link' //超链接
            ,'unlink' //清除链接
            ,'face' //表情
            // ,'image' //插入图片
            // ,'help' //帮助
        ]
    })
    
    form.verify({
        timeinput:function(value){
            if(!value.match(/\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}/)){
                return '请选择日期';
            };
        },
     
    })
    
    //添加人员
    $("a.addDesc").on("click",function(){
        selMemberFun($(this));
    });
    $("a.emptyDesc").on("click",function(){
        $(this).siblings("ul").html("");
        $(this).siblings("ul").attr("data-val","");
        $(this).siblings(".layui-textarea").html("");
    });
    //删除附件
    $('#UploadNames').on("click","i",function(){
        var el =$(this);
        var aid=el.attr('data-id');
        $.fetch({
            url:"/gateway/notice/delattach/"+aid+"",
            type: 'get',
            cb:function(rs){
                el.parent("a").remove();
            }
        });
    })
    var resetForm =function(){
        $("#StartEnd-item").val('').prop("placeholder",'开始时间 ~ 结束时间');
        $("#noticetitle").val('');
        $("#noticeEit").val('');
        $("ul#noticUser").attr("data-val",'');
        $("#UploadNames").html('');
        $("#noticUser").html('');
        $("#userName").html('');
        var appro =$("#appro").val();
        noticedit = layedit.build("noticeEit", {
            tool: [
                'strong' //加粗
                ,'italic' //斜体
                ,'underline' //下划线
                ,'del' //删除线
                ,'|' //分割线
                ,'left' //左对齐
                ,'center' //居中对齐
                ,'right' //右对齐
                ,'link' //超链接
                ,'unlink' //清除链接
                ,'face' //表情
                // ,'image' //插入图片
                // ,'help' //帮助
              ]
        })
        form.render();
    }
    form.on('submit(form-notice)', function(data){
        var userName= data.field.userName;
        userName=userName.replace(/;/, ",");
        userName =userName.slice(0,userName.length-1);
        
        var timesArr= $("#StartEnd-item").val();
        timesArr= timesArr.split(" ~ ");
        var tit = $("#noticetitle").val();
        var Content =layedit.getContent(noticedit);
        var uid= $("ul#noticUser").attr("data-val");
        var Attastr =AttachsId.join(',');
        var StartTime = timesArr[0];
        var EndTime = timesArr[1];
        var appro =$("#appro").val();
        var prama={
            Users:userName,
            UserID:uid,
            Content:Content,
            Title:tit,
            StartTime:StartTime,
            EndTime:EndTime,
            ApprovalUserId:appro,
            Attachs:Attastr
        }
        $.fetch({
            url:"/gateway/notice/add",
            type: 'post',
            data:prama,
            cb:function(rs){
                layer.msg("提交成功!");
               
                resetForm();
            }
        });
        return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
    });
    $("#resetnotice").on("click",function(){
        resetForm();
    })
    laydate.render({ 
        elem: '#NoticeTime'
        ,range: true //或 range: '~' 来自定义分割字符
    });

    // 生成表格
    var AnnounTabel = table.render({
        elem: '#publishTable',
        url: urls + "/gateway/notice/mypublish",
        method: 'post',
        contentType: 'application/json',
        page: true, //开启分页
        where:{
            ApplyResult:0
        },
        limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000],
        text: {
            none: '暂无数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
        },
        cols:  [[ //标题栏
            {sort: true,field: 'creater', title: '发布人', width:100}
            ,{
                sort: true,field: 'to_users',
                title:'发布范围',
                width:180,
                templet: function (d) {
                    // var userName = '';
                    // for (var i = 0; i < d.to_users.length; i++) {
                    //     userName += '<span data-userid="' + d.to_users[i].id + '">' + d.to_users[i].name + ',</span>'
                    // }
                    return '<div class="limit-width">' + d.to_users + '</div>'
                } 
            }  
            ,{sort: true,field: 'publish_user_count', title: '发布人数',minWidth:100 } 
            ,{sort: true,field: 'read_count', title:'已读人数',minWidth:100,
                templet: function (d) {
                    return '<a title="点此查看" class="HaveRead" lay-event="read_user">' + d.read_count + '</a>'
                }
            }            
            ,{
                sort: true,field: 'title', 
                title: '标题',
                minWidth:160,
                templet:function(d){
                    return '<a class="toTitle"  lay-event="toTitle">' + d.title + '</a>'
                }
            }
            ,{sort: true,field: 'created_at', title: '创建时间',width:160}
            ,{sort: true,field: 'validity_starttime', title: '生效时间',width:160}
            ,{sort: true,field: 'validity_endtime', title: '终止时间',width:160}
            ,{sort: true,field: 'current_approval_user_name', title: '审批人',minWidth:100}
            ,{
                sort: true,field: 'apply_result',
                title: '状态',
                width: 100,
                templet: function (d) {
                    return  d.apply_result ==0?'<span class="layui-btn layui-btn-warm layui-btn-xs">待审批</span>':
                            d.apply_result ==1?'<span class="layui-btn layui-btn-primary layui-btn-xs">未批准</span>':
                            d.apply_result ==2?'<span class="layui-btn layui-btn-normal layui-btn-xs">已批准</span>':''
                }
            }
            ,{
                fixed: 'right'
                ,title:'操作'
                ,width:110
                ,templet: function (d) {
                    var check = d.status == 1 ? 'checked' : '';
                    return d.apply_result == 0 ? '<span class="del layui-btn layui-btn-xs"  lay-event="del">删除</span><span class="noticChange layui-btn layui-btn-xs"  lay-event="noticChange">修改</span>' :
                            d.apply_result ==1?'<span class="del layui-btn layui-btn-xs"  lay-event="del">删除</span>':
                            d.apply_result ==2?'<div class="layui-input-inline" style="min-width:64px;" data-id="'+d.id+'"><input type="checkbox" '+check+' lay-skin="switch" lay-filter="stopOpen" lay-text="生效|终止"></div>':''
                }
                // , toolbar: '<div><span class="wsee layui-btn layui-btn-xs" lay-event="wsee">查看详情</span><span class="wChange layui-btn layui-btn-xs" lay-event="wChange">修改</span><span class="wdel layui-btn layui-btn-xs" lay-event="wdel">删除</span></div>'
            }
        ]]
        ,request: {
            pageName: 'currentIndex' //页码的参数名称，默认：page
            ,limitName: 'pageSize' //每页数据量的参数名，默认：limit
        }
        ,parseData: function(res){ //res 即为原始返回的数据
            return {
                "status_code":res.status_code, //解析接口状态
                "message": res.message, //解析提示文本
                "count": res.data.total_count, //解析数据长度
                "data": res.data.data_list, //解析数据列表
                "curr":res.data.page_index
            };
        }
        ,done:function(res){
            $('.limit-width').on("mouseenter", function () {
                var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">' + $(this).text(); + '</div>'
                var that = this;
                layer.tips(tipsCont1, that, {
                    tips: [1, '#999'],
                    maxWidth: 'auto'
                });
            });
            // if(this.where.ApplyResult!=="2"){
            //     $("th[data-field='read_count'] div").text('发布人数');
            // }
        }
    })
    $("#InquireSur").on("click",function(){
        var timeArr = $('#NoticeTime').val().split(' - ');
        var tit = $("#NoticeTit").val();
        var status = $("#publish-status").val();
        AnnounTabel.reload({
            where: { //设定异步数据接口的额外参数，任意设
                Title: tit
                ,ApplyResult:status
                ,StartDate:timeArr[0]
                ,EndDate:timeArr[1]
            }
            ,page: {
                curr: 1 //重新从第 1 页开始
            }
        });
    })
    table.on('tool(publishTable)', function (obj) {
        var data = obj.data; //获得当前行数据
        var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
        var trData=data;
        if(layEvent == 'del'){ //删除
            layer.confirm('确定删除这条公告?',{"title":""},function(index){
                $.fetch({
                    url:"/gateway/notice/delete/"+data.id+"",
                    type: 'get',
                    cb:function(rs){
                        layer.msg("删除成功");
                        var result = $("#publish-status").val();
                        AnnounTabel.reload({where:{
                            ApplyResult:result
                        }})
                    }
                })
            })
        }else if(layEvent == 'noticChange'){ //修改
            $.fetch({
                url:"/gateway/notice/detail/"+data.id+"",
                type: 'get',
                cb:function(rs){
                    var starTime =rs.notice.validity_starttime;
                    var endTime =rs.notice.validity_endtime;
                    
                    timesVal =starTime.slice(0,10)+' ~ '+endTime.slice(0,10)
                    var AttachsId=[],atta='';
                    //发布给
                    var useridArr=rs.notice.to_userId.split(",");
                    var userNameArr=rs.notice.to_users.split(",");
                    var userUlHtml='';
                    for(var i=0;i<userNameArr.length;i++){
                        userUlHtml+='<li class="pick" data-user="'+useridArr[i]+'">'+userNameArr[i]+'</li>';
                    }
                    var htmls ='<div class="layui-card">'
                                        +'<div class="reviewCont layui-card-body">'
                                            +'<div class="layui-card-body">'
                                                +'<div class="layui-form" action="" lay-filter="component-form-c-notice">'
                                                    +'<div class="layui-form-item">'
                                                        +'<label class="layui-form-label modify-layui-label">公告标题：</label>'
                                                        +'<div class="layui-input-block">'
                                                            +'<input id="c_noticetitle" name="title" lay-verify="required" type="text" placeholder="请输入公告标题" class="layui-input">'
                                                        +'</div>'
                                                    +'</div>'
                                                    +'<div class="layui-form-item">'
                                                        +'<label class="layui-form-label modify-layui-label">按成员发布：</label>'
                                                        +'<div class="layui-input-block departTable">'
                                                            +'<textarea id="c_userName" name="c_userName" required lay-verify="required" placeholder="点击添加进行编辑"  readonly="readonly" class="layui-textarea layui-input-inline">'
                                                            +rs.notice.to_users+',</textarea>'
                                                            +'<ul id="c_noticUser" style="display: none" class="layui-small-static" data-val="'+rs.notice.to_userId+'">'+userUlHtml+'</ul>'
                                                            +'<a class="addDesc">'
                                                                +'<i class="iconfont icon-40"></i>添加'
                                                            +'</a>'
                                                            +'<a class="emptyDesc">'
                                                                +'<i class="iconfont icon-qingkong"></i>清除'
                                                            +'</a>'
                                                        +'</div>'
                                                    +'</div>'
                                                    +'<div class="layui-form-item">'
                                                        +'<label class="layui-form-label modify-layui-label">有效期：</label>'
                                                        +'<div class="layui-input-inline" style="margin-left:5px;">'
                                                            +'<input type="text" name="ytime" lay-verify="timeinput" class="layui-input" placeholder="开始时间 ~ 结束时间" id="c_StartEnd-item">'
                                                        +'</div>'
                                                    +'</div>'
                                                    +'<div class="layui-form-item">'
                                                        +'<label class="layui-form-label modify-layui-label">附件：</label>'
                                                        +'<div class="layui-input-block">'
                                                            +'<button type="button" class="layui-btn layui-btn-primary" id="c_fileUpload">'
                                                                +'<i class="layui-icon">&#xe67c;</i>上传附件'
                                                            +'</button>'
                                                            +'<div id="c_UploadNames" class="upload-names-box"></div>'
                                                        +'</div>'
                                                    +'</div>'
                                                    +'<div class="layui-form-item">'
                                                        +'<div class="layui-input-block">'
                                                            +'<textarea name="noticeEit" id="c_noticeEit" style="display: none;">'+rs.notice.content+'</textarea>'
                                                        +'</div>'
                                                        
                                                    +'</div>'
                                                    +'<div class="layui-form-item">'
                                                        +'<div class="layui-input-block">'
                                                            +'<button id="c_subnotice" class="layui-btn" lay-submit lay-filter="form-c-notice">提交修改</button>'
                                                            +'<button id="c_resetnotice" class="layui-btn layui-btn-primary">重置</button>  '  
                                                        +'</div>'
                                                    +'</div>'
                                                +'</div>'
                                            +'</div>'
                                        +'</div>'
                                    +'</div>'
                    layer.open({
                        title:'修改公告',
                        content:htmls,
                        type:1,
                        id:'changPop',
                        area:['100%','100%'],
                        success:function(layero, index){
                            if(rs.attaches&&rs.attaches!=''){//附件
                                for(var i=0; i<rs.attaches.length; i++){      
                                    AttachsId.push(rs.attaches[i].id);
                                    $("#c_UploadNames").append('<a><span>'+rs.attaches[i].original_name+'</span><i class="layui-icon layui-unselect layui-tab-close" data-id="'+rs.attaches[i].id+'">ဆ</i></a>')
                                }
                            }
                            laydate.render({
                                elem: '#StartEnd-item' //指定元素
                                ,type: 'date'
                                ,range: '~'
                                ,format: 'yyyy-MM-dd'
                            });
                            var upload = layui.upload;
                            
                            var c_uploadInst = upload.render({
                                elem: '#c_fileUpload' //绑定元素
                                ,url: window.urls+'/gateway/notice/addattach' //上传接口
                                ,accept:'file'
                                ,before: function(obj){ //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
                                    layer.load(); //上传loading
                                }
                                ,done: function(res){
                                    //上传完毕回调
                                    layer.closeAll('loading'); //关闭loading
                                    AttachsId.push(res.data.attachId);
                                    $("#c_UploadNames").append('<a><span>'+res.data.attachName+'</span><i class="layui-icon layui-unselect layui-tab-close" data-id="'+res.data.attachId+'">ဆ</i></a>')
                                    
                                }
                                ,error: function(){
                                    layer.closeAll('loading'); //关闭loading
                                //请求异常回调
                                }
                            });
                            var c_noticedit = layedit.build("c_noticeEit", {
                                tool: [
                                    'strong' //加粗
                                    ,'italic' //斜体
                                    ,'underline' //下划线
                                    ,'del' //删除线
                                    ,'|' //分割线
                                    ,'left' //左对齐
                                    ,'center' //居中对齐
                                    ,'right' //右对齐
                                    ,'link' //超链接
                                    ,'unlink' //清除链接
                                    ,'face' //表情
                                    // ,'image' //插入图片
                                    // ,'help' //帮助
                                ]
                            })
                            form.verify({
                                timeinput:function(value){
                                    if(!value.match(/\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}/)){
                                        return '请选择日期';
                                    };
                                },
                            
                            })

                            form.render();
                            form.val("component-form-c-notice", {
                                "title":rs.notice.title,
                                "ytime":timesVal,
                            })
                            $("a.addDesc").on("click",function(){
                                selMemberFun($(this));
                            });
                            $("a.emptyDesc").on("click",function(){
                                $(this).siblings("ul").html("");
                                $(this).siblings("ul").attr("data-val","");
                                $(this).siblings(".layui-textarea").html("");
                            });
                            //添加人员
                            //删除附件
                            $('#c_UploadNames').on("click","i",function(){
                                // var el =$(this);
                                // var aid=el.attr('data-id');
                                $.fetch({
                                    url:"/gateway/notice/delattach/"+data.id+"",
                                    type: 'get',
                                    cb:function(rs){
                                        el.parent("a").remove();
                                    }
                                });
                            })
                            form.on('submit(form-c-notice)', function(data){
                                var userName= data.field.c_userName;
                                console.log(userName);
                                userName=userName.replace(/;/, ",");
                                userName =userName.slice(0,userName.length-1);
                                
                                var timesArr= $("#c_StartEnd-item").val();
                                timesArr= timesArr.split(" ~ ");
                                var tit = $("#c_noticetitle").val();
                                var Content =layedit.getContent(c_noticedit);
                                var uid= $("ul#c_noticUser").attr("data-val");
                                var Attastr =AttachsId.join(',');
                                var StartTime = timesArr[0];
                                var EndTime = timesArr[1];
                                var appro =$("#c_appro").val();
                                var prama={
                                    ID:trData.id,
                                    Users:userName,
                                    UserID:uid,
                                    Content:Content,
                                    Title:tit,
                                    StartTime:StartTime,
                                    EndTime:EndTime,
                                    Attachs:Attastr
                                }
                                $.fetch({
                                    url:"/gateway/notice/update",
                                    type: 'post',
                                    data:prama,
                                    cb:function(rs){
                                        layer.msg("修改成功!");
                                        var result = $("#publish-status").val();
                                        AnnounTabel.reload({where:{
                                            ApplyResult:result
                                        }})
                                        layer.closeAll();
                                    }
                                });
                                return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
                            });
                        }
                    })
                    form.render();
                }
            })
        }else if(layEvent == 'read_user'){
            var list='',listno='';
            allUser=data.to_users.split(",");
            for(var i=0;i<allUser.length;i++){
                var isRead=false
                for(var j=0;j<data.read_users.length;j++){
                    if((data.read_users[j].name.replace(' ',''))==allUser[i].replace(/\(.*?\)/g,'').replace(' ','')){
                        list+='<li class="NoticeIsRead">'+allUser[i]+',</li>'
                        isRead=true;
                    }
                }
                if(!isRead){
                    listno += '<li class="NoticeNoRead">' + allUser[i] + ',</li>'
                    isRead=false;
                }
            }
            layer.tab({
                area: ['600px', '300px'],
                tab: [{
                  title: '已读：<em style="color:#FFB800;font-style:normal;">' + data.read_users.length + '</em>人',
                  content: '<ul class="ULisRead">' + list + '</ul>'
                }, {
                  title: '未读：<em style="color:#FF5722;font-style:normal;">' + (allUser.length - data.read_users.length) + '</em>人',
                  content: '<ul class="ULisRead">' + listno + '</ul>'
                }]
            }); 
        } else if (layEvent == 'toTitle') {
            $.fetch({
                url: "/gateway/notice/detail/" + data.id + "",
                type: 'get',
                cb: function (rs) {
                    console.log(rs)
                    var atta = '';
                    if (rs.attaches && rs.attaches != '') {
                        for (var i = 0; i < rs.attaches.length; i++) {
                            atta += '<a title="点击下载" class="seeXqOutIn" target="_blank" href="' + urls + '/gateway/notice/download/' + rs.attaches[i].id + '" >' + rs.attaches[i].original_name + '</a>'
                        }
                    } else {
                        atta = '<span>无附件</span>'
                    }

                     var htmls ='<div class="layui-card" style="min-height:300px">'
                                    +'<div class="reviewCont layui-card-body">'
                                        +' <div class="layui-form-item">'
                                            +' <p style="margin-bottom: 3px;"><label class="fl">发布部门：</label><u class="hideCont">'+rs.notice.to_users+'<i class="iconfont icon-triangle-left"></i></u></p>'
                                            +'<div class="layui-elem-quote" style="padding: 15px 0px;">'
                                                +' <p><label class="fl">发布人：</label><u class="fr-width">'+rs.notice.creater+'</u></p>'
                                                +' <p><label class="fl">发布于：</label><u class="fr-width">'+rs.notice.validity_starttime+'</u></p>'
                                                +' <p><label class="fl">标题：</label><u class="fr-width">'+rs.notice.title+'</u></p>'                                    
                                                +' <p><label class="fl">附件：</label><u class="fr-width">'+atta+'</u></p>'
                                            +'</div>'
                                        +' </div>'
                                        +'<fieldset class="layui-elem-field"><legend>公告内容</legend><div class="layui-field-box pageCont">'+rs.notice.content+'</div></fieldset>'
                                    +'</div>'
                                +'</div>'
                    var publisDetail = layer.open({
                        title: '查看公告详情',
                        content: htmls,
                        type: 1,
                        id: 'publisDetail',
                        area: ['60%', 'auto'],
                    });
                    $(".reviewCont i").click(function () {
                        if (!$(this).parent("u").hasClass('showCont')) {
                            $(this).parent(".hideCont").addClass("showCont");
                            $(this).parent(".hideCont").removeClass("hideCont");
                        } else {
                            $(this).parent(".showCont").removeClass("showCont");
                            $(this).parent("u").addClass("hideCont");
                        }
                    })
                }
            });
        }
    })
    
    //状态选框
    form.on('select(publish-status)', function(data){
        var timeArr = $('#NoticeTime').val().split(' - ');
        var tit = $("#NoticeTit").val();
        table.reload('publishTable', {
            where: {
                Title: tit
                ,StartDate:timeArr[0]
                ,EndDate:timeArr[1]
                ,ApplyResult: data.value
            }
            ,page:{
                curr:1,
            }
        })
    });
    $("#backquireSur").on("click",function(){
        $("#NoticeTit").val('');
        $("#NoticeTime").val('');
        var ApplyResult = $("#publish-status").val();
        table.reload('publishTable', {
            where: {
                Title: ''
                ,StartDate:''
                ,EndDate:''
                ,ApplyResult: ApplyResult
            }
            ,page:{
                curr:1,
            }
        })
    })
    form.on('switch(stopOpen)', function(data){
        console.log($(data.elem))
        var sid = $(data.elem).parents("div").attr("data-id");
        var st =data.elem.checked?1:2;
        prama={
            ID:sid,
            Status:st,
        }
        $.fetch({
            url:"/gateway/notice/updatestatus",
            type: 'post',
            data:prama,
            cb:function(rs){
            }
        });
    });
})