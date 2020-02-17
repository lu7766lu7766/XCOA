$(function(){
    //获取树状图

    layui.config({
        version: true,
		base: '../../../layui/' //静态资源所在路径
	}).extend({
		index: 'index' //主入口模块
	}).use(['index','form','laydate','table','dtree'], function(){
        var $ = layui.$
        ,admin = layui.admin
        ,element = layui.element
        ,router = layui.router();
        element.render();
        var laydate = layui.laydate
        ,dtree=layui.dtree
        ,form = layui.form
        ,layer = layui.layer
        ,table=layui.table;
    
    
        var groupObj ={
            groupTree:"",//储存集团树结构
            slectList : function (ev,elme,pid){//生成下拉选框
                var html ="";

                function listHtml(o){
                    for(var i = 0;i < ev.length; i++){
                        html+='<option value="'+ev[i].id+'">'+ev[i].name+'</option>'
                    }
                }
                function pidlistHtml(o){
                    for(var i = 0;i < o.length; i++){
                        html+='<li>'
                        if(o[i].children&&o[i].children.length>0){
                            html+='<span class="folder treeId_'+o[i].id+'" data-id="'+o[i].id+'"><i class="iconfont"></i>'+o[i].name+'</span><ul>'
                            pidlistHtml(o[i].children);//存在子级再次调用循环
                            html+="</ul>"
                        }else{
                            html+='<span class="file treeId_'+o[i].id+'" data-id="'+o[i].id+'"><i class="iconfont"></i>'+o[i].name+'</span>'
                        }
                    
                    html+= '</li>'
                    }
                }
                if(!pid){
                    listHtml(ev);
                    elme.append(html);
                }else{
                    if(ev.children&&ev.children.length>0){
                        pidlistHtml(ev.children);
                    }else{
                        html = '<li><span class="file " data-id="0"><i class="iconfont"></i>顶级部门</span><li>'
                    }
                
                    elme.html(html);
                } 
            }
        } 
        // function groupLfTree(){//左侧部门树
        //     $.fetch({
        //         url: "/gateway/department/tree",
        //         type: 'post',
        //         dataType: 'JSON',
        //         cb:function(rs){
        //             // groupObj.groupTree = rs;
        //             $.tree(rs,$("#browser"));
        //         }
        //     })
        // }
        var dprDtree=dtree.render({
            elem: "#ManagDuti",
            url:urls+"/gateway/department/tree",
            response : {
                statusName:'status_code',
                statusCode: 200,
                message: "message",
                rootName: "data",
                parentId: "parent_id",
                childName: "children",
                nodeId: "id", 
                treeId: "node_id",//节点ID
                title: "name", 
                basicData:"data"
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
            dataStyle:"layuiStyle",
            // heightLight:[],//传入高亮
            done:function(obj){
                $("#ManagDuti").find('div.nav-tree-div').each(function(){
                    console.log($(this).attr("data-basic"))
                    var basicData=$(this).attr("data-basic")?JSON.parse($(this).attr("data-basic")):'';
                    if(basicData.user_count){
                        $(this).find("cite").append('('+basicData.user_count+'人)');
                    }
                    if(basicData.title_name){
                        $(this).find("cite").append('('+basicData.title_name+')');
                    }
                })
                $("#ManagDuti").find('li[data-index="1"]>div.nav-tree-div').attr('d-click','');
                $("#ManagDuti").find('li[data-index="2"]>div.nav-tree-div').attr('d-click','');
            }
        });
        
        var evenTreeFun=function(obj){
            var basicData = JSON.parse(obj.basicData);
            var oid = basicData.department_id;
            //console.log(basicData);
            //console.log(parseInt(obj.node_id))
            if( obj.node_id<1000000){
            // $("#browser").find("span").removeClass("on");
            //  $(this).parent("span").addClass("on");
                //调用修改接口
                $.fetch({
                    url: "/gateway/department/info",
                    type: 'post',
                    data: {
                        departmentId:oid,
                    },
                    dataType: 'JSON',
                    cb:function(rs){
                        var pidval = rs.company_id;//获取公司选中的id
                        // //console.log()
                        $("#backGroupData").show();
                        $("#sort").val(rs.sort);
                        $("#changeGroupData").show();
                        $("#subGroupData").hide();
                        $("#dpartTit").text("部门编辑");
                        $("#backGroupData").off("click").on("click",function(){
                            groupObj.groupTree =null;
                            // groupLfTree()
                            setTimeout(function(){
                                location.reload();
                            }, 300 );
                            // var cpid=$("#departGrop").val();
                            // depatSelec(cpid);
                            // $("#depart_name").val("");//中文名
                            // $("#depart_enname").val("");//英文名
                            // $("#deparDesc").html("").attr("data-val",'');
                            // $("#pareDeparDesc").html("").attr("data-val",'');
                            // $("#pareDeparDescQ").html("").attr("data-val",'');  
                            // $("#subGroupData").show();
                            // $("#changeGroupData").html('');
                            // $("#backGroupData").hide();
                            // $("#dpartTit").html("新建部门/成员单位");
                        });
                        $("#depart_name").val(rs.name);
                        $("#depart_enname").val(rs.en_name);
                        $("#departCompSel").find("option[value='"+rs.group_id+"']").attr("selected","selected");
                        // $("input[type='radio']:checked").val()
                        // //console.log( $('input[name="isOrgShow"][value="'+1+'"]'));
                        // $('input[name="isOrgShow"]').each(function(){
                        //     //console.log($(this).val()==rs.is_org_show)
                        //     if($(this).val()==rs.is_org_show){
                        //         $(this).attr('checked',true);
                        //     }else{
                        //         $(this).removeAttr('checked');
                        //     }
                            
                        // })
                        // $('input[name="isOrgShow"]').attr('checked',false);
                        if(rs.is_org_show==0){
                            $('input[name="isOrgShow"][value=0]').prop('checked',true);
                            $('input[name="isOrgShow"][value=1]').removeAttr('checked');
                            form.render('radio'); 
                            
                        }else{
                            $('input[name="isOrgShow"][value=1]').prop('checked',true);
                            $('input[name="isOrgShow"][value=0]').removeAttr('checked');
                            form.render('radio'); 
                            
                        }
                        //添加主管详情
                        if(rs.one_level&&rs.one_level.length>0){
                            var levHtml='',idstr='',nameText='';
                            for(var i=0;i<rs.one_level.length;i++){
                                levHtml+='<li class="pick" data-user="'+rs.one_level[i].id+'">'+rs.one_level[i].name+'</li>';
                                if(i>0){
                                    idstr+=",";
                                }
                                idstr+=""+rs.one_level[i].id+"";
                                nameText+=''+rs.one_level[i].name+';';
                            }
                            $("#deparDesc").html(levHtml);
                            $("#deparDesc").attr("data-val",idstr);
                            $("#deparDesc").siblings(".layui-textarea").html(nameText);
                        }else{
                            $("#deparDesc").html('');
                            $("#deparDesc").attr("data-val",'');
                            $("#deparDesc").siblings(".layui-textarea").html('');
                        }

                        if(rs.two_level&&rs.two_level.length>0){
                            var levHtml='',idstr='',nameText='';
                            for(var i=0;i<rs.two_level.length;i++){
                                levHtml+='<li class="pick" data-user="'+rs.two_level[i].id+'">'+rs.two_level[i].name+'</li>';
                                if(i>0){
                                    idstr+=",";
                                }
                                idstr+=""+rs.two_level[i].id+"";
                                nameText+=''+rs.two_level[i].name+';';
                            }
                            $("#pareDeparDesc").html(levHtml);
                            $("#pareDeparDesc").attr("data-val",idstr);
                            $("#pareDeparDesc").siblings(".layui-textarea").html(nameText);
                        }else{
                            $("#pareDeparDesc").html('');
                            $("#pareDeparDesc").attr("data-val",'');
                            $("#pareDeparDesc").siblings(".layui-textarea").html('');
                        }
                        if(rs.three_level&&rs.three_level.length>0){
                            var levHtml='',idstr='',nameText='';
                            for(var i=0;i<rs.three_level.length;i++){
                                levHtml+='<li class="pick" data-user="'+rs.three_level[i].id+'">'+rs.three_level[i].name+'</li>';
                                if(i>0){
                                    idstr+=",";
                                }
                                idstr+=""+rs.three_level[i].id+"";
                                nameText+=''+rs.three_level[i].name+';';
                            }
                            $("#pareDeparDescQ").html(levHtml);
                            $("#pareDeparDescQ").attr("data-val",idstr);
                            $("#pareDeparDescQ").siblings(".layui-textarea").html(nameText);
                        }else{
                            $("#pareDeparDescQ").html('');
                            $("#pareDeparDescQ").attr("data-val",'');
                            $("#pareDeparDescQ").siblings(".layui-textarea").html('');
                        }
                        if(rs.four_level&&rs.four_level.length>0){
                            var levHtml='',idstr='',nameText='';
                            for(var i=0;i<rs.four_level.length;i++){
                                levHtml+='<li class="pick" data-user="'+rs.four_level[i].id+'">'+rs.four_level[i].name+'</li>';
                                if(i>0){
                                    idstr+=",";
                                }
                                idstr+=""+rs.four_level[i].id+"";
                                nameText+=''+rs.four_level[i].name+';';
                            }
                            $("#pareDescFour").html(levHtml);
                            $("#pareDescFour").attr("data-val",idstr);
                            $("#pareDescFour").siblings(".layui-textarea").html(nameText);                        
                        }else{
                            $("#pareDescFour").html('');
                            $("#pareDescFour").attr("data-val",'');
                            $("#pareDescFour").siblings(".layui-textarea").html('');
                        }
                        if(rs.five_level&&rs.five_level.length>0){
                            var levHtml='',idstr='',nameText='';
                            for(var i=0;i<rs.five_level.length;i++){
                                levHtml+='<li class="pick" data-user="'+rs.five_level[i].id+'">'+rs.five_level[i].name+'</li>';
                                if(i>0){
                                    idstr+=",";
                                }
                                idstr+=""+rs.five_level[i].id+"";
                                nameText+=''+rs.five_level[i].name+';';
                            }
                            $("#pareDescFive").html(levHtml);
                            $("#pareDescFive").attr("data-val",idstr);
                            $("#pareDescFive").siblings(".layui-textarea").html(nameText);  
                        }else{
                            $("#pareDescFive").html('');
                            $("#pareDescFive").attr("data-val",'');
                            $("#pareDescFive").siblings(".layui-textarea").html('');
                        }
                        $.fetch({
                            url: "/gateway/company/list",
                            type: 'post',
                            cb:function(rs2){
                                var obj = rs2 ;
                                var selhtml=""
                                var selecHtml=function(o){
                                    for(var i=0;i<o.length;i++){
                                        if(o[i].children&&o[i].children.length>0){
                                            selhtml+='<option value="'+o[i].id+'" ><span>'+o[i].name+'</span></option>'  
                                            selecHtml(o[i].children);
                                        }else{
                                            selhtml+='<option value="'+o[i].id+'" >'+o[i].name+'</option>'
                                        }
                                    }
                                }
                                if(obj&&obj.length>0){
                                    selecHtml(obj);
                                }else{
                                    selhtml='<option value="0" >顶级目录</option>'
                                } 
                                $("#departGrop").html(selhtml);
                                $("#departGrop").find("option[value='"+pidval+"']").attr("selected","selected");
                                form.render('select','component-form-depar'); 
                            }
                        })
                        $.each(groupObj.groupTree[0].children,function(key,val){   
                            if( groupObj.groupTree[0].children[key].id ==rs.company_id){
                            var  obj = groupObj.groupTree[0].children[key].children;
                                var selhtml="";
                                selhtml +='<option value="0" >&nbsp;&nbsp;顶级部门</option>';
                                var  ss='';
                                var selecHtml=function(o,jj){
                                    jj+="&nbsp;&nbsp;";
                                    var nn = jj          
                                    for(var i=0;i<o.length;i++){
                                        if(oid==o[i].id){//不可以选自己
                                            var m ='disabled="disabled"'
                                        }else{
                                            var m=''
                                        }
                                        if(o[i].children&&o[i].children.length>0){
                                            selhtml+='<option '+m+' value="'+o[i].id+'" >'+jj+''+o[i].name+'</option>' 
                                            selecHtml(o[i].children,jj);
                                        }else{ 
                                            selhtml+='<option '+m+' value="'+o[i].id+'" >'+nn+''+o[i].name+'</option>'
                                        }
                                    }
                                    
                                }
                                if(obj&&obj.length>0){
                                    selecHtml(obj,ss);
                                }
                                
                                $("#departPidVal").html(selhtml);
                                $("#departPidVal").find("option[value='"+rs.parent_id+"']").attr("selected","selected");
                                form.render('select','component-form-depar'); 
                            }
                        })
                        
                        $("#changeGroupData").html('<button type="button" class="del layui-btn layui-btn-danger">删除</<button><button type="button" class="change layui-btn">确认修改</<button>')
                        $("#changeGroupData>.del").off("click").on("click",function(){
                            var param={
                                    departmentId:rs.id,
                            };
                            $.fetch({
                                url: "/gateway/department/delete",
                                type: 'post',
                                data: param,
                                cb:function(rs){
                                    layer.msg("删除成功");
                                    groupObj.groupTree =null;
                                    setTimeout(function(){
                                        location.reload();
                                    }, 300 );
                                    // groupLfTree()
                                    // var cpid=$("#departGrop").val();
                                    // depatSelec(cpid);
                                    // $("#depart_name").val("");//中文名
                                    // $("#depart_enname").val("");//英文名
                                    // $("#deparDesc").html("").attr("data-val",'');
                                    // $("#pareDeparDesc").html("").attr("data-val",'');
                                    // $("#pareDeparDescQ").html("").attr("data-val",'');
                                    // $("#pareDescFour").html("").attr("data-val",'');
                                    // $("#pareDescFive").html("").attr("data-val",'');
                                    // $("#subGroupData").show();
                                    // $("#changeGroupData").html('');
                                    // $("#backGroupData").hide();
                                }
                            })
                        
                        });
                        $("#changeGroupData>.change").off("click").on("click",function(){
                            var Name = $("#depart_name").val();//中文名
                            var enName = $("#depart_enname").val();//英文名
                            var Pgname = $("#departPidVal").val();//上级
                            var oneLevelIds =$("#deparDesc").attr("data-val");
                            var twoLevelIds =$("#pareDeparDesc").attr("data-val");
                            var threeLevelIds =$("#pareDeparDescQ").attr("data-val");  

                            var fourLevelIds =$("#pareDescFour").attr("data-val");
                            var isOrgShow =$("input[name='isOrgShow']:checked").val();
                            var fiveLevelIds =$("#pareDescFive").attr("data-val");
                            var sort = $("#sort").val();//上级
                            
                            if (Name == '') {
                                layer.msg('中文名称不能为空!');
                                return false;
                            }
                            if (enName == '') {
                                layer.msg('英文名称不能为空!');
                                return false;
                            }
                            if (Pgname == '') {
                                $.error('请选择所属上级!');
                                return false;
                            }
                            var param = {
                                name:Name,
                                enName:enName,
                                parentId:Pgname,
                                departmentId:rs.id,
                                oneLevelIds:oneLevelIds,
                                twoLevelIds:twoLevelIds,
                                sort:sort,
                                threeLevelIds:threeLevelIds,
                                fourLevelIds:fourLevelIds,
                                fiveLevelIds:fiveLevelIds,
                                isOrgShow:isOrgShow,
                            };
                    
                            $.fetch({
                                url: "/gateway/department/update",
                                type: 'post',
                                data: param,
                                dataType: 'JSON',
                                cb:function(rs){
                                    layer.msg('修改成功');
                                    // groupObj.groupTree =null;
                                    setTimeout(function(){
                                        location.reload();
                                    }, 300 );
                                    // groupLfTree()
                                    // var cpid=$("#departGrop").val();
                                    // depatSelec(cpid);
                                    // $("#depart_name").val("");//中文名
                                    // $("#depart_enname").val("");//英文名
                                    // $("#deparDesc").html("").attr("data-val",'');
                                    // $("#pareDeparDesc").html("").attr("data-val",'');
                                    // $("#pareDeparDescQ").html("").attr("data-val",'');
                                    // $("#pareDescFour").html("").attr("data-val",'');
                                    // $("#pareDescFive").html("").attr("data-val",'');
                                    // $("#subGroupData").show();
                                    // $("#changeGroupData").html('');
                                    // $("#backGroupData").hide();
                                    // $("#dpartTit").html("新建部门/成员单位");
                                }
                            })
                        });
                    }
                })
            }
        }
        // 点击节点触发回调
        // dtree.on("changeTree('ManagDuti')" ,function(obj){
        //     evenTreeFun(obj);
        // });
        dtree.on("node('ManagDuti')" ,function(obj){
            evenTreeFun(obj);
        });
        // groupLfTree();

        //公司下拉
        var depatSelec =function(cpId){
            $.fetch({
                url: "/gateway/department/tree",
                type: 'post',
                dataType: 'JSON',
                cb:function(rs){
                    groupObj.groupTree = rs;
                    var elem =$("#departPid");
                    var obj ;
                    var selhtml="";
                    selhtml='<option value="0">顶级部门</option>'
                    $.each(groupObj.groupTree[0].children,function(key,val){   
                        if( groupObj.groupTree[0].children[key].id ==cpId){
                            obj = groupObj.groupTree[0].children[key].children;
                            var ss='';
                            var selecHtml=function(o,jj){
                                jj+='&nbsp;';
                                var nn=jj;
                                for(var i=0;i<o.length;i++){
                                    if(o[i].children&&o[i].children.length>0){
                                        selhtml+='<option value="'+o[i].id+'" >'+jj+''+o[i].name+'</option>'  
                                        selecHtml(o[i].children,jj);
                                    }else{
                                        selhtml+='<option value="'+o[i].id+'" >'+nn+''+o[i].name+'</option>'
                                    }
                                }
                            }
                            if(obj&&obj.length>0){
                                selecHtml(obj,ss);
                            }
                            $("#departPidVal").html(selhtml);
                            form.render('select','component-form-depar'); 
                        }
                    })
                }
            })
            
        }

        //集团下拉列表
        $.fetch({
            url: "/gateway/group/list",
            type: 'post',
            dataType: 'JSON',
            cb:function(rs){
                var elme = $("#departCompSel");
                groupObj.slectList(rs,elme,false);
                form.render('select','component-form-depar'); 
            }
        })
        $.fetch({//公司
            url: "/gateway/company/list",
            type: 'post',
            dataType: 'JSON',
            cb:function(rs){
                var elme = $("#departGrop");
                groupObj.slectList(rs,elme,false);
                var cpid=$("#departGrop").val();
                depatSelec(cpid);
                form.render('select','component-form-depar'); 
            }
        })

        $("#departGrop").change(function(){
            var pidval = $(this).children("option:selected").val();//获取公司选中的id
            depatSelec(pidval);
        })

        //添加部门主管
        $(".departTable").on("click","a.addDesc",function(){
            selMemberFun($(this));
        });
        $(".departTable").on("click","a.emptyDesc",function(){
            $(this).siblings("ul").html("");
            $(this).siblings("ul").attr("data-val","");
            $(this).siblings(".layui-textarea").html("");
        })

        var addDepart=function(){
            //获取表单值//为空的提示填写
            var Name = $("#depart_name").val();//中文名
            var enName = $("#depart_enname").val();//英文名
            var jName = $("#departCompSel option:selected").val();//集团
            var gName = $("#departGrop option:selected").val();//公司
            var Pgname = $("#departPidVal").val();//上级
            var sort = $("#sort").val();//上级
            var oneLevelIds =$("#deparDesc").attr("data-val");
            var twoLevelIds =$("#pareDeparDesc").attr("data-val");
            var threeLevelIds =$("#pareDeparDescQ").attr("data-val");     
            var fourLevelIds =$("#pareDescFour").attr("data-val");
            var fiveLevelIds =$("#pareDescFive").attr("data-val");   
            var isOrgShow =$("input[name='isOrgShow']:checked").val();
            // //console.log()   
            if (Name == '') {
                layer.msg('中文名称不能为空!');
                return false;
            }
            if (enName == '') {
                layer.msg('英文名称不能为空!');
                return false;
            }
            if (jName == '') {
                layer.msg('请选择所属集团!');
                return false;
            }if (gName == '') {
                layer.msg('请选择所属公司!');
                return false;
            }
            if (Pgname == '') {
                layer.msg('请选择所属上级!');
                return false;
            }
            
            var param = {
                name:Name,
                enName:enName,
                parentId:Pgname,
                companyId:gName,
                groupId:jName,
                sort:sort,
                oneLevelIds:oneLevelIds,
                twoLevelIds:twoLevelIds,
                threeLevelIds:threeLevelIds,
                fourLevelIds:fourLevelIds,
                fiveLevelIds:fiveLevelIds,
                isOrgShow:isOrgShow,
            };
            $.fetch({
                url: "/gateway/department/add",
                type: 'post',
                data: param,
                dataType: 'JSON',
                cb:function(rs){
                    layer.msg("新建成功");
                    setTimeout(function(){
                        location.reload();
                    }, 300 );
                    // groupObj.groupTree =null;
                    // groupLfTree()
                    // var cpid=$("#departGrop").val();
                    // depatSelec(cpid);
                    // $("#depart_name").val("");//中文名
                    // $("#depart_enname").val("");//英文名
                    // $("#deparDesc").html("").attr("data-val",'');
                    // $("#pareDeparDesc").html("").attr("data-val",'');
                    // $("#pareDeparDescQ").html("").attr("data-val",'');
                    // $("#pareDescFour").html("").attr("data-val",'');
                    // $("#pareDescFive").html("").attr("data-val",'');
                }
            })
        }

        $("#subGroupData").off("click").on("click",function(){
            addDepart();
        })
    })
})