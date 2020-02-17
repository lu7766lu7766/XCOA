//审批

$(function(){
    layui.config({
		base: '../../../layui/' //静态资源所在路径
	}).extend({
		index: 'index' //主入口模块
	}).use(['index','form','laypage','table'], function(){
        var $ = layui.$
        ,admin = layui.admin
        ,element = layui.element
        ,router = layui.router();
        element.render();
        element.on('tab(approval-tabs-brief)', function(obj){
            var tabIndex =obj.index;
            switch(tabIndex)
                {
                case 0:
                    popUrl = "/gateway/userleave/approval";
                    forwardUrl="/gateway/userleave/forward";
                    leaveTable();
                    break;

                case 1:
                    popUrl = "/gateway/goout/approval";
                    forwardUrl="/gateway/goout/forward";
                    outgoTable();
                    break;

                case 2:
                    popUrl = "/gateway/overtime/approval";
                    forwardUrl="/gateway/overtime/forward";
                    overTimeTable();
                    break;

                case 3:
                    popUrl = "/gateway/checkinoutapply/approval";
                    forwardUrl="/gateway/checkinoutapply/forward";
                    danceTable();
                    break;

                }

        });

        var laydate = layui.laydate
            ,form = layui.form
            ,layer = layui.layer
            ,laypage = layui.laypage
            ,table=layui.table;
        $("#approvalAll").on("click",".reviewButton>button",function(){
                var step=$(this).attr("data-step");
                var item=$(this).attr("data-item");
                var dpar=$(this).attr("data-dapr"); 
                var userId=$(this).attr("data-user");
                var approvalType =$(this).attr("data-type");
                var elThis =$(this);
                var htmls ='<div class="layui-card">'
                            +'<div class="reviewCont layui-card-body">'
                            +    '<div class="layui-form" action="">'
                            +        '<div class="layui-form-item">'
                            +            '<label class="layui-form-label modify-layui-label">审批意见：</label>'
                            +            '<div class="layui-input-block">'
                            +                '<textarea id="appDacText" name="suggestion" class="layui-textarea" cols="50" rows="4" ></textarea>'
                            +            '</div>'
                            +        '</div>'
                            +        '<div class="layui-form-item">'
                            +            '<label class="layui-form-label modify-layui-label">是否同意：</label>'
                            +            '<div class="layui-input-block">'
                            +                '<input type="radio"  lay-filter="approvalYn" name="approvalYn" id="approvalOk" value="2" title="同意">'
                            +                '<input type="radio"  lay-filter="approvalYn" name="approvalYn" id="approvalNo" value="1" title="不同意" checked>'
                            +            '</div>'
                            +        '</div>'
                            +        '<div class="layui-form-item">'
                            +            '<label class="layui-form-label modify-layui-label">审批人：</label>'
                            +            '<div class="layui-input-block">'
                            +                '<div class="layui-input-inline">'
                            +                    '<select name="nextDacApp" lay-verify="required" id="nextDacApp"></select>'
                            +                '</div>'
                            +            '</div>'
                            +        '</div>'
                            +       ' <div class="layui-form-item">'
                            +            '<label class="layui-form-label modify-layui-label modify-layui-width">选择转交人：</label>'
                            +            '<div class="layui-input-block">'
                            +                '<div class="layui-input-inline MaxHeight">'
                            +                    '<select name="dacAppForward" lay-verify="required" id="dacAppForward"></select>'
                            +                '</div>'
                            +                '<button class="layui-btn" data-item="'+item+'" id="okForward">转发</button>'
                            +           ' </div>'
                            +       ' </div>'
                            +        '<div class="layui-form-item">'
                            +            '<div class="layui-input-block">'
                            +               ' <button class="appOk layui-btn" data-item="'+item+'">确认</button>'
                            +            '</div>'
                            +        '</div>'
                            +    '</div>'
                            +'</div>'
                            +'</div>'



              var appro= layer.open({
                    title:'审批意见',
                    content:htmls,
                    type:1,
                    id:'approvPop',
                    area:['60%','51%'],
                    success:function(layero,index){
                        form.on('radio(approvalYn)', function(data){
                            if(data.value==1){
                                $("#nextDacApp").attr("disabled","disabled");
                                $("#dacAppForward").attr("disabled","disabled");
                                $("#okForward").attr("disabled","disabled").addClass("disabled");
                                
                            }else if(data.value==2){
                                $("#nextDacApp").removeAttr("disabled");
                                $("#dacAppForward").removeAttr("disabled");
                                $("#okForward").removeAttr("disabled").removeClass("disabled");
                            }
                            form.render();
                        });  
                    }
                })
                form.render();
                $.managerFun({
                    departmentId:dpar,
                    step:step,
                    applyuserId:userId,
                    approvalType:approvalType,
                    itemId:item,
                    fun:function(rs,forw,steps){
                        var oplhtml ='';
                        for(var i=0;i<rs.length;i++){
                            oplhtml+='<option value="'+rs[i].id+'">'+rs[i].name+'</option>'
                        }
                        $("#nextDacApp").html(oplhtml); 
                        $("#nextDacApp").attr("data-step",steps);
                        
                        if(forw&&forw.length!=0){
                            var forwHtml ='';
                            for(var i=0;i<forw.length;i++){
                                forwHtml+='<option value="'+forw[i].id+'">'+forw[i].name+'</option>'
                            }
                            $("#dacAppForward").html(forwHtml);
                        }else{
                            $("#dacAppForward").parents('.layui-form-item').remove();
                        }

                        var elem =elThis.parents("table.item"+item+"");
                        $("#approvPop").find(" input[value='2']").prop("checked",true);
                        apprPopFun(elem,popUrl,forwardUrl);
                        form.render();
                    }
                });
                
            })
    
  





    var leavetypes;
    var popUrl,forwardUrl;
    $.fetch({
        url:"/gateway/userleave/leavetypes",
        type: 'post',
        cb:function(rs){
            leavetypes=rs;
            popUrl = "/gateway/userleave/approval";
            forwardUrl="/gateway/userleave/forward";
            leaveTable()
        }
    });
    $('#apprTabNav a:first').tab('show');
    
    $('#apprTabNav a').click(function (e) {
        e.preventDefault();
        $(this).tab('show');
        var tabIndex=$(this).parents("li").index();
        
    })
    //请假
    function leaveTable(){
        $.fetch({
            url:"/gateway/userleave/approvallist",
            type: 'post',
            cb:function(rs){
                var html ='';
                if(rs.length==0){
                    html='<div>暂无</div>'
                }else{
                    for(var i=0;i<rs.length;i++){
                        var yj='';
                        if(rs[i].approval_history.length==0){
                            yj ='暂无';
                        }else{
                            for(var k=0;k< rs[i].approval_history.length;k++){

                                var res='';
                                var classList = '';
                                if(rs[i].approval_history[k].is_forward ==1){//是转发的
                                    res ='--转发-->';
                                    yj+='<p>【'+rs[i].approval_history[k].username+''+res+ ''+rs[i].approval_history[k].forward_username+''//名字
                                                 //意见
                                            +'<em class='+classList+'> ' +rs[i].approval_history[k].approval_time+'</em>】：'//时间
                                                +rs[i].approval_history[k].content+'</p>'//意见内容
        
                                }else{//是审批的
        
                                    if(rs[i].approval_history[k].approval_result==1){
                                        res ="未批准";
                                        classList = "red";
                                    }else if(rs[i].approval_history[k].approval_result==2){
                                        res ="已批准";
                                        classList = 'green';
                                    }
                                    yj+='<p><span> 【'+rs[i].approval_history[k].username +'<em class='+classList+'>'+res+' '+rs[i].approval_history[k].approval_time+'</em>'+'】</span>'+rs[i].approval_history[k].content+'</p>'
                                }
                            
                            };
                        }
                        html+='<table class="layui-table item'+rs[i].id+'">'
                                     +'<colgroup>'
                                       +'<col width="180">'
                                       +'<col width="180">'
                                       +'<col width="130">'
                                       +'<col width="280">'
                                       +'<col width="280">'
                                       +'<col width="180">'
                                       +'<col>'
                                    +'</colgroup>'
                                    +'<thead>'
                                        +'<tr>'
                                            +'<th>部门</th>'
                                            +'<th>姓名</th>'
                                            +'<th>请假天数</th>'
                                            +'<th>开始时间</th>'
                                            +'<th>结束时间</th>'
                                            +'<th>请假类型</th>'
                                            +'<th>申请时间</th>'    
                                        +'</tr>'
                                    +'</thead>'
                                    +'<tbody>'
                                        +'<tr>'
                                            +'<td>'+rs[i].depatment_name+'</td>'
                                            +'<td>'+rs[i].apply_user_name+'</td>'
                                            +'<td>'+rs[i].day_count+'</td>'
                                            +'<td>'+rs[i].start_time+'</td>'
                                            +'<td>'+rs[i].end_time+'</td>'
                                            +'<td>'+leavetypes[rs[i].leave_type]+''+(rs[i].is_cancel==1?'(取消申请)':'')+'</td>'
                                            +'<td>'+rs[i].apply_time+'</td>'
                                        +'</tr>'
                                        +'<tr class="hoverShow">'
                                            +'<td colspan="7"><div class="reviewComp">'
                                                +'<span>请假原因：</span>'+rs[i].content+''
                                                +'</div><div class="reviewComp">'
                                                +'<span>审批意见：</span>'+yj+''
                                            +'</div><div class="reviewButton tc"><button class="layui-btn" data-user="'+rs[i].apply_user_id+
                                            '" data-dapr="'+rs[i].department_id+
                                            '" data-item="'+rs[i].id+
                                            '" data-step="'+rs[i].next_step+
                                            '" data-type="'+rs[i].approval_type+
                                            '">审核</button></div></td>' 
                                        +'</tr>'
                                    +'</tbody></table>'
                    }
                }  
                $("#leaveAppr .reviewCont").html(html);
            }
        })
    }
     //外出
    function outgoTable(){
        $.fetch({
            url:"/gateway/goout/approvallist",
            type: 'post',
            cb:function(rs){
                var html =''
                if(rs.length==0){
                    html='<div>暂无</div>'
                }else{
                    for(var i=0;i<rs.length;i++){
                        var yj='';
                        if(rs[i].approval_history.length==0){
                            yj ='暂无';
                        }else{
                            for(var k=0;k< rs[i].approval_history.length;k++){
                                var res='';
                                var classList = '';
                                if(rs[i].approval_history[k].is_forward ==1){//是转发的
                                    res ='--转发-->';
                                    yj+='<p>【'+rs[i].approval_history[k].username+''+res+ ''+rs[i].approval_history[k].forward_username+''//名字
                                                 //意见
                                            +'<em class='+classList+'> ' +rs[i].approval_history[k].approval_time+'</em>】：'//时间
                                                +rs[i].approval_history[k].content+'</p>'//意见内容
        
                                }else{//是审批的
                                    if(rs[i].approval_history[k].approval_result==1){
                                        res ="未批准";
                                        classList = "red";
                                    }else if(rs[i].approval_history[k].approval_result==2){
                                        res ="已批准";
                                        classList = 'green';
                                    }
                                    yj+='<p><span> 【'+rs[i].approval_history[k].username +'<em class='+classList+'>'+res+' '+rs[i].approval_history[k].approval_time+'</em>'+'】</span>'+rs[i].approval_history[k].content+'</p>'
                           
                                };
                            }
                        }
                        var outgoType =rs[i].go_out_type==2?'出差':'外出';
                        html+='<table class="layui-table item'+rs[i].id+'">'
                                    +'<colgroup>'
                                       +'<col width="150">'
                                       +'<col width="150">'
                                       +'<col width="200">'
                                       +'<col width="200">'
                                       +'<col width="150">'
                                       +'<col width="500">'
                                       +'<col>'
                                    +'</colgroup>'
                                    +'<thead>'
                                        +'<tr>'
                                            +'<th>部门</th>'
                                            +'<th>姓名</th>'                                           
                                            +'<th>开始时间</th>'
                                            +'<th>结束时间</th>'
                                            +'<th>外出类型</th>' 
                                            +'<th>外出地点</th>'
                                            +'<th>申请时间</th>'
                                        +'</tr>'
                                    +'</thead>'
                                    +'<tbody>'
                                        +'<tr>'
                                            +'<td>'+rs[i].depatment_name+'</td>'
                                            +'<td>'+rs[i].apply_user_name+'</td>'
                                            +'<td>'+rs[i].start_time+'</td>'
                                            +'<td>'+rs[i].end_time+'</td>'
                                            +'<td>'+outgoType+'</td>'
                                            +'<td>'+rs[i].location+'</td>'
                                            +'<td>'+rs[i].apply_time+'</td>'
                                        +'</tr>'
                                        +'<tr  class="hoverShow">'
                                            +'<td colspan="7"><div class="reviewComp">'
                                                +'<span>外出原因：</span>'+rs[i].content+''
                                                +'</div><div class="reviewComp">'
                                                +'<span>审批意见：</span>'+yj+''
                                                +'</div><div class="reviewButton tc"><button class="layui-btn" data-user="'+rs[i].apply_user_id+
                                                '" data-dapr="'+rs[i].department_id+
                                                '" data-item="'+rs[i].id+
                                                '" data-step="'+rs[i].next_step+
                                                '" data-type="'+rs[i].approval_type+
                                                '">审核</button></div></td>' 
                                            +'</tr>'
                                        +'</tbody></table>'
                    }
                }  
                $("#outgoAppr .reviewCont").html(html);
            }
        })
    }
    //加班
    function overTimeTable(){
        $.fetch({
            url:"/gateway/overtime/approvallist",
            type: 'post',
            cb:function(rs){
                var html =''
                if(rs.length==0){
                    html='<div>暂无</div>'
                }else{
                    for(var i=0;i<rs.length;i++){
                        var yj='';
                        if(rs[i].approval_history.length==0){
                            yj ='暂无';
                        }else{
                            for(var k=0;k< rs[i].approval_history.length;k++){
                                var res='';
                                var classList = '';
                                for(var k=0;k< rs[i].approval_history.length;k++){
                                    var res='';
                                    var classList = '';
                                    if(rs[i].approval_history[k].is_forward ==1){//是转发的
                                        res ='--转发-->';
                                        yj+='<p>【'+rs[i].approval_history[k].username+''+res+ ''+rs[i].approval_history[k].forward_username+''//名字
                                                     //意见
                                                +'<em class='+classList+'> ' +rs[i].approval_history[k].approval_time+'</em>】：'//时间
                                                    +rs[i].approval_history[k].content+'</p>'//意见内容
            
                                    }else{//是审批的
                                        if(rs[i].approval_history[k].approval_result==1){
                                            res ="未批准";
                                            classList = 'red';
                                        }else if(rs[i].approval_history[k].approval_result==2){
                                            res ="已批准";
                                            classList = 'green';
                                        }
                                        yj+='<p><span>【'+rs[i].approval_history[k].username +'<em class='+classList+'>'+res+' '+rs[i].approval_history[k].approval_time+'</em>'+'】</span>'+rs[i].approval_history[k].content+'</p>'
                            
                                    };
                                }
                            }
                        }
                        var timeLeng=$.diffTime(rs[i].start_time,rs[i].end_time);
                        html+='<table class="layui-table item'+rs[i].id+'">'
                                    +'<colgroup>'
                                       +'<col width="150">'
                                       +'<col width="150">'
                                       +'<col width="300">'
                                       +'<col width="300">'
                                       +'<col width="300">'
                                       +'<col>'
                                    +'</colgroup>'
                                    +'<thead>'
                                        +'<tr>'
                                            +'<th>部门</th>'
                                            +'<th>姓名</th>'
                                            +'<th>开始时间</th>'
                                            +'<th>结束时间</th>'
                                            +'<th>加班时长</th>'
                                            +'<th>申请时间</th>'
                                        +'</tr>'
                                    +'</thead>'
                                    +'<tbody>'
                                        +'<tr>'
                                            +'<td>'+rs[i].depatment_name+'</td>'
                                            +'<td>'+rs[i].apply_user_name+'</td>'
                                            +'<td>'+rs[i].start_time+'</td>'
                                            +'<td>'+rs[i].end_time+'</td>'
                                            +'<td>'+timeLeng+'</td>'
                                            +'<td>'+rs[i].apply_time+'</td>'                                            
                                        +'</tr>'
                                        +'<tr  class="hoverShow">'
                                            +'<td colspan="6"><div class="reviewComp">'
                                                +'<span>加班原因：</span>'+rs[i].content+''
                                                +'</div><div class="reviewComp">'
                                                +'<span>审批意见：</span>'+yj+''
                                                +'</div><div class="reviewButton tc"><button class="layui-btn" data-user="'+rs[i].apply_user_id+
                                                '" data-dapr="'+rs[i].department_id+
                                                '" data-item="'+rs[i].id+
                                                '" data-step="'+rs[i].next_step+
                                                '" data-type="'+rs[i].approval_type+
                                                '">审核</button></div></td>' 
                                            +'</tr>'
                                        +'</tbody></table>'
                    }
                }  
                $("#overTimeAppr .reviewCont").html(html);
            }
        })
    }
    //补录
    function danceTable(){
        $.fetch({
            url:"/gateway/checkinoutapply/approvallist",
            type: 'post',
            cb:function(rs){
                var html =''
                if(rs.length==0){
                    html='<div>暂无</div>'
                }else{
                    for(var i=0;i<rs.length;i++){
                        var yj='';
                        if(rs[i].approval_history.length==0){
                            yj ='暂无';
                        }else{
                            for(var k=0;k< rs[i].approval_history.length;k++){
                                var res='';
                                var classList = '';
                                for(var k=0;k< rs[i].approval_history.length;k++){
                                    var res='';
                                    var classList = '';
                                    if(rs[i].approval_history[k].is_forward ==1){//是转发的
                                        res ='--转发-->';
                                        yj+='<p>【'+rs[i].approval_history[k].username+''+res+ ''+rs[i].approval_history[k].forward_username+''//名字
                                                     //意见
                                                +'<em class='+classList+'> ' +rs[i].approval_history[k].approval_time+'</em>】：'//时间
                                                    +rs[i].approval_history[k].content+'</p>'//意见内容
            
                                    }else{//是审批的
                                        if(rs[i].approval_history[k].approval_result==1){
                                            res ="未批准";
                                            classList = 'red';
                                        }else if(rs[i].approval_history[k].approval_result==2){
                                            res ="已批准";
                                            classList = 'green';
                                        }
                                        yj+='<p><span>【'+rs[i].approval_history[k].username +'<em class='+classList+'>'+res+' '+rs[i].approval_history[k].approval_time+'</em>'+'】</span>'+rs[i].approval_history[k].content+'</p>'
                            
                                    };
                                }
                            }
                        }
                        var arr= rs[i].check_in_out_time.split("|");
                        var arrHtml='';
                        for(var k=0;k<arr.length;k++){
                            arrHtml+='<p>'+arr[k]+'</p>'
                        }
                        html+='<table class="layui-table item'+rs[i].id+'">'
                                    +'<colgroup>'
                                       +'<col width="200">'
                                       +'<col width="200">'
                                       +'<col>'
                                    +'</colgroup>'
                                    +'<thead>'
                                        +'<tr>'
                                            +'<th>部门</th>'
                                            +'<th>姓名</th>'
                                            +'<th>补录时间</th>'
                                            +'<th>申请时间</th>'
                                        +'</tr>'
                                    +'</thead>'
                                    +'<tbody>'
                                        +'<tr>'
                                            +'<td>'+rs[i].depatment_name+'</td>'
                                            +'<td>'+rs[i].apply_user_name+'</td>'
                                            +'<td>'+arrHtml+'</td>'
                                            +'<td>'+rs[i].apply_time+'</td>'
                                            
                                        +'</tr>'
                                        +'<tr  class="hoverShow">'
                                            +'<td colspan="6"><div class="reviewComp">'
                                                +'<span>补录原因：</span>'+rs[i].content+''
                                                +'</div><div class="reviewComp">'
                                                +'<span>审批意见：</span>'+yj+''
                                                +'</div><div class="reviewButton tc"><button class="layui-btn" data-user="'+rs[i].apply_user_id+
                                                '" data-dapr="'+rs[i].department_id+
                                                '" data-item="'+rs[i].id+
                                                '" data-step="'+rs[i].next_step+
                                                '" data-type="'+rs[i].approval_type+
                                                '">审核</button></div></td>' 
                                            +'</tr>'
                                        +'</tbody></table>'
                    }
                }  
                $("#danceAppr .reviewCont").html(html);
            }
        })
    }
    //审核弹窗
    var apprPopFun=function(elem,url,furl){
        //选择不同意所需 请勿删除
        var slectHtml=$("#nextDacApp").html();
        $("#approvPop").off("change").on("change","input[name='approvalYn']",function(){
            var vals =$("#approvPop").find(" input[name='approvalYn']:checked").val();
           if(vals ==1){
                $("#nextDacApp").html('<option value="0">无</option>');
           }else{
                $("#nextDacApp").html(slectHtml);
           }
        })

        $("#approvPop .appOk").off("click").on("click",function(){// 接口参数,删除的table item
            var itemID = $(this).attr("data-item");
            var nextApprovalUserID = $("#approvPop #nextDacApp").val();
            var isAgree = $("#approvPop").find(" input[name='approvalYn']:checked").val();
            var content = $("#appDacText").val();
            var nextApprovalStep =$("#approvPop #nextDacApp").attr('data-step');
            if(content==''){
                layer.msg("意见不能为空!");
                return false
            }
            $.fetch({
                url:url,
                type: 'post',
                data:{
                    ItemID:itemID,
                    NextApprovalUserID:nextApprovalUserID,
                    NextApprovalStep:nextApprovalStep,
                    IsAgree:isAgree,
                    Content:content,
                },
                cb:function(rs){
                    layer.closeAll();
                    layer.msg("审批完成");
                    elem.remove();
                }
            })
        })

        $("#okForward").off('click').on("click",function(){// 接口参数,删除的table item
            var itemID = $(this).attr("data-item");
            var ForwardUserID =$("#dacAppForward").val();
            var content = $("#appDacText").val();
            if(content==''){
                layer.msg("意见不能为空!");
                return false
            }
            $.fetch({
                url:furl,
                type: 'post',
                data:{
                    ItemID:itemID,
                    ForwardUserID:ForwardUserID,
                    Content:content,
                },
                cb:function(rs){
                    layer.msg("转交完成");
                    layer.closeAll();
                    elem.remove();
                }
            })
        })
    }
   
    
    

    $("#offSelMember").on("click",function(){
        $("#approvPop").hide();
        $("#approvPop").find('textarea').val("");
    })
    $("#approvPop .appNone").on("click",function(){
        $("#approvPop").hide();
        $("#approvPop").find('textarea').val("");
    })

})
})