
$(function(){

    layui.config({
		base: '../../../layui/' //静态资源所在路径
	}).extend({
		index: 'index' //主入口模块
	}).use(['index','form','laydate','laypage','table'], function(){
        var $ = layui.$
        ,admin = layui.admin
        ,element = layui.element
        ,router = layui.router();
        element.render();
        element.on('tab(component-tabs-brief)', function(obj){});

        var laydate = layui.laydate,form = layui.form,layer = layui.layer,laypage = layui.laypage,table=layui.table;

        // 时间选择
        laydate.render({
            elem: '#dataItem_1'
            ,type: 'datetime'
            ,format: 'yyyy-MM-dd HH:mm:ss'
        });

        form.verify({
            item:function(value){
                if(!value.match(/\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}/)){
                    return '请选择日期';
                };
            },
            dacReasonData:function(value){
                if(value==""){
                    return '补录原因不能为空';
                };
            },
         
        })
        //当前审批人
        $.managerFun({
            step:1,
            fun:function(rs,forw,steps){
                var oplhtml ='';
                for(var i=0;i<rs.length;i++){
                    oplhtml+='<option value="'+rs[i].id+'">'+rs[i].name+'</option>'
                }
                console
                $("#dacApprover").html(oplhtml); 
                $("#dacApprover").attr("data-step",steps);
                form.render('select','component-form-dance');       
            }
        });
        // 提交
        form.on('submit(form-demo)', function(data){
            var timeArr=[];
                $("#dacTimes input.itemData").each(function(){
                    if($(this).val()!=''){
                        timeArr.push($(this).val());
                        $(this).attr("style",'');
                    }
                });
            
            var nexspet =$("#dacApprover").attr("data-step");  
            var prama={
                Time:timeArr,
                Content:data.field.desc,
                NextApprovalUserID: data.field.dacLeveAp,
                NextApprovalStep:nexspet,
            }
            $.fetch({
                url:"/gateway/checkinoutapply/add",
                type: 'post',
                data:prama,
                cb:function(rs){
                    layer.msg('申请成功!');
                    $("#dataItem_1").parent().siblings().remove();
                    var hiedShow = $("#dacTimes").find("i.addInput").length;
                    if(hiedShow > 0){
                        $("#dataItem_1").after('');
                    }else{
                        $("#dataItem_1").after('<i class="iconfont icon-40 addInput"></i>');
                    }
                }
            })
        });
        $("#daceReset").on("click",function(){
            $("#dataItem_1").parent().siblings().remove();
            $("#dataItem_1").after('<i class="iconfont icon-40 addInput"></i>');
        })
        // 历史记录
        $("#dacNotes").on("click",function(){

             var index = layer.open({ //设置弹窗的相关属性
                 title: '<i class="iconfont icon-icon-test"></i>补录历史记录',
                 type: 1,
                 content: '<div class="layui-card"><div class="layui-card-body layui-form modify-table-cell"><div style="padding-bottom: 10px;">'
                                    +'<div class="layui-inline">'
                                        +'<label class="layui-form-label">选择状态</label>'
                                        +'<div class="layui-input-inline">'
                                            +'<select name="" class="slct" lay-filter="leaveDescSel" id="leaveDescSel"><option value="">全部</option>><option value="0">待审批</option><option value="1">未通过</option><option value="2">已通过</option></select>'
                                        +'</div>'
                                    +'</div>'
                                    +'<div class="layui-inline">'
                                        +'<label class="layui-form-label">申请日期</label>'
                                        +'<div class="layui-input-inline">'
                                            +'<input type="text" placeholder="请选择开始日期" class="layui-input itemData" id="startTime" name="itemData_1" data-item="1" lay-verify="startTime"  lay-filter="startTime" >'
                                        +'</div>'
                                        +'<span class="layui-inline" style="margin: 0 5px; line-height: 38px;"> ~ </span> '
                                        +'<div class="layui-input-inline">'
                                            +'<input type="text" placeholder="请选择结束日期" class="layui-input itemData" id="endTime" name="itemData_1" data-item="1" lay-verify="endTime"  lay-filter="endTime" >'
                                        +'</div>'
                                    +'</div>'
                                    +'<div class="layui-inline ml-10">'
                                        +'<button id="HistoryUserFile" class="layui-btn">'
                                            +'<i class="iconfont icon-sousuo"></i>'
                                        +'</button>'
                                    +'</div>'
                                +'</div><table lay-filter="leava-History-table" class="layui-table" id="leava-History-table"></table></div></div>', //设置初始化静态内容
                 area: ['100%', '100%'],
                //  maxmin: true,
                 id: 'leavaTabl', //设置表格的id
                success:function(){
                    var table_leava = table.render({
                        elem: '#leava-History-table',
                        url: window.urls + '/gateway/checkinoutapply/myapply',
                        // limit: 10,
                        // where: {
                        //     ApplyResult: 0,
                        // },
                        method: 'post',
                        contentType: 'application/json',
                        page: true,
                        loading: true,
                        toolbar: true,
                        defaultToolbar:'',
                        limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000],
                        cols: [[
                            {
                                field: 'name',
                                title: '补录人',
                                unresize: true,
                                width: 100
                            },
                            {
                                field: 'content',
                                unresize: true,
                                minWidth: 120,
                                title: '补录原因'
                            },
                            {
                                field: 'apply_time',
                                unresize: true,
                                minWidth: 160,
                                title: '申请时间'
                            },
                            {
                                field: 'check_in_out_time',
                                title: '补录时间',
                                unresize: true,
                                minWidth:160,
                                templet: function (d) {
                                    var arr = d.check_in_out_time;
                                    var arrHtml = arr.split("|");
                                    return arrHtml.map(item => '<p>' + item + '</p>').join("")
                                },
                            },
                            {
                                field: '',
                                title: '审核人/审核意见',
                                unresize: true,
                                minWidth:310,
                                templet: function (d) {
                                    var histry = '';
                                    if (d.approval_history.length > 0) {
                                        for (var k = 0; k < d.approval_history.length; k++) {
                                            var res = '';
                                            var classList = '';
                                            if (d.approval_history[k].is_forward == 1) { //是转发的
                                                res = '--转发-->';

                                                histry += '<p>【' + d.approval_history[k].username + '' + res + '' + d.approval_history[k].forward_username + '' //名字
                                                    //意见

                                                    +
                                                    '<em class=' + classList + '> ' +
                                                    d.approval_history[k].approval_time + '</em>】：<span class="list" title=' + d.approval_history[k].content + '>' //时间
                                                    +
                                                    d.approval_history[k].content + '</p>' //意见内容

                                            } else { //是审批的

                                                if (d.approval_history[k].approval_result == 1) {
                                                    res = '未批准';
                                                    classList = "red";
                                                } else if (d.approval_history[k].approval_result == 2) {
                                                    res = '已批准';
                                                    classList = "green";
                                                }

                                                histry += '<p>【' + d.approval_history[k].username + '<em class=' + classList + '>' //名字
                                                    +
                                                    res + '' //意见
                                                    +
                                                    d.approval_history[k].approval_time + '</em>】：<span class="list" title=' + d.approval_history[k].content + '>' //时间
                                                    +
                                                    d.approval_history[k].content + '</p>' //意见内容
                                            }
                                        }
                                    } else {
                                        histry = "暂无审批记录"
                                    }
                                    return histry
                                }
                            },
                            {
                                field: 'current_approval_user_name',
                                unresize: true,
                                title: '当前审批人',
                                minWidth: 100
                            },
                            {
                                field: 'apply_result_desc',
                                unresize: true,
                                title: '状态',
                                minWidth: 100
                            },
                            {
                                field: '',
                                fixed: 'right',
                                title: '操作',
                                unresize: true,
                                minWidth: 120,
                                templet: function (d) {
                                    var len = d.approval_history.length;
                                    var lenList = (len > 0 ? '<div data-aid="' + d.id + '"></div>' : '<div data-aid="' + d.id + '"><a class="delTr layui-btn layui-btn-danger layui-btn-sm" lay-event="delTr">删除</a></div>')
                                    return lenList
                                },
                            }
                        ]],
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
                            // $("#leaveDescSel").val(this.where.ApplyResult);
                            // form.render();
                            // form.on('select(leaveDescSel)', function (data) {
                            //      //得到被选中的值
                            //     table_leava.reload({
                            //         where: {
                            //             ApplyResult: data.value,
                            //         },
                            //         page: {
                            //             curr: 1 //重新从第 1 页开始
                            //         }
                            //     });
                            // });
                        }
                    })
                    table.on('tool(leava-History-table)', function (obj) {
                        var data = obj.data; //获得当前行数据
                        var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
                        if (layEvent === 'delTr') { //删除
                             layer.confirm('确认删除?',{title:' '},function(index){
                                $.fetch({ //默认打开显示未审批
                                     url: "/gateway/checkinoutapply/del",
                                     type: 'post',
                                     data: {
                                         ItemID: data.id,
                                     },
                                     cb: function (rs) {
                                         table_leava.reload({
                                             page: {
                                                 curr: 1 //重新从第 1 页开始
                                             }
                                         });
                                        layer.close(index);
                                     }
                                 })
                            })
                            
                        }

                    })
                    laydate.render({
                        elem: '#startTime',
                        type:'datetime'
                    });
                    laydate.render({
                        elem: '#endTime',
                        type: 'datetime'
                    });
                    form.render();
                    
                    $("#HistoryUserFile").on('click',function(){
                        var ApplyResult = $("#leaveDescSel").val();
                        var StartTime = $("#startTime").val();
                        var EndTime = $("#endTime").val();
                        if(EndTime<StartTime){
                            layer.msg("结束日期要大于开始日期!请重新选择");
                        }else{
                            table_leava.reload({
                                where: {
                                    ApplyResult:ApplyResult,
                                    StartTime:StartTime,
                                    EndTime:EndTime
                                },
                                page: {
                                    curr: 1 //重新从第 1 页开始
                                }
                            });
                        }
                    })
                }
             });
        });
        $("#dacTimes").on("click","i.addInput",function(){
            // var addHtml='<div class="itemAdd">'
            //                 +'<input type="text" onclick="SetDate(this,\'yyyy-MM-dd hh:mm:ss\')">'
            //                 +'<i class="iconfont icon-40 addInput"></i>'
            //                 +'<i class="iconfont icon-jianhao delInput" style="left: 204px;"></i>'
            //             +'</div>'
            var num = parseInt($(this).prev('input').attr('data-item'))+1;
            var addHtml='<div class="layui-input-inline item-modify">'
                            +'<input type="text" placeholder="请选择时间" class="layui-input itemData" lay-verify="item" id="dataItem_'+num+'" name="itemData_'+num+'" data-item="'+num+'" lay-filter="item">'
                            +'<i class="iconfont icon-40 addInput"></i>'
                            +'<i class="iconfont icon-jianhao delInput" style="left: 204px;"></i>'
                        +'</div>'
            
            $("#dacTimes").append(addHtml);
            // element.render();
            // var laydate = layui.laydate;
            var el = '#dataItem_'+num+'';
            laydate.render({
                elem: el
                ,type: 'datetime'
                ,format: 'yyyy-MM-dd HH:mm:ss'
            });
            $(this).next("i.delInput").css("left","182px");
            $(this).remove();
            // 时间选择
            
            
        });
        $("#dacTimes").on("click","i.delInput",function(){
            if($(this).parent(".item-modify").index()+1==$("#dacTimes .item-modify").length){
                $(this).parent(".item-modify").prev().children("i.delInput").css("left","204px");
                $(this).parent(".item-modify").prev().children("input").after('<i class="iconfont icon-40 addInput"></i>');
            }
            $(this).parent(".item-modify").remove();
        });

    });
   
    var dacTable=function(o){//渲染考勤记录 考勤 历史列表
        var tableHtml='';  
        if(o.length>0){
            for(var i=0;i<o.length;i++){
                var arr= o[i].check_in_out_time.split("|");
                var arrHtml='';
                for(var k=0;k<arr.length;k++){
                    arrHtml+='<p>'+arr[k]+'</p>'
                }
                var histry='';
                var len =o[i].approval_history.length;
                if(o[i].approval_history.length>0){
                    for(var k=0;k<o[i].approval_history.length;k++){

                        var res ='';
                        var classList = '';
                        if(o[i].approval_history[k].is_forward ==1){//是转发的
                            res ='--转发-->';

                            histry+='<p>【'+o[i].approval_history[k].username+''+res+ ''+o[i].approval_history[k].forward_username+''//名字
                                         //意见

                                        +'<em class='+classList+'> '
                                        +o[i].approval_history[k].approval_time+'</em>】：<span class="list" title='+o[i].approval_history[k].content+'>'//时间
                                        +o[i].approval_history[k].content+'</p>'//意见内容

                         }else{
                            if(o[i].approval_history[k].approval_result==1){
                                res= '未批准';
                                classList = "red";
                            }else if(o[i].approval_history[k].approval_result==2){
                                res= '已批准';
                                classList = "green";
                            }
                            histry+='<p>【'+o[i].approval_history[k].username+'<em class='+classList+'>'//名字
                                        +res+'' //意见
                                        +o[i].approval_history[k].approval_time+'</em>】：'//时间
                                        +o[i].approval_history[k].content+'</p>'//意见内容
                        }
                    }
                }else{
                    histry="暂无审批记录"
                }
                
               
                tableHtml+='<tr>'
                             +'<td>'+o[i].name+'</td>'
                             +'<td>'+o[i].content+'</td>'
                             +'<td>'+o[i].apply_time+'</td>'
                             +'<td>'+arrHtml+'</td>'
                             +'<td>'+histry+'</td>'
                             +'<td data-apid="'+o[i].apply_user_id+'">'+o[i].current_approval_user_name+'</td>'
                             +'<td>'+o[i].apply_result_desc+'</td>'
                             +(len>0?'<td data-aid="'+o[i].id+'"></td>':'<td data-aid="'+o[i].id+'"><button class="layui-btn layui-btn-danger layui-btn-sm delTr">删除</button></td>')
                           +'</tr>'

                           
            }
        }else if(o.length==0){
            tableHtml='<tr><td colspan="8" class="tc">无记录</td></tr>'
        }
        return tableHtml;
    }
    $("#dacApplyTable>table").off("click").on("click",".delTr",function(){
        var itemId=$(this).parent("td").attr("data-aid");
        var deltr=$(this).parent("td").parent("tr");
        var o={
            delid:itemId,
            elme:deltr
        }
        var delFun=function(aid,elem){
            $.fetch({//默认打开显示未审批
                url:"/gateway/checkinoutapply/del",
                type: 'post',
                data:{
                    ItemID:aid,
                },
                cb:function(rs){
                    var desVal=$('#dacDescSel').val();
                    $.fetch({//默认打开显示未审批
                        url:"/gateway/checkinoutapply/myapply",
                        type: 'post',
                        data:{
                            ApplyResult:desVal,
                            currentIndex:1,
                            pageSize:5,
                        },
                        cb:function(rs){
                            var page={
                                last_page:rs.last_page,
                                page_index:rs.page_index,
                                page_size:rs.page_size,
                                total_count:rs.total_count,
                            }
                            var elem =$("#pagTop");
                            dacTable(rs.data_list);
                            $.pageFun({
                                elem:elem,
                                page:page,
                                url:"/gateway/checkinoutapply/myapply",
                                pram:{
                                    ApplyResult:desVal,
                                    pageSize:5,
                                },
                                fun:function(rdata){
                                    dacTable(rdata);
                                },
                            });
                        }
                    })
                }
            })
        }
    })
})
