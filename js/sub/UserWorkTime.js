

layui.config({
    base: '../../layui/' //静态资源所在路径
}).extend({
    index: 'index' //主入口模块
}).use(['index','table','laydate','form','laypage'], function(){
    var $ = layui.$
    ,admin = layui.admin
    ,element = layui.element
    ,router = layui.router()
    ,layer = layui.layer;
    element.render();

    var table = layui.table
        ,laydate = layui.laydate
        ,laypage = layui.laypage
        ,form = layui.form;

    table.render({
        elem: '#table-checkbox',
        limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000],
    });


    // 生成表格
    var TimeTable = table.render({
        elem: '#WorkTimeTable',
        url: urls + "/gateway/worktimetypeuser/list",
        method: 'post',
        page: true, //开启分页
        text: {
            none: '暂无数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
        },
        limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000],
        cols:  [[ //标题栏
            {field: 'work_time_type_name', title: '排班名称', width:230}
            ,{
                field: 'user_list',
                title:'用户',
                width:120,
                templet: function (d) {
                    var userName = '';
                    for (var i = 0; i < d.user_list.length; i++) {
                        userName += '<span data-userid="' + d.user_list[i].id + '">' + d.user_list[i].name + ',</span>'
                    }
                    return '<div class="userNames">' + userName + '</div>'
                } 
            }
            ,{field: 'start_date', title: '开始时间',minWidth:120}
            ,{field: 'end_date', title: '结束时间',minWidth:120}
            ,{field: 'approval_username', title: '审批人',width:80,templet: function (d) {
                    return d.approval_username ==null?'暂无':d.approval_username
            } 
            }
            ,{field: 'content', title: '审批意见',minWidth:100,templet: function (d) {
                return d.content ==null?'暂无':d.content
            } }
            ,{field: 'created_at', title: '创建时间',width:165}
            ,{
                field: 'approval_result',
                title: '状态',
                minWidth: 80,
                templet: function (d) {
                    if(d.approval_userid==''||d.approval_userid==null){
                        return '待提交';
                    }else{
                        return d.approval_result ==0?'<span class="layui-btn layui-btn-warm layui-btn-xs">待审批</span>':
                                d.approval_result ==1?'<span class="layui-btn layui-btn-primary layui-btn-xs">未批准</span>':
                                d.approval_result ==2?'<span class="layui-btn layui-btn-normal layui-btn-xs">已批准</span>':''
                    }
                    
                }
            }
            ,{
                fixed: 'right'
                ,title:'操作'
                ,width:185
                , toolbar: '<div><span class="wsee layui-btn layui-btn-xs" lay-event="hday">公休日</span><span class="wsee layui-btn layui-btn-xs" lay-event="wuser">排班人员</span><span class="wsee layui-btn layui-btn-xs" lay-event="wsee">查看详情</span><span class="wChange layui-btn layui-btn-xs" lay-event="wChange">修改</span><span class="wdel layui-btn layui-btn-xs" lay-event="wdel">删除</span></div>'
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
            $('.userNames').on("mouseenter", function () {
                var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">' + $(this).text(); + '</div>'
                var that = this;
                layer.tips(tipsCont1, that, {
                    tips: [1, '#999'],
                    maxWidth: 'auto'
                });
            });
        }
    })
   
    table.on('tool(WorkTimeTable)', function (obj) {
        var data = obj.data; //获得当前行数据
        var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）

        if (layEvent === 'wsee') {//查看详情
            var seehtml =''
            $.fetch({
                url:"/gateway/worktimetypeuser/detail/"+data.id+"",
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
                                                +'<div class="layui-field-box pageCont" style="word-break:break-all;">' + content + '</div>'
                                            +'</fieldset>' 
                                        +'</div>'
                                    +'</blockquote>'
                                +'</div>'
                                if(rs.approval_userid==null){
                                    seehtml+='<div class="layui-form-item">'
                                                +'<div class="layui-inline">'
                                                    +'<label class="layui-form-label modify-form-label">审批人：</label>'
                                                    +'<div class="layui-input-inline">'
                                                        +'<select id="workApprUs" name="workApprUs" lay-filter="workApprUs"></select>'
                                                    +'</div>'
                                                +'</div>'
                                            +'</div>'
                                }
                            seehtml+='</div>' 
                            if(rs.approval_userid==null){
                                layer.open({//新增排班人员弹窗
                                    title:'排班人员详情',
                                    content:seehtml,
                                    type:1,
                                    id:'dailWorkUrs',
                                    area:['800px','700px'],
                                    resize: false,
                                    btn: ['提交审批', '取消'],
                                    success:function(index, layero){
                                        $.fetch({
                                            url:"/gateway/worktime/showuser",
                                            type: 'post',
                                            cb:function(rs){
                                                var ophtml='';
                                                if(rs.length ==0){
                                                    ophtml= '<option value="0">暂无审批人</option>'
                                                }else{
                                                    for(var i =0;i<rs.length;i++){
                                                    ophtml+='<option value="'+rs[i].user_id+'">　'+rs[i].user_name+'</option>'
                                                    }
                                                }
                                                $("#workApprUs").html(ophtml);
                                                form.render();
                                            }}
                                        )
                                        var ContHeight = $(".ShowWidth").height();
                                        if (ContHeight >16){
                                            $('.ShowWidth').addClass("hideCont ShowHidden");
                                        }
                                        $(".ShowHidden i").on('click',function(){
                                            if (!$(this).parent("div").hasClass('showCont')) {
                                                $(this).parent(".hideCont").addClass("showCont ShowHiddenCont");
                                                $(this).parent(".hideCont").removeClass("hideCont");
                                            }else{
                                                $(this).parent("div").removeClass("showCont ShowHiddenCont");
                                                $(this).parent("div").addClass("hideCont ShowHidden");
                                            }
                                        })
                                    },
                                    yes:function(index, layero){
                                        var ApprovalUserid =$("#workApprUs").val();
                                        
                                        var prs={
                                            ID:workId,
                                            ApprovalUserid:ApprovalUserid,
                                        }
                                        $.fetch({
                                            url:"/gateway/worktimetypeuser/applyapproval",
                                            type: 'post',
                                            data:prs,
                                            cb:function(rs){
                                                layer.msg("提交审批成功！");
                                                TimeTable.reload();
                                                layer.close(index);
                                            }
                                        });
                                    }
                                })
                            }else{
                                layer.open({//新增排班人员弹窗
                                    title:'排班人员详情',
                                    content:seehtml,
                                    type:1,
                                    id:'dailWorkUrs',
                                    area:['800px','700px'],
                                    resize:false
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

                }
            })
        } else if (layEvent === 'wChange') {//修改
            var times = data.start_date + ' ~ ' + data.end_date
            var names = data.user_list.map(item => item.name).join(",")
            var nids = data.user_list.map(item=>item.id).join(",")
            var uLi=""
            for(var i = 0; i < data.user_list.length;i++) {
                uLi += '<li class="pick" data-user="' + data.user_list[i].id + '">' + data.user_list[i].name + '</li>'
            }
            $.fetch({
                url:"/gateway/worktime/list",
                type: 'post',
                cb:function(rs){
                    var ophtml = '';
                    if (rs.length == 0) {
                        ophtml = '<option value="0">暂无排班</option>'
                    } else {
                        for (var i = 0; i < rs.length; i++) {
                            var ops = rs[i].id ? 'selected="selected"' : ' ';
                            ophtml += '<option value="' + rs[i].id + '" ' + ops + '>　' + rs[i].name + '</option>'
                        }
                    }
                    var  whtml =' <div class="popUpsCont layui-card layui-form" style="padding: 20px;">'
                                    +'<div class="layui-form-item">'
                                        +'<label class="layui-form-label modify-form-label">用户：</label>'
                                        +'<div class="layui-input-block modify-input-cont">'
                                            +'<ul class="layui-small-static" id="workUserList" data-val="' + nids + '" style="display:none;" >' + uLi + '</ul>'
                                            +'<textarea name="workUserList" lay-verify="required" placeholder="点击添加进行编辑" readonly="readonly" class="layui-textarea  layui-input-inline">'+names+'</textarea>'
                                            +'<a class="addDesc"><i class="iconfont icon-40"></i>添加</a>'
                                            +'<a class="emptyDesc"><i class="iconfont icon-qingkong"></i>清空</a>'
                                        +'</div>'
                                    +'</div>'
                                    +'<div class="layui-form-item">'
                                        +'<label class="layui-form-label modify-form-label">选择排班类型：</label>'
                                        +'<div class="layui-input-block modify-input-cont">'
                                            +'<select id="workTypeSel" name="workTypeSel" lay-filter="workTypeSel">' + ophtml + '</select>'
                                        +'</div>'
                                    +'</div>'
                                    +'<div class="layui-form-item">'
                                        +'<label class="layui-form-label modify-form-label">排班时间：</label>'
                                        +'<div class="layui-input-block modify-input-cont">'
                                            +'<input id="workSETime" type="text" placeholder="请选择开始时间和结束时间" class="layui-input test1">'
                                        +'</div>'
                                    +'</div>'
                                +'</div>'

                    layer.open({//新增排班人员弹窗
                        title:'修改排班人员',
                        content:whtml,
                        type:1,
                        id:'setWorkUrs',
                        area:['80%','auto'],
                        btn: ['确定', '取消'],
                        success:function(index, layero){
                            $("a.addDesc").on("click",function(){
                                selMemberFun($(this));
                            });
                            $("a.emptyDesc").on("click",function(){
                                $(this).siblings("ul").html("");
                                $(this).siblings("ul").attr("data-val","");
                                $(this).siblings(".layui-textarea").html("");
                            });
                            $("#workTypeSel").val(data.work_time_type_id);
                            laydate.render({
                                elem: '#workSETime' //指定元素
                                ,type: 'date'
                                ,range: '~'
                                ,value: times
                            });
                            form.val()
                            form.render();

                        },
                        yes:function(index, layero){
                            var seTime =$("#workSETime").val();
                            var timesArr= seTime.split(" ~ ");
                            var starT =timesArr[0];
                            var endT =timesArr[1];
                            var WorkTimeTypeId = $("#workTypeSel").val();
                            var edUid=$("#workUserList").attr("data-val");
                            var prs={
                                ID:data.id,
                                UserIds:edUid,
                                WorkTimeTypeId:WorkTimeTypeId,
                                StartTime:starT,
                                EndTime:endT,
                            }

                            $.fetch({
                                url:"/gateway/worktimetypeuser/update",
                                type: 'post',
                                data:prs,
                                cb:function(rs){
                                    layer.msg("新增成功！");
                                    TimeTable.reload({})
                                    // TimeTable({//调用列表数据
                                    //     currentIndex:1,
                                    //     pageSize:10,
                                    // });
                                    layer.close(index);
                                }
                            });
                        }

                    })
                }
            });
        } else if (layEvent === 'wdel') {//删除
             layer.confirm('确定删除？', {icon: 3, title:' '}, function(index){
            $.fetch({//调用删除接口
                url: '/gateway/worktimetypeuser/del',
                type: 'post',
                data:{
                    ID:data.id,
                },
                cb:function(rs){
                    layer.msg("删除成功");
                    TimeTable.reload({})
                    // TimeTable({//调用列表数据
                    //     currentIndex:1,
                    //     pageSize:10,
                    // });
                } 
            });
            layer.close(index);
        
        });
        }
    })

});
