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
            ParentId:0,//默认为0
            elem:"#finaTypeList"
        }
       
        var costFormObj=[
            {
                FormType:1
                ,ItemID:''
                ,
            }
        ]
        var financialListHtml =function(list,elem,isThree){//渲染页面 表格方法
            var tables='';
            var html='';
            if(list.length==0){
                html+='<tr><td colspan="10"><div style="text-align:center;">暂无</div></td></tr>'
            }else{
                for(var i = 0;i <list.length;i++){
                    // var appru='';
                    // if(list[i].approval_users&&list[i].approval_users.length>0){
                    //     for(var j = 0;j <list[i].approval_users.length;j++){
                    //         appru+=;
                    //       //  ///console.log(appru)
                    //     }
                    // }
                    html+='<tr>'
                            +'<td class="typeID">'+list[i].id+'</td>'
                            +'<td class="typeCode">'+list[i].code+'</td>'
                            +'<td class="typeName">'+list[i].name+'</td>'
                            +'<td>'+list[i].parent_name+'</td>'      
                            +'<td class="typeSort">'+list[i].sort_index+'</td>'           
                            +'<td data-tid="'+list[i].id+'" data-pid="'+list[i].parent_id+'">'
                            if( tableNowPage.ParentId==0){
                                html+='<button class="childTypeList layui-btn layui-btn-normal layui-btn-sm">子类型</button>'
                                +'<button data-ischid="0"  class="bjType layui-btn layui-btn-warm layui-btn-sm">编辑</button>'
                            }else{
                                html+='<button data-appr=\''+ JSON.stringify(list[i].approval_users)+'\' data-special="'+list[i].is_special+'" data-ischid="1" data-formId="'+list[i].form_page_id+'" class="bjType layui-btn layui-btn-warm layui-btn-sm">编辑</button>'
                                // +'<button class="setForm layui-btn  layui-btn-sm">设置表单</button>'
                            }
                            if(isThree){
                                html+='<button class="moveThree layui-btn layui-btn-normal layui-btn-sm">移动</button>'
                                
                            }
                            html+='<button class="delType layui-btn layui-btn-danger layui-btn-sm">删除</button>'
                            +'</td>'                   
                         '</tr>'
                }
            }
            $(elem).html(html);
        }
        var financialList = function(objs={}){//调用表格数据接口方法
            var objst =objs;
            $.fetch({
                url:"/gateway/financialtype/index",
                type: 'post',
                data:{ParentId:objst.ParentId},
                cb:function(rs){
                    var  list =rs;
                    financialListHtml(list,objst.elem);
                }
            });
        }
        financialList(tableNowPage);//初始化列表数据
        var payTypeFormFun = function(ItemID){
          ////  ///console.log(ItemID);
            if(ItemID!=''){
                $.fetch({
                    url:"/gateway/formtpl/formpage",
                    type: 'post',
                    data:{
                        FormPageID:ItemID,
                    },
                    cb:function(rs){
                        if(rs.form_page!=null){
                            $("#subFinanForm").attr('data-FormId',rs.form_page.id);

                        }
                        var rs = rs.form_template;
                        subFormDatas=[];//切换子类时清空
                        var formTypeFun=function(type,n){
                            var formHtml='';
                            switch (type.component_type){
                                case 'text':
                                    formHtml=' <input type="text" value="'+((type.attr&&type.attr.textVal)?type.attr.textVal:'')+'" name="text_'+n+'" placeholder="请输入" autocomplete="off" class="layui-input">'
                                    
                                break;
                                case 'select':
                                    var arr=type.attr?type.attr.option:[];
                                    formHtml='<select name="select_'+n+'" lay-filter="aihao">';
                                    for(var k=0;k<arr.length;k++){
                                        formHtml+='<option value="'+arr[k]+'">'+arr[k]+'</option>'
                                    }
                                    formHtml+='</select>';
                                break;
                                case 'checkbox':
                                    var arr=type.attr?type.attr.option:[];
                                    for(var k=0;k<arr.length;k++){
                                        formHtml+='<input type="checkbox" name="checkbox_'+n+'" title="'+arr[k]+'" lay-skin="primary">'
                                    }
                                break;
                                case 'radio':
                                    var arr=type.attr?type.attr.option:[];
                                    for(var k=0;k<arr.length;k++){
                                        formHtml+='<input type="radio" name="radio_'+n+'" value="'+arr[k]+'" title="'+arr[k]+'" '+(k==0?'checked':'')+'>'
                                    }
                                break;
                                case 'textarea':
                                    formHtml='<textarea name="textarea_'+n+'" placeholder="请输入内容" class="layui-textarea">'+((type.attr&&type.attr.textVal)?type.attr.textVal:'')+'</textarea>'
                                break;
                                case 'datetime':
                                    formHtml='<input type="text" name="datetime_'+n+'" class="layui-input datetime" id="test_'+n+'">';
                                break;
                            }
                            return formHtml
                        }
                        // var forDataFormFun=function(rs,ors){
                            if(rs&&rs.length>0){
                                var tr='';
                                
                                for(var i=0;i<rs.length;i++){
                                    if(typeof(rs[i].attr)=='string'&&rs[i].attr!=''){
                                        rs[i].attr=JSON.parse(rs[i].attr);
                                    }
                                    subFormDatas.push({
                                        name:rs[i].component_type+'_'+i,
                                        FormTemplateID:rs[i].template_id,
                                        component_type:rs[i].component_type,
                                        label:rs[i].label,
                                    })
                                    tr+='<div class="layui-inline"><label class="layui-form-label">'+ (rs[i].required==0?'<b class="red">*</b>':'')+rs[i].label+'</label><div class="modify-layui layui-input-inline"  >'+ formTypeFun(rs[i],i)+'</div>'+((rs[i].attr&&rs[i].attr.formode)?'<div class="layui-form-mid layui-word-aux">'+rs[i].attr.formode+'</div>':'')+'</div>'
                                }
                                $("#formShow").html('<div class="layui-form"><div class="layui-form-item">'+tr+'</div></div>');
                                    //处理时间控件 
                                $("#formShow").find(".datetime").each(function(){
                                    var tid=$(this).attr("id");
                                    var arrindex =parseInt(tid.split('_')[1]);
                                    var  dateIsRange=false,datetype='date';
                                    if(typeof(rs[arrindex].attr)=='string'){
                                        rs[arrindex].attr=JSON.parse(rs[arrindex].attr);
                                    }
                                    if(rs[arrindex].attr){
                                    dateIsRange= rs[arrindex].attr.dateIsRange==0?'~':false;
                                    datetype= ['date','month','year','datetime'][rs[arrindex].attr.dateFormType];
                                    }
                                    laydate.render({
                                        elem: '#'+tid+'' //指定元素
                                        ,range: dateIsRange 
                                        ,type: datetype
                                    });
                                })
                                form.render();
                            }else{
                                $("#formShow").html('<tr><td><div style="text-align:center;line-height: 36px;">暂无</div></td></tr>');
                            }
                        // }
                    }
                })
            }else{
                $("#formShow").html('<tr><td><div style="text-align:center;line-height: 36px;">暂无</div></td></tr>');
            }
        }
        var addFinaTypes = function(ParentId,el,codes){
            var dis ='',row='',row2='';
            if(ParentId!=0){
                dis='disabled';
                var area=['995px','620px'];
                row='layui-row  layui-col-space15';
                row2='layui-col-xs6 layui-col-sm6 layui-col-md6'

            }else{
                var area=['auto'];
            }
            $.fetch({
                url:"/gateway/financialtype/initaddtype",
                type: 'post',
                data:{ParentId:ParentId},
                cb:function(rs){
                    var processType ='';
                    if(rs.process_type.length>0){
                        for(var i=0;i<rs.process_type.length;i++){
                            var check = ''+rs.process_type[i].code==codes?'checked':'';
                            processType+='<input  type="radio" name="processType" value="'+rs.process_type[i].id+'" title="'+rs.process_type[i].name+'('+rs.process_type[i].code+')" '+check+' '+dis+'>'
                        }
                    }
                    var cont ='<div class="layui-fluid">'
                        +'<div class="layui-card-body">'
                            +'<div  class="'+row+'">'
                                +'<div class="layui-form '+row2+'">'
                                if(rs.parent!=null){
                                    cont+='<div class="layui-form-item">'
                                        +'<label class="layui-form-label">父类型：</label>'
                                        +'<div class="layui-input-inline">'
                                            +'<input  type="text" class="layui-input layui-disabled" value="'+rs.parent.name+'" readonly>'
                                        +'</div>'
                                    +'</div>'
                                }
                                   

                                cont+='<div class="layui-form-item">'
                                        +'<label class="layui-form-label">类型编码：</label>'
                                        +'<div class="layui-input-block">'
                                           +processType
                                        +'</div>'
                                    +'</div>'
                                    +'<div class="layui-form-item">'
                                        +'<label class="layui-form-label">类型名称：</label>'
                                        +'<div class="layui-input-inline">'
                                            +'<input id="typeName" name="typeName" type="text" class="layui-input" value="" lay-verify="required">'
                                        +'</div>'
                                    +'</div>'
                                    if(ParentId!=0){
                                        cont+='<div class="layui-form-item">'
                                                +'<label class="layui-form-label">表单类型：</label>'
                                                +'<div class="layui-input-inline">'
                                                    +'<select name="formList" lay-filter="formList"  id="formList"></select>'
                                                +'</div>'
                                            +'</div>'
                                    }
                                    cont+='<div class="layui-form-item">'
                                        +'<label class="layui-form-label">排序：</label>'
                                        +'<div class="layui-input-inline">'
                                            +'<input id="sortIndex" name="sortIndex" type="text" class="layui-input" value="" lay-verify="required">'
                                        +'</div>'
                                    +'</div>'
                                    if(ParentId!=0){

                                        cont += '<div class="layui-form-item" style="display:none;">'
                                                +'<label class="layui-form-label">特殊类型：</label>'
                                                +'<div class="layui-input-block">'
                                                    +'<input  type="radio" lay-filter="IsSpecial" name="IsSpecial" value="0" title="否" checked>'
                                                    +'<input  type="radio" lay-filter="IsSpecial" name="IsSpecial" value="1" title="是" >'
                                                +'</div>' 
                                            +'</div>'
                                           + '<div class="layui-form-item specialNone">'
                                                +'<label class="layui-form-label">审批人：</label>'
                                                +'<div class="layui-input-block departTable" data-title="">'
                                                    +'<textarea id="userName" name="userName" required lay-verify="required" placeholder="点击添加进行编辑"  readonly="readonly" class="layui-textarea layui-input-inline"></textarea>'
                                                    +'<ul id="appUserList" class="layui-small-static" style="display: none"></ul>'
                                                    +'<a class="addDesc"><i class="iconfont icon-40"></i>添加</a>'
                                                    +'<a class="emptyDesc"><i class="iconfont icon-qingkong"></i>清除</a>'
                                                +'</div>'
                                            +'</div>'
                                    }
                                    cont+='<div class="layui-form-item ">'
                                        +'<button id="subAddType" lay-submit lay-filter="subAddType"  class="layui-btn">确定</button>'
                                        +'<button id="backTypeList" class="layui-btn layui-btn-primary">返回</button>'
                                    +'</div>'
                                +'</div>'
                                if(ParentId!=0){
                                    cont+='<div class="layui-form layui-col-xs6 layui-col-sm6 layui-col-md6" style="height: 470px;"><div style="padding: 0 10px;">表单预览: </div><div id="formShow"  style=" border-left: 1px solid #eee;"></div></div>'
                                }
                            cont+='</div>'
                        +'</div>'
                    +'</div>';
                    layer.open({
                        title:'<i class="iconfont mr-5 icon-leixing"></i>增加类型',
                        type: 1, 
                        content:cont,
                        area: area,
                        success:function(layero,index){

                            form.on('radio(IsSpecial)', function(data){
                                if(data.value==='1'){
                                    $('div.specialNone').hide();
                                    $("#userName").removeAttr('lay-verify')
                                }else if(data.value==='0'){
                                    $("#userName").attr('lay-verify','required')     
                                    $('div.specialNone').show();                    
                                }
                            });  
                            if(ParentId!=0){
                                $.fetch({
                                    url:"/gateway/formtpl/allformpage",
                                    type: 'post',
                                    cb:function(rs){
                                    //    ///console.log(rs)
                                        var op='<option value=" ">暂无</option>';
                                        for(var i=0;i<rs.length;i++){
                                            op+='<option value="'+rs[i].id+'">'+rs[i].name+'</option>'
                                        }
                                        $("#formList").html(op); 
                                        form.render();
                                        payTypeFormFun('');
                                        form.on('select(formList)', function(data){
                                            payTypeFormFun(data.value);
                                        });  
                                    }
                                })
                            }
                            form.render();
                            if($("input[name='processType']:checked").val()==undefined){
                                $("input[name='processType']:first").attr('checked', 'checked');
                            } 
                            form.render();
                            $(".addDesc").on("click",function(){
                                selMemberFun($(this));
                            });
                            $(".emptyDesc").on("click",function(){
                                $(this).siblings("ul").html("");
                                $(this).siblings("ul").attr("data-val","");
                                $(this).siblings(".layui-textarea").html("");
                            })
                            form.on('submit(subAddType)', function(data){
                                var name =$("#typeName").val();
                                var sortIndex =$("#sortIndex").val();
                                                                    
                                if(ParentId==0){
                                var textStr =$("ul#appUserList").attr("data-val");
                                    
                                    var parentId=data.field.processType;
                                    var data={
                                        ParentId:parentId,
                                        Name:name,
                                        SortIndex:sortIndex,
                                        UserID:textStr,
                                    }
                                }else{
                                    var IsSpecial =$("input[name='IsSpecial']:checked").val();
                                    var textStr =IsSpecial==='0'?$("ul#appUserList").attr("data-val"):'';
                                    // var textStr =$("ul#appUserList").attr("data-val");
                                    var parentId= ParentId;
                                    var data={
                                        ParentId:parentId,
                                        Name:name,
                                        SortIndex:sortIndex,
                                        IsSpecial:IsSpecial,
                                        UserID:textStr,
                                        FormPageID:data.field.formList
                                    }
                                }
                               // ///console.log(data)
                                $.fetch({
                                    url:"/gateway/financialtype/addtype",
                                    type: 'post',
                                    data:data,
                                    cb:function(rs){
                                        layer.msg("新建成功");
                                        layer.close(index);
                                        tableNowPage.elem='#'+el;
                                        financialList(tableNowPage);//列表数据
                                    }
                                })
                            })
                            $("#backTypeList").on("click",function(){
                                layer.close(index);
                            })
                        },
                    })
                }
            });
            
        }
        //获取子类型
        $("#finaTypeList").on("click",".childTypeList",function(){
            var tid =$(this).parents("td").attr("data-tid");
            var pid =$(this).parents("td").attr("data-pid");
            var pname =$(this).parents("td").siblings(".typeName").text();
            var pcodes  =$(this).parents("td").siblings(".typeCode").text();
            tableNowPage.ParentId=tid;
            layer.open({
                title:false,
                type: 1, 
                closeBtn:false,
                content:'<div class="layui-fluid">'
                            +'<div class="layui-card">'
                                +'<div class="layui-card-header">'
                                    +'<i class="iconfont mr-5 icon-leixing"></i>'+pname+'的子类型设置'
                                    +'<div class="holidayBatch fr">'
                                        +'<button id="caddtype" data-code="" class="layui-btn layui-btn-normal layui-btn-sm">新增</button>'
                                        +'<button id="cclosetype" data-code="" class="layui-btn layui-btn-normal layui-btn-sm">关闭</button>'
                                    +'</div>'
                                +'</div>'
                                +'<div class="layui-card-body">'
                                    +'<table class="layui-table">'
                                       +'<thead>'
                                            +'<tr>'
                                                +'<th>ID</th>'
                                                +'<th>类型编码</th>'
                                                +'<th>类型名称</th>'
                                                +'<th>上级类型</th>'
                                                +'<th>排序</th>'
                                                +'<th>操作</th>'
                                            +'</tr>'
                                        +'</thead>'
                                        +'<tbody  id="finaTypeList_child"  class="allfinaTypeList">'
                                        +'</tbody></table></div></div></div>',
                area:['85%','85%'],
                success:function(layero,index){
                    tableNowPage.elem='#finaTypeList_child'
                    $.fetch({
                        url:"/gateway/financialtype/index",
                        type: 'post',
                        data:{ParentId:tid},
                        cb:function(rs){
                            var  list =rs;
                            financialListHtml(list,"#finaTypeList_child",true);
                        }
                    });
                    $("#caddtype").on("click",function(){
                        addFinaTypes(tid,'finaTypeList_child',pcodes)
                    })
                    $("#cclosetype").on("click",function(){
                        layer.close(index);
                        tableNowPage.ParentId=0;
                        tableNowPage.elem="#finaTypeList";
                        financialList(tableNowPage);//列表数据
                    })

                },
            })
        })
        $("body").on("click",".bjType",function(){
            var tid =$(this).parents("td").attr("data-tid");
            var pid =$(this).parents("td").attr("data-pid");
            var codes = $(this).parents("td").siblings("td.typeCode").text();
            var typeSort = $(this).parents("td").siblings("td.typeSort").text();
            var name =$(this).parents("td").siblings("td.typeName").text();
            var el =$(this).parents("tbody").attr("id");
            var appruser =$(this).attr("data-appr");
            var isc =$(this).attr("data-ischid");
            var formId=$(this).attr('data-formId');
            var is_special=$(this).attr('data-special');
            
            var cont='';
            var apprHtml ='';
            var html ='',idstr='',nameText='',formS='',row='',row2='';
           
            var area=['auto'];
            if(isc==1){
                if(appruser!=''&&appruser!=undefined){
                    var appruserArr = JSON.parse($(this).attr("data-appr"));
                    for(var i=0;i<appruserArr.length;i++){
                        apprHtml+='<li class="pick" data-user="'+appruserArr[i].id+'">'+appruserArr[i].name+'</li>';
                        if(i>0){
                            idstr+=",";
                        }
                        idstr+=''+appruserArr[i].id+'';
                        nameText+=''+appruserArr[i].name+';';
                    }

                    // $("ul#appUserList").apprHtml(); 
                                // $("ul#appUserList").attr("",);
                                // $('ul#appUserList').siblings(".layui-textarea").apprHtml();
                }
                area=['995px','620px'];
                row='layui-row  layui-col-space15';
                row2='layui-form layui-col-xs6 layui-col-sm6 layui-col-md6'
                cont+='<div class="layui-form-item"  style="display:none;">'
                        +'<label class="layui-form-label">特殊类型：</label>'
                        +'<div class="layui-input-block">'
                            +'<input  type="radio" lay-filter="IsSpecial" name="IsSpecial" value="0" title="否" '+(is_special==="0"?"checked":"")+' >'
                            +'<input  type="radio" lay-filter="IsSpecial" name="IsSpecial" value="1" title="是" '+(is_special==="1"?"checked":"")+'>'
                        +'</div>' 
                    +'</div>'
                    +'<div class="layui-form-item specialNone">'
                    +'<label class="layui-form-label">审批人：</label>'
                    +'<div class="layui-input-block departTable" data-title="">'
                        +'<textarea id="userName" name="userName" required lay-verify="required" placeholder="点击添加进行编辑" readonly="readonly" class="layui-textarea layui-input-inline">'+nameText+'</textarea>'
                        +'<ul id="appUserList" data-val="'+idstr+'" class="layui-small-static" style="display: none">'+ apprHtml+'</ul>'
                        +'<a class="addDesc"><i class="iconfont icon-40"></i>添加</a>'
                        +'<a class="emptyDesc"><i class="iconfont icon-qingkong"></i>清除</a>'
                    +'</div>'
                +'</div>'
                formS='<div class="layui-form layui-col-xs6 layui-col-sm6 layui-col-md6" style="height: 470px;" ><div style="padding: 0 10px;">表单预览: </div><div id="formShow" style=" border-left: 1px solid #eee;"></div></div>'
            }
            $.fetch({
                url:"/gateway/financialtype/initaddtype",
                type: 'post',
                data:{
                    ID:tid,
                    ParentId:pid,
                },
                cb:function(rs){
                    
                    var processType ='';
                    if(rs.process_type.length>0){
                        for(var i=0;i<rs.process_type.length;i++){
                            var check = ''+rs.process_type[i].code==codes?'checked':'';
                            processType+='<input type="radio" name="processType" value="'+rs.process_type[i].id+'" title="'+rs.process_type[i].name+'('+rs.process_type[i].code+')" '+check+' disabled>'
                        }
                    }
                    // rs.current_type.id
                    
                    layer.open({
                        title:'<i class="iconfont mr-5 icon-jiahao"></i>编辑类型',
                        type: 1, 
                        content:'<div class="layui-fluid">'
                                    +'<div class="layui-card-body ">'
                                        +'<div class='+row+'>'
                                            +'<div class="layui-form '+row2+'">'
                                                +'<div class="layui-form-item">'
                                                    +'<label class="layui-form-label">父类型：</label>'
                                                    +'<div class="layui-input-inline">'
                                                        +'<input  type="text" class="layui-input layui-disabled" value="'+rs.parent.name+'" readonly>'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-form-item">'
                                                    +'<label class="layui-form-label">类型编码：</label>'
                                                    +'<div class="layui-input-block">'
                                                        +processType
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-form-item">'
                                                    +'<label class="layui-form-label">类型名称：</label>'
                                                    +'<div class="layui-input-inline">'
                                                        +'<input id="typeName" type="text" class="layui-input" value="'+name+'">'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-form-item">'
                                                    +'<label class="layui-form-label">表单类型：</label>'
                                                    +'<div class="layui-input-inline">'
                                                        +'<select name="formList" lay-filter="formList"  id="formList"></select>'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-form-item">'
                                                    +'<label class="layui-form-label">排序：</label>'
                                                    +'<div class="layui-input-inline">'
                                                        +'<input id="sortIndex" type="text" class="layui-input" value="'+typeSort+'">'
                                                    +'</div>'
                                                +'</div>'
                                                +cont
                                                +'<div class="layui-form-item ">'
                                                    +'<button id="subBjType"  lay-submit lay-filter="subBjType"   class="layui-btn">确定</button>'
                                                    +'<button id="backTypeList" class="layui-btn layui-btn-primary">返回</button>'
                                                +'</div>'
                                            +'</div>'
                                            
                                            +formS
                                        +'</div>'
                                    +'</div>'
                                +'</div>',
                        area:area,
                        success:function(layero,index){
                                form.on('radio(IsSpecial)', function(data){
                                    if(data.value==='1'){
                                        $('.specialNone').hide();
                                        $("#userName").removeAttr('lay-verify');
                                    }else if(data.value==='0'){
                                        $("#userName").attr('lay-verify','required');                                    
                                        $('.specialNone').show();                                
                                    }
                                }); 
                                if(is_special==='1'){
                                    $('.specialNone').hide();     
                                    $("#userName").removeAttr('lay-verify')   ;                                                                
                                }else if(is_special==='0'){
                                    $('.specialNone').show();   
                                    $("#userName").attr('lay-verify','required');
                                }
                            if(isc==1){
                                $(".addDesc").on("click",function(){
                                    selMemberFun($(this));
                                });
                                $(".emptyDesc").on("click",function(){
                                    $(this).siblings("ul").html("");
                                    $(this).siblings("ul").attr("data-val","");
                                    $(this).siblings(".layui-textarea").html("");
                                })
                                $.fetch({
                                    url:"/gateway/formtpl/allformpage",
                                    type: 'post',
                                    cb:function(rs){
                                      //  ///console.log(rs)
                                        var op='<option value="0">暂无</option>';
                                        for(var i=0;i<rs.length;i++){
                                            op+='<option value="'+rs[i].id+'">'+rs[i].name+'</option>'
                                        }
                                        $("#formList").html(op);  
                                      //  ///console.log(formId)
                                        $("#formList").val(formId);
                                        payTypeFormFun(formId);
                                        form.render();
                                    }
                                })
                                form.on('select(formList)', function(data){
                                    payTypeFormFun(data.value);
                                });  
                            }
                            form.render();
                            // $("#subBjType").on("click",function(){
                            form.on('submit(subBjType)',function(){
                                var name =$("#typeName").val();
                                var sortIndex =$("#sortIndex").val();
                                var textStr =$("ul#appUserList").attr("data-val");
                                if(isc==1){
                                    var IsSpecial =$("input[name='IsSpecial']:checked").val();
                                    var textStr =IsSpecial==='0'?$("ul#appUserList").attr("data-val"):'';
                                    
                                    var formIds =$("#formList").val();
                                    formIds=formIds==0?'':formIds;
                                    var data={
                                        ID:tid,
                                        Name:name,
                                        IsSpecial:IsSpecial,
                                        SortIndex:sortIndex,
                                        UserID:textStr,
                                        FormPageID:formIds,
                                    }
                                }else{
                                    var textStr =$("ul#appUserList").attr("data-val");
                                    var data={
                                        ID:tid,
                                        Name:name,
                                        SortIndex:sortIndex,
                                        UserID:textStr,
                                    }
                                }
                                $.fetch({
                                    url:"/gateway/financialtype/updatetype",
                                    type: 'post',
                                    data:data,
                                    cb:function(rs){
                                        layer.msg("编辑成功");
                                        layer.close(index);
                                        tableNowPage.elem='#'+el;
                                        financialList(tableNowPage);//列表数据
                                        
                                    }
                                })
                            })
                            $("#backTypeList").on("click",function(){
                                layer.close(index);
                            })
                        },  
        
                    })
                }
            });
        })
        $("#paddtype").on("click",function(){
            addFinaTypes(0,'finaTypeList');
        })
        $("body").on("click",".delType",function(){
            var tid =$(this).parents("td").attr("data-tid");
            layer.confirm('确定删除?',{"title":" "},function(index){
                layer.close(index);
                $.fetch({
                    url:"/gateway/financialtype/deltype",
                    type: 'post',
                    data:{
                        ID:tid,
                    },
                    cb:function(rs){
                        financialList(tableNowPage);//列表数据
                    }
                });
            })
        })
        $("body").on("click",".moveThree",function(){
            var tid =$(this).parents("td").attr("data-tid");
            var pid =$(this).parents("td").attr("data-pid");
            $.fetch({
                url:"/gateway/financialtype/initaddtype",
                type: 'post',
                data:{
                    ID:tid,
                    ParentId:pid,
                },
                cb:function(rs){
                    ///console.log(rs)
                    for(key in rs.process_type){
                        if(rs.current_type.code==rs.process_type[key].code){
                            var oneTypeId=rs.process_type[key].id;
                        }
                    }
                    layer.open({
                        title:'移动',
                        type: 1, 
                        content:'<div class="layui-fluid">'
                                    +'<div class="layui-card-body">'
                                        +'<div>'
                                            +'<div class="layui-form">'
                                                +'<div class="layui-form-item">'
                                                    +'<label class="layui-form-label">类型名称：</label>'
                                                    +'<div class="layui-input-inline" style="padding:7px 0px;">'+rs.current_type.name
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-form-item">'
                                                    +'<label class="layui-form-label">父类型：</label>'
                                                    +'<div class="layui-input-inline" style="padding:7px 0px;">'+rs.parent.name
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-form-item">'
                                                    +'<label class="layui-form-label">移动到：</label>'
                                                    +'<div class="layui-input-inline">'
                                                        +' <select class="remoToType" name="remoToType" lay-filter="remoToType" id="remoToType"></select>'  
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="layui-form-item ">'
                                                    +'<button id="subBjTypes"  lay-submit lay-filter="subBjTypes"   class="layui-btn">确定</button>'
                                                    +'<button id="backTypeList" class="layui-btn layui-btn-primary">返回</button>'
                                                +'</div>'
                                            +'</div>'
                                        
                                        +'</div>'
                                    +'</div>'
                                +'</div>',
                        area:['50%','80%'],
                        success:function(layero,index){
                            // oneTypeId
                            $.fetch({
                                url:"/gateway/financialtype/subtypes",
                                type: 'post',
                                data:{
                                    pid:oneTypeId,
                                },
                                cb:function(rs){
                                    ///console.log(rs);
                                    if(rs&&rs.length>0){
                                        var opHtml=''
                                        for(var i=0;i<rs.length;i++){
                                            opHtml+='<option value="'+rs[i].id+'">'+rs[i].name+'</option>'
                                        }
                                    }
                                    $("#remoToType").html(opHtml);
                                    form.render();
                                }
                            })
                            $("#subBjTypes").on("click",function(){
                                var ParentID=$("#remoToType").val();
                                $.fetch({
                                    url:"/gateway/financialtype/move",
                                    type: 'post',
                                    data:{
                                        ID:tid,
                                        ParentID:ParentID,
                                    },
                                    cb:function(rs){
                                        layer.msg('保存成功');
                                        layer.close(index);
                                    }
                                })
                            })
                            $("#backTypeList").on('click',function(){
                                layer.close(index);
                                
                            })
                        },
                        end:function(){//移动后列表刷新
                            $.fetch({
                                url:"/gateway/financialtype/index",
                                type: 'post',
                                data:{ParentId:pid},
                                cb:function(rs){
                                    var  list =rs;
                                    financialListHtml(list,"#finaTypeList_child",true);
                                }
                            });
                        }
                    })
                }
            })
        })
    })
})