//登录成功后 导航方法
// setInterval("sessionId()",5000);
// function sessionId()
// {
//     $.ajax({
//         url: ""+urls+"/gateway/user/info",
//         dataType: 'json',
//         // xhrFields: {
//         //     withCredentials: true // 这里设置了withCredentials
//         // },
//         type: 'post',
//         'success': function (data) {
//             if (data.status_code == 401){
//                 //获取cookie中 语言变量
//                 // $.menuInit(data.data,language);
//                 alert("登录已失效，请重新登录！")
//                 window.location.href='login.html';
//             }else if(data.status_code != 200){
//                 alert(data.message);
//             }
//         }
//     });
// }

$(function() {
	// window.urls = "http://10.20.11.152";
	// window.urls = "http://oa-company.com";
	// window.urls = "http://oa-group.com";
	// window.urls = "http://oa-company-699.com";
	// window.urls = 'http://api.oa.video88.cc'
	window.urls = 'http://' + location.hostname.replace(/^(www|site)/, 'api')
	// window.urls =   window.location.host; //
	$.ajaxSetup({
		xhrFields: {
			withCredentials: true,
		},
	})
	setInterval(function() {
		var containerHeight = $('#LAY_app_body').height()
		$.each($('.layadmin-iframe'), function(i) {
			if (!i) return
			var $iframe = $(this)
			var height = $iframe
				.contents()
				.find('body')
				.height()
			$iframe.css('height', height >= containerHeight ? '100%' : height)
		})
	}, 300)

	layui
		.config({
			base: '../layui/', //静态资源所在路径
		})
		.extend({
			index: 'index', //主入口模块
		})
		.use('index', function() {
			var $ = layui.$,
				admin = layui.admin,
				element = layui.element,
				router = layui.router()
			//获取地址栏参数，name:参数名称
			$.ajax({
				//获取未读消息数
				url: urls + '/gateway/notifyMessage/list',
				dataType: 'json',
				type: 'post',
				data: {
					status: 1,
				},
				success: function(data) {
					if (data.status_code == 200) {
						if (data.data.total_count == 0) {
							$('#messageDo').addClass('layui-hide')
						} else if (data.data.total_count > 0) {
							$('#messageDo').html(data.data.total_count)
							$('#messageDo').removeClass('layui-hide')
						}
						// if(data.data.data_list.length>0){
						//     var htmls ='';
						//     for(var i=0;i<data.data.data_list.length;i++){
						//         htmls+='<li><a class="messageToPage" data-id="'+data.data.data_list[i].message_id+'" layadmin-event="messageToPage" lay-text="消息中心" lay-href="'+data.data.data_list[i].message_url+'">'+data.data.data_list[i].message_content+'来自'+data.data.data_list[i].from_name+'</a></li>'
						//     }
						//     layer.open({
						//         type: 2,
						//         title: "未读消息",
						//         shade: false,
						//         area: ['350px', '200px'],
						//         offset: 'rb',//右下角弹出
						//         shift: 2,
						//         content: '/home/msg.html?v=20181207',
						//         time:12000,
						//         success: function(layero, index){
						//             var body = layer.getChildFrame('body', index);
						//             var iframeWin = window[layero.find('iframe')[0]['name']]; //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
						//             body.find('ul').append(htmls) //得到iframe页的body内容
						//         }
						//     });
						// }
					}
				},
			})
			window.userInfo = {
				dapartId: null,
				userId: null,
				userName: null,
				dapartName: null,
				newMsg: false,
				// type:null,
				sessionId: function() {
					$.ajax({
						url: urls + '/gateway/user/info',
						dataType: 'json',
						type: 'post',
						headers: {
							'Cache-Control': 'no-cache',
						},
						success: function(data) {
							// console.log(data.data.msgUnread)
							if (data.status_code == 200) {
								if (data.data.msgUnread != null && data.data.msgUnread == 0) {
									$('#messageDo')
										.addClass('layui-hide')
										.html(data.data.msgUnread) ///实时更新未读消息
								} else {
									$('#messageDo')
										.removeClass('layui-hide')
										.html(data.data.msgUnread) ///实时更新未读消息
								}
								userInfo.dapartId = data.data.departmentId
								userInfo.userId = data.data.id
								userInfo.userName = data.data.name
								userInfo.dapartName = data.data.departmentName
								userInfo.type = data.data.type
								$('#topUserName').text(userInfo.userName)
								$('#topUserName').attr(userInfo.dapartName)
								$('#topUserName').attr('data-depar', userInfo.dapartId)
								$('#topUserName').attr('data-uid', userInfo.userId)
								if (data.data.msg.length > 0) {
									var htmls = ''
									for (var i = 0; i < data.data.msg.length; i++) {
										htmls +=
											'<li><a class="messageToPage" data-id="' +
											data.data.msg[i].message_id +
											'" layadmin-event="messageToPage" lay-text="消息中心" lay-href="' +
											data.data.msg[i].message_url +
											'?id=' +
											data.data.msg[i].message_content_id +
											'">' +
											data.data.msg[i].message_content +
											'来自' +
											data.data.msg[i].from_name +
											'</a></li>'
									}
									layer.open({
										type: 2,
										title: '新消息',
										shade: false,
										area: ['350px', '200px'],
										offset: 'rb', //右下角弹出
										shift: 2,
										content: '/home/msg.html?v=20181207',
										time: 12000,
										success: function(layero, index) {
											var body = layer.getChildFrame('body', index)
											var iframeWin = window[layero.find('iframe')[0]['name']] //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
											body.find('ul').append(htmls) //得到iframe页的body内容
										},
									})
									$.ajax({
										url: urls + '/gateway/notifyMessage/list',
										dataType: 'json',
										type: 'post',
										data: {
											status: 1,
										},
										success: function(data) {
											if (data.status_code == 200) {
												$('#messageDo').html(data.data.total_count)
												$('#messageDo').removeClass('layui-hide')
											}
										},
									})
								}
							} else if (data.status_code == 401) {
								//获取cookie中 语言变量
								// $.menuInit(data.data,language);
								alert('登录已失效，请重新登录！')
								window.location.href = 'login.html'
							} else if (data.status_code != 200) {
								alert(data.message)
							}
						},
					})
				},
			}
			userInfo.sessionId()
			setInterval('userInfo.sessionId()', 5000)
			// function getUrlParms (name) {
			//     var tstr = window.location.href;
			//     var index = tstr.indexOf('?')
			//     var str = tstr.substring(index + 1);
			//     var arr = str.split('&');
			//     var result = {};
			//     arr.forEach((item) => {
			//         var a = item.split('=');
			//         result[a[0]] = a[1];
			//     })
			//     return result[name];
			// }
			// var userName =getUrlParms("user");

			$('#logOut').click(function() {
				//
				// var prame = {
				$.ajax({
					url: '' + urls + '/gateway/logout',
					dataType: 'json',
					type: 'post',
					success: function(data) {
						if (data.status_code == 200 && data.message == 'OK') {
							//获取cookie中 语言变量

							window.location.href = 'login.html'
							// $.menuInit(data.data,language);
						} else if (data.status_code === 400 && data.message == '未登录') {
							// 登陆错误
							alert('登录已失效，请重新登录。')
							window.location.href = 'login.html'
						} else {
							alert(data.message)
							window.location.href = 'index.html'
						}
					},
				})
				// }
			})
			/*头部用户名neir*/
			/*页面导航*/
			/*大导航切换*/
			/*小导航跳转*/
			// console.log(window._user_);
			$.menuInit = function(ev, language) {
				var menu = {
					//导航参数及方法
					menuData: ev,
					userName: '',
					tNavHtml: '',
					lNavHtml: '',
					navTopId: $('#LAY-system-side-menu'),
					navLeftId: $('#nmenu_left'),
					openFrome: function(elem) {
						var url = elem.attr('lay-href')
						var h = $(window).height() - 55
						$('#LAY-system-side-menu')
							.find('li')
							.removeClass('openFr')
						elem.addClass('openFr')
						$('#frameRight').attr('src', url)
						$('#frameRight').css('height', h)
					},
				}
				$.each(menu.menuData, function(key, val) {
					if (key == 'topNav') {
						for (var i = 0; i < menu.menuData[key].length; i++) {
							// console.log(topNav);
							menu.tNavHtml +=
								'<li  class="layui-nav-item  menuT_' +
								menu.menuData[key][i].id +
								'"><a href="javascript:void(0)" lay-tips="' +
								menu.menuData[key][i].display_name +
								'" ><i class="layui-iconFont iconfont ' +
								menu.menuData[key][i].icon +
								'"></i><cite>' +
								//    <i class="iconfont icon-jiantou"></i>
								menu.menuData[key][i].display_name +
								'</cite></a><dl class="layui-nav-child"></dl></li>'
						}
						$('#LAY-system-side-menu').html(menu.tNavHtml)
					}

					if (key == 'leftNav') {
						for (var i = 0; i < menu.menuData[key].length; i++) {
							//顶部切换的             // console.log(topNav);
							// console.log(menu.menuData[key][i]);
							for (var k = 0; k < menu.menuData[key][i].length; k++) {
								// menu.lNavHtml +='<dl class="layui-nav-child">'
								if (menu.menuData[key][i][k].children && menu.menuData[key][i][k].children.length > 0) {
									//包含子导航
									menu.lNavHtml +=
										'<dd class="parent_' +
										menu.menuData[key][i][k].parent_id +
										' "><a >' +
										menu.menuData[key][i][k].display_name +
										'</a><dl class="layui-nav-child">'
									for (var j = 0; j < menu.menuData[key][i][k].children.length; j++) {
										if (menu.menuData[key][i][k].children[j].children) {
											menu.lNavHtml +=
												'<dd class=" parent_' +
												menu.menuData[key][i][k].parent_id +
												'_' +
												menu.menuData[key][i][k].children[j].id +
												'"><a>' +
												menu.menuData[key][i][k].children[j].display_name +
												'</a><dl class="layui-nav-child">'
											for (var l = 0; l < menu.menuData[key][i][k].children[j].children.length; l++) {
												menu.lNavHtml +=
													'<dd class=" parent_' +
													menu.menuData[key][i][k].children[j].parent_id +
													'_' +
													menu.menuData[key][i][k].children[j].children[l].id +
													'"><a class="noChild"   lay-href="' +
													menu.menuData[key][i][k].children[j].children[l].static_html +
													'">' +
													menu.menuData[key][i][k].children[j].children[l].display_name +
													'</a></dd>'
											}
											menu.lNavHtml += '</dl></dd>'
										} else {
											menu.lNavHtml +=
												'<dd class=" parent_' +
												menu.menuData[key][i][k].parent_id +
												'_' +
												menu.menuData[key][i][k].children[j].id +
												'"><a class="noChild"   lay-href="' +
												menu.menuData[key][i][k].children[j].static_html +
												'">' +
												menu.menuData[key][i][k].children[j].display_name +
												'</a></dd>'
										}
									}
									menu.lNavHtml += '</dl></dd>'
								} else {
									menu.lNavHtml +=
										'<dd class=" parent_' +
										menu.menuData[key][i][k].parent_id +
										'"><a class="noChild"  lay-href="' +
										menu.menuData[key][i][k].static_html +
										'">' +
										menu.menuData[key][i][k].display_name +
										'</a></dd>'
								}
								// console.log(menu.menuData[key][i][k].parent_id);
								// menu.lNavHtml+= "</dl>"
								// console.log(menu.lNavHtml);
								$('.menuT_' + menu.menuData[key][i][k].parent_id + '')
									.children('dl')
									.append(menu.lNavHtml)
								menu.lNavHtml = ''
							}
							// var pid = "parentId"+menu.menuData[key][i].parent_id;
							// menu.lNavOb[pid]= menu.menuData[key][i];
						}
					}
				})
				//静态导航

				// var ulHtml = '<li><i class="iconfont icon-jiantou pos_a"></i><a href="javascript:void(0)" data-url="no.html">工作流</a></li> \
				// <li><i class="iconfont icon-jiantou pos_a"></i><a href="javascript:void(0)" data-url="no.html">行政事务</a></li> \
				// <li><i class="iconfont icon-jiantou pos_a"></i><a href="javascript:void(0)" data-url="no.html">人力资源</a></li> \
				// <li><i class="iconfont icon-jiantou pos_a"></i><a href="javascript:void(0)" data-url="no.html">公文档案管理</a></li>\
				// <li><i class="iconfont icon-jiantou pos_a"></i><a href="javascript:void(0)" data-url="no.html">财务管理</a></li>';
				// $("#LAY-system-side-menu").append(ulHtml);
				// $("#nmenu_top li").click(function(){
				//     var unll = $(this).find("a").attr("data-url");
				//     $("#frameRight").attr("src",unll);
				//     var h =$(window).height() - 55;
				//     $("#frameRight").css("height",h);
				// })
				// console.log(menu.lNavOb);
				//生成页面

				// $("#nmenu_top a:first-child").addClass("active");
				// $("#nmenu_left").html(menu.lNavHtml);
				// $("#nmenu_left ul.list1:first-child").addClass("active");
				// $("#nmenu_top li>a").toggle(function(){//展开
				//     var ida = $(this).parent("li").attr("class").split('_')[1];
				//     $(this).addClass("active");

				// },function(){

				//     $(this).removeClass("active");
				//     $(".parent_"+ida+"").parent("ul").removeClass("active")
				// });
				// $("#nmenu_left li.isChild>a").on("click",$("#nmenu_left"),function(){
				//     var list_2 = $(this).siblings("ul.list2");
				//     if(list_2.hasClass("active")){
				//         list_2.removeClass("active");
				//     }else{
				//         list_2.addClass("active");
				//     };
				// });
				// $("#nmenu_top li a.isChild").toggle(function(){
				//     // $(this)
				// // });
				// $("#nmenu_top>li>a").click(function(){
				//     if( $(this).parent("li").hasClass("active") ){
				//         $(this).parent("li").removeClass("active");
				//     }else{
				//         $(this).parent("li").addClass("active");
				//         // console.log($(this),222)

				//     }

				// })
				// $("#nmenu_top>li").find("a.isChild").click(function(){
				//     if($(this).parent("li").hasClass("active")){
				//         $(this).parent("li").removeClass("active");
				//     }else{
				//         $(this).parent("li").addClass("active");
				//     }

				// })
				// $("#nmenu_top").on('click','a.noChild',function(){
				//     menu.openFrome($(this));
				// });
			}

			$.ajax({
				url: urls + '/gateway/menu/list',
				dataType: 'json',
				type: 'post',
				success: function(data) {
					if (data.status_code == 200 && data.message == 'OK') {
						//获取cookie中 语言变量
						var language = $.cookie('cookie_now_lang')

						$.menuInit(data.data, language)
						// var element = layui.element;
						element.render('side', 'layadmin-system-side-menu')
					} else if (data.status_code === 400 && data.message == '未登录') {
						// 登陆错误
						alert('登录已失效，请重新登录。')
						window.location.href = 'login.html'
					} else {
						// window.location.href = 'login.html';
					}
				},
			})

			// layui.use('element', function(){
			//     var element = layui.element;

			//     //一些事件监听
		})
	// });
})
