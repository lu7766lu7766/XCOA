
$(function(){
	layui.config({
		version: true,
		base: '../../../layui/' //静态资源所在路径
	}).extend({
		index: 'index' //主入口模块
	}).use(['index','form','dtree'], function(){
        var $ = layui.$
        ,admin = layui.admin
		,element = layui.element
		,dtree = layui.dtree		
        ,router = layui.router();
        element.on('tab(component-tabs-brief)', function(obj){});

		var laydate = layui.laydate,
		form = layui.form,
		layer = layui.layer,
		laypage = layui.laypage,
		table=layui.table;

        // 时间选择
	window.companyForm = {
		// isLogin: "false", //// 是否登录,"true":登录；  "false":未登录
		// userName: "",  //当前用户的登录 用户名
	//ajax请求超时时间
		//左侧 树结构
		//http://10.20.11.152/gateway/group/tree

		// getGroupHtml:function(){
			
		// 	function getGroupTree(o,elem){
		// 		var html="";
		// 		function treeFor(o){
		// 			for(var i =0;i<o.length;i++){
		// 				html+='<li>'
		// 					if(o[i].children&&o[i].children.length>0){
		// 						html+=
		// 						'<span class="folder" data-id="'+o[i].id+'" data-pid="'+o[i].parent_id+'"><i class="iconfont icon-gongsi"></i>'
		// 						+o[i].name+'</span><ul  style="padding-left:15px;">'
		// 						treeFor(o[i].children);//存在子级再次调用循环
								
		// 						html+="</ul>"
		// 					}else{
		// 						html+='<span class="file" data-id="'+o[i].id+'"><i class="iconfont icon-gongsi"></i>'+o[i].name+'</span>'
		// 					} 
		// 					html+= '</li>'
		// 			}
		// 		}
		// 		treeFor(o);
		// 		elem.html(html);

		// 		$("#groupListBox>li>span").off('click').on("click",function(){
		// 			$.fetch({
		// 				url: "/gateway/company/info",
		// 				type: 'post',
		// 				data: {
		// 					companyId:1,
		// 				},
		// 				cb:function(rs){
		// 					$("#companyBox").hide();
		// 					$("#groupBox").show();
		// 					$("#groupInput_c").val(rs.name);
		// 					$("#groupInput_e").val(rs.en_name);
		// 				}
		// 			})
		// 		})
				
		// 		$("#groupListBox>li>ul").off("click").on("click","span",function(){
		// 			$("#companyBox").show();
		// 			$("#groupBox").hide();
		// 			$("#groupInput_c").val('');
		// 			$("#groupInput_e").val('');
		// 			var gid=$(this).attr("data-id");

		// 			$.fetch({
		// 				url: "/gateway/company/info",
		// 				type: 'post',
		// 				data: {
		// 					companyId:gid,
		// 				},
		// 				cb:function(rs){
		// 					var c_Name = rs.name;
		// 					var c_enname = rs.en_name;
		// 					var pid = rs.parent_id;
		// 					$("#cp_zh_name").val(c_Name);
		// 					$("#cp_en_name").val(c_enname);
		// 					$("#userName").val( rs.company_admin_user);
		// 					$("#companyIDtext").val(rs.id).parents('tr').show()
		// 					$("#userName").attr("disabled","disabled");
		// 					$("#userPassword").parents('tr').hide();
		// 					$("#userPasswords").parents('tr').hide();
		// 					$("#addUserText").text("公司管理员:");
		// 					var textInput = $("#addUserText").text();
		// 					if(textInput=="公司管理员:"){
		// 						$("#userName").parents(".layui-form-item").addClass("layui-disabled");
		// 						$("#userName").addClass("layui-disabled");
		// 					}

		// 					$("#addUserText").parents("td").removeAttr("rowspan");

		// 					$("#delCompanyForm").show();
		// 					$("#changCompanyForm").show();
		// 					$("#backCompanyForm").show();
		// 					$("#suBmitCompanyForm").hide();																		
		// 					$("#delCompanyForm").off('click').on("click",function(){//删除
		// 						layer.confirm('确认删除公司"'+c_Name+'"?',{title:' '},function(index){
		// 							var j = j+1;
		// 							$.fetch({
		// 								url: "/gateway/company/delete",
		// 								type: 'post',
		// 								data: {
		// 									companyId:gid,
		// 								},
		// 								cb:function(rs){
		// 									layer.msg("删除成功");
		// 									$("#groupListBox").find("span[data-id="+gid+"]").parent("li").remove();
		// 									window.location.reload();
		// 									layer.close(index);
		// 								}
		// 							});
		// 						})
		// 					});
		// 					$("#changCompanyForm").off("click").on("click",function(){//修改
		// 						var ch_name =  $("#cp_zh_name").val();
		// 						var ch_enname = $("#cp_en_name").val();
		// 						$.fetch({
		// 							url: "/gateway/company/update",
		// 							type: 'post',
		// 							data: {
		// 								companyId:gid,
		// 								name:ch_name,
		// 								enName:ch_enname,
		// 								parentId:pid,
		// 							},
		// 							cb:function(rs){
		// 								layer.msg('修改成功');
		// 								window.location.reload();  //刷新页面
		// 							}
		// 						})
		// 					});
		// 					$("#backCompanyForm").off("click").on("click",function(){
		// 						window.location.reload();
		// 					});
		// 				}
		// 			});
		// 		});
		// 	}
		// 	//获取 树形数据
		// 	$.fetch({
		//         url: "/gateway/group/tree",
		//         type: 'post',
		//         cb:function(rs){
		//             getGroupTree(rs,$("#groupListBox"));
		//         }
		//     })
			
		// },
		
		suBmit:function(async_) {
			var zhname = $.trim($('#cp_zh_name').val());
			var enname = $.trim($('#cp_en_name').val());
			var uName =$("#userName").val();
			var pword1 =$("#userPassword").val();	 
			var pword2 =$("#userPasswords").val();	 
				
			var parent_id = $("#groupSlect").val();
			if (zhname == '') {
				$('#cp_zh_warm').text("*请输入公司名称");
				return false;
			}
			if (enname == '') {
				$('#cp_en_warm').text("*公司英文名称不能为空");
				return false;
			}
			if (uName == '') {
				layer.msg("用户名不能为空");
				return false;
			}
			if (pword1 == '') {
				layer.msg("密码不能为空");
				return false;
			}if (pword2 == '') {
				layer.msg("确认密码不能为空");
				return false;
			}
		
			var param = {
				name: zhname,
				enName: enname,
				parentId: parent_id,
				userName:uName,
				password:pword1,
				password_confirmation:pword2,
			};

			
			$.fetch({
				url: "/gateway/company/add",
				type: 'post',
				data: param,
				cb:function(rs){
					layer.msg("添加成功");
					setTimeout(function(){
						location.reload();
					}, 300 );
					$('#cp_zh_name').val('');
					$('#cp_en_name').val('');
					$("#userName").val('');
					$("#userPassword").val('');	 
					$("#userPasswords").val('');
				}
			})
		}
		
	};
	// companyForm.getGroupHtml();
	var dpDtree=dtree.render({
		elem: "#ManagDuti",
		url:urls+"/gateway/group/tree",
		response : {
			statusName:'status_code',
			statusCode: 200,
			message: "message",
			rootName: "data",
			parentId: "parent_id",
			childName: "children",
			nodeId: "id", 
			treeId: "id",//节点ID
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
			// $("#ManagDuti").find('li[data-index="1"]>div.nav-tree-div').attr('d-click','');
			// $("#ManagDuti").find('li[data-index="2"]>div.nav-tree-div').attr('d-click','');
		}
	});
	dtree.on("node('ManagDuti')" ,function(obj){
		// evenTreeFun(obj);
		if(obj.node_id==1){
			$.fetch({
				url: "/gateway/company/info",
				type: 'post',
				data: {
					companyId:1,
				},
				cb:function(rs){
					$("#companyBox").hide();
					$("#groupBox").show();
					$("#groupInput_c").val(rs.name);
					$("#groupInput_e").val(rs.en_name);
				}
			})
		}else{
			$("#companyBox").show();
			$("#groupBox").hide();
			$("#groupInput_c").val('');
			$("#groupInput_e").val('');
			// var gid=$(this).attr("data-id");
			$.fetch({
				url: "/gateway/company/info",
				type: 'post',
				data: {
					companyId:obj.node_id,
				},
				cb:function(rs){
					var c_Name = rs.name;
					var c_enname = rs.en_name;
					var pid = rs.parent_id;
					$("#cp_zh_name").val(c_Name);
					$("#cp_en_name").val(c_enname);
					$("#userName").val( rs.company_admin_user);
					$("#companyIDtext").val(rs.id).parents('tr').show()
					$("#userName").attr("disabled","disabled");
					$("#userPassword").parents('tr').hide();
					$("#userPasswords").parents('tr').hide();
					$("#addUserText").text("公司管理员:");
					var textInput = $("#addUserText").text();
					if(textInput=="公司管理员:"){
						$("#userName").parents(".layui-form-item").addClass("layui-disabled");
						$("#userName").addClass("layui-disabled");
					}
					$("#addUserText").parents("td").removeAttr("rowspan");
					$("#delCompanyForm").show();
					$("#changCompanyForm").show();
					$("#backCompanyForm").show();
					$("#suBmitCompanyForm").hide();																		
					
				}
			});
		}
	});
	$("#changCompanyName").off('click').on("click",function(){
		var gname =$("#groupInput_c").val();
		var gname_e=$("#groupInput_e").val();	
	
		var param={
			companyId:1,
			parentId:0,
			name:gname,
			enName:gname_e
		}
		$.fetch({
			url: "/gateway/company/update",
			type: 'post',
			data:param,
			cb:function(rs){
				layer.msg('保存成功',{anim: 5,time: 500},function(){
					setTimeout(function(){
						location.reload();
					}, 300 );
				});
			}
		})
	})
	$("#delCompanyForm").off('click').on("click",function(){//删除
		var param = dpDtree.getNowParam();
		layer.confirm('确认删除公司"'+param.context+'"?',{title:' '},function(index){
			var j = j+1;
			$.fetch({
				url: "/gateway/company/delete",
				type: 'post',
				data: {
					companyId:param.node_id,
				},
				cb:function(rs){
					layer.msg("删除成功");
					setTimeout(function(){
						location.reload();
					}, 300 );
				}
			});
		})
	});
	$("#changCompanyForm").off("click").on("click",function(){//修改
		var ch_name =  $("#cp_zh_name").val();
		var ch_enname = $("#cp_en_name").val();
		var param = dpDtree.getNowParam();
		$.fetch({
			url: "/gateway/company/update",
			type: 'post',
			data: {
				companyId:param.node_id,
				name:ch_name,
				enName:ch_enname,
				parentId:param.parentId,
			},
			cb:function(rs){
				layer.msg('修改成功');
				setTimeout(function(){
					location.reload();
				}, 300 );
			}
		})
	});
	$("#backCompanyForm").off("click").on("click",function(){
		setTimeout(function(){
			location.reload();
		}, 300 );
	});
	$("#backCompany").off('click').on("click",function(){
		setTimeout(function(){
			location.reload();
		}, 300 );
	})
	$.fetch({
		url: "/gateway/group/list",
		type: 'post',
		cb:function(rs){
			for(var i = 0; i< rs.length; i++){
				$("#groupSlect").append('<option class="compid_'+rs[i].id+'" value="'+rs[i].id+'" >'+rs[i].name+'</option>');
			}
			$("#suBmitCompanyForm").on("click",function(){
				companyForm.suBmit();
			});
			form.render();
		}
	})
})
});
