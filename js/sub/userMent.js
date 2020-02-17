
$(function(){
    layui.config({
        version: 20181219,
		base: '../../../layui/' //静态资源所在路径
	}).extend({
		index: 'index' //主入口模块
	}).use(['index','form','laydate','laypage','table','dtree','formSelects'], function(){
        var $ = layui.$
        ,admin = layui.admin
        ,element = layui.element
        ,dtree = layui.dtree
        ,form = layui.form
        ,laypage=layui.laypage
        ,table=layui.table
        ,formSelects=layui.formSelects
        ,router = layui.router();
        element.render();
        element.on('tab(component-tabs-brief)', function(obj){});
        form.verify({
            pass: [
                /^[\S]{6,16}$/
                ,'密码必须6到16位，且不能出现空格'
            ] 
        })
        
        var isCompny=$(".depart").attr("data-iscomp")=="1"?true:false;
       
        var tableIndex = table.render({
            elem: '#allUserTb'
            ,url: window.urls+"/gateway/user/list"
            // ,limit:10
            ,method:'post'
            ,contentType: 'application/json'
            ,page:true
            ,loading:true
            ,limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000]
            ,toolbar:'<div style="padding-bottom: 10px;">'
                        +'<button id="newPareUser" class="layui-btn layuiadmin-btn-role" data-type="add" lay-event="newPareUser">新建用户</button>'
                        +'<button id="delSleUser" class="layui-btn layuiadmin-btn-role" data-type="batchdel" lay-event="delSleUser">删除</button>'
                        // +'<div class="layui-inline ml-5" id="searchUser">'
                        // +   ' <input type="text" class="layui-input layui-input-search layui-input-75" placeholder="请输入用户名进行搜索" />'
                        // +    '<i class="iconfont icon-sousuo layui-btn" style="vertical-align: initial;" lay-event="sousuo"></i>'
                        // +'</div>'
                    +'</div>'
            ,cols:  [[ //标题栏
                {type:'checkbox'}
                ,{field: 'id', title: '用户ID',width:80}
                ,{field: 'machine_uid', title:'考勤编号',minWidth:100}
                ,{field: 'name', title: '用户名',minWidth:120}
                ,{field: 'company_name', title: '公司',minWidth:120}
                ,{field: 'one_level_dept_name', title: '一级部门',sort: true ,minWidth:120}
                ,{field: 'department_name', title: '直接部门',sort: true,minWidth:120 }
                ,{field: 'title_name', title: '岗位',sort: true,minWidth:120 }
                ,{field: 'role_name', title: '角色',sort: true,minWidth:120 }
                ,{fixed: 'right'
                    ,title:'操作'
                    // ,width:150
                    ,toolbar:'#allUserTbTool'
                    ,minWidth:150
                }
            ]]
            ,height: 'full-325' //高度最大化减去差值
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
            ,done:function(res, curr, count){
                $(window).resize();
                //添加总人数
                // $("#searchUser input").val(this.where.userName);
                // $("#partUsersNum").html(' 总人数('+ count+' 人)')
                
            }
            
            //,…… //其他参数
        });

        //编辑
        var slecTree=function(o,elem){//生成 下拉
            var html ='';
            var ss='';
            function forTree(o,jj){
                jj+='　';
                var nn=jj;
                for(var i=0; i<o.length; i++){
                    if(o[i].children&&o[i].children.length>0){
                        html+='<option class="levNext_'+o[i].children.length+'" value="'+o[i].id+'">'+jj+''+o[i].name+'</option>'
                        forTree(o[i].children,jj);
                    }else{
                        html+='<option value="'+o[i].id+'">'+nn+''+o[i].name+'</option>'
                    }
                }
            }
            forTree(o,ss);
            html+='<option value="0">暂无</option>'
            elem.html(html);
        }

        table.on('tool(allUserTb)', function(obj){ //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="allUserTb"
            var tdata = obj.data; //获得当前行数据
            var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            var tr = obj.tr;
            var  uid = obj.data.id;
            if(layEvent === 'editUserClick'){ //问题管理
           
                var bjHtml='<div class="tab-pane active layui-form pr-40 mt-10" id="partUserForm" lay-filter="part-User">'
                                +'<div class="layui-form-item">'
                                    +'<label class="layui-form-label modify-layui-label">用户名</label>'
                                    +'<div class="layui-input-block">'
                                        +'<input id="part_user" disabled type="text" name="part_user" class="layui-input layui-disabled" placeholder="用户名">'
                                    +'</div>'
                                +'</div>'
                                +'<div class="layui-form-item">'
                                    +'<label class="layui-form-label modify-layui-label">考勤编号</label>'
                                    +'<div class="layui-input-block">'
                                        +'<input id="machine_uid"  type="text" name="machine_uid" class="layui-input" placeholder="">'
                                    +'</div>'
                                +'</div>'
                                if(isCompny){
                                    bjHtml+='<div class="layui-form-item">'
                                                +'<label class="layui-form-label modify-layui-label">所在部门</label>'
                                                +'<div class="layui-input-block MaxHeight">'
                                                    +'<select id="partUser_grp" name="partUser_grp"></select>'
                                                +'</div>'
                                            +'</div>'
                                            +'<div class="layui-form-item">'
                                                +'<label class="layui-form-label modify-layui-label">岗位名称</label>'
                                                +'<div class="layui-input-block MaxHeight">'
                                                    +'<select id="jobTitle" name="jobTitle"></select>'
                                                +'</div>'
                                            +'</div>'
                                        
                                }
                                bjHtml+='<div class="layui-form-item">'
                                    +'<label class="layui-form-label modify-layui-label">角色名称</label>'
                                    +'<div class="layui-input-block MaxHeight">'
                                        +'<select id="parUser_role" name="parUser_role"></select>'
                                    +'</div>'
                                +'</div>'
                                if(isCompny){
                                    bjHtml+='<div class="layui-form-item">'
                                        +'<label class="layui-form-label">显示在<br>组织架构</label>'
                                        +'<div class="layui-input-block">'
                                            +'<input type="radio" lay-filter="isOrgShow" name="isOrgShow" value="1" title="是" checked>'
                                            +'<input type="radio" lay-filter="isOrgShow" name="isOrgShow" value="0" title="否">'
                                        +'</div>'
                                    +'</div>'
                                }
                            
                                bjHtml+='<div class="layui-form-item">'
                                    +'<div class="layui-input-block">'
                                        +'<button id="subMitParForm"  class="layui-btn" lay-filter="UserModify">提交</button>'
                                        +'<button id="ParFormBack" class="layui-btn layui-btn-primary">取消</button>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                            if(isCompny){
                                var sub={
                                    userId:uid,
                                }
                            }else{
                                var sub={
                                    userId:uid,
                                    companyId:tdata.company_id,
                                }
                            }
                            //console.log(tdata.company_id)
                $.fetch({//获取当前用户详情
                    url: "/gateway/user/detail",
                    type: 'post',
                    data:sub,
                    cb:function(rs){
                        var drs =rs;
                        layer.open({
                            title:'用户编辑',
                            content:bjHtml,
                            area:['360px','560px'],
                            btn:'',
                            type:1,                        
                            success:function(layero, index){
                                layer.closeAll('loading');
                                form.val("part-User", {
                                    "part_user":drs.name,
                                    "machine_uid":drs.machine_uid,
                                })
                                if(drs.is_org_show==0){
                                    $('input[name="isOrgShow"][value=0]').prop('checked',true);
                                    $('input[name="isOrgShow"][value=1]').removeAttr('checked');
                                    form.render('radio'); 
                                    
                                }else{
                                    $('input[name="isOrgShow"][value=1]').prop('checked',true);
                                    $('input[name="isOrgShow"][value=0]').removeAttr('checked');
                                    form.render('radio'); 
                                    
                                }
                                form.render();
                                $.fetch({//刷新公司列表 并设置默认值
                                    url: "/gateway/department/tree",
                                    type: 'post',
                                    cb:function(rs){
                                        var depatmetsle=rs;
                                        var obj = depatmetsle[0].children[0].children;
                                        slecTree(obj,$("#partUser_grp"));
                                        form.val("part-User", {
                                            "partUser_grp":drs.department_id
                                        })
                                        form.render('select');
                                    }
                                })
                                $.fetch({
                                    url: "/gateway/role/list",
                                    type: 'post',
                                    cb:function(rs){
                                        roleList =rs;
                                        slecTree(rs,$("#parUser_role"));
                                        form.val("part-User", {
                                            "parUser_role": drs.role_id
                                        })
                                        form.render('select');
                                    }
                                })
                                if(isCompny){
                                    $.fetch({
                                        url: "/gateway/jobTitle/tree",
                                        type: 'post',
                                        cb:function(rs){
                                            var html ='';
                                            var ss='';
                                            function forTree(o,jj){
                                                jj+='　';
                                                var nn=jj;
                                                for(var i=0; i<o.length; i++){
                                                    if(o[i].children&&o[i].children.length>0){
                                                        html+='<option class="levNext_'+o[i].children.length+'" value="'+o[i].id+'">'+jj+''+o[i].title_name+'</option>'
                                                        forTree(o[i].children,jj);
                                                    }else{
                                                        html+='<option value="'+o[i].id+'">'+nn+''+o[i].title_name+'</option>'
                                                    }
                                                }
                                            }
                                            forTree(rs,ss);
                                            html+='<option value="">暂无</option>'
                                            // html+='<option value="0"></option>'
                                            $("#jobTitle").html(html);
                                            form.val("part-User", {
                                                "jobTitle": drs.job_title_id
                                            })
                                            form.render('select');
                                        }
                                    })
                                }
                                $("#subMitParForm").on("click",function(){
                                    var grpId = $("#partUser_grp").val();//部门
                                    var roleId=$("#parUser_role").val();
                                    var titleId=$("#jobTitle").val();
                                    var machineUid =$("#machine_uid").val();
                                    var isOrgShow =$("input[name='isOrgShow']:checked").val();
                                    
                                   
                                    if(isCompny){
                                        var pra ={
                                            userId:drs.id,
                                            roleId:roleId,
                                            departmentId:grpId,
                                            titleId:titleId,
                                            machineUid:machineUid,
                                            isOrgShow:isOrgShow,
                                        }
                                    }else{
                                        var pra ={
                                            userId:drs.id,
                                            roleId:roleId,
                                            departmentId:grpId,
                                            titleId:titleId,
                                            machineUid:machineUid,
                                            isOrgShow:0
                                        }
                                    }
                                    $.fetch({
                                        url: "/gateway/user/update",
                                        type: 'post',
                                        data: pra,
                                        cb:function(rs){
                                            tableIndex.reload({page: {
                                                curr: 1 //重新从第 1 页开始
                                              }});
                                            layer.close(index);
                                            layer.msg('修改成功');
                                        }
                                    })
                                })
                                $("#ParFormBack").on("click",function(){
                                    layer.close(index);
                                })
                            }

                        })
                        
                    }
                })
            } else if(layEvent === 'editUserPass'){ //修改密码
                var uname= obj.data.name;
                
                // layer.load(1);
                var bjHtml='<div class="tab-pane active layui-form pr-40 mt-10" id="partUserForm" lay-filter="part-User">'
                                +'<div class="layui-form-item">'
                                    +'<label class="layui-form-label modify-layui-label">用户名</label>'
                                    +'<div class="layui-input-block">'
                                        +'<input id="part_user" disabled type="text" name="part_user" value="'+uname+'" class="layui-input layui-disabled" placeholder="">'
                                    +'</div>'
                                +'</div>'
                                +'<div class="layui-form-item">'
                                    +'<label class="layui-form-label modify-layui-label">密码</label>'
                                    +'<div class="layui-input-block">'
                                        +'<input lay-verify="pass" id="part_password" type="password" name="part_password"  class="layui-input" placeholder="密码长度为6~16位">'
                                    +'</div>'
                                +'</div>'
                                +'<div class="layui-form-item">'
                                    +'<label class="layui-form-label modify-layui-label">重复密码</label>'
                                    +'<div class="layui-input-block">'
                                        +'<input lay-verify="pass" id="part_cpassword" type="password" name="part_password"  class="layui-input" placeholder="密码长度为6~16位">'
                                    +'</div>'
                                +'</div>'
                                +'<div class="layui-form-item">'
                                    +'<div class="layui-input-block">'
                                        +'<button id="subMitParForm" lay-submit  class="layui-btn" lay-filter="UserModify">提交</button>'
                                        +'<button id="ParFormBack" class="layui-btn layui-btn-primary">取消</button>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                    var index = layer.open({
                            title:'重设密码',
                            content:bjHtml,
                            area:['auto'],
                            btn:'',
                            type:1,                        
                            success:function(layero, index){
                                layer.closeAll('loading');
                                form.render();
                                form.on('submit(UserModify)', function(data){
                                    var psword = $("#part_password").val();
                                    var tpsword = $("#part_cpassword").val();
                                    var pra ={
                                        userId:uid,
                                        password:psword,
                                        password_confirmation:tpsword,
                                    }
                                    $.fetch({
                                        url: "/gateway/password/update",
                                        type: 'post',
                                        data: pra,
                                        cb:function(rs){
                                            layer.msg('修改成功');
                                            tableIndex.reload({page: {
                                                curr: 1 //重新从第 1 页开始
                                              }});
                                            layer.close(index);
                                        }
                                    })
                                })
                                $("#ParFormBack").on("click",function(){
                                    layer.close(index);
                                })
                            }
    
                        })
            }
        })
        
        table.on('toolbar(allUserTb)', function(obj){
            var checkStatus = table.checkStatus(obj.config.id);
            switch(obj.event){
              case 'newPareUser':
                var bjHtml='<div class="tab-pane active layui-form pr-40 mt-10" id="partUserForm" lay-filter="part-User">'
                +'<div class="layui-form-item">'
                    +'<label class="layui-form-label modify-layui-label">用户名</label>'
                    +'<div class="layui-input-block">'
                        +'<input id="part_user" lay-verify="required"  type="text" name="part_user" class="layui-input " placeholder="用户名">'
                    +'</div>'
                +'</div>'
                +'<div class="layui-form-item">'
                    +'<label class="layui-form-label modify-layui-label">密码</label>'
                    +'<div class="layui-input-block">'
                        +'<input lay-verify="pass" id="part_password" type="password" name="part_password"  class="layui-input" placeholder="密码长度为6~16位">'
                    +'</div>'
                +'</div>'
                +'<div class="layui-form-item">'
                    +'<label class="layui-form-label modify-layui-label">重复密码</label>'
                    +'<div class="layui-input-block">'
                        +'<input lay-verify="pass" id="part_cpassword" type="password" name="part_password"  class="layui-input" placeholder="密码长度为6~16位">'
                    +'</div>'
                +'</div>'
                if(isCompny){
                    bjHtml+='<div class="layui-form-item">'
                            +'<label class="layui-form-label modify-layui-label">所在部门</label>'
                            +'<div class="layui-input-block MaxHeight">'
                                +'<select id="partUser_grp" name="partUser_grp"></select>'
                            +'</div>'
                        +'</div>'
                        +'<div class="layui-form-item">'
                            +'<label class="layui-form-label modify-layui-label">岗位名称</label>'
                            +'<div class="layui-input-block MaxHeight">'
                                +'<select id="jobTitle" name="jobTitle"></select>'
                            +'</div>'
                        +'</div>'
                }
                bjHtml+='<div class="layui-form-item">'
                    +'<label class="layui-form-label modify-layui-label">角色名称</label>'
                    +'<div class="layui-input-block MaxHeight">'
                        +'<select id="parUser_role" name="parUser_role"></select>'
                    +'</div>'
                +'</div>'
                if(isCompny){
                    bjHtml+='<div class="layui-form-item">'
							+'<label class="layui-form-label">显示在<br>组织架构</label>'
							+'<div class="layui-input-block">'
								+'<input type="radio" lay-filter="isOrgShow" name="isOrgShow" value="1" title="是" checked>'
								+'<input type="radio" lay-filter="isOrgShow" name="isOrgShow" value="0" title="否">'
							+'</div>'
                    +'</div>'
                }
                bjHtml+='<div class="layui-form-item">'
                    +'<div class="layui-input-block">'
                        +'<button id="subMitParForm" lay-submit class="layui-btn" lay-filter="UserModify">提交</button>'
                        +'<button id="ParFormBack" class="layui-btn layui-btn-primary">取消</button>'
                    +'</div>'
                +'</div>'
            +'</div>'
            var index=layer.open({
                    title:'新增用户',
                    content:bjHtml,
                    area:['365px','560px'],
                    btn:'',
                    type:1,
                    success:function(layero, index){
                        layer.closeAll('loading');
                        form.render();
                        $.fetch({//刷新公司列表 并设置默认值
                            url: "/gateway/department/tree",
                            type: 'post',
                            cb:function(rs){
                                var depatmetsle=rs;
                                var obj = depatmetsle[0].children[0].children;
                                slecTree(obj,$("#partUser_grp"));
                                form.render('select');
                            }
                        })
                        $.fetch({
                            url: "/gateway/role/list",
                            type: 'post',
                            cb:function(rs){
                                roleList =rs;
                                slecTree(rs,$("#parUser_role"));
                                form.render('select');
                            }
                        })
                        if(isCompny){
                            $.fetch({
                                url: "/gateway/jobTitle/tree",
                                type: 'post',
                                cb:function(rs){
                                    var html ='';
                                    var ss='';
                                    function forTree(o,jj){
                                        jj+='　';
                                        var nn=jj;
                                        for(var i=0; i<o.length; i++){
                                            if(o[i].children&&o[i].children.length>0){
                                                html+='<option class="levNext_'+o[i].children.length+'" value="'+o[i].id+'">'+jj+''+o[i].title_name+'</option>'
                                                forTree(o[i].children,jj);
                                            }else{
                                                html+='<option value="'+o[i].id+'">'+nn+''+o[i].title_name+'</option>'
                                            }
                                        }
                                    }
                                    forTree(rs,ss);
                                    html+='<option value="">暂无</option>'
                                    // html+='<option value="0"></option>'
                                    $("#jobTitle").html(html);
                                    // form.val("part-User", {
                                    //     "jobTitle": rs.job_title_id
                                    // })
                                    form.render('select');
                                }
                            })
                        }
                        form.on('submit(UserModify)', function(data){
                            var uname = $("#part_user").val();
                            var grpId = $("#partUser_grp").val();//部门
                            var roleId=$("#parUser_role").val();
                            var psword = $("#part_password").val();
                            var tpsword = $("#part_cpassword").val();
                            var titleId=$("#jobTitle").val();
                            var isOrgShow =$("input[name='isOrgShow']:checked").val();
                            if(isCompny){
                                var grpId = $("#partUser_grp").val();//部门 
                                var pra ={
                                    name:uname,
                                    password:psword,
                                    password_confirmation:tpsword,
                                    roleId:roleId,
                                    departmentId:grpId,
                                    titleId:titleId,
                                    isOrgShow:isOrgShow
                                }
                            }else{
                                var pra ={
                                    name:uname,
                                    password:psword,
                                    password_confirmation:tpsword,
                                    roleId:roleId,
                                    isOrgShow:0
                                }
                            }
                            $.fetch({
                                url: "/gateway/user/create",
                                type: 'post',
                                data: pra,
                                cb:function(rs){
                                    tableIndex.reload({page: {
                                        curr: 1 //重新从第 1 页开始
                                    }});
                                    layer.msg('新建成功');
                                    layer.close(index);
                                }
                            })
                            return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
                        });
                        $("#ParFormBack").on("click",function(){
                            layer.close(index);
                        })
                    }

            })
              break;
              case 'delSleUser':
                var deldata = checkStatus.data;
                var delArr=[];
              
                if(deldata.length==0){
                    layer.msg('无选中用户');
                    return false
                }else{
                    for(var i=0;i<deldata.length;i++ ){
                        delArr.push(deldata[i].id);   
                    };
                    userids=delArr.join(",");
                    layer.confirm('确定删除所选用户吗?',{"title":" "},function(index){
                        layer.close(index);
                        layer.msg('正在删除',{icon:16})
                        $.fetch({
                            url: "/gateway/user/delete",
                            type: 'post',
                            data: {
                                userId: userids,
                            },
                            cb:function(rs){
                                tableIndex.reload({page: {
                                    curr: 1 //重新从第 1 页开始
                                }});
                                layer.msg('删除成功',{icon:1});
                            }
                        })
                    })
                }
              break;
            };
          });

          $("#searchUser>i.icon-sousuo").on("click",function(){
            var searName = $("#searchUser .layui-input-search").val();
            var departmentId = formSelects.value('departmentId'); 
            var roleId = formSelects.value('roleId'); 
            ////console.log(departmentId)
            var arrDep=[],subDpr;
            var arrRole=[],subRole;
            if(departmentId.length>0){
                for(var i =0;i<departmentId.length;i++){
                    arrDep.push(departmentId[i].id);
                }
                subDpr=arrDep.join(',');

            }else{
                subDpr='';
            }
            if(roleId.length>0){
                for(var i =0;i<roleId.length;i++){
                    arrRole.push(roleId[i].id);
                }
                subRole=arrRole.join(',');

            }else{
                subRole='';
            }
            tableIndex.reload({
                where: {
                    userName:searName,
                    departmentId:subDpr,
                    roleId:subRole,
                }
                ,page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
            $("#backUser").css("display", "inline-block");

          })
          $("#backUser").on("click",function(){
            tableIndex.reload({
                where: {
                    userName: '',
                },
                page: {
                    curr: 1 //重新从第 1 页开始
                }
            });
            $("#searchUser .layui-input-search").val('');
            $("#backUser").hide();

          })
        // formHtmlFun(); //初始化
        dtree.render({
            elem: "#browser1",
            url: urls + '/gateway/department/tree',
            type: 'post',
            response: {
                statusName: 'status_code',
                statusCode: 200,
                message: "message",
                rootName: "data",
                parentId: "parent_id",
                childName: "children",
                nodeId: "id", //节点ID
                title: "name",
                treeId: "node_id",
                basicData: 'data',
            },
            firstIconArray: {
                "0": {
                    "open": "icon-set-sm1",
                    "close": "icon-favor"
                }
            }, //用户自定义一级图标集合，node
            nodeIconArray: {
                "0": {
                    "open": "icon-shuye1",
                    "close": "icon-wenjianjiazhankai"
                }
            }, //用户自定义二级级图标集合，node
            dataStyle: "layuiStyle",
            done: function(data, obj){  
                $("#browser1").find('div.nav-tree-div').each(function () {
                    // console.log($(this).attr("data-basic"))
                    var basicData = $(this).attr("data-basic") ? JSON.parse($(this).attr("data-basic")) : '';
                    if (basicData.user_count) {
                        $(this).find("cite").append('(' + basicData.user_count + '人)');
                    }
                    if (basicData.title_name) {
                        $(this).find("cite").append('(' + basicData.title_name + ')');
                    }
                })
                $("#browser1").find('li[data-index="1"]>div.nav-tree-div').attr('d-click', '');
                $("#browser1").find('li[data-index="2"]>div.nav-tree-div').attr('d-click', '');
            }
        });
        // 点击节点触发回调
        var slectDeparFun=function(dpid){
            $.fetch({//部门树列表
                url: "/gateway/department/tree",
                type: 'post',
                cb:function(rs){
                    var rsArr=rs[0].children,formSelectsArr=[];  
                    if(rsArr&&rsArr.length>0){   
                        if(dpid&&dpid!='all'){               
                            for(var i =0;i<rsArr.length;i++){
                                if(dpid == rsArr[i].id){
                                    formSelectsArr=(rsArr[i].children&&rsArr[i].children.length>0)?rsArr[i].children:[];//"type": "optgroup"
                                } 
                            }
                        }else if(dpid==null){
                            formSelectsArr=rsArr[0].children;
                        }else if(dpid=='all'){
                            // //console.log(rsArr[i].level)
                            var optRsArr=[];
                            for(var i =0;i<rsArr.length;i++){
                                if(rsArr[i].level==2){
                                    rsArr[i]["type"]= "optgroup";
                                    // rsArr[i]["disabled"]= "disabled";
                                    optRsArr.push(rsArr[i]);
                                    Array.prototype.push.apply(optRsArr, rsArr[i].children);
                                    
                                }
                            }
                            formSelectsArr=optRsArr;
                        }
                    }
                    // if(formSelectsArr.length>0){
                    //     formSelectsArr.unshift({'name':'全部','id':'-1'});
                    // }else{
                    //     formSelectsArr=[{'name':'全部','id':'-1'}];                           
                    // }
                    formSelects.config('departmentId', {
                        keyName: 'name',
                        keyVal: 'id'
                    })
                    layui.formSelects.data('departmentId', 'local', {
                        checked: true,
                        arr:formSelectsArr
                    });
                }
            });
            $.fetch({//部门树列表
                url: "/gateway/role/tree",
                type: 'post',
                cb:function(rs){
                    var rsArr=rs[0].children,formSelectsArr=[];  
                    if(rsArr&&rsArr.length>0){   
                        if(dpid&&dpid!='all'){               
                            for(var i =0;i<rsArr.length;i++){
                                if(dpid == rsArr[i].id){
                                    formSelectsArr=(rsArr[i].children&&rsArr[i].children.length>0)?rsArr[i].children:[];//"type": "optgroup"
                                } 
                            }
                        }else if(dpid==null){
                            formSelectsArr=rsArr[0].children;
                        }else if(dpid=='all'){
                            // //console.log(rsArr[i].level)
                            var optRsArr=[];
                            for(var i =0;i<rsArr.length;i++){
                                if(rsArr[i].level==2){
                                    rsArr[i]["type"]= "optgroup";
                                    // rsArr[i]["disabled"]= "disabled";
                                    optRsArr.push(rsArr[i]);
                                    Array.prototype.push.apply(optRsArr, rsArr[i].children);
                                    
                                }
                            }
                            formSelectsArr=optRsArr;
                        }
                    }
                    // if(formSelectsArr.length>0){
                    //     formSelectsArr.unshift({'name':'全部','id':'-1'});
                    // }else{
                    //     formSelectsArr=[{'name':'全部','id':'-1'}];                           
                    // }
                    formSelects.config('roleId', {
                        keyName: 'name',
                        keyVal: 'id'
                    })
                    layui.formSelects.data('roleId', 'local', {
                        checked: true,
                        arr:formSelectsArr
                    });
                }
            });
        }
        slectDeparFun(null);
        var browser1 =dtree.on("node('browser1')", function (param) {
            if(param.level==1&&param.basicData==undefined){
                //console.log(param.level)
                slectDeparFun('all');
                // return false;
            }else{
                var thisCopmNode=$(this).parents("li[data-index='2']").children('div').attr("data-basic");
                
                var paramObj = JSON.parse(param.basicData);
                // var aaa = dtree.getNowParam('browser1',thisCopmNode);
                if (param.node_id > 10000000) {
                    tableIndex.reload({
                        where: {
                            companyId:  paramObj.company_id,
                            departmentId:'',
                        }
                        ,page: {
                            curr: 1 //重新从第 1 页开始
                        }
                    });
                    //部门下拉
                    slectDeparFun(paramObj.company_id)
                
                }else{  
                    ////console.log(paramObj,thisCopmNode)
                    var copmpID= JSON.parse(thisCopmNode).company_id;
                    //部门下拉
                    slectDeparFun(copmpID)
                    // dtree.getParentParam('browser1',)
                    tableIndex.reload({
                        where: {
                            companyId: '',
                            departmentId: paramObj.department_id,
                        }
                        ,page: {
                            curr: 1 //重新从第 1 页开始
                        }
                    });
                }
            }
            var HtmlData = param.context.replace(/"/g,"");
            $("#partUsers").html(HtmlData);
        });
    })
})