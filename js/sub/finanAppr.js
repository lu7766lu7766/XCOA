$(function(){
    layui.config({
        base: '../../../layui/' //静态资源所在路径
    }).extend({
        index: 'index' //主入口模块
    }).use(['index','table','laydate','form','laypage','upload'], function(){
        var $ = layui.$
        ,admin = layui.admin
        ,element = layui.element
        ,router = layui.router();
        element.render();

        var laydate = layui.laydate
        ,form = layui.form
        ,layer = layui.layer
        ,table=layui.table
        ,laypage=layui.laypage;
        form.render('select');

        var tableNowPage={
            ApplyResult:0,//0：未审批(待批)，1：未批准，2：已批准
            currentIndex:1,
            pageSize:10,
        }

        // 数据表格渲染
        // financialTable
        var ReimTable = table.render({
            elem: '#financialTable',
            url: window.urls + '/gateway/financial/myapply',
            // limit: 10,
            limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000],
            where: {
                ApplyResult: 0,
            },
            method: 'post',
            contentType: 'application/json',
            page: true,
            loading: true,
            toolbar:'<div style="padding-bottom: 10px;">'
                        +'<div classs="layui-inline">'
                            +'<label class="layui-form-label modify-form-label">选择状态</label>'
                            +'<div class="layui-input-inline">'
                                +'<select class="slct"  name="myfinanDescSel" lay-filter="myfinanDescSel"  id="myfinanDescSel"><option value="0">待审批</option><option value="1">未批准</option><option value="2">已批准</option></select>'
                            +'</div>'
                        +'</div>'
                    +'</div>',
            defaultToolbar: '',
            text: {
                none: '暂无数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
            },
            cols: [
                [{
                    field: 'created_at',
                    title: '申请时间',
                    minWidth:160,
                    unresize: true
                }, {
                    field: 'process_type_name',
                    unresize: true,
                    minWidth: 90,
                    title: '流程类型'
                }, {sort: true,
                    field: 'yz_to_bx_desc',
                    title: '预支转报销',
                    minWidth: 110,
                    
                },{
                    field: 'baoxiao_type_name',
                    unresize: true,
                    minWidth: 90,
                    title: '类型'
                }, {//
                    sort:true,
                    field: 'finan_dept_name',
                    unresize: true,
                    minWidth: 90,
                    title: '费用部门'
                }, {
                    // symbol
                    field: 'amountSymbol',
                    title: '金额',
                    minWidth: 110,
                    templet: function (d) {
                        var len = d.amount;
                        var xx = d.symbol;
                        return len + '（'+xx+'）'
                    }
                }, {
                    field: 'receipt_count',
                    title: '单据数',
                    minWidth: 80
                }, {
                    field: 'liezhi_month',
                    unresize: true,
                    title: '列支年月',
                    minWidth: 110
                },  {
                    field: 'current_approval_user_name',
                    title: '当前审批人',
                    minWidth: 140
                }, {
                    field: 'apply_result_desc',
                    title: '状态',
                    unresize: true,
                    templet: function (d) { 
                        return d.apply_result_desc=="待审批"?'<button class="layui-btn layui-btn-primary layui-btn-xs">未审批</button>':d.apply_result_desc=='未批准'?'<button class="layui-btn layui-btn-primary layui-btn-xs">未批准</button>': d.apply_result_desc=='已批准'?'<button class="layui-btn layui-btn-normal layui-btn-xs">已批准</button>':'';
                    }
                }, {
                    // field: '',
                    fixed: 'right',
                    title: '操作',
                    width: 150,
                    unresize: true,
                    toolbar: '<div><a  class="detail layui-btn layui-btn-warm layui-btn-xs"  lay-Event="detail">详情</a><a  class="detail layui-btn layui-btn-warm layui-btn-xs"  lay-Event="detail">编辑</a></div>',
                  
                }]
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
            done: function (rs) {
                $("#myfinanDescSel").val(this.where.ApplyResult);
                form.render();
                form.on('select(myfinanDescSel)', function (data) {
                    ReimTable.reload({
                        where: {
                            ApplyResult: data.value,
                        },
                        page: {
                            curr: 1 //重新从第 1 页开始
                        }
                    });
                });
                 //获取详情
                // $("#myfinanDescSel").on("click", function () {
                //    var fid =$(this).attr("data-appr");
                    
                // })
            }
        });

        table.on('tool(financialTable)', function(obj){ //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="对应的值"
            var data = obj.data; //获得当前行数据
            var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            var tr = obj.tr; //获得当前行 tr 的DOM对象
        
            if(layEvent === 'detail'){ //查看
            //do somehing
                var fid =obj.data.id;
                $.fetch({
                    url:"/gateway/financial/detail",
                    type: 'post',
                    data:{
                        ID:fid,
                    },
                    cb:function(rs){
                        if(rs.is_fixed_costs==1){
                            var attachesUrl='/gateway/financial/downloadfixedcost/'
                        }else{
                            var attachesUrl='/gateway/financial/download/'
                        }
                        var details ='',attaches='',apprList='';
                        
                        for(var i=0;i<rs.details.length;i++){
                            details+='<tr><td>'+rs.details[i].fee_type_name+'</td><td>'+rs.details[i].remark+'</td><td>'+rs.details[i].receipt_count+'</td><td>'+rs.details[i].amount+'</td></tr>'
                        }
                        if(rs.attaches&&rs.attaches.length>0){
                            for(var j=0;j<rs.attaches.length;j++){
                                attaches+='<a  title="点击下载" target="_blank" href="'+attachesUrl+''+rs.attaches[j].id+'">'+rs.attaches[j].original_name+'</a>'
                            }
                        }else{
                            attaches='无附件'
                        }
                        var approval =rs.approval_history;
                        if(approval.length==0){
                        apprList ='暂无';
                        }else{
                            for(var k=0;k< approval.length;k++){

                                var res='';
                                var classList = '';
                                if(approval[k].is_forward ==1){//是转发的
                                    res ='--转发-->';
                                apprList+='<p>【'+approval[k].username+''+res+ ''+approval[k].forward_username+''//名字
                                                //意见
                                            +'<em class='+classList+'> ' +approval[k].approval_time+'</em>】：'//时间
                                                +approval[k].content+'</p>'//意见内容
        
                                }else{//是审批的
        
                                    if(approval[k].approval_result==1){
                                        res ="未批准";
                                        classList = "red";
                                    }else if(approval[k].approval_result==2){
                                        res ="已批准";
                                        classList = 'green';
                                    }
                                apprList+='<p><span> 【'+approval[k].username +'<em class='+classList+'>'+res+' '+approval[k].approval_time+'</em>'+'】</span>'+approval[k].content+'</p>'
                                }
                            
                            };
                        }
                        var detailPop='<div class="layui-fluid">'
                                        +'<div class="layui-form"  id="printHtml">'
                                            // +'<div class="layui-form-mid layui-word-aux">IP：'+rs.createor_ip+'</div>'
                                            // +'<div class="fr layui-word-aux" style="padding: 9px 0!important;">填写时间：'+rs.created_at+'</div>'
                                            +'<div class="layui-form-item">'
                                            +'<div class="layui-inline layui-word-aux">'
                                                +'<label class="layui-form-label modify-layui-label ">填写时间</label>'
                                                +'<div class="layui-input-block layui-input-lineHeight">'
                                                    +'<span>'+rs.created_at+'</span>'
                                                +'</div>'
                                            +'</div>'
                                            // if(rs.is_fixed_costs==1){
                                            //     detailPop+='<div class="layui-inline layui-word-aux">'
                                            //         +'<label class="layui-form-label modify-layui-label ">开始日期</label>'
                                            //         +'<div class="layui-input-block layui-input-lineHeight">'
                                            //             +'<span>'+rs.fixed_cost_start_month+'</span>'
                                            //         +'</div>'
                                            //     +'</div>'
                                            //     +'<div class="layui-inline layui-word-aux">'
                                            //         +'<label class="layui-form-label modify-layui-label ">结束日期</label>'
                                            //         +'<div class="layui-input-block layui-input-lineHeight">'
                                            //             +'<span>'+rs.fixed_cost_end_month+'</span>'
                                            //         +'</div>'
                                            //     +'</div>'
                                            //     +'<div class="layui-inline layui-word-aux">'
                                            //         +'<label class="layui-form-label modify-layui-label">生效时间</label>'
                                            //         +'<div class="layui-input-block layui-input-lineHeight">'
                                            //             +'<span>'+rs.fixed_cost_job_date+'</span>'
                                            //         +'</div>'
                                            //     +'</div>'
                                            // }
                                            detailPop+='</div>'
                                            +'<div class="layui-form-item">'
                                                +'<div class="layui-inline">'
                                                    +'<label class="layui-form-label modify-layui-label">姓名</label>'
                                                    +'<div class="layui-input-block layui-input-lineHeight">'
                                                        +'<span>'+rs.creator+'</span>'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-inline">'
                                                    +'<label class="layui-form-label modify-layui-label">部门</label>'
                                                    +'<div class="layui-input-block layui-input-lineHeight">'
                                                        +'<span>'+rs.dept_name+'</span>'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-inline">'
                                                    +'<label class="layui-form-label modify-layui-label">列支年月</label>'
                                                    +'<div class="layui-input-block layui-input-lineHeight">'
                                                        +'<span>'+rs.liezhi_month+'</span>'
                                                    +'</div>'
                                                +'</div>'
                                            +'</div>'
                                            // +'<div class="layui-form-item">'
                                            //     +'<label class="layui-form-label modify-layui-label">列支科目</label>'
                                            //     +'<div class="layui-input-block layui-input-lineHeight">'
                                            //         +'<span>'+rs.liezhi_kemu+'</span>'
                                            //     +'</div>'
                                            // +'</div>'
                                            +'<div class="layui-form-item">'
                                                +'<div class="layui-inline">'
                                                    +'<label class="layui-form-label modify-layui-label">流程类型</label>'
                                                    +'<div class="layui-input-block layui-input-lineHeight">'
                                                    +'<span>'+rs.process_type_name+'</span>'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-inline">'
                                                    +'<label class="layui-form-label modify-layui-label">类型</label>'
                                                    +'<div class="layui-input-block layui-input-lineHeight">'
                                                        +'<span>'+rs.baoxiao_type_name+'</span>'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-inline">'
                                                    +'<label class="layui-form-label modify-layui-label">费用部门</label>'
                                                    +'<div class="layui-input-block layui-input-lineHeight">'
                                                        +'<span>'+(rs.finan_dept_name==null?'暂无':''+rs.finan_dept_name+'')+'</span>'
                                                    +'</div>'
                                                +'</div>'
                                            +'</div>'
                                            +'<div class="layui-form-item">'
                                                +'<label class="layui-form-label modify-layui-label">支付明细</label>'
                                                +'<div class="layui-input-block">'
                                                    +'<table class="layui-table" id="lzmFormData">'
                                                        +'<thead><tr></tr></thead>'
                                                        +'<tbody><tr><td>暂无</td></tr></tbody>'
                                                    +'</table>'
                                                +'</div>'
                                            +'</div>'
                                            +'<div class="layui-form-item">'
                                                +'<label class="layui-form-label">费用明细</label>'
                                                +'<div class="layui-input-block">'
                                                    +'<table class="layui-table">'
                                                        +'<colgroup><col width="150"><col><col width="150"><col width="150"><col width="130"></colgroup>'
                                                        +'<thead><tr><th>费用类型</th><th>费用摘要</th><th>单据数量</th><th>金额 '+rs.zh_name+'('+rs.short_code+')</th></tr></thead>'
                                                        +'<tbody>'+details+'</tbody>'
                                                    +'</table>'
                                                +'</div>'
                                            +'</div>'
                                            +'<div class="layui-form-item">'
                                                +'<div class="layui-inline">'
                                                    +'<label class="layui-form-label modify-layui-label">总金额</label>'
                                                    +'<div class="layui-input-block layui-input-lineHeight">'
                                                    +'<span>'+rs.short_code+' '+rs.amount+''+rs.symbol+'，'+rs.capital_amount+''+rs.zh_name+'</span>'
                                                        
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-inline">'
                                                    +'<label class="layui-form-label modify-layui-label">单据总数</label>'
                                                    +'<div class="layui-input-block layui-input-lineHeight">'
                                                        +'<span>'+rs.receipt_count+'</span>'
                                                    +'</div>'
                                                +'</div>'
                                            +'</div>'
                                            +'<div class="layui-form-item">'
                                                +'<label class="layui-form-label modify-layui-label">附件</label>'
                                                +'<div class="layui-input-block layui-input-lineHeight UploadNames-box">'
                                                    +attaches
                                                +'</div>'
                                            +'</div>'
                                            if(rs.cancel_remark!=null){
                                                detailPop+='<div class="layui-form-item">'
                                                    +'<label class="layui-form-label modify-layui-label">取消原因</label>'
                                                    +'<div class="layui-input-block layui-input-lineHeight UploadNames-box">'
                                                        +rs.cancel_remark
                                                    +'</div>'
                                                +'</div>'
                                            }

                                            detailPop+='<div class="layui-form-item">'
                                                +'<label class="layui-form-label modify-layui-label">审批记录</label>'
                                                +'<div class="layui-input-block layui-input-lineHeight layui-overflow-lineHeight">'
                                                    +apprList
                                                +'</div>'
                                            +'</div>'
                                            +'<div class="layui-form-item">'
                                                +'<label class="layui-form-label modify-layui-label label-six">出纳审批记录</label>'
                                                +'<div class="layui-input-block layui-input-lineHeight layui-overflow-lineHeight">'
                                                    if(rs.cashier_approval == null){
                                                        detailPop+='暂无'
                                                    }else{
                                                        detailPop+='<p><span>【'+rs.cashier_approval.name +':<em class="">'
                                                        +(rs.cashier_approval.approval_result==0?"待审批":(rs.cashier_approval.approval_result==1?"未通过":(rs.cashier_approval.approval_result==2?"已同意":"")))
                                                        +''+rs.cashier_approval.approval_time+'</em>】</span>'
                                                        +rs.cashier_approval.content+'</p>'
                                                    }
                                                    detailPop+='</div>'
                                            +'</div>'
                                        +'</div>'
                                        +'<div class="layui-form-item" style="margin-left:118px;">'
                                                    +'<div class="layui-input-blocklayui-input-lineHeight layui-overflow-lineHeight">'
                                                        +'<button id="printId" class="no-print layui-btn">打印</button><button id="closeId" class=" layui-btn layui-btn-primary">关闭</button>'
                                                    +'</div>'
                                                +'</div>'
                                    +'</div>'
                        layer.open({
                            title:'报销付款单详情',
                            type: 1, 
                            content:detailPop,
                            area:['80%','80%'],
                            success:function(layero,index){
                                // console.log(data);//id 
                                $("#closeId").on("click",function(){
                                    layer.close(index)
                                })
                                $("#printId").on("click",function(){
                                    var index = layer.load(2, {time: 2000});
                                    $("#printHtml").jqprint({
                                        debug: false,
                                        importCSS: true,
                                        printContainer: true,
                                        operaSupport: false

                                    });  
                                })  
                                $.fetch({
                                    url:"/gateway/formtpl/getformdata",
                                    type: 'post',
                                    data:{
                                        ItemID:data.id,
                                        FormType:2,
                                    },
                                    cb:function(rs){
                                        console.log(rs);
                                        if(rs&&rs.length>0){
                                            var th ='',td=''; 
                                            for(var i =0;i<rs.length;i++){
                                               th+='<th>'+rs[i].label+'</th>';
                                               td+='<td>'+JSON.parse(rs[i].value)+'</td>'
                                            }
                                            $("#lzmFormData thead tr").html(th);
                                            $("#lzmFormData tbody tr").html(td);
                                        }
                                    }
                                })
                            }
                        })
                    }
                });
            } 
      });

        // var myfinancialHtml =function(list){//渲染页面 表格方法
        //     var tables='';
        //     var html='';
        //     if(list.length==0){
        //         html+='<tr><td colspan="9"><div style="text-align:center;">暂无</div></td></tr>'
        //     }else{
        //         for(var i = 0;i <list.length;i++){
        //             var approval =list[i].approval_history;
        //             var apprList='';
        //             if(approval&&approval.length>0){
        //                 apprList+='<p>【最终审批人：'+list[i].current_approval_user_name+'】<p>' 
        //             }else{
        //                 apprList='';
        //             }
        //            html+='<tr>'
        //                     +'<td>'+list[i].created_at+'</td>'
        //                     +'<td>'+list[i].process_type_name+'</td>'
        //                     +'<td>'+list[i].baoxiao_type_name+'</td>'
        //                     +'<td>'+list[i].amount+'（'+list[i].symbol+'）</td>'
        //                     +'<td>'+list[i].receipt_count+'</td>'
        //                     +'<td>'+list[i].liezhi_month+'</td>'                   
        //                     +'<td>'+list[i].liezhi_kemu+'</td>'                   
        //                     +'<td>'+list[i].apply_result_desc
        //                     if(list[i].apply_result==0){
        //                         html+='【当前审批人：'+list[i].current_approval_user_name+'】' 
        //                     }else{
        //                         html+=apprList;
        //                     }
                            
        //                     html+='</td>'                   
        //                     +'<td><button data-appr="'+list[i].id+'" class="detail layui-btn layui-btn-warm layui-btn-xs">详情</button></td>'                   
        //                  '</tr>'
        //         }
        //     }
        //     $("#financialTable").html(html);
        // }
        // var myfinancial = function(objs={}){//调用表格数据接口方法
        //     var objst =objs;
        //     $.fetch({
        //         url:"/gateway/financial/myapply",
        //         type: 'post',
        //         data:objst,
        //         cb:function(rs){
        //             var  list =rs.data_list;
        //             myfinancialHtml(list);
        //             laypage.render({
        //                 elem: 'finanPage' //注意，这里的 test1 是 ID，不用加 # 号
        //                 ,count: rs.total_count //数据总数，从服务端得到
        //                 ,jump: function(obj, first){
        //                     //obj包含了当前分页的所有参数，比如：
        //                      //得到当前页，以便向服务端请求对应页的数据。
        //                     if(!first){ 
        //                         $.fetch({
        //                             url:"/gateway/financial/myapply",
        //                             type: 'post',
        //                             data:{
        //                                 currentIndex:obj.curr,
        //                                 pageSize:10,
        //                             },
        //                             cb:function(rs){
        //                                 myfinancialHtml(rs.data_list);
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
        // myfinancial(tableNowPage);//初始化列表数据
        // form.on('select(myfinanDescSel)', function(data){

        //     tableNowPage={
        //         ApplyResult:data.value,//0：未审批(待批)，1：未批准，2：已批准
        //         currentIndex:1,
        //         pageSize:10,
        //     }
        //     myfinancial(tableNowPage);
        // });  
    })
})