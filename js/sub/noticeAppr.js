layui.config({
    base: '../../../layui/' //静态资源所在路径
}).extend({
    index: 'index' //主入口模块
}).use(['index','form','laydate','laypage','layedit','table','upload'], function(){
    var $ = layui.$
    ,admin = layui.admin
    ,table = layui.table
    ,element = layui.element
    ,router = layui.router();
    element.render();
    element.on('tab(component-tabs-appr)', function(obj){
        if(obj.index==0){
            noticrTable.reload({})
            // mynoticeAppr({
            //     Status:0,
            //     currentIndex:1,
            //     pageSize:10,
            // });
        }
        if(obj.index==1){
            noticrTable1.reload({})
            // mynoticeAppr1({
            //     Status:2,
            //     currentIndex:1,
            //     pageSize:10,
            // },);
        }
    });

    var laydate = layui.laydate
        ,form = layui.form
        ,laypage =layui.laypage
        ,layedit = layui.layedit

    // 数据表格
    var noticrTable = table.render({
        elem: '#noticeAppr',
        url: urls + "/gateway/notice/approvallist",
        contentType: 'application/json',
        method: 'post',
        where: {
            Status: 0
        },
        page: true, //开启分页
        text: {
            none: '暂无数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
        },
        cols:  [[ //标题栏
            {field: 'apply_user_name', title: '发布人', width:100}
            ,{
                field: 'to_users',
                title:'发布范围',
                width:220,
                templet: function (d) {
                    return '<div class="noticeHiad"><span data-userid="' + d.to_userId + '">' + d.to_users+ ',</span></div>'
                } 
            }
            ,{
                field: 'title', 
                title: '标题',
                minWidth:120,
                templet:function(d){
                    return  '<a class="toTitle" lay-event="toTitle">' + d.title + '</a>'
                }
            }
            ,{field: 'apply_time', title: '创建时间',minWidth:160}
            ,{field: 'validity_starttime', title: '生效时间',minWidth:160}
            ,{field: 'validity_endtime', title: '终止时间',minWidth:160}
            ,{
                fixed: 'right'
                ,title:'操作'
                ,width:100
                , toolbar: '<div><button class="alertAppr layui-btn layui-btn-sm layui-btn-warm" lay-event="alertAppr">审批</button></div>'
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
            $('.noticeHiad').on("mouseenter", function () {
                var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">' + $(this).text(); + '</div>'
                var that = this;
                layer.tips(tipsCont1, that, {
                    tips: [1, '#999'],
                    maxWidth: 'auto'
                });
            });
        }
    })

    table.on('tool(noticeAppr)', function (obj) {
        var data = obj.data; //获得当前行数据
        var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）

        if(layEvent=='alertAppr'){
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
                            +               ' <button class="appOk layui-btn" data-item="'+data.id+'">确认</button>'
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
            })
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
                    url:'/gateway/notice/approval',
                    type: 'post',
                    data:{
                        ItemID:itemID,
                        IsAgree:isAgree,
                        Content:content,
                    },
                    cb:function(rs){
                        layer.closeAll();
                        layer.msg("审批完成");
                        noticrTable.reload({})
                    }
                })
            })
        }else if(layEvent == 'toTitle'){
            $.fetch({
                url:"/gateway/notice/detail/"+data.id+"",
                type: 'get',
                cb:function(rs){
                    var atta='';
                    if(rs.attaches&&rs.attaches!=''){
                        for(var i=0; i<rs.attaches.length; i++){      
                            atta+='<a title="点击下载" class="seeXqOutIn" target="_blank" href="/gateway/notice/download/'+rs.attaches[i].id+'" >'+rs.attaches[i].original_name+'</a>'
                        }
                    }else{
                        atta='<span>无附件</span>'
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
                                    +'<fieldset class="layui-elem-field"><legend>内容公告</legend><div class="layui-field-box pageCont">'+rs.notice.content+'</div></fieldset>'
                                    
                                +'</div>'
                            +'</div>'
                    var publisDetail= layer.open({
                        title:'查看公告详情',
                        content:htmls,
                        type:1,
                        id:'publisDetail',
                        area:['60%','auto'],
                    });
                    $(".reviewCont i").click(function(){
                        if(!$(this).parent("u").hasClass('showCont')){
                            $(this).parent(".hideCont").addClass("showCont");
                            $(this).parent(".hideCont").removeClass("hideCont"); 
                        }else {
                            $(this).parent(".showCont").removeClass("showCont"); 
                            $(this).parent("u").addClass("hideCont");
                        }
                    })
                }
            });
        }
    })


    // 数据表格
    var noticrTable1 = table.render({
        elem: '#noticeAppr1',
        url: urls + "/gateway/notice/approvallist",
        contentType: 'application/json',
        method: 'post',
        where: {
            Status: 2
        },
        page: true, //开启分页
        text: {
            none: '暂无数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
        },
        cols: [
            [ //标题栏
                {
                    field: 'apply_user_name',
                    title: '发布人',
                    width: 100
                }, {
                    field: 'to_users',
                    title: '发布范围',
                    width: 220,
                    templet: function (d) {
                        return '<div class="noticeHiad"><span data-userid="' + d.to_userId + '">' + d.to_users + ',</span></div>'
                    }
                }, {
                    field: 'title',
                    title: '标题',
                    minWidth: 120,
                    templet:function(d){
                        return  '<a class="toTitle"  lay-event="toTitle">' + d.title + '</a>'
                    }
                }, {
                    field: 'apply_time',
                    title: '创建时间',
                    minWidth: 160
                }, {
                    field: 'validity_starttime',
                    title: '生效时间',
                    minWidth: 160
                }, {
                    field: 'validity_endtime',
                    title: '终止时间',
                    minWidth: 160
                }, {field: 'current_approval_user_name', title: '审批人',minWidth:100}
                , {
                    title: '状态',
                    minWidth:100,
                    templet:function(d){
                        return d.apply_result==2?'<span class="layui-btn layui-btn-normal layui-btn-xs">批准</span>':'<span class="layui-btn layui-btn-danger layui-btn-xs">不批准</span>'
                    },
                    // toolbar: '<div><button class="alertAppr layui-btn layui-btn-sm layui-btn-warm" lay-event="alertAppr">审批</button></div>'
                }
            ]
        ],
        request: {
            pageName: 'currentIndex' //页码的参数名称，默认：page
                ,
            limitName: 'pageSize' //每页数据量的参数名，默认：limit
        },
        parseData: function (res) { //res 即为原始返回的数据
            return {
                "status_code": res.status_code, //解析接口状态
                "message": res.message, //解析提示文本
                "count": res.data.total_count, //解析数据长度
                "data": res.data.data_list, //解析数据列表
                "curr": res.data.page_index
            };
        },
        done: function () {
            $('.noticeHiad').on("mouseenter", function () {
                var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">' + $(this).text(); + '</div>'
                var that = this;
                layer.tips(tipsCont1, that, {
                    tips: [1, '#999'],
                    maxWidth: 'auto'
                });
            });
        }
    })

    table.on('tool(noticeAppr1)', function (obj) {
        var data = obj.data; //获得当前行数据
        var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）

        if(layEvent == 'toTitle'){
            //  var elem =$(this);
            // var nid =elem.parents("td").attr("data-id");
            $.fetch({
                url:"/gateway/notice/detail/"+data.id+"",
                type: 'get',
                cb:function(rs){
                    var atta='';
                    if(rs.attaches&&rs.attaches!=''){
                        for(var i=0; i<rs.attaches.length; i++){      
                            atta+='<a title="点击下载" class="seeXqOutIn" target="_blank" href="/gateway/notice/download/'+rs.attaches[i].id+'" >'+rs.attaches[i].original_name+'</a>'
                        }
                    }else{
                        atta='<span>无附件</span>'
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
                                    +'<fieldset class="layui-elem-field"><legend>内容公告</legend><div class="layui-field-box pageCont">'+rs.notice.content+'</div></fieldset>'
                                +'</div>'
                            +'</div>'
                    layer.open({
                        title:'查看公告详情',
                        content:htmls,
                        type:1,
                        id:'publisDetail',
                        area:['60%','auto'],
                    });
                    $(".reviewCont i").click(function(){
                        if(!$(this).parent("u").hasClass('showCont')){
                            $(this).parent(".hideCont").addClass("showCont");
                            $(this).parent(".hideCont").removeClass("hideCont"); 
                        }else {
                            $(this).parent(".showCont").removeClass("showCont"); 
                            $(this).parent("u").addClass("hideCont");
                        }
                    })
                }
            });
        }
    })

    // var  noDataHtml ='<tr><td colspan="7"><div class="layui-table-cell" style="text-align: center">暂无公告</div></td></tr>'

    // var mynoticeAppr = function(objs={}){ //待审批
    //     var objst =objs;
    //     $.fetch({
    //         url:"/gateway/notice/approvallist",
    //         type: 'post',
    //         data:objst,
    //         cb:function(rs){
    //             var  list =rs.data_list;
    //             mynoticeApprHtml(list);
    //             laypage.render({
    //                 elem: 'noticeApprPage' //注意，这里的 test1 是 ID，不用加 # 号
    //                 ,count: rs.total_count //数据总数，从服务端得到
    //                 ,jump: function(obj, first){
    //                     //obj包含了当前分页的所有参数，比如：
    //                      //得到当前页，以便向服务端请求对应页的数据。
    //                     if(!first){   //得到每页显示的条数
    //                         $.fetch({
    //                             url:"/gateway/notice/approvallist",
    //                             type: 'post',
    //                             data:{
    //                                 Status:objst.ApplyResult,
    //                                 currentIndex:obj.curr,
    //                                 pageSize:10,
    //                             },
    //                             cb:function(rs){
    //                                 mynoticeApprHtml(rs.data);
    //                             }
    //                         });
    //                     //首次不执行
                        
    //                       //do something
    //                     }
    //                 }
    //             });
    //         }
    //     });
    // }
    
    // var mynoticeApprHtml =function(list){//待审批
    //     var tables='';
    //     for(var i=0; i<list.length; i++){
            
    //         tables+='<tr>'
    //                 +'<td data-id="'+list[i].id+'">'+list[i].apply_user_name+'</td>'
    //                 +'<td class="limit-width">'+list[i].to_users+'</td>'
    //                 +'<td data-id="'+list[i].id+'"><a class="toTitle">'+list[i].title+'</a></td>'
    //                 +'<td>'+list[i].apply_time+'</td>'
    //                 +'<td>'+list[i].validity_starttime+'</td>'
    //                 +'<td>'+list[i].validity_endtime+'</td>'
    //                 +'<td data-id="'+list[i].id+'">'
    //                     +'<button class="alertAppr layui-btn layui-btn-sm layui-btn-warm">审批</button>'
    //                 +'</td>'
    //             +'</tr>'
    //     }
    //     if(list.length==0){
    //         tables=noDataHtml;
    //     }
    //     $("#noticeAppr tbody").html(tables);

        
       
    // }
    // mynoticeAppr({
    //     Status:0,
    //     currentIndex:1,
    //     pageSize:10,
    // });
    
    // var mynoticeAppr1 = function(objs={}){ //已审批
    //         var objst =objs;
    //         $.fetch({
    //             url:"/gateway/notice/approvallist",
    //             type: 'post',
    //             data:objst,
    //             cb:function(rs){
    //                 var  list =rs.data_list;
    //                 mynoticeApprHtml1(list);
    //                 laypage.render({
    //                     elem: 'noticeApprPage1' //注意，这里的 test1 是 ID，不用加 # 号
    //                     ,count: rs.total_count //数据总数，从服务端得到
    //                     ,jump: function(obj, first){
    //                         //obj包含了当前分页的所有参数，比如：
    //                          //得到当前页，以便向服务端请求对应页的数据。
    //                         if(!first){   //得到每页显示的条数
    //                             $.fetch({
    //                                 url:"/gateway/notice/approvallist",
    //                                 type: 'post',
    //                                 data:{
    //                                     Status:objst.Status,
    //                                     currentIndex:obj.curr,
    //                                     pageSize:10,
    //                                 },
    //                                 cb:function(rs){
    //                                     mynoticeApprHtml1(rs.data_list);
    //                                 }
    //                             });
    //                         //首次不执行
                            
    //                           //do something
    //                         }
    //                     }
    //                 });
    //             }
    //         });
    // }
    
    // var mynoticeApprHtml1 =function(list){//已审批
    //         var tables='';
            
    //         for(var i=0; i<list.length; i++){
    //             var sta = list[i].apply_result==2?' <span class="blue">批准</span>':'<span class="red">不批准</span>';
     
    //             tables+='<tr>'
    //                     +'<td data-id="'+list[i].id+'">'+list[i].apply_user_name+'</td>'
    //                     +'<td class="limit-width">'+list[i].to_users+'</td>'
    //                     +'<td data-id="'+list[i].id+'"><a class="toTitle">'+list[i].title+'</a></td>'
    //                     +'<td>'+list[i].apply_time+'</td>'
    //                     +'<td>'+list[i].validity_starttime+'</td>'
    //                     +'<td>'+list[i].validity_endtime+'</td>'
    //                     +'<td id="'+list[i].id+'">'
    //                         +sta
    //                     +'</td>'
    //                 +'</tr>'
    //         }
    //         if(list.length==0){
    //             tables=noDataHtml;
    //         }
    //         $("#noticeAppr1 tbody").html(tables);
            
    // }
    // mynoticeAppr1({
    //     Status:2,
    //     currentIndex:1,
    //     pageSize:10,
    // });

    
    // //点击审批
    // $("#noticeAppr").on("click",".alertAppr",function(){

    //     var aid= $(this).parent("td").attr("data-id");
    //     var elThis =$(this);
    //     var elem =$(this).parents('tr');
    //     var htmls ='<div class="layui-card">'
    //                         +'<div class="reviewCont layui-card-body">'
    //                         +    '<div class="layui-form" action="">'
    //                         +        '<div class="layui-form-item">'
    //                         +            '<label class="layui-form-label">审批意见：</label>'
    //                         +            '<div class="layui-input-block">'
    //                         +                '<textarea id="appDacText" name="suggestion" class="layui-textarea" cols="50" rows="4" ></textarea>'
    //                         +            '</div>'
    //                         +        '</div>'
    //                         +        '<div class="layui-form-item">'
    //                         +            '<label class="layui-form-label">是否同意：</label>'
    //                         +            '<div class="layui-input-block">'
    //                         +                '<input type="radio" name="approvalYn" id="approvalOk" value="2" title="同意">'
    //                         +                '<input type="radio" name="approvalYn" id="approvalNo" value="1" title="不同意" checked>'
    //                         +            '</div>'
    //                         +        '</div>'
           
    //                         +        '<div class="layui-form-item">'
    //                         +            '<div class="layui-input-block">'
    //                         +               ' <button class="appOk layui-btn" data-item="'+aid+'">确认</button>'
    //                         +            '</div>'
    //                         +        '</div>'
    //                         +    '</div>'
    //                         +'</div>'
    //                      +'</div>'
    //     var appro= layer.open({
    //         title:'审批意见',
    //         content:htmls,
    //         type:1,
    //         id:'approvPop',
    //         area:['60%','auto'],
    //     })
    //     form.render();

        
    //     $("#approvPop .appOk").off("click").on("click",function(){//审核确认
    //         var itemID = $(this).attr("data-item");
    //         var isAgree = $("#approvPop").find(" input[name='approvalYn']:checked").val();
    //         var content = $("#appDacText").val();
    //         if(content==''){
    //             layer.msg("意见不能为空!");
    //             return false
    //         }
    //         $.fetch({
    //             url:'/gateway/notice/approval',
    //             type: 'post',
    //             data:{
    //                 ItemID:itemID,
    //                 IsAgree:isAgree,
    //                 Content:content,
    //             },
    //             cb:function(rs){
    //                 layer.closeAll();
    //                 layer.msg("审批完成");
                    
    //                 elem.remove();
    //             }
    //         })
    //     })

    // })

    // //待审批查看标题内容
    // $("#noticeAppr").on("click",".toTitle",function(){
    //     var elem =$(this);
    //     var nid =elem.parents("td").attr("data-id");
    //     $.fetch({
    //         url:"/gateway/notice/detail/"+nid+"",
    //         type: 'get',
    //         cb:function(rs){
    //             var atta='';
    //             if(rs.attaches&&rs.attaches!=''){
    //                 for(var i=0; i<rs.attaches.length; i++){      
    //                     atta+='<a title="点击下载" class="seeXqOutIn" target="_blank" href="/gateway/notice/download/'+rs.attaches[i].id+'" >'+rs.attaches[i].original_name+'</a>'
    //                 }
    //             }else{
    //                 atta='<span>无附件</span>'
    //             }

    //             var htmls ='<div class="layui-card" style="min-height:300px">'
    //                         +'<div class="reviewCont layui-card-body">'
    //                             +' <div class="layui-form-item">'
    //                                 +' <p style="margin-bottom: 3px;"><label class="fl">发布部门：</label><u class="hideCont">'+rs.notice.to_users+'<i class="iconfont icon-triangle-left"></i></u></p>'
    //                                 +'<div class="layui-elem-quote" style="padding: 15px 0px;">'
    //                                     +' <p><label class="fl">发布人：</label><u class="fr-width">'+rs.notice.creater+'</u></p>'
    //                                     +' <p><label class="fl">发布于：</label><u class="fr-width">'+rs.notice.validity_starttime+'</u></p>'
    //                                     +' <p><label class="fl">标题：</label><u class="fr-width">'+rs.notice.title+'</u></p>'                                    
    //                                     +' <p><label class="fl">附件：</label><u class="fr-width">'+atta+'</u></p>'
    //                                 +'</div>'
    //                             +' </div>'
    //                             +'<fieldset class="layui-elem-field"><legend>内容公告</legend><div class="layui-field-box pageCont">'+rs.notice.content+'</div></fieldset>'
                                
    //                         +'</div>'
    //                     +'</div>'
    //             var publisDetail= layer.open({
    //                 title:'查看公告详情',
    //                 content:htmls,
    //                 type:1,
    //                 id:'publisDetail',
    //                 area:['60%','auto'],
    //             });
    //             $(".reviewCont i").click(function(){
    //                 if(!$(this).parent("u").hasClass('showCont')){
    //                     $(this).parent(".hideCont").addClass("showCont");
    //                     $(this).parent(".hideCont").removeClass("hideCont"); 
    //                 }else {
    //                     $(this).parent(".showCont").removeClass("showCont"); 
    //                     $(this).parent("u").addClass("hideCont");
    //                 }
    //             })
    //         }
    //     });
    // })

    // //已审批查看标题内容
    // $("#noticeAppr1").on("click",".toTitle",function(){
    //     var elem =$(this);
    //     var nid =elem.parents("td").attr("data-id");
    //     $.fetch({
    //         url:"/gateway/notice/detail/"+nid+"",
    //         type: 'get',
    //         cb:function(rs){
    //             var atta='';
    //             if(rs.attaches&&rs.attaches!=''){
    //                 for(var i=0; i<rs.attaches.length; i++){      
    //                     atta+='<a title="点击下载" class="seeXqOutIn" target="_blank" href="/gateway/notice/download/'+rs.attaches[i].id+'" >'+rs.attaches[i].original_name+'</a>'
    //                 }
    //             }else{
    //                 atta='<span>无附件</span>'
    //             }

    //             var htmls ='<div class="layui-card" style="min-height:300px">'
    //                         +'<div class="reviewCont layui-card-body">'
    //                             +' <div class="layui-form-item">'
    //                                 +' <p style="margin-bottom: 3px;"><label class="fl">发布部门：</label><u class="hideCont">'+rs.notice.to_users+'<i class="iconfont icon-triangle-left"></i></u></p>'
    //                                 +'<div class="layui-elem-quote" style="padding: 15px 0px;">'
    //                                     +' <p><label class="fl">发布人：</label><u class="fr-width">'+rs.notice.creater+'</u></p>'
    //                                     +' <p><label class="fl">发布于：</label><u class="fr-width">'+rs.notice.validity_starttime+'</u></p>'
    //                                     +' <p><label class="fl">标题：</label><u class="fr-width">'+rs.notice.title+'</u></p>'                                    
    //                                     +' <p><label class="fl">附件：</label><u class="fr-width">'+atta+'</u></p>'
    //                                 +'</div>'
    //                             +' </div>'
    //                             +'<fieldset class="layui-elem-field"><legend>内容公告</legend><div class="layui-field-box pageCont">'+rs.notice.content+'</div></fieldset>'
    //                         +'</div>'
    //                     +'</div>'
    //             var publisDetail= layer.open({
    //                 title:'查看公告详情',
    //                 content:htmls,
    //                 type:1,
    //                 id:'publisDetail',
    //                 area:['60%','auto'],
    //             });
    //             $(".reviewCont i").click(function(){
    //                 if(!$(this).parent("u").hasClass('showCont')){
    //                     $(this).parent(".hideCont").addClass("showCont");
    //                     $(this).parent(".hideCont").removeClass("hideCont"); 
    //                 }else {
    //                     $(this).parent(".showCont").removeClass("showCont"); 
    //                     $(this).parent("u").addClass("hideCont");
    //                 }
    //             })
    //         }
    //     });
    // })

    // $('#noticeAppr').on("mouseenter", 'limit-width',function(){
    //     var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">'+$(this).text();+'</div>'
    //     var that = this;
    //     layer.tips(tipsCont1, that,{
    //           tips:[1,'#999']
    //           ,maxWidth: 'auto'
    //     });
    // });
    // $('#noticeAppr1').on("mouseenter",".limit-width",function(){
    //     var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">'+$(this).text();+'</div>'
    //     var that = this;
    //     layer.tips(tipsCont1, that,{
    //           tips:[1,'#999']
    //           ,maxWidth: 'auto'
    //     });
    // });
})