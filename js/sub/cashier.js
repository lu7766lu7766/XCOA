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

        // var tableNowPage={
        //     ApprovalResult:0,
        //     currentIndex:1,
        //     pageSize:10,
        // }


        // 数据表格
        var CashiTable = table.render({
            elem: '#cashierlistTable',
            url: urls + "/gateway/financial/cashierlist",
            contentType: 'application/json',
            method: 'post',
            where: {
                ApprovalResult: 0
            },
            page: true, //开启分页
            text: {
                none: '暂无数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
            },

            limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000],
            toolbar:true,
            defaultToolbar: ['filter', 'print', 'exports'],
            cols: [
                [ //标题栏
                    {
                        sort: true,
                        field: 'created_at',
                        title: '申请时间',
                        minWidth: 160
                    }, {
                        sort: true,
                        field: 'creator',
                        title: '申请人',
                        minWidth: 100
                    }, {
                        sort: true,
                        field: 'amount',
                        title: '付款金额',
                        minWidth: 100,
                        templet: function (d) {
                            return '<span>' + d.amount + ' ' + d.symbol + '</span>'
                        }
                        
                    }, {
                        sort: true,
                        field: 'zh_name',
                        title: '币种',
                        minWidth: 120,
                        templet: function (d) {
                            return '<span>' + d.zh_name + ' (' + d.short_code + ')</span>'
                        }
                    },  
                    {sort: true,
                        field: 'liezhi_month',
                        title: '列支年月',
                        minWidth: 100
                    }, {//
                        sort:true,
                        field: 'finan_dept_name',
                        unresize: true,
                        minWidth: 90,
                        title: '费用部门'
                    }, {
                        sort: true,
                        field: '',
                        title: '状态',
                        width: 90,
                        templet: function (d) {
                            return d.approval_result == 0 ? '<button class="layui-btn layui-btn-primary layui-btn-xs">未审核</button>' : 
                                    d.approval_result == 1 ? '<button class="layui-btn layui-btn-primary layui-btn-xs">不批准</button>' :
                                    d.approval_result == 2 ? '<button class="layui-btn layui-btn-normal layui-btn-xs">已批准</button>' : " "
                        }
                    }, {
                        fixed: 'right',
                        title: '操作',
                        width: 130,
                        templet:function(d){
                            var apprSh = ''
                            if (d.approval_result == 0) {
                                apprSh = '<button data-rate="'+d.rate_range.min2+'~'+d.rate_range.max2+'" data-type="'+d.process_type_code+'"  data-mony="'+d.amount+'" data-appr="'+d.id+'" class="appr layui-btn layui-btn-normal layui-btn-xs" lay-event="appr">出纳</button><button data-appr="'+d.id+'" class="detail layui-btn layui-btn-warm layui-btn-xs" lay-event="detail">详情</button>'
                            } else {
                                apprSh = '<button data-appr="'+d.id+'" class="detail layui-btn layui-btn-warm layui-btn-xs" lay-event="detail">详情</button>'
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
                
            }
        })
        table.on('tool(cashierlistTable)', function (obj) {
            var data = obj.data; //获得当前行数据
            var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            
            if(layEvent == 'appr'){ //出纳
                var fid =$(this).attr("data-appr");
                var typsc =$(this).attr("data-type")=="FK";
                var money =$(this).attr("data-mony");  
                var rate =$(this).attr("data-rate");   
                var contAppr='';       
                contAppr+='<div class="layui-fluid">'
                                +'<div class="layui-card">'
                                    +'<div class="layui-card-body">'
                                        +'<div class="layui-form">'
                                            +'<div class="layui-form-item">'
                                                +'<label class="layui-form-label modify-form-label">出纳说明</label>'
                                                +'<div class="layui-input-block layui-input-lineHeight modify-input-cont">'
                                                    +'<textarea lay-verify="required" id="contentPay" name="contentPay" class="layui-textarea"></textarea>'
                                                +'</div>'
                                            +'</div>'
                                            +'<div class="layui-form-item modify-layui-block">'
                                                +'<label class="layui-form-label modify-form-label">出纳结果：</label>'
                                                +'<div class="layui-input-block layui-input-lineHeight modify-input-cont">'
                                                    +'<input type="radio" name="payYN" lay-filter="payYN" value="2" title="同意" checked>'
                                                    +'<input type="radio" name="payYN" lay-filter="payYN" value="1" title="不同意">'
                                                +'</div>'
                                            +'</div>'
                                            //临时注释 请保留
                                            if(typsc){
                                                contAppr+='<div class="layui-form-item modify-layui-block payYsNh">'
                                                    +'<label class="layui-form-label modify-form-label">汇率：</label>'
                                                    +'<div class="layui-input-inline" style="width: 130px;">'
                                                        +'<div class="layui-inline layui-input-lineHeight"><input id="payMoney" lay-verify="required|maxMin" name="payMoney"  type="tel" autocomplete="off" class="layui-input layui-maxInput layui-maxInput-12"  value="0"></div>'
                                                    +'</div>'
                                                    // +'<div id="rmbMoney" class="layui-form-mid layui-word-aux">汇率区间：<span>'+rate+'</span></div>'
                                                    
                                                +'</div>'
                                                +'<div  class="layui-form-item modify-layui-block payYsNh"><label class="layui-form-label modify-form-label">换算人民币：</label><div class="layui-input-inline" id="bpayMoney"><span style="line-height: 38px;">0元</span></div></div>'

                                            }
                                            contAppr+='<div class="layui-form-item tc">'
                                                +'<button id="subPayMForm"  lay-submit class="layui-btn" lay-filter="subPayMForm">提交</button>'
                                                +'<button id="backcashiera" class="layui-btn layui-btn-primary">返回</button>'
                                            +'</div>'
                                        +'</div>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                layer.open({
                    title:'出纳',
                    type: 1, 
                    content:contAppr,
                    area:['60%','auto'],
                    success:function(layero,index){
                        laydate.render({
                            elem: '#payData'
                            ,value: new Date()
                        });
                        form.render(); 
                        $("#payMoney").on('keyup',function () {
                            $(this).val(NumberCheck($(this).val()));
                        }).bind("paste", function () {  //CTR+V事件处理
                            $(this).val(NumberCheck($(this).val()));
                        }).css("ime-mode", "disabled"); //CSS设置输入法不可用
                        $("#payMoney").on("input propertychange",function(){
                        
                            var num = $(this).val();
                            var bpayMoney=  parseFloat((money*num).toFixed(2))
                            $("#bpayMoney span").text(bpayMoney);
                        })
                        form.on('radio(payYN)', function(data){
                            if(data.value==1){
                                $(".payYsNh").hide();
                            }else if(data.value==2){
                                $(".payYsNh").show();
                            }
                        });
                        form.on('submit(subPayMForm)', function(data){
                            var pram={
                                FinancialOrderId:fid,
                                Content:data.field.contentPay,
                                ApprovalResult:data.field.payYN,
                                // PayMethod:data.field.payMethod,
                                Rate:data.field.payMoney,
                                // PayDate:data.field.payData,
                                // Rate:
                            }
                            $.fetch({
                                url: '/gateway/financial/cashierapproval',
                                type: 'post',
                                data:pram,
                                cb:function(rs){
                                    layer.msg('提交成功');
                                        // cashierlist(tableNowPage);
                                        CashiTable.reload({});
                                        layer.close(index);
                                } 
                            });
                            return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
                        });
                        $("#backcashiera").on("click",function(){
                            layer.close(index);
                        })
                    }
                })
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
                                apprList+='<p>【'+approval[k].username+''+res+ ''+approval[k].forward_username+''//名字
                                                //意见
                                            +'<em class="'+classList+'"> ' +approval[k].approval_time+'</em>】：'//时间
                                                +approval[k].content+'</p>'//意见内容
        
                                }else{//是审批的
        
                                    if(approval[k].approval_result==1){
                                        res ="未批准";
                                        classList = "red";
                                    }else if(approval[k].approval_result==2){
                                        res ="已批准";
                                        classList = 'green';
                                    }
                                apprList+='<p><span> 【'+approval[k].username +'<em class="'+classList+'">'+res+' '+approval[k].approval_time+'</em>'+'】</span>'+approval[k].content+'</p>'
                                }
                            
                            };
                        }
                        var detailPop='<div class="layui-fluid">'
                                        +'<div class="layui-form" id="printHtml">'
                                            // +'<div class="layui-form-mid layui-word-aux">IP：'+rs.createor_ip+'</div>'
                                            +'<div class="fr layui-word-aux" style="padding: 9px 0!important;">填写时间：'+rs.created_at+'</div>'
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
                                                    +'<span>'+rs.short_code+' '+rs.amount+' '+rs.symbol+'，'+rs.capital_amount+''+rs.zh_name+'</span>'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-inline">'
                                                    +'<label class="layui-form-label modify-layui-label">单据总数</label>'
                                                    +'<div class="layui-input-block layui-input-lineHeight">'
                                                        +'<span>'+rs.receipt_count+'</span>'
                                                    +'</div>'
                                                +'</div>'
                                            +'</div>'
                                            +'<div class="layui-form-item  no-print">'
                                                +'<label class="layui-form-label modify-layui-label">附件</label>'
                                                +'<div class="layui-input-block layui-input-lineHeight UploadNames-box">'
                                                    +attaches
                                                +'</div>'
                                            +'</div>'
                                            +'<div class="layui-form-item">'
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
                            title:'详情',
                            type: 1, 
                            content:detailPop,
                            area:['80%','80%'],
                            success:function(layero,index){
                                // console.log(data);//id 
                                $.fetch({
                                    url:"/gateway/formtpl/getformdata",
                                    type: 'post',
                                    data:{
                                        ItemID:data.id,
                                        FormType:2,
                                    },
                                    cb:function(rs){
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
                            }
                        })
                    }
                });
            }
        })

        // cashierlist(tableNowPage);//初始化列表数据
        form.on('select(myCashierSel)', function(data){
            CashiTable.reload({
                where:{
                    ApprovalResult:data.value,
                }
                ,page:{
                    curr:1,
                }
            });
        });  
    
         //转成大写方法
         function changeMoneyToChinese(money){
            var cnNums = new Array("零","壹","贰","叁","肆","伍","陆","柒","捌","玖"); //汉字的数字
            var cnIntRadice = new Array("","拾","佰","仟"); //基本单位
            var cnIntUnits = new Array("","万","亿","兆"); //对应整数部分扩展单位
            var cnDecUnits = new Array("角","分","毫","厘"); //对应小数部分单位
            var cnIntLast = "元"; //整型完以后的单位
            var maxNum = 999999999999999.9999; //最大处理的数字
            
            var IntegerNum; //金额整数部分
            var DecimalNum; //金额小数部分
            var ChineseStr=""; //输出的中文金额字符串
            var parts; //分离金额后用的数组，预定义
            if( money == "" ){
                return "";
            }
            money = parseFloat(money);
            if( money >= maxNum ){
                layer.msg('超出最大处理数字');
                return "";
            }
            if( money == 0 ){
                ChineseStr = cnNums[0]+cnIntLast;
                return ChineseStr;
            }
            money = money.toString(); //转换为字符串
            if( money.indexOf(".") == -1 ){
                IntegerNum = money;
                DecimalNum = '';
            }else{
                parts = money.split(".");
                IntegerNum = parts[0];
                DecimalNum = parts[1].substr(0,4);
            }
            if( parseInt(IntegerNum,10) > 0 ){//获取整型部分转换
                zeroCount = 0;
                IntLen = IntegerNum.length;
                for( i=0;i<IntLen;i++ ){
                    n = IntegerNum.substr(i,1);
                    p = IntLen - i - 1;
                    q = p / 4;
                    m = p % 4;
                    if( n == "0" ){
                        zeroCount++;
                    }else{
                        if( zeroCount > 0 ){
                            ChineseStr += cnNums[0];
                        }
                        zeroCount = 0; //归零
                        ChineseStr += cnNums[parseInt(n)]+cnIntRadice[m];
                    }
                    if( m==0 && zeroCount<4 ){
                        ChineseStr += cnIntUnits[q];
                    }
                }
                ChineseStr += cnIntLast;
                //整型部分处理完毕
            }
            if( DecimalNum!= '' ){//小数部分
                decLen = DecimalNum.length;
                for( i=0; i<decLen; i++ ){
                    n = DecimalNum.substr(i,1);
                    if( n != '0' ){
                        ChineseStr += cnNums[Number(n)]+cnDecUnits[i];
                    }
                }
            }
            if( ChineseStr == '' ){
                ChineseStr += cnNums[0]+cnIntLast;
            }
            return ChineseStr;
        }
        // $("#cashierlistTable").on("click",".appr",function(){
        //     var fid =$(this).attr("data-appr");
        //     var typsc =$(this).attr("data-type")=="FK";
        //     var money =$(this).attr("data-mony");  
        //     var rate =$(this).attr("data-rate");   
        //     var contAppr='';       
        //     contAppr+='<div class="layui-fluid">'
        //                     +'<div class="layui-card">'
        //                         +'<div class="layui-card-body">'
        //                             +'<div class="layui-form">'
        //                                 +'<div class="layui-form-item">'
        //                                     +'<label class="layui-form-label modify-form-label">出纳说明</label>'
        //                                     +'<div class="layui-input-block layui-input-lineHeight modify-input-cont">'
        //                                         +'<textarea lay-verify="required" id="contentPay" name="contentPay" class="layui-textarea"></textarea>'
        //                                     +'</div>'
        //                                 +'</div>'
        //                                 +'<div class="layui-form-item modify-layui-block">'
        //                                     +'<label class="layui-form-label modify-form-label">出纳结果：</label>'
        //                                     +'<div class="layui-input-block layui-input-lineHeight modify-input-cont">'
        //                                         +'<input type="radio" name="payYN" lay-filter="payYN" value="2" title="同意" checked>'
        //                                         +'<input type="radio" name="payYN" lay-filter="payYN" value="1" title="不同意">'
        //                                     +'</div>'
        //                                 +'</div>'
        //                                 //临时注释 请保留
        //                                 if(typsc){
        //                                     contAppr+='<div class="layui-form-item modify-layui-block payYsNh">'
        //                                         +'<label class="layui-form-label modify-form-label">汇率：</label>'
        //                                         +'<div class="layui-input-inline" style="width: 130px;">'
        //                                             +'<div class="layui-inline layui-input-lineHeight"><input id="payMoney" lay-verify="required|maxMin" name="payMoney"  type="tel" autocomplete="off" class="layui-input layui-maxInput layui-maxInput-12"  value="0"></div>'
        //                                         +'</div>'
        //                                         // +'<div id="rmbMoney" class="layui-form-mid layui-word-aux">汇率区间：<span>'+rate+'</span></div>'
                                                
        //                                     +'</div>'
        //                                      +'<div  class="layui-form-item modify-layui-block payYsNh"><label class="layui-form-label modify-form-label">换算人民币：</label><div class="layui-input-inline" id="bpayMoney"><span style="line-height: 38px;">0.000元</span></div></div>'

        //                                 }
        //                                 // +'<div class="layui-form-item modify-layui-block payYsNh">'
        //                                 //     +'<label class="layui-form-label modify-layui-label">付款日期：</label>' 
        //                                 //     +'<div class="layui-input-block">'
        //                                 //         +'<div class="layui-inline"><input type="text" id="payData" name="payData" placeholder="" lay-verify="data" class="layui-input layui-maxInput layui-maxInput-12"></div>'
        //                                 //     +'</div>'
        //                                 // +'</div>'
        //                                 // +'<div class="layui-form-item modify-layui-block payYsNh">'
        //                                 //     +'<label class="layui-form-label modify-layui-label">付款方式：</label>' 
        //                                 //     +'<div class="layui-input-block">'
        //                                 //         +'<div class="layui-inline"><input type="text" name="payMethod" class="layui-input layui-maxInput layui-maxInput-12"></div>'
        //                                 //     +'</div>'
        //                                 // +'</div>'
        //                                 contAppr+='<div class="layui-form-item tc">'
        //                                     +'<button id="subPayMForm"  lay-submit class="layui-btn" lay-filter="subPayMForm">提交</button>'
        //                                     +'<button id="backcashiera" class="layui-btn layui-btn-primary">返回</button>'
        //                                 +'</div>'
        //                             +'</div>'
        //                         +'</div>'
        //                     +'</div>'
        //                 +'</div>'
        //     layer.open({
        //         title:'出纳',
        //         type: 1, 
        //         content:contAppr,
        //         area:['60%','auto'],
        //         success:function(layero,index){
        //             laydate.render({
        //                 elem: '#payData'
        //                 ,value: new Date()
        //             });
        //             form.render(); 
        //             $("#payMoney").on('keyup',function () {
        //                 $(this).val(NumberCheck($(this).val()));
        //             }).bind("paste", function () {  //CTR+V事件处理
        //                 $(this).val(NumberCheck($(this).val()));
        //             }).css("ime-mode", "disabled"); //CSS设置输入法不可用
        //             // console.log(rate);
        //             // var rateArr = rate.split("~");
        //             $("#payMoney").on("input propertychange",function(){
                       
        //                  var num = $(this).val();
        //                 // if(rateArr[0]>num||num>rateArr[1]){
        //                 //     $(this).addClass("layui-form-danger");
        //                 // }else{
        //                 //     $(this).removeClass("layui-form-danger");
        //                 // }
        //                 // var bpayMoney = changeMoneyToChinese(num);
        //                 // console.log(money,num,money/num)
        //                 var bpayMoney=  (money*num).toFixed(2)
        //                 $("#bpayMoney span").text(bpayMoney);
        //             })
        //             // form.verify({
        //             //     maxMin: function(value, item){ //value：表单的值、item：表单的DOM对象
        //             //       if(value>rateArr[1]){
        //             //         return '汇率不能超出最大值';
        //             //       }else if(value<rateArr[0]){
        //             //         return '汇率不能低于最小值';
        //             //       }
        //             //     }
        //             // }); 
        //             form.on('radio(payYN)', function(data){
        //                 if(data.value==1){
        //                     $(".payYsNh").hide();
        //                 }else if(data.value==2){
        //                     $(".payYsNh").show();
        //                 }
        //             });
        //             form.on('submit(subPayMForm)', function(data){
        //                 var pram={
        //                     FinancialOrderId:fid,
        //                     Content:data.field.contentPay,
        //                     ApprovalResult:data.field.payYN,
        //                     // PayMethod:data.field.payMethod,
        //                     Rate:data.field.payMoney,
        //                     // PayDate:data.field.payData,
        //                     // Rate:
        //                 }
        //                 $.fetch({
        //                     url: '/gateway/financial/cashierapproval',
        //                     type: 'post',
        //                     data:pram,
        //                     cb:function(rs){
        //                         layer.msg('提交成功');
        //                             cashierlist(tableNowPage);
        //                             layer.close(index);
        //                     } 
        //                 });
        //                 return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
        //             });
        //             $("#backcashiera").on("click",function(){
        //                 layer.close(index);
        //             })
        //         }
        //     })
        // })
    })
})