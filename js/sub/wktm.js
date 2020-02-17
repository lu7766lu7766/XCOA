$(function(){
    layui.config({
        base: '../../../layui/' //静态资源所在路径
    }).extend({
        index: 'index' //主入口模块
    }).use(['index','table','laydate','form','laypage'], function(){
        var $ = layui.$
        ,admin = layui.admin
        ,element = layui.element
        ,router = layui.router();
        element.render();
        var laydate = layui.laydate
        ,form = layui.form
        ,layer = layui.layer
        ,table=layui.table
        ,laypage=layui.laypage
        ,workId='';

    // 生成表格
   var workApprList =  table.render({
        elem: '#workApprList',
        url: urls + "/gateway/worktimetypeuser/approvallist",
        method: 'post',
        limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000],
        page: true, //开启分页
        text: {
            none: '暂无数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
        },
        cols:  [[ //标题栏
            {field: 'work_time_type_name', title: '排班/倒班名称', width:210,
                templet: function (d) {
                return  d.is_auto===1?d.work_time_type_name+'('+d.work_time_name+')':d.work_time_type_name
                }
            },{field: 'is_auto', title: '类型', width:100,
                templet: function (d) {
                return  d.is_auto===1?'倒班':'普通排班'
                }
            }
                
            ,{
                field: 'user_list',
                title:'用户',
                templet: function (d) {
                    var userName = '';
                    for (var i = 0; i < d.user_list.length; i++) {
                        userName += '<span data-userid="' + d.user_list[i].id + '">' + d.user_list[i].name + ',</span>'
                    }
                    return '<div class="workname">' + userName + '</div>'
                } 
            }
            ,{field: 'start_date', title: '开始时间',}
            ,{field: 'end_date', title: '结束时间',}
            ,{field: 'creator', title: '申请人',width:80}
            // ,{field: 'modify_ip', title: '申请人ID',}
            ,{field: 'created_at', title: '创建时间',width:165}
            ,{
                fixed: 'right'
                ,title:'操作'
                ,width:165
                ,templet:function(d){
                    if(d.is_auto==1){
                        return '<div><button class="layui-btn layui-btn-sm layui-btn-warm" lay-event="wreview">审核</button><button class="layui-btn layui-btn-sm layui-btn-warm" lay-event="PourDail">查看详情</button></div>'
                    }else{
                        return '<div><button class="layui-btn layui-btn-sm layui-btn-warm" lay-event="wreview">审核</button><button class="layui-btn layui-btn-sm layui-btn-warm" lay-event="seeDail">查看详情</button></div>'
                    }
                }
                // , toolbar: '<div><button class="layui-btn layui-btn-sm layui-btn-warm wreview" lay-event="wreview">审核</button><button class="layui-btn layui-btn-sm layui-btn-warm seeDail" lay-event="seeDail">查看详情</button></div>'
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
        ,done:function(){
            $('.workname').on("mouseenter", function () {
                var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">' + $(this).text(); + '</div>'
                var that = this;
                layer.tips(tipsCont1, that, {
                    tips: [1, '#999'],
                    maxWidth: 'auto'
                });
            });
        }
    })


    table.on('tool(workApprList)', function (obj) {
        var data = obj.data; //获得当前行数据
        var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）

        if (layEvent === 'seeDail') { //正常排班查看详情
            var seehtml = ''
            $.fetch({
                url: "/gateway/worktimetypeuser/detail/" + data.auto_key+ "",
                type: 'get',
                cb:function(rs){
                    var workId =rs.id;
                    var userName ='';
                    if(rs.user_list&&rs.user_list.length>0){
                        for(var j=0;j<rs.user_list.length;j++){
                            userName+='<span data-userid="'+rs.user_list[j].id+'">'+rs.user_list[j].name+',</span>'
                        }
                    }else{
                        var userName ='无';
                    }
                    var sta = rs.approval_result==0?('<span class="blue">待审批</span>'):
                        rs.approval_result==1?('<span class="red">未批准</span>'):
                        rs.approval_result==2?('<span class="green">已批准</span>'):'';
                        if(rs.approval_userid==null){
                            sta='待提交';
                        }
                    var content=rs.content==null?'暂无':rs.content;

                    var htmlsAppr = '<div class="layui-card">'
                        +'<div class="reviewCont layui-card-body">'
                        +    '<div class="layui-form" action="">'
                        +        '<div class="layui-form-item">'
                        +            '<label class="layui-form-label">审批意见：</label>'
                        +            '<div class="layui-input-block">'
                        +                '<textarea id="appDacText" name="suggestion" class="layui-textarea" cols="50" rows="4" ></textarea>'
                        +            '</div>'
                        +        '</div>'
                        +        '<div class="layui-form-item">'
                        +            '<label class="layui-form-label">是否同意：</label>'
                        +            '<div class="layui-input-block">'
                        +                '<input type="radio" name="approvalYn" id="approvalOk" value="2" title="同意">'
                        +                '<input type="radio" name="approvalYn" id="approvalNo" value="1" title="不同意" checked>'
                        +            '</div>'
                        +        '</div>'
                        +        '<div class="layui-form-item">'
                        +            '<div class="layui-input-block">'
                        +               ' <button class="appOk layui-btn" data-item="'+data.auto_key+'">确认</button>'
                        +            '</div>'
                        +        '</div>'
                        +    '</div>'
                        +'</div>'
                        +'</div>'

                    seehtml+='<div class=" layui-card layui-form">'
                                +'<div class="layui-block">'
                                    +'<blockquote class="layui-row layui-fluid">'
                                        +'<div class="layui-col-xs12">' 
                                            +'<fieldset class="layui-elem-field">'
                                                +'<legend>用　　户：</legend>'
                                                +'<div class="layui-field-box" style="word-break:break-all;overflow: hidden;"><div class="ShowWidth" style="width: 700px;">' + userName + '<i class="iconfont icon-triangle-left"></i></div></div>'
                                            +'</fieldset>' 
                                        +'</div>'
                                        +'<div class="layui-col-xs12 layui-elem-quote layui-quote-nm addColor">'
                                            +'<div class="layui-col-xs3">'
                                                +'<p>排班名称：<span>'+rs.work_time_type_name +'</span></p>'
                                            +'</div>'
                                            +'<div class="layui-col-xs3">'
                                                +'<p>是 否 跨 天：<span>'+(rs.is_crossday==0?"否":"是")+'</span></p>'
                                            +'</div>'
                                            // +'<div class="layui-col-xs3">'
                                            //     +'<p>是否固定排班：<span>'+(rs.is_fixed==0?"否":"是")+'</span></p>'
                                            // +'</div>'
                                            +'<div class="layui-col-xs3">'
                                                +'<p>状　　态：<span>'+sta +'</span></p>'
                                            +'</div>'
                                            +'<div class="layui-col-xs12">'
                                                +'<div class="layui-col-xs3">'
                                                    +'<p>第一次登记：<span>'+rs.time1 +'</span></p>'
                                                +'</div>'
                                                +'<div class="layui-col-xs3">'
                                                    +'<p>第二次登记：<span>'+rs.time2 +'</span></p>'
                                                +'</div>'
                                                +'<div class="layui-col-xs3">'
                                                    +'<p>第三次登记：<span>'+rs.time3 +'</span></p>'
                                                +'</div>'
                                                +'<div class="layui-col-xs3">'
                                                    +'<p>第四次登记：<span>'+rs.time4 +'</span></p>'
                                                +'</div>'
                                            +'</div>'
                                            +'<div class="layui-col-xs4">'
                                                +'<p>创建时间：<span>'+rs.created_at +'</span></p>'
                                            +'</div>'
                                            +'<div class="layui-col-xs4">'
                                                +'<p>开始时间：<span>'+rs.start_date +'</span></p>'
                                            +'</div>'
                                            +'<div class="layui-col-xs4">'
                                                +'<p>结束时间：<span>'+rs.end_date +'</span></p>'
                                            +'</div>'
                                        +'</div>'
                                        +'<div class="layui-col-xs12">' 
                                            +'<fieldset class="layui-elem-field">'
                                                +'<legend>审批意见：</legend>'
                                                +'<div class="layui-field-box" style="word-break:break-all;">'+content+'</div>'
                                            +'</fieldset>' 
                                        +'</div>'
                                        +htmlsAppr
                                    +'</blockquote>'
                                +'</div>'
                            +'</div>'
                    layer.open({//新增排班人员弹窗
                        title:'排班人员详情',
                        content:seehtml,
                        type:1,
                        id:'dailWorkUrs',
                        area: ['800px', '700px'],
                        resize: false,
                        success: function (layero,index) {
                             form.render();
                            $("#dailWorkUrs .appOk").off("click").on("click", function () { //审核确认
                                var itemID = $(this).attr("data-item");
                                var isAgree = $("#dailWorkUrs").find(" input[name='approvalYn']:checked").val();
                                var content = $("#appDacText").val();
                                if(content==''){
                                    layer.msg("意见不能为空!");
                                    return false
                                }
                                $.fetch({
                                    url:'/gateway/worktimetypeuser/approval',
                                    type: 'post',
                                    data:{
                                        ID:itemID,
                                        Result:isAgree,
                                        Content:content,
                                    },
                                    cb:function(rs){
                                        layer.msg("审批完成");
                                        // myWorkTimeTable({
                                        //     currentIndex:1,
                                        //     pageSize:10,
                                        // })
                                        workApprList.reload({page: {
                                            curr: 1 //重新从第 1 页开始
                                        }})
                                        layer.closeAll();
                                    }
                                })
                            })
                        }
                    })
                    var ContHeight = $(".ShowWidth").height();
                    if (ContHeight > 16) {
                        $('.ShowWidth').addClass("hideCont ShowHidden");
                    }
                    $(".ShowHidden i").on('click', function () {
                        if (!$(this).parent("div").hasClass('showCont')) {
                            $(this).parent(".hideCont").addClass("showCont ShowHiddenCont");
                            $(this).parent(".hideCont").removeClass("hideCont");
                        } else {
                            $(this).parent("div").removeClass("showCont ShowHiddenCont");
                            $(this).parent("div").addClass("hideCont ShowHidden");
                        }
                    })
                }
            })
        }else if(layEvent === 'PourDail'){
            var seehtml = ''
            $.fetch({
                url: "/gateway/worktimetypeuser/daobandetail",
                type: 'post',
                data:{
                    AutoKey:data.auto_key
                },
                cb:function(rs){
                    console.log(rs)
                    var workId =rs.id;
                    var userName ='';
                    if(rs.user_list&&rs.user_list.length>0){
                        for(var j=0;j<rs.user_list.length;j++){
                            userName+='<span data-userid="'+rs.user_list[j].id+'">'+rs.user_list[j].name+',</span>'
                        }
                    }else{
                        var userName ='无';
                    }
                    var sta = rs.approval_result==0?('<span class="blue">待审批</span>'):
                        rs.approval_result==1?('<span class="red">未批准</span>'):
                        rs.approval_result==2?('<span class="green">已批准</span>'):'';
                        if(rs.approval_userid==null){
                            sta='待提交';
                        }
                    var PBUser='';
                    for(var j = 0; j<rs.user_list.length; j++){
                        PBUser+='<span class="red">'+rs.user_list[j].name+'，</span>'
                    }
                    var PBtype = '';
                    for(var i = 0; i<rs.work_time_type_arr.length; i++){
                        var iscolor=data.work_time_type_id===rs.work_time_type_arr[i].id?'red':'';
                        PBtype+='<span class="'+iscolor+'">'+rs.work_time_type_arr[i].name+': '+rs.work_time_type_arr[i].time1+' ~ '+rs.work_time_type_arr[i].time2+'</span><br>'
                    }
                                        
                    var dab_list='<div class="layui-form-item"><div class="layui-block"><label class="layui-form-label">倒班明细：</label><div class="layui-input-block">'
                    for(var j = 0; j<rs.dao_ban_sub_list.length; j++){
                           dab_list+='<p class="PMal"><span>'+rs.dao_ban_sub_list[j].worktime_type.name+':</span><span>'+rs.dao_ban_sub_list[j].start_date+' ~ '+rs.dao_ban_sub_list[j].end_date+'</span></p>'
                    }
                    dab_list+='</div></div></div>'

                    var content=rs.content==null?'暂无':rs.content;

                    var htmlsAppr =   '<div class="layui-form-item">'
                        +            '<label class="layui-form-label">审批意见：</label>'
                        +            '<div class="layui-input-block">'
                        +                '<textarea id="appDacText" name="suggestion" class="layui-textarea" cols="50" rows="4" ></textarea>'
                        +            '</div>'
                        +        '</div>'
                        +        '<div class="layui-form-item">'
                        +            '<label class="layui-form-label">是否同意：</label>'
                        +            '<div class="layui-input-block">'
                        +                '<input type="radio" name="approvalYn" id="approvalOk" value="2" title="同意">'
                        +                '<input type="radio" name="approvalYn" id="approvalNo" value="1" title="不同意" checked>'
                        +            '</div>'
                        +        '</div>'

                    var htmlS = '<div class="">'
                            +'<div class="layui-form" action="">'
                                +'<div class="layui-form-item">'
                                    +'<div class="layui-inline">'
                                        +'<label class="layui-form-label">倒班用户：</label>'
                                        +'<div class="layui-input-block cateID">'
                                            +PBUser
                                        +'</div>'
                                    +'</div>'
                                +'</div>'
                                +dab_list
                                +'<div class="layui-form-item">'
                                    +'<div class="layui-inline">'
                                        +'<label class="layui-form-label">倒班名称：</label>'
                                        +'<div class="layui-input-block cateID">'
                                            +'<span class="red">'+rs.work_time_name+'</span>'
                                        +'</div>'
                                    +'</div>'
                                    +'<div class="layui-inline">'
                                        +'<label class="layui-form-label">开始日期：</label>'
                                        +'<div class="layui-input-block cateID">'
                                            +'<span class="red">'+rs.start_date+'</span>'
                                        +'</div>'
                                    +'</div>'
                                    +'<div class="layui-inline">'
                                        +'<label class="layui-form-label">结束日期：</label>'
                                        +'<div class="layui-input-block cateID">'
                                            +'<span class="red">'+rs.end_date+'</span>'
                                        +'</div>'
                                    +'</div>'
                                    // +'<div class="layui-inline">'
                                    //     +'<label class="layui-form-label">周期：</label>'
                                    //     +'<div class="layui-input-block cateID">'
                                    //         +'<span class="red"></span>'
                                    //     +'</div>'
                                    // +'</div>'
                                    +'<div class="layui-inline">'
                                        +'<label class="layui-form-label">排班类型：</label>'
                                        +'<div class="layui-input-block cateID">'
                                            +PBtype
                                        +'</div>'
                                    +'</div>'
                                +'</div>'
                                +htmlsAppr
                                +'<div class="layui-form-item">'
                                    +'<div class="layui-input-block">'
                                    +  '<button class="appOk layui-btn" data-item="'+data.auto_key+'">确认</button>'
                                        +' <button class="ShutDown layui-btn">关闭</button>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                        +'</div>'
                    layer.open({//新增排班人员弹窗
                        title:'倒班详情',
                        content:htmlS,
                        type:1,
                        id:'dailWorkUrs',
                        area: ['800px', '700px'],
                        resize: false,
                        success: function (layero,index) {
                             form.render();
                            $("#dailWorkUrs .appOk").off("click").on("click", function () { //审核确认
                                var itemID = $(this).attr("data-item");
                                var isAgree = $("#dailWorkUrs").find(" input[name='approvalYn']:checked").val();
                                var content = $("#appDacText").val();
                                if(content==''){
                                    layer.msg("意见不能为空!");
                                    return false
                                }
                                $.fetch({
                                    url:'/gateway/worktimetypeuser/approval',
                                    type: 'post',
                                    data:{
                                        ID:itemID,
                                        Result:isAgree,
                                        Content:content,
                                    },
                                    cb:function(rs){
                                        layer.msg("审批完成");
                                        // myWorkTimeTable({
                                        //     currentIndex:1,
                                        //     pageSize:10,
                                        // })
                                        workApprList.reload({page: {
                                            curr: 1 //重新从第 1 页开始
                                        }})
                                        layer.closeAll();
                                    }
                                })
                            })
                            $(".ShutDown").on("click",function(){
                                layer.close(index);                                
                            })
                        }
                    })
                    var ContHeight = $(".ShowWidth").height();
                    if (ContHeight > 16) {
                        $('.ShowWidth').addClass("hideCont ShowHidden");
                    }
                    $(".ShowHidden i").on('click', function () {
                        if (!$(this).parent("div").hasClass('showCont')) {
                            $(this).parent(".hideCont").addClass("showCont ShowHiddenCont");
                            $(this).parent(".hideCont").removeClass("hideCont");
                        } else {
                            $(this).parent("div").removeClass("showCont ShowHiddenCont");
                            $(this).parent("div").addClass("hideCont ShowHidden");
                        }
                    })
                }
            })
        } else if (layEvent === 'wreview') { //审核
            var htmls ='<div class="layui-card">'
                        +'<div class="reviewCont layui-card-body">'
                        +    '<div class="layui-form" action="">'
                        +        '<div class="layui-form-item">'
                        +            '<label class="layui-form-label">审批意见：</label>'
                        +            '<div class="layui-input-block">'
                        +                '<textarea id="appDacText" name="suggestion" class="layui-textarea" cols="50" rows="4" ></textarea>'
                        +            '</div>'
                        +        '</div>'
                        +        '<div class="layui-form-item">'
                        +            '<label class="layui-form-label">是否同意：</label>'
                        +            '<div class="layui-input-block">'
                        +                '<input type="radio" name="approvalYn" id="approvalOk" value="2" title="同意">'
                        +                '<input type="radio" name="approvalYn" id="approvalNo" value="1" title="不同意" checked>'
                        +            '</div>'
                        +        '</div>'
                        +        '<div class="layui-form-item">'
                        +            '<div class="layui-input-block">'
                        +               ' <button class="appOk layui-btn" data-item="'+data.auto_key+'">确认</button>'
                        +            '</div>'
                        +        '</div>'
                        +    '</div>'
                        +'</div>'
                        +'</div>'
            layer.open({
                title:'审批意见',
                content:htmls,
                type:1,
                id:'approvPop',
                area:['60%','auto'],
                success:function(index, layero){
                    form.render();
                    $("#approvPop .appOk").off("click").on("click",function(){//审核确认
                        var itemID = $(this).attr("data-item");
                        var isAgree = $("#approvPop").find(" input[name='approvalYn']:checked").val();
                        var content = $("#appDacText").val();
                        if(content==''){
                            layer.msg("意见不能为空!");
                            return false
                        }
                        $.fetch({
                            url:'/gateway/worktimetypeuser/approval',
                            type: 'post',
                            data:{
                                ID:itemID,
                                Result:isAgree,
                                Content:content,
                            },
                            cb:function(rs){
                                layer.msg("审批完成");
                                // myWorkTimeTable({
                                //     currentIndex:1,
                                //     pageSize:10,
                                // })
                                workApprList.reload({page: {
                                    curr: 1 //重新从第 1 页开始
                                  }})
                                layer.
                                closeAll();
                            }
                        })
                    })

                }
            })
        } 
    })
})
})