/** 子页面 公用js **/
/* 1.子页面所需接口地址 url ，2.所需登录账号的信息 3.ajax方法 4.自定义选人弹窗*/
//定义子页面
window.urls = parent.window.urls
window.userInfo = parent.window.userInfo
var ajaxSenquce = []
// console.log(111,ajaxSenquce)
$.ajaxSetup({
	xhrFields: {
		withCredentials: true,
	},
})
// 利用冒泡偵聽點擊的內容
$(document).ready(function() {
	$('body').on(
		'click',
		"a[href*='/download']," +
			"a:contains('.jpg')," +
			"a:contains('.jpeg')," +
			"a:contains('.png')," +
			"a:contains('.svg')," +
			"a:contains('.bmp')," +
			"a:contains('.pdf')",
		function(e) {
			var $a = $(e.target)
			// $(e.target).attr('target', '_blank')
			window.open($a.attr('href'), '预览', (config = 'height=600,width=800'))
		}
	)
})

$.fetch = function(o = {}) {
	if (ajaxSenquce.findIndex(v => v === o.url) != -1) {
		return
	}
	if (o.url !== '/gateway/user/info') {
		ajaxSenquce.push(o.url)
	}
	// console.log(111,ajaxSenquce)
	$.ajax({
		timeout: 120000,
		type: o.type || 'GET',
		url: window.urls + o.url,
		data: o.data || {},
		dataType: 'json',
		success(data, status, xhr) {
			if (data.status_code === 200) {
				o.cb && o.cb(data.data)
			} else if (data.status_code === 400 && data.message == '未登录') {
				layer.confirm('登录已失效，请重新登录.', function(index) {
					window.location.href = 'login.html'
				})
			} else {
				layer.msg('' + data.message + '', { anim: 6 }, { offset: 'rt' }, { time: 1000 })
			}
		},
		error(xhr, errorType, error) {
			console.error(error)
			if (errorType === 'timeout') {
				layer.confirm('请求失败，是否重试？.', function(index) {
					$.fetch(o)
				})
			}
			layer.msg('网络错误！', { anim: 6 }, { time: 1000 })
		},
		complete() {
			// console.log(o.url)
			ajaxSenquce.splice(
				ajaxSenquce.findIndex(v => v == o.url),
				1
			)
		},
	})
}
var selMemberFun = function(el) {
	//添加用户弹窗
	//el 当前点击的标签
	layTit = el.parent().attr('data-title')
	if (layTit == '') {
		layTit = ' '
	}
	var pophtml =
		'<div class=" popUpsCont popUps">' +
		'<div class="layui-card-body layui-row popUpsCont">' +
		'<div id=""  class=" layui-col-xs12">' +
		'<div class="layui-inline" style=" margin: 10px 0;">' +
		'<label class="layui-form-label" style="width: 56px;padding-left: 0;">用户搜索</label>' +
		'<div class="layui-input-inline">' +
		'<input type="text" name="username" id="usernamesq"  lay-verify="" placeholder="请输入用户名" autocomplete="off" class="layui-input">' +
		'</div>' +
		// +'<div class="layui-inline">'
		//     +'<button id="scqUser" class="layui-btn layui-btn"><i class="iconfont icon-sousuo"></i></button>'
		// +'</div>'
		'</div>' +
		'</div>' +
		'<div id="main1"  class="limit layui-col-xs5">' +
		'<div class="browserTab">' +
		'<a href="javascript:void(0)" class="active">按当前部门选择</a>' +
		'<a href="javascript:void(0)">按部门选择</a>' +
		'<a href="javascript:void(0)">按角色选择</a>' +
		'</div>' +
		'<ul id="browser1" class="filetree"></ul>' +
		'<ul id="browser2" class="filetree"></ul>' +
		'<ul id="browser3" class="filetree"></ul>' +
		'</div>' +
		' <div id="userList"  class="limitCont layui-col-xs4">' +
		'<div class="deparTit">成员选择列表</div>' +
		'<ul><div style="height: 255px;line-height: 255px;text-align: center;font-size: 22px;color: #ccc;">请先选择部门或角色</div></ul>' +
		'<div id="userPage"></div>' +
		'</div>' +
		'<div  id="pickUserlist" class="selected layui-col-xs3">' +
		'<div>已选成员</div>' +
		'<ul> </ul>' +
		'</div>' +
		'<div class="chosBtn layui-col-xs12">' +
		'<div id="btmChosBtn" style="display:none;">' +
		'<a id="addAllDePUser" class="layui-btn layui-btn-sm">全选当前部门</a>' +
		'<a id="addAllRolUser" class="layui-btn layui-btn-sm" style="display:none;" >全选当前角色</a>' +
		'<a id="addAllPageUser" class="layui-btn layui-btn-normal layui-btn-sm">全选当前页</a>' +
		'<a id="removerAllUser" class="layui-btn layui-btn-primary layui-btn-sm">清空已选</a>' +
		'<span class="red">注：全选后不会删除已选成员。</span>' +
		'</div>' +
		'</div>' +
		'</div>' +
		'</div>'
	layer.open({
		title: layTit,
		content: pophtml,
		type: 1,
		area: ['800px', '540px'],
		btn: ['添加已选', '取消'],
		yes: function(index, layero) {
			//do something
			var nameArr = '',
				idstr = '',
				nameText = '',
				titlename = '',
				departmentName = ''
			nameArr = $('#pickUserlist>ul').html()
			$('#pickUserlist>ul>li').each(function(index, val) {
				if (index > 0) {
					idstr += ','
				}
				idstr += '' + $(this).attr('data-user') + ''
				nameText += '' + $(this).text() + ','
				titlename += '' + $(this).attr('data-titlename') + ''
				departmentName += '' + $(this).attr('data-department') + ''
			})
			el.siblings('ul').html(nameArr)
			el.siblings('ul').attr('data-val', idstr)
			el.siblings('.layui-textarea').html(nameText)
			el.parents()
				.find('#workTitle')
				.val(departmentName)
			el.parents()
				.find('#titlename')
				.val(titlename)
			selTerr([], $('#browser2'), 2)
			selTerr([], $('#browser3'), 1)
			selTerr([], $('#browser1'), 1)
			$('#userList>ul').html('')
			$('#pickUserlist>ul').html('')
			$('#userPage')
				.hide()
				.html('')
			layer.close(index) //如果设定了yes回调，需进行手工关闭
		},
		success: function() {
			// $("#scqUser").on("click",function(){
			//     var uname = $("#usernamesq").val();
			//     clickTerr({userName:uname},true);
			// })usernamesq
			$('#usernamesq').bind('input propertychange', function() {
				var uname = $('#usernamesq').val()
				clickTerr({ userName: uname }, true)
			})
		},
	})
	var nowArr = [] //已选
	var roleList = [] //角色列表
	var deparList = [] //权限列表
	var textStr = el.siblings('ul').attr('data-val')
	if (textStr !== undefined) {
		roleList = textStr.split(',')
		var rolHtml = el.siblings('ul').html()
		$('#pickUserlist>ul').html(rolHtml)
	}
	var selTerr = function(o, el, ls) {
		//生成列表的方法
		var html = ''

		function forTree(o) {
			for (var i = 0; i < o.length; i++) {
				html += '<li>'
				if (o[i].children && o[i].children.length > 0) {
					html +=
						'<span class="isChid folder" data-id="' +
						o[i].id +
						'"><i class="iconfont bclick icon-40"></i><i class="iconfont icon-zy_qunzuduoren"></i><a data-id="' +
						o[i].id +
						'">' +
						o[i].name +
						'</a></span><ul>'
					forTree(o[i].children) //存在子级再次调用循环
					html += '</ul>'
				} else {
					html +=
						'<span class="noChid Shrink file" data-id="' +
						o[i].id +
						'"><i class="iconfont null"></i><i class="iconfont icon-zy_qunzuduoren"></i><a data-id="' +
						o[i].id +
						'">' +
						o[i].name +
						'</a></span>'
				}

				html += '</li>'
			}
		}

		forTree(o)
		el.html(html)
		el.find('span.isChid>i.bclick').click(function() {
			//展示样式
			if ($(this).hasClass('icon-jianhao')) {
				$(this)
					.parent('span')
					.next('ul')
					.removeClass('active')
				$(this)
					.addClass('icon-40')
					.removeClass('icon-jianhao')
			} else {
				$(this)
					.parent('span')
					.next('ul')
					.addClass('active')
				$(this)
					.addClass('icon-jianhao')
					.removeClass('icon-40')
			}
		})
		el.off('click').on('click', 'span>a', function() {
			var Id = $(this).attr('data-id')
			var titles = $(this).text()
			if (ls == 1) {
				var obj = {
					departmentId: Id,
				}
				$('#addAllDePUser')
					.show()
					.attr('data-nid', Id)
				$('#addAllRolUser').hide()
			}
			if (ls == 2) {
				var obj = {
					roleId: Id,
				}
				$('#addAllRolUser')
					.show()
					.attr('data-nid', Id)
				$('#addAllDePUser').hide()
			}
			$('#main1>ul.filetree')
				.find('span')
				.removeClass('on')
			$('#userList>.deparTit').text(titles)
			$(this)
				.parent('span')
				.addClass('on')
			clickTerr(obj)
		})
	}
	var clickTerr = function(o = {}, isSq) {
		//列表选择后执行的方法
		// if(isSq&&o.userName==''){
		//     layer.msg('请输入用户名');
		//     return false
		// }
		$.fetch({
			url: '/gateway/user/list',
			type: 'post',
			data: o,
			cb: function(rs) {
				var page = {
					last_page: rs.last_page,
					page_index: rs.page_index,
					page_size: rs.page_size,
					total_count: rs.total_count,
				}
				//生成中间部分用户列表
				ceckMenber(rs.data_list, page, o)
				if (!isSq) {
					$('#btmChosBtn').show()
					$('#addAllDePUser')
						.off('click')
						.on('click', function() {
							var id = $(this).attr('data-nid')
							$.fetch({
								url: '/gateway/user/list',
								type: 'post',
								data: {
									departmentId: id,
									pageSize: 1000,
								},
								cb: function(rs) {
									for (var i = 0; i < rs.data_list.length; i++) {
										if (roleList.indexOf('' + rs.data_list[i].id) == -1) {
											//判断数组是否存在当前id
											roleList.push('' + rs.data_list[i].id)
											var ulist =
												'<li class="pick" data-user="' +
												rs.data_list[i].id +
												'">' +
												rs.data_list[i].name +
												' (' +
												rs.data_list[i].title_name +
												')</li>'
											$('#pickUserlist>ul').append(ulist)
										}
									}
									$('#userList>ul')
										.find('li.dbl')
										.addClass('pick')
										.removeClass('dbl')
								},
							})
						})
					$('#addAllRolUser')
						.off('click')
						.on('click', function() {
							var id = $(this).attr('data-nid')
							$.fetch({
								url: '/gateway/user/list',
								type: 'post',
								data: {
									roleId: id,
									pageSize: 1000,
								},
								cb: function(rs) {
									for (var i = 0; i < rs.data_list.length; i++) {
										if (roleList.indexOf('' + rs.data_list[i].id) == -1) {
											//判断数组是否存在当前id
											roleList.push('' + rs.data_list[i].id)
											var ulist =
												'<li class="pick" data-user="' +
												rs.data_list[i].id +
												'">' +
												rs.data_list[i].name +
												' (' +
												rs.data_list[i].title_name +
												')</li>'
											$('#pickUserlist>ul').append(ulist)
										}
									}
									$('#userList>ul')
										.find('li.dbl')
										.addClass('pick')
										.removeClass('dbl')
								},
							})
						})
					$('#addAllPageUser')
						.off('click')
						.on('click', function() {
							var datas = $.extend({ currentIndex: page.page_index }, o)
							$.fetch({
								url: '/gateway/user/list',
								type: 'post',
								data: datas,
								cb: function(rs) {
									for (var i = 0; i < rs.data_list.length; i++) {
										if (roleList.indexOf('' + rs.data_list[i].id) == -1) {
											//判断数组是否存在当前id
											roleList.push('' + rs.data_list[i].id)
											var ulist =
												'<li class="pick" data-user="' +
												rs.data_list[i].id +
												'">' +
												rs.data_list[i].name +
												' (' +
												rs.data_list[i].title_name +
												')</li>'
											$('#pickUserlist>ul').append(ulist)
										}
									}
									$('#userList>ul')
										.find('li.dbl')
										.addClass('pick')
										.removeClass('dbl')
								},
							})
						})

					$('#removerAllUser')
						.off('click')
						.on('click', function() {
							$('#pickUserlist>ul').html('')
							roleList = []
							$('#userList>ul')
								.find('li.pick')
								.addClass('dbl')
								.removeClass('pick')
						})
				} else {
					$('#btmChosBtn').hide()
					$('#userList>.deparTit').text('成员选择列表')
					if (rs.data_list.length == 0) {
						$('#userList>ul').html(
							'<div style="height: 255px;line-height: 255px;text-align: center;font-size: 22px;color: #ccc;">查询不到此用户<div>'
						)
					}
				}
			},
		})
	}
	var ceckMenber = function(obj, page, o) {
		//选中用户的方法
		var html = ''

		//先判断是否存在已经选中的
		for (var i = 0; i < obj.length; i++) {
			if (roleList.indexOf(obj[i].id + '') == -1) {
				var isPick = 'dbl'
			} else {
				var isPick = 'pick'
			}
			html +=
				'<li class="' +
				isPick +
				'" data-user=' +
				obj[i].id +
				' data-titleName=' +
				obj[i].title_name +
				' data-department=' +
				obj[i].department_name +
				'>' +
				obj[i].name +
				' (' +
				obj[i].title_name +
				')</li>'
		}
		$('#userList>ul').html(html)
		$('#userPage').show()
		var pageHtml = ''
		pageHtml +=
			'<p class="nowPage">第' + page.page_index + '页(共' + page.last_page + '页)</p><p class="prevPage">上一页</p><p class="nextPage">下一页</p>'
		$('#userPage').html(pageHtml)
		if (page.page_index > 1) {
			$('#userPage>.prevPage').on('click', function() {
				var index = page.page_index - 1
				o.currentIndex = index
				var pra = o
				clickTerr(pra)
			})
		} else {
			$('#userPage>.prevPage').addClass('disable')
		}
		if (page.page_index < page.last_page) {
			$('#userPage>.nextPage').on('click', function() {
				var index = page.page_index + 1
				o.currentIndex = index
				var pra = o
				clickTerr(pra)
			})
		} else {
			$('#userPage>.nextPage').addClass('disable')
		}
		//选中
		$('#userList>ul')
			.off('click')
			.on('click', 'li.dbl', function() {
				var roId = $(this).attr('data-user')
				$(this)
					.addClass('pick')
					.removeClass('dbl')
				//把选中的id 存入数组
				if (roleList.indexOf(roId) == -1) {
					//判断数组是否存在当前id
					roleList.push(roId)
					var pickLi = $(this).prop('outerHTML')
					$('#pickUserlist>ul').append(pickLi)
				}
			})
	}
	$('#pickUserlist>ul')
		.off('mouseenter')
		.on('mouseenter', 'li', function() {
			$(this).append('<i class="iconfont icon-guanbi"></i>')
			$(this)
				.children('i')
				.one('click', function() {
					var userId = $(this)
						.parent('li.pick')
						.attr('data-user')
					roleList.splice($.inArray(userId, roleList), 1)
					$(this)
						.parent('li.pick')
						.remove()
					$('#userList')
						.find('li[data-user="' + userId + '"]')
						.addClass('dbl')
						.removeClass('pick')
				})
		})
	$('#pickUserlist>ul')
		.off('mouseleave')
		.on('mouseleave', 'li', function() {
			$(this)
				.children('i')
				.remove()
		})
	$.fetch({
		//部门树列表
		url: '/gateway/department/tree',
		type: 'post',
		cb: function(rs) {
			var obj = rs[0].children[0].children
			selTerr(obj, $('#browser2'), 1)
		},
	})
	$.fetch({
		url: '/gateway/role/list',
		type: 'post',
		cb: function(rs) {
			selTerr(rs, $('#browser3'), 2)
		},
	})
	$.fetch({
		url: '/gateway/currentDept/tree',
		type: 'post',
		cb: function(rs) {
			selTerr(rs[0].children[0].children, $('#browser1'), 1)
		},
	})
	$('#main1 .browserTab').on('click', 'a', function() {
		var index = $(this).index()
		$(this)
			.addClass('active')
			.siblings('a')
			.removeClass('active')
		$('#main1>ul')
			.eq(index)
			.show()
		$('#main1>ul')
			.eq(index)
			.siblings('ul')
			.hide()
	})
}
var selDeparFun = function(el) {
	//添加部门弹窗
	layTit = el.parent().attr('data-title')
	if (layTit == '') {
		layTit = ' '
	}
	var pophtml =
		'<div class=" popUpsCont popUps">' +
		'<div class="layui-card-body layui-row popUpsCont">' +
		'<div id="main1"  class="limit layui-col-xs5">' +
		'<div class="browserTab">' +
		'<a href="javascript:void(0)" class="active">选择部门</a>' +
		'</div>' +
		'<ul id="browser1" class="filetree"></ul>' +
		'</div>' +
		'<div  id="pickUserlist" class="selected layui-col-xs5 fr">' +
		'<div>已选部门</div>' +
		'<ul> </ul>' +
		'</div>' +
		'</div>' +
		'</div>'
	layer.open({
		title: layTit,
		content: pophtml,
		area: ['600px', '480px'],
		btn: ['添加已选', '取消'],
		yes: function(index, layero) {
			//do something
			var nameArr = '',
				idstr = '',
				nameText = ''
			nameArr = $('#pickUserlist>ul').html()
			$('#pickUserlist>ul>li').each(function(index, val) {
				if (index > 0) {
					idstr += ','
				}
				idstr += '' + $(this).attr('data-user') + ''
				nameText += '' + $(this).text() + ','
			})
			el.siblings('ul').html(nameArr)
			el.siblings('ul').attr('data-val', idstr)
			el.siblings('.layui-textarea').html(nameText)
			selTerr([], $('#browser1'), 1)
			$('#userList>ul').html('')
			$('#pickUserlist>ul').html('')
			$('#userPage')
				.hide()
				.html('')
			layer.close(index) //如果设定了yes回调，需进行手工关闭
		},
	})
	var nowArr = [] //已选
	var roleList = [] //角色列表
	var deparList = [] //权限列表
	var textStr = el.siblings('ul').attr('data-val')
	if (textStr !== undefined) {
		roleList = textStr.split(',')
		var rolHtml = el.siblings('ul').html()
		$('#pickUserlist>ul').html(rolHtml)
	}
	var selTerr = function(o, el, ls) {
		//生成列表的方法
		var html = ''

		function forTree(o) {
			for (var i = 0; i < o.length; i++) {
				html += '<li>'
				if (o[i].children && o[i].children.length > 0) {
					html +=
						'<span class="dbl isChid folder" data-id="' +
						o[i].id +
						'"><i class="iconfont bclick icon-40"></i><i class="iconfont icon-zy_qunzuduoren"></i><a data-id="' +
						o[i].id +
						'">' +
						o[i].name +
						'</a></span><ul>'
					forTree(o[i].children) //存在子级再次调用循环
					html += '</ul>'
				} else {
					html +=
						'<span class="dbl noChid Shrink file" data-id="' +
						o[i].id +
						'"><i class="iconfont null"></i><i class="iconfont icon-zy_qunzuduoren"></i><a data-id="' +
						o[i].id +
						'">' +
						o[i].name +
						'</a></span>'
				}

				html += '</li>'
			}
		}

		forTree(o)
		el.html(html)

		for (var i = 0; i < roleList.length; i++) {
			$('a[data-id="' + roleList[i] + '"]')
				.parent('span')
				.removeClass('dbl')
				.addClass('layui-disabled')
		}
		el.find('span.isChid>i.bclick').click(function() {
			//展示样式
			if ($(this).hasClass('icon-jianhao')) {
				$(this)
					.parent('span')
					.next('ul')
					.removeClass('active')
				$(this)
					.addClass('icon-40')
					.removeClass('icon-jianhao')
			} else {
				$(this)
					.parent('span')
					.next('ul')
					.addClass('active')
				$(this)
					.addClass('icon-jianhao')
					.removeClass('icon-40')
			}
		})
		el.off('click').on('click', 'span.dbl>a', function() {
			var Id = $(this).attr('data-id')
			var titles = $(this).text() //文本
			var pickHtml = '<li class="pick" data-user="' + Id + '">' + titles + '</li>'
			$('#main1>ul.filetree')
				.find('span')
				.removeClass('on')
			$('#pickUserlist ul').append(pickHtml)
			roleList.push('' + Id)
			$(this)
				.parent('span')
				.addClass('layui-disabled')
				.removeClass('dbl')
		})
	}
	$('#pickUserlist>ul')
		.off('mouseenter')
		.on('mouseenter', 'li', function() {
			$(this).append('<i class="iconfont icon-guanbi"></i>')
			$(this)
				.children('i')
				.one('click', function() {
					var userId = $(this)
						.parent('li.pick')
						.attr('data-user')
					roleList.splice($.inArray(userId, roleList), 1)
					$(this)
						.parent('li.pick')
						.remove()
					$('#main1')
						.find('a[data-id="' + userId + '"]')
						.parent('span')
						.removeClass('layui-disabled')
						.addClass('dbl')
				})
		})
	$('#pickUserlist>ul')
		.off('mouseleave')
		.on('mouseleave', 'li', function() {
			$(this)
				.children('i')
				.remove()
		})
	$.fetch({
		//部门树列表
		url: '/gateway/department/tree',
		type: 'post',
		cb: function(rs) {
			var obj = rs[0].children[0].children
			selTerr(obj, $('#browser1'))
		},
	})
}
var selRoleFun = function(el) {
	//添加角色弹窗
	layTit = el.parent().attr('data-title')
	if (layTit == '') {
		layTit = ' '
	}
	var pophtml =
		'<div class=" popUpsCont popUps">' +
		'<div class="layui-card-body layui-row popUpsCont">' +
		'<div id="main1"  class="limit layui-col-xs5">' +
		'<div class="browserTab">' +
		'<a href="javascript:void(0)" class="active">选择角色</a>' +
		'</div>' +
		'<ul id="browser1" class="filetree"></ul>' +
		'</div>' +
		'<div  id="pickUserlist" class="selected layui-col-xs5 fr">' +
		'<div>已选角色</div>' +
		'<ul></ul>' +
		'</div>' +
		'</div>' +
		'</div>'
	layer.open({
		title: layTit,
		content: pophtml,
		area: ['600px', '480px'],
		btn: ['添加已选', '取消'],
		yes: function(index, layero) {
			//do something
			var nameArr = '',
				idstr = '',
				nameText = ''
			nameArr = $('#pickUserlist>ul').html()
			$('#pickUserlist>ul>li').each(function(index, val) {
				if (index > 0) {
					idstr += ','
				}
				idstr += '' + $(this).attr('data-user') + ''
				nameText += '' + $(this).text() + ','
			})
			el.siblings('ul').html(nameArr)
			el.siblings('ul').attr('data-val', idstr)
			el.siblings('.layui-textarea').html(nameText)
			selTerr([], $('#browser1'), 1)
			$('#userList>ul').html('')
			$('#pickUserlist>ul').html('')
			$('#userPage')
				.hide()
				.html('')
			layer.close(index) //如果设定了yes回调，需进行手工关闭
		},
	})
	var nowArr = [] //已选
	var roleList = [] //角色列表
	var deparList = [] //权限列表
	var textStr = el.siblings('ul').attr('data-val')
	if (textStr !== undefined) {
		roleList = textStr.split(',')
		var rolHtml = el.siblings('ul').html()
		$('#pickUserlist>ul').html(rolHtml)
	}
	var selTerr = function(o, el, ls) {
		//生成列表的方法
		var html = ''

		function forTree(o) {
			for (var i = 0; i < o.length; i++) {
				html += '<li>'
				if (o[i].children && o[i].children.length > 0) {
					html +=
						'<span class="dbl isChid folder" data-id="' +
						o[i].id +
						'"><i class="iconfont bclick icon-40"></i><i class="iconfont icon-zy_qunzuduoren"></i><a data-id="' +
						o[i].id +
						'">' +
						o[i].name +
						'</a></span><ul>'
					forTree(o[i].children) //存在子级再次调用循环
					html += '</ul>'
				} else {
					html +=
						'<span class="dbl noChid Shrink file" data-id="' +
						o[i].id +
						'"><i class="iconfont null"></i><i class="iconfont icon-zy_qunzuduoren"></i><a data-id="' +
						o[i].id +
						'">' +
						o[i].name +
						'</a></span>'
				}

				html += '</li>'
			}
		}

		forTree(o)
		el.html(html)

		for (var i = 0; i < roleList.length; i++) {
			$('a[data-id="' + roleList[i] + '"]')
				.parent('span')
				.removeClass('dbl')
				.addClass('layui-disabled')
		}
		// $("#"+el.attr("id")+">li>ul>li>span").children("i.iconlev").addClass("icon-gongsi");
		el.find('span.isChid>i.bclick').click(function() {
			//展示样式
			if ($(this).hasClass('icon-jianhao')) {
				$(this)
					.parent('span')
					.next('ul')
					.removeClass('active')
				$(this)
					.addClass('icon-40')
					.removeClass('icon-jianhao')
			} else {
				$(this)
					.parent('span')
					.next('ul')
					.addClass('active')
				$(this)
					.addClass('icon-jianhao')
					.removeClass('icon-40')
			}
		})
		el.off('click').on('click', 'span.dbl>a', function() {
			var Id = $(this).attr('data-id')
			var titles = $(this).text() //文本
			var pickHtml = '<li class="pick" data-user="' + Id + '">' + titles + '</li>'
			$('#main1>ul.filetree')
				.find('span')
				.removeClass('on')
			$('#pickUserlist ul').append(pickHtml)
			roleList.push('' + Id)
			$(this)
				.parent('span')
				.addClass('layui-disabled')
				.removeClass('dbl')
		})
	}
	$('#pickUserlist>ul')
		.off('mouseenter')
		.on('mouseenter', 'li', function() {
			$(this).append('<i class="iconfont icon-guanbi"></i>')
			$(this)
				.children('i')
				.one('click', function() {
					var userId = $(this)
						.parent('li.pick')
						.attr('data-user')
					roleList.splice($.inArray(userId, roleList), 1)
					$(this)
						.parent('li.pick')
						.remove()
					$('#main1')
						.find('a[data-id="' + userId + '"]')
						.parent('span')
						.removeClass('layui-disabled')
						.addClass('dbl')
				})
		})
	$('#pickUserlist>ul')
		.off('mouseleave')
		.on('mouseleave', 'li', function() {
			$(this)
				.children('i')
				.remove()
		})
	$.fetch({
		url: '/gateway/role/list',
		type: 'post',
		cb: function(rs) {
			selTerr(rs, $('#browser1'))
		},
	})
}
$.managerFun = function(obj = {}) {
	//
	if (obj.departmentId) {
		var dprId = obj.departmentId
	} else {
		var dprId = window.userInfo.dapartId
	}
	if (obj.applyuserId) {
		var userId = obj.applyuserId
	} else {
		var userId = window.userInfo.userId
	}
	if (obj.approvalType) {
		var approvalType = obj.approvalType
	} else {
		var approvalType = null
	}
	if (obj.itemId) {
		var itemId = obj.itemId
	} else {
		var itemId = null
	}
	$.fetch({
		url: '/gateway/approval/managerList',
		type: 'post',
		data: {
			departmentId: dprId,
			step: obj.step,
			applyuserId: userId,
			approvalType: approvalType,
			itemId: itemId,
		},
		cb: function(rs) {
			var steps = rs.step
			var forw = rs.forwardUsers
			var rs = rs.userList
			if (rs.length == 0) {
				$('#nextDacApp')
					.parents('.layui-form-item')
					.hide()
				rs = [{ name: '暂无下一步', id: 0 }]
			} else {
				$('#nextDacApp')
					.parent('td')
					.parent('tr')
					.show()
			}
			obj.fun(rs, forw, steps)
		},
	})
}
$.pageFun = function(o = {}) {
	//自定义分页
	var page = o.page
	var elem = o.elem
	var pageLi = ''
	var index = page.page_index
	var p_disabled = page.page_index == 1 ? 'disabled' : ''
	var n_disabled = page.page_index == page.last_page ? 'disabled' : ''
	pageLi += '<span class="prev ' + p_disabled + '"><i class="iconfont icon-triangle-left leftIcon"></i></span><ul class="pag">'
	for (var i = 1; i <= page.last_page; i++) {
		var active = page.page_index == i ? 'active' : ''
		pageLi += '<li class="' + active + '" ><a href="javascript:void(0)">' + i + '</a></li>'
	}

	pageLi += '</ul></ul><span class="next ' + n_disabled + '"><i class="iconfont icon-triangle-left"></i></span>'
	elem.html(pageLi)
	elem.children('.prev').on('click', function() {
		if (index > 1) {
			index = index - 1
			getList(index, o)
		}
	})
	elem.children('.next').on('click', function() {
		if (index < page.last_page) {
			index = index + 1
			getList(index, o)
		}
	})
	elem
		.children('.pag')
		.off('click')
		.on('click', 'li', function() {
			var n = $(this).text()
			if (index != n) {
				getList(n, o)
			}
		})

	function getList(index, o) {
		o.pram.currentIndex = index
		$.fetch({
			url: o.url,
			type: 'post',
			data: o.pram,
			cb: function(rs) {
				var page = {
					last_page: rs.last_page,
					page_index: rs.page_index,
					page_size: rs.page_size,
					total_count: rs.total_count,
				}
				o.fun(rs.data_list)
				$.pageFun({
					elem: elem,
					page: page,
					url: o.url,
					pram: o.pram,
					fun: function(rdata) {
						o.fun(rdata)
					},
				})
			},
		})
	}
}
// 只能输入数字和小数点；
// 小数点只能有1个
// 第一位不能是小数点
// 第一位如果输入0，且第二位不是小数点，则去掉第一位的0
// 小数点后保留2位
var NumberCheck = function(num) {
	var str = num
	var len1 = str.substr(0, 1)
	var len2 = str.substr(1, 1)
	//如果第一位是0，第二位不是点，就用数字把点替换掉
	if (str.length > 1 && len1 == 0 && len2 != '.') {
		str = str.substr(1, 1)
	}
	//第一位不能是.
	if (len1 == '.') {
		str = ''
	}
	//限制只能输入一个小数点
	if (str.indexOf('.') != -1) {
		var str_ = str.substr(str.indexOf('.') + 1)
		if (str_.indexOf('.') != -1) {
			str = str.substr(0, str.indexOf('.') + str_.indexOf('.') + 1)
		}
	}
	//正则替换，保留数字和小数点
	str = str.replace(/[^\d^\.]+/g, '')
	//如果需要保留小数点后两位，则用下面公式
	var result = str.toString().indexOf('.')
	if (result != -1) {
		// alert("含有小数点");

		var num3 = str.split('.')[1].slice(0, 2)
	} else {
		// alert("不含小数点");
	}
	// console.log(num3,(num3==''||num3==undefined)?'':'.'+num3,111)

	str = str.replace(/\.\d\d\d$/, num3 == '' || num3 == undefined ? '' : '.' + num3)
	// str = str.replace(/\.\d\d\d\d$/,'')
	// console.log(str)

	return str
} //blog.csdn.net/kukudelaomao/article/details/81536435?utm_source=copy
var NumberAmount = function(num) {
	var str = num
	var len1 = str.substr(0, 1)
	var len2 = str.substr(1, 1)
	//如果第一位是0，第二位不是点，就用数字把点替换掉
	if (str.length > 1 && len1 == 0) {
		str = str.substr(1, 1)
	}
	return str
} //blog.csdn.net/kukudelaomao/article/details/81536435?utm_source=copy
$.diffTime = function(starT, endT) {
	//计算时间差
	//如果时间格式是正确的，那下面这一步转化时间格式就可以不用了
	var dateBegin = new Date(starT.replace(/-/g, '/')) //将-转化为/，使用new Date
	var dateEnd = new Date(endT.replace(/-/g, '/')) //
	var dateDiff = dateEnd.getTime() - dateBegin.getTime() //时间差的毫秒数
	var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)) //计算出相差天数
	var leave1 = dateDiff % (24 * 3600 * 1000) //计算天数后剩余的毫秒数
	var hours = Math.floor(leave1 / (3600 * 1000)) //计算出小时数
	//计算相差分钟数
	var leave2 = leave1 % (3600 * 1000) //计算小时数后剩余的毫秒数
	var minutes = Math.floor(leave2 / (60 * 1000)) //计算相差分钟数
	//计算相差秒数
	var leave3 = leave2 % (60 * 1000) //计算分钟数后剩余的毫秒数
	var seconds = Math.round(leave3 / 1000)
	return '' + dayDiff + '天' + hours + '小时' + minutes + '分钟' + seconds + '秒'
}
// var loadTableFun=function(elem,icon){//loading
//     var  loadHtml   ='<div class=" layui-layer-loading table-loading" type="loading" times="1" showtime="0" contype="string" >'
//                         +'<div class="tc">加载中</div>'
//                         +'<div style="left: 50%; margin-left: -16px;" class="layui-layer-content layui-layer-loading'+icon+'"></div>'
//                         +'<span class="layui-layer-setwin"></span>'
//                     +'</div>'
//     elem.html(loadHtml);
// }
// loadTableFun($(".loadingTd"),2);
//
function toNonExponential(num) {
	//科学计数法转数字
	// console.log(num)
	if (num != null && num != undefined) {
		var num = Number(num)
		var m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
		return num.toFixed(Math.max(0, (m[1] || '').length - m[2]))
	} else {
		return ''
	}
}

$('table.table-limit-wideh').on('mouseenter', '.limit-width', function() {
	var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">' + $(this).text()
	;+'</div>'
	var that = this
	layer.tips(tipsCont1, that, {
		tips: [1, '#999'],
		maxWidth: 'auto',
	})
})
