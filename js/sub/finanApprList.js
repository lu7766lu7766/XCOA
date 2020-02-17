
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

        var tableNowPage={
            ApplyResult:0,
            currentIndex:1,
            pageSize:10,
        }
        
        // element.on('tab(component-tabs-brief)', function(data){
        //     console.log(data.index);
        //     if(data.index == 2){
        //         noticrTable1.reload({
        //             url:urls+"/gateway/financial/forwardlist",//
        //             where:{
        //                 // ApplyResult: data.index
        //             }
        //         })
        //     }else{
        //         tableNowPage.ApplyResult=data.index;
        //         noticrTable1.reload({
        //             url:urls+"/gateway/financial/approvallist",//
        //             where:{
        //                 ApplyResult: data.index
        //             }
        //         })
        //     }

        // });

        
        // 数据表格
        var noticrTable1 = table.render({
            elem: '#finanListTable',
            url:urls+"/gateway/financial/approvallist",//
            contentType: 'application/json',
            method: 'post',
            where: {
                ApplyResult: 0
            },
            page: true, //开启分页
            // limit: 10,
            limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000],
            loading: true,
            text: {
                none: '暂无数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
            },
            cols: [
                [ //标题栏
                    {
                        field: 'apply_user_name',
                        title: '申请人',
                        width: 100
                    }, {
                        field: 'apply_time',
                        title: '申请时间',
                        width: 180
                    }, {
                        field: 'process_type_name',
                        title: '流程类型',
                        minWidth: 100,
                        
                    }, {sort: true,
                        field: 'yz_to_bx_desc',
                        title: '预支转报销',
                        minWidth: 110,
                        
                    },{
                        field: 'baoxiao_type_name',
                        title: '类型',
                        minWidth: 100
                    }, {//
                        sort:true,
                        field: 'finan_dept_name',
                        unresize: true,
                        minWidth: 90,
                        title: '费用部门'
                    }, {
                        field: 'symbolamount',
                        title: '报销金额',
                        minWidth: 120,
                        templet:function(d){
                            return '<span>'+d.symbol+' '+d.amount+'</span>'
                        }
                    }, {
                        field: 'receipt_count',
                        title: '单据数',
                        width: 100
                    }, {
                        field: 'liezhi_month',
                        title: '列支年月',
                        width: 100
                    }, {
                        field: '',
                        title: '审批历史',
                        minWidth: 180,
                        templet:function(d){
                            var apprList = '';
                             if (d.approval_history.length == 0) {
                                 apprList = '暂无';
                             } else {
                                 for (var k = 0; k < d.approval_history.length; k++) {
                                     var res = '';
                                     var classList = '';
                                     if (d.approval_history[k].is_forward == 1) { //是转发的
                                         res = '--转发-->';
                                         apprList += '<p>【' + d.approval_history[k].username + '' + res + '' + d.approval_history[k].forward_username + '】：' //意见
                                             +
                                             d.approval_history[k].content + '</p>' //意见内容

                                     } else { //是审批的

                                         if (d.approval_history[k].approval_result == 1) {
                                             res = "未批准";
                                             classList = "red";
                                         } else if (d.approval_history[k].approval_result == 2) {
                                             res = "已批准";
                                             classList = 'green';
                                         }
                                         apprList += '<p><span> 【' + d.approval_history[k].username + '<em class=' + classList + '>' + res + '</em>' + '】</span>' + d.approval_history[k].content + '</p>'
                                     }

                                 };
                             }
                            return apprList;
                        }
                    }, {
                        field: 'approval_result',
                        title: '状态',
                        width: 90,
                        templet: function (d) {
                            var resu= d.approval_result == 0 ?'未审批':
                                d.approval_result == 1 ? '未批准' : '已批准'
                                +(d.is_cancel==1?'<span class="green">(取消财务申请)</span>':(d.is_cancel==2?'已取消':' '));
                                return resu;
                        } 
                    }, {
                        fixed: 'right',
                        title: '操作',
                        width: 110,
                        templet:function(d){
                            var apprSh = ''
                            if (d.approval_result == 0) {
                                apprSh = '<button data-depa="' + d.department_id + '" data-step="' + d.next_step + '" data-user="' + d.apply_user_id + '" data-appr="' + d.id + '" class="appr layui-btn layui-btn-warm layui-btn-xs" lay-event="appr">审核</button><button data-appr="' + d.id + '" class="detail layui-btn layui-btn-warm layui-btn-xs" lay-event="detail">详情</button>'
                            } else {
                                apprSh = '<button data-appr="' + d.id + '" class="detail layui-btn layui-btn-warm layui-btn-xs" lay-event="detail">详情</button>'
                            }
                            return apprSh
                        },
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
                $("#myfinanDescSel").val(this.where.ApplyResult);
                form.on('select(myfinanDescSel)', function (data) {
                    console.log(data.value)
                    if (data.value == 2) {
                        noticrTable1.reload({
                            url: urls + "/gateway/financial/forwardlist",
                            where: {
                                // ApplyResult: data.value,
                            },
                            page: {
                                curr: 1 //重新从第 1 页开始
                            }
                        });
                    } else {
                        tableNowPage.ApplyResult = data.index;
                        noticrTable1.reload({
                            url:urls+"/gateway/financial/approvallist",
                            where: {
                                ApplyResult: data.value,
                            },
                            page: {
                                curr: 1 //重新从第 1 页开始
                            }
                        });
                    }
                 });
            }
        })

        // 详情和审核
        table.on('tool(finanListTable)', function (obj) {
            var data = obj.data; //获得当前行数据
            var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）

            if(layEvent == 'appr'){
                var fid =$(this).attr("data-appr");
                var step =$(this).attr("data-step");
                var uid =$(this).attr("data-user");
                var depid =$(this).attr("data-depa");
                var tabelData =data;
                $.fetch({
                    url:"/gateway/financial/getapprovaluser",
                    type: 'post',
                    data:{
                        financialTypeId:data.fee_type,                        
                        itemId: fid,
                        step:step,
                        departmentId:depid,
                        applyuserId:uid,
                    },
                    cb:function(rs){
                        var oplist = '',forwar='';
                        if(rs.userList&&rs.userList.length>0){
                            oplist+='<div class="layui-form-item" id="finaApprUser">'
                                        +'<div class="layui-inline">'
                                            +'<label class="layui-form-label modify-layui-label">指定审核人</label>'
                                            +'<div class="layui-input-block layui-input-lineHeight">'
                                                +'<select name="finaApprUser" lay-verify="required">'
                            for(var i=0;i<rs.userList.length;i++){
                                oplist+='<option value="'+rs.userList[i].id+'">'+rs.userList[i].name+'</option>'
                            }
                            oplist+='</select></div></div></div>';
                            
                        }else{
                            oplist='';
                        }

                        if(rs.forwardUsers&&rs.forwardUsers.length>0){
                            forwar+='<div class="layui-form-item" id="finaForwUser">'
                                        +'<div class="layui-inline">'
                                            +'<label class="layui-form-label modify-layui-label">转发给</label>'
                                            +'<div class="layui-input-block layui-input-lineHeight">'
                                                +'<select name="finaForwUser"  lay-verify="required">'
                            for(var i=0;i<rs.forwardUsers.length;i++){
                                forwar+='<option value="'+rs.forwardUsers[i].id+'">'+rs.forwardUsers[i].name+'</option>'
                            }
                            forwar+='</select></div></div><div class="layui-inline"><button id="forwardTo" class="layui-btn">转发</button></div></div>'
                        }else{
                            forwar='';
                        }    
                        var contAppr='<div class="layui-fluid">'
                                        +'<div class="layui-card">'
                                            +'<div class="layui-card-body">'
                                                +'<div class="layui-form">'
                                                    +'<div class="layui-form-item">'
                                                        +'<label class="layui-form-label modify-layui-label">审核说明</label>'
                                                        +'<div class="layui-input-block layui-input-lineHeight">'
                                                            +'<textarea lay-verify="required" id="contentAppr" name="contentAppr" class="layui-textarea"></textarea>'
                                                        +'</div>'
                                                    +'</div>'
                                                    +'<div class="layui-form-item">'
                                                        +'<label class="layui-form-label modify-layui-label">审核结果</label>'
                                                        +'<div class="layui-input-block layui-input-lineHeight">'
                                                            +'<input type="radio" name="ApprYn" lay-filter="ApprYn" value="2" title="审核通过" checked>'
                                                            +'<input type="radio" name="ApprYn" lay-filter="ApprYn" value="1" title="审核不通过">'
                                                        +'</div>'
                                                    +'</div>'
                                                    +oplist
                                                    if(data.next_step!=7&&data.is_special!=0){
                                                        contAppr+=forwar
                                                    }
                                                    contAppr+='<div class="layui-form-item">'
                                                        +'<div class="layui-input-block">'
                                                            +'<button id="subFinanApprForm" data-stpe="'+rs.step+'" lay-submit class="layui-btn" lay-filter="subFinanApprForm">提交</button>'
                                                            +'<button id="backApprList" class="layui-btn layui-btn-primary">返回</button>'
                                                        +'</div>'
                                                    +'</div>'
                                                +'</div>'
                                            +'</div>'
                                        +'</div>'
                                    +'</div>'
                        layer.open({
                            title:'报销付款单审批',
                            type: 1, 
                            content:contAppr,
                            area:['60%','47%'],
                            success:function(layero,index){
                                form.render(); 
                                form.on('radio(ApprYn)', function(data){
                                    if(data.value==1){
                                        $("#finaApprUser").hide();
                                        $("#finaForwUser").hide();
                                    }else if(data.value==2){
                                        $("#finaApprUser").show();
                                        $("#finaForwUser").show();
                                    }
                                });
                                form.on('submit(subFinanApprForm)', function(data){
                                    var stpeId =$("#subFinanApprForm").attr("data-stpe");
                                    if(data.field.finaApprUser==undefined){
                                        var nextApprovalUserID=0;
                                    }else{
                                        var nextApprovalUserID=data.field.finaApprUser;
                                    }
                                    var pram={
                                        ItemID:tabelData.id,
                                        NextApprovalUserID:nextApprovalUserID,
                                        Content:data.field.contentAppr,
                                        IsAgree:data.field.ApprYn,
                                        NextApprovalStep:stpeId,
                                    }
                                    $.fetch({
                                        url: '/gateway/financial/approval',
                                        type: 'post',
                                        data:pram,
                                        cb:function(rs){
                                            layer.msg('提交成功');
                                                // financialList(tableNowPage,0);
                                                noticrTable1.reload({});
                                                layer.close(index);
                                        } 
                                    });
                                    return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
                                });
                                $("#forwardTo").on("click",function(){
                                    var fowid= $("#finaForwUser select").val();
                                    var ctext =$("#contentAppr").val();
                                    if(ctext==''){
                                        $("#contentAppr").focus().addClass('layui-form-danger');
                                        layer.msg('审核说明不能为空',{icon:5,anim: 6},function(){

                                        })
                                        return false
                                    }
                                    $.fetch({
                                        url: '/gateway/financial/forward',
                                        type: 'post',
                                        data:{
                                            ForwardUserID:fowid,
                                            Content:ctext,
                                            ItemID:fid,
                                        },
                                        cb:function(rs){
                                            layer.msg('转发成功');
                                            noticrTable1.reload({});
                                                // financialList(tableNowPage,0);
                                                layer.close(index);
                                        } 
                                    });
                                });
                                $("#backApprList").on("click",function(){
                                    layer.close(index);
                                })
                            }
                        })
                    }
                });
            }else if(layEvent == 'detail'){
                 var fid =$(this).attr("data-appr");
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
                                apprList+='<p>【'+approval[k].username+''+res+ ''//名字
                                                //意见
                                            +'<em class="green"> '+approval[k].forward_username+' '+approval[k].approval_time+'</em>】：'//时间
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
                                                +'<div class="layui-form" id="printHtml">'
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
                                                        +'<label class="layui-form-label modify-layui-label layui-overflow-lineHeight">审批历史</label>'
                                                        +'<div class="layui-input-block layui-input-lineHeight UploadNames-box layui-overflow-lineHeight">'
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
                            title: '报销付款单详情',
                            type: 1, 
                            content:detailPop,
                            area:['80%','80%'],
                            success:function(layero,index){
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
                                // console.log(data);//id 
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
        })
    })