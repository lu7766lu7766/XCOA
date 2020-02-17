$(function(){
    layui.config({
		base: '../../../layui/' //静态资源所在路径
	}).extend({
		index: 'index' //主入口模块
	}).use(['index','form','laydate','table'], function(){
		var $ = layui.$
		,admin = layui.admin
		,element = layui.element
		,router = layui.router();
		element.render();
		var laydate = layui.laydate
		,form = layui.form
		,layer = layui.layer
		,table=layui.table;
        
        // teb切换
		element.on('tab(component-tabs-brief)', function(obj){
		});
	
        var treesFun = function (ev,language,urls){ //生成树状图
            var treeData ={
                isEdit:[],//可编辑元素的标签
                isPick:[],//包含复选框的标签
                html:"",
                id:""
            }
            var changeRole=[];
            var listShow,selected,icon;
            function treeHtml(o){
                // var 
                for(var i =0;i<o.length;i++){
                    //是否展开
                    if(o[i].is_show == 1){
                        listShow='active';
                        icon ="icon-jianhao";
                    }else{
                        listShow=''
                        icon ="icon-40";
                    }
                    //默认是否为选中状态
                    if(o[i].selected==1){
                        selected="checked='checked'";
                    }else if(o[i].selected==0){
                        selected="";
                    }
                    treeData.html+='<li>'
                    if(o[i].children&&o[i].children.length>0){
                        treeData.html+=
                        '<span class="folder" data-id="'+o[i].id+'" data-pid="'+o[i].parent_id+'"><i class="iconfont '+icon+'"></i><input type="checkbox"  name="ck_'+o[i].id+'" '+selected+'/>'
                        +o[i].display_name+'</span><ul class="'+listShow+'" style="padding-left:15px;">'

                        treeHtml(o[i].children);//存在子级再次调用循环
                        
                        treeData.html+="</ul>"
                    }else{
                        treeData.html+='<span class="file" data-id="'+o[i].id+'"><i class="iconfont "></i><input type="checkbox"  name="ck_'+o[i].id+'" '+selected+
                        '/>'+o[i].display_name+'</span>'
                    } 
                    treeData.html+= '</li>'
                }
            };
            treeHtml(ev);

            $("#oneSetRoleId .organTop").html( treeData.html);
            $("#oneSetRoleId .organTop .folder .iconfont").click(function(){//树状图点击展开和隐藏
                var tab = $(this).parent(".folder").next("ul"); 
                if(tab.hasClass("active")){ 
                    tab.removeClass("active"); 
                    $(this).removeClass("icon-jianhao").addClass("icon-40");
                }else{ 
                    tab.addClass("active"); 
                    $(this).removeClass("icon-40").addClass("icon-jianhao");
                } 
            });
        
            $("#oneSetRoleId input").change(function(){  //     
            //改变数组内值 
                var sleEmpty = function(n,s){ // n为查找上一级 s为 循环次数
                    var lengths =n.parent("ul").find("input:checked").length;
                    if(lengths == 0 ){
                        n.parent("ul").prev("span").find("input").removeAttr("checked");    
                        s= s-1;
                        n= n.parent("ul").parent("li");
                        if(s > 0){
                            sleEmpty(n,s);
                        }    
                    }
                }
                if($(this).prop("checked")){
                    $(this).parent("span").parent("li").find("input").prop("checked", true);
                    var lengths =$(this).parent("span").parent("li").find("input:checked").length;
                    $(this).parent("span").parent("li").parents("ul").prev("span").children("input").prop("checked", true);
                        // 选中父节点
                }else{
                    $(this).parent("span").parent("li").find("input").removeAttr("checked"); 
                    var ullengths =$(this).parent("span").parent("li").parents("ul").length-1;
                    sleEmpty($(this).parent("span").parent("li"),ullengths);

                }
            });
            $("#subRoleTree").on("click",function(){
                //遍历input 并提交
                $("#oneSetRoleId .organTop").find("input").each(function(){
                    var tid = $(this).parent("span").attr("data-id");
                    var slecVal =$(this).prop("checked");
                    if(slecVal){
                        changeRole.push(tid);
                    }
                });
                var r_Id =$("#oneSetRoleId").attr("data-roleId");
                var pr_Id;
                if(changeRole.length ==0){
                    pr_Id = "null";
                }else{
                    pr_Id =changeRole.join(",");
                }
                param = {
                    roleId: r_Id,
                    permIds:pr_Id,
                }
                $.fetch({
                    url: "/gateway/permission/set",
                    type: 'post',
                    data: param,
                    cb:function(rs){
                        changeRole = [];
                        layer.msg('修改成功');
                        $("#oneSetRoleId").hide();
                        $("#subRoleTree").off("click");
                    }
                })
            
            })

        }
        var _roleOper = {//角色及权限操作对象
            roleList:[],//保存角色列表
            suBmit:function(){//新建角色
                var role_name = $.trim($('#role_name').val());
                if (role_name == '') {
                    $('#role_name').attr("placeholder","请输入名称")
                return false;
                }
                var param = {
                    roleName:  role_name,
                };
                layer.confirm('提交成功',function(index){
                    $.fetch({
                        url: "/gateway/role/add",
                        type: 'post',
                        data: param,
                        cb:function(rs){
                            $('#role_name').attr("placeholder","");
                            $('#role_name').val("");
                            _roleOper.getRoleList();
                            layer.close(index);
                        }
                    })
                })
            },
            getRoleList:function(){//获取角色列表,
                $.fetch({
                    url: "/gateway/role/list",
                    type: 'post',
                    cb:function(rs){
                        _roleOper.roleList=rs;
                        _roleOper.roleListHtml();
                    }
                })
            },
            roleListHtml:function(){//生成角色列表html
                var html='<tr><td>角色名称</td><td>操作</td></tr>';
                var slec,delhtml;

                for (var i = 0;i<_roleOper.roleList.length;i++){
                    if(_roleOper.roleList[i].selected){//判断是否为当前角色
                        slec ="red";
                        demhtml=""
                    }else{
                        slec =""
                        demhtml='<span class="roleDel layui-btn layui-btn-danger layui-btn-sm" data-delId="'+_roleOper.roleList[i].id+'">删除</span>'
                    }
                    html+='<tr> <td  class="roleName '+slec+'"><span>'+
                    _roleOper.roleList[i].name+
                    '</span></td> <td><span class="roleSet layui-btn layui-btn-sm layui-btn-warm" data-setId="'+_roleOper.roleList[i].id+'">设置权限</span>'
                    +demhtml+
                    '<span class="rolecName layui-btn layui-btn-sm"  data-nameId="'+_roleOper.roleList[i].id+'">编辑名称</span></td></tr>'
                }
                $("#roleListTable").html(html);
                // 
                $("#roleListTable .roleSet").off("click").on("click",function(){
                    var setId = $(this).attr("data-setId");
                    var sName = $(this).parent().siblings('td').text();
                    _roleOper.setRole(setId,sName);
                });
                $("#roleListTable .roleDel").off("click").on("click",function(){
                
                    var delid = $(this).attr("data-delid");
                    var elme = $(this).parent().parent("tr");
                    var name =$(this).parent().siblings(".roleName").text();
                    layer.confirm('确认删除角色 "'+ name+'?"',{"title":" "},function(index){
                        _roleOper.delRole(delid,elme);
                        layer.close(index);
                    })
                    
                })
                $("#roleListTable span.rolecName").on("click",function(){
                    $(this).hide();
                    var thisTd = $(this);
                    var nameid = thisTd.attr("data-nameId");             
                    var sName = thisTd.parent().siblings('td').text();
                    thisTd.parent().siblings('td.roleName').find("span").hide();//当前名字隐藏
                    thisTd.parent().parent().siblings('tr').find(".roleName>span").show();//其他的名字显示
                    thisTd.parent().parent().siblings('tr').find(".rolecName").show();
                    thisTd.parent().parent().siblings('tr').find("#c_role_name").remove();
                    var cangHtml ='<div id="c_role_name" ><input  type="text" value="'+sName+'" class="layui-input"><span class="subc layui-btn layui-btn-sm">确认</span><span class="cancelc layui-btn layui-btn-sm">取消</span></div>'
                    thisTd.parent().siblings('td').append(cangHtml);
                    $("#c_role_name .cancelc").on("click",function(){
                        thisTd.parent().siblings('td').find("#c_role_name").remove();
                        thisTd.parent().siblings('td.roleName').find("span").show();
                        thisTd.show();
                    });
                    $("#c_role_name .subc").on("click",function(){
                        var cname = $("#c_role_name>input").val();
                        if(cname==''){
                            layer.msg('名称不能为空！');
                            return false;
                        }
                        var  param={
                            roleId:nameid,
                            roleName:cname,
                        }
                        $.fetch({
                            url: "/gateway/role/update",
                            data: param,
                            type: 'post',
                            cb:function(rs){
                                layer.msg('修改成功');
                                _roleOper.getRoleList();
                            }
                        })
                    });
                });

            },
            setRole:function(id,name){//设置角色权限页面
                $("#oneSetRoleId .roleNamet").text(name);
                var ids ={
                    roleId:id
                }
                $.fetch({
                    url: "/gateway/permission/list",
                    type: 'post',
                    data:ids,
                    cb:function(rs){
                        treesFun(rs);
                        $("#oneSetRoleId").show();
                        $("#oneSetRoleId").attr("data-roleId",""+id+"")
                    }
                })
            },
            delRole:function(id,elme){//删除角色
                var delids ={
                    roleId:id
                }
                $.fetch({
                    url: "/gateway/role/del",
                    type: 'post',
                    data:delids,
                    cb:function(rs){
                        elme.remove();
                    }
                })
            },  
            rolePermHtml:function(group){
                //获取树形结构
                var  treeData = {
                    html:"",
                    ss:'',
                }
                treeData.html+= '<option value="0">顶级类目</option>'
                function treeHtml(o,jj){
                    jj+='&nbsp;';
                    var nn=jj;
                    for(var i =0;i<o.length;i++){
                        //是否展开         
                        if(o[i].children&&o[i].children.length>0){
                            treeData.html+= '<option value="'+o[i].id+'">'+jj+''+o[i].display_name+'</option>'
                            treeHtml(o[i].children,jj);//存在子级再次调用循环
                            
                        
                        }else{
                            treeData.html+= '<option value="'+o[i].id+'">'+nn+''+o[i].display_name+'</option>'
                        } 
                    }
                };
                $("#Perm_select").html(treeData.html);
                param={
                    isGroup:group,
                }
                $.fetch({
                    url: "/gateway/permission/menu",
                    type: 'post',
                    data: param,
                    cb:function(rs){
                        treeHtml(rs,treeData.ss);
                        $("#Perm_select").html(treeData.html);
                    }
                })
            
            },
            addRolePerm:function(){//新建菜单
                //获取表单值
                //为空的提示填写
                var rotName = $("#route_name").val();
                var permName = $("#Perm_name").val();
                var permenName = $("#Perm_enname").val();
                var PermFile = $("#Perm_file").val();
                var PermPfile = $("#Perm_select").val();
                var menus =$("input[name='opreation']:checked").val();
                var visbles =$("input[name='showHide']:checked").val();
                var isGroup=$("input[name='opGroup']:checked").val();
                var icon =$("#Perm_Icon").val();
                if (rotName == '') {
                    layer.msg('路由名称不能为空!');
                return false;
                }
                if (permName == '') {
                    layer.msg('权限名称不能为空!');
                return false;
                }
                if (permenName == '') {
                    layer.msg('权限英文名不能为空!');
                return false;
                }if (PermFile == '') {
                    layer.msg('静态档目录不能为空!');
                    return false;
                }
                if (PermPfile == '') {
                    layer.msg('所在类目不能为空!');
                    return false;
                }
                var param = {
                    routeName:rotName,
                    displayName:permName,
                    parentId:PermPfile,
                    isMenu:menus,
                    isShow:visbles,
                    htmlPath:PermFile,
                    enName:permenName,
                    isGroup:isGroup,
                    icon:icon,
                };
                $.fetch({
                    url: "/gateway/permission/add",
                    type: 'post',
                    data: param,
                    cb:function(rs){
                        layer.msg("保存成功");
                    }
                })
            }
        }
        //新建角色
        $("#submitRole").on("click",function(){
            _roleOper.suBmit();
        });

        //调用列表生成
        _roleOper.getRoleList();
        if($("input[name='opGroup']").length !== 0){//判断用户权限
            var isGroup=$("input[name='opGroup']:checked").val();
            _roleOper.rolePermHtml(isGroup);//先获取页面isGroup值
            $("input[name='opGroup']").change(function(){
                isGroup=$("input[name='opGroup']:checked").val();
                _roleOper.rolePermHtml(isGroup);
            })
        }
    
        $("#submiPerm").click(function(){
            _roleOper.addRolePerm();
        })
    
        $('#myTabRole a:first').tab('show');
        
        $('#myTabRole a').click(function (e) {
            e.preventDefault();
            $(this).tab('show');
        })

        $("#Perm_select").on("change",function(){
            var  vals =$(this).val();
            if(vals==0){
                $("#Perm_Icon").parents("tr").show();
            }else{
                $("#Perm_Icon").parents("tr").hide();          
            }
        })
    });
})