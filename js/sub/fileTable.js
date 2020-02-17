
$(function () {
    layui.config({
        base: '../../layui/' //静态资源所在路径
    }).extend({
        index: 'index' //主入口模块
    }).use(['index','table','laydate','form','laypage'], function(){
        var $ = layui.$
        ,admin = layui.admin
        ,element = layui.element
        ,router = layui.router()
        ,layer = layui.layer;
        element.render();
        var table = layui.table
            ,laypage=layui.laypage
            ,form=layui.form
            ,laydate = layui.laydate;
    
        table.render({
            elem: '#table-checkbox'
            ,page: true
            ,limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000]
        });
        
        laydate.render({
            elem: '#entryTime' //指定元素
            ,type: 'date'
        });
        $.fetch({//公司下拉
            url: "/gateway/department/tree",
            type: 'post',
            dataType: 'JSON',
            cb:function(rs){
                var groupTree = rs[0].children;
                var obj ;
                var selhtml="";
                selhtml='<option value="">无选中</option>'
                $.each(groupTree,function(key,val){ 
                        obj = groupTree[key].children;
                        var ss='';
                        var selecHtml=function(o,jj){
                            jj+='　';
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
                        $("#department").html(selhtml);
                        form.render('select','user-file-form'); 
                   
                })
            }
        })

        // 生成表格
        table.render({
            elem: '#userFileTable',
            url: urls + "/gateway/archives/list",
            method: 'post',
            limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000],
            page: true, //开启分页
            text: {
                none: '暂无数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
            },
            cols:  [[ //标题栏
                {field: 'users_id', title: '编号', width:80}
                ,{field: 'company_name',itle:'公司名称', width:140}
                ,{field: 'user_name', title: '用户名',minWidth:100}
                ,{field: 'department_name', title: '部门',width:160}
                ,{
                    field: 'users_status',
                    title: '员工状态',
                    width:110,
                    templet: function (d) {
                        return d.users_status == 0 ? '正常' : d.users_status == 1 ? '停职' : d.users_status == 2 ? '休假' :d.users_status == 3 ? '离职' : ' '
                    }
                }
                ,{field: 'join_date', title: '入职时间',minWidth:120}
                ,{
                    field: 'work_visa',
                    title: '工作类型',
                    width:120,
                    templet:function(d){
                        return d.work_visa == 0 ? ('临时工签') : d.work_visa == 1 ? '9G工签' : ' '
                    }
                }
                ,{field: 'mobile',title: '手机号',minWidth:120}
                ,{
                    fixed: 'right'
                    ,title:'操作'
                    ,width:145
                    , toolbar: '<div><span class="fileSee layui-btn layui-btn-xs" lay-event="fileSee">查看详情</span><span class="fileChang layui-btn layui-btn-xs" lay-event="fileChang">编辑</span></div>'
                }
            ]]
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
            ,done:function(){
            }
        })

        table.on('tool(userFileTable)', function (obj) {
            var data = obj.data; //获得当前行数据
            var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）

            if(layEvent == 'fileSee'){ //查看详情
                var seehtml =''
                $.fetch({
                    url:"/gateway/archives/detail",
                    type: 'POST',
                    data:{
                        userId:data.users_id,
                    },
                    cb:function(rs){
                        var userName = rs.user_name==null?'':''+rs.user_name+''
                        var  stat_u =rs.users_status;
                        var  stat_text =stat_u==0?('正常'):stat_u==1?('停职'):stat_u==2?('休假'):stat_u==3?('离职'):('');
                        var  gender = rs.gender==0?('男'):rs.gender==1?'女':'男'//默认为男
                        var  visa =rs.work_visa ==0?('临时工签'): rs.work_visa==1?'9G工签':'';
                        var  employ_type =rs.employ_type ==0?('试用期'): rs.employ_type==1?'正式':'';
                        var contractContinue =rs.contract_if_continue==0?('不续约'): rs.contract_if_continue==1?'续约':'不续约';//默认为不续约
                        seehtml+='<div class="">'
                                +'<div class="layui-block layui-row layui-card-body">'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">用户名：</label><span>'+userName+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">编号：</label><span>'+forRsNull(rs.users_id)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">性别：</label><span>'+gender+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">公司名称：</label><span>'+forRsNull(rs.company_name)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">部门：</label><span>'+forRsNull(rs.department_name)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">职位：</label><span>'+forRsNull(rs.position)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">入职日期：</label><span>'+forRsNull(rs.join_date)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">转正日期：</label><span>'+forRsNull(rs.due_date)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">雇佣类型：</label><span>'+employ_type+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">员工状态：</label><span>'+stat_text+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">合同期开始：</label><span>'+forRsNull(rs.contract_startdate)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">合同期结束：</label><span>'+forRsNull(rs.contract_enddate)+'</span></div>'
                                        +'</div>'                                   
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">合同期/月：</label><span>'+forRsNull(rs.contract_time)+'月</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">合同期续约：</label><span>'+contractContinue+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">工作签类型：</label><span>'+visa+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">工作签号：</label><span>'+forRsNull(rs.visa_number)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">工作签开始：</label><span>'+forRsNull(rs.visa_startdate)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">工作签结束：</label><span>'+forRsNull(rs.visa_enddate)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">工作签年/月：</label><span>'+forRsNull(rs.visa_time)+'月</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">手机号：</label><span>'+forRsNull(rs.mobile)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm12">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">宿舍地址：</label><span>'+forRsNull(rs.dorm_address)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-sm6">'
                                            +'<div class="layui-input-lineHeight layui-lineHeigh layui-line"><label class="layui-bg-title">宿舍号：</label><span>'+forRsNull(rs.dorm_number)+'</span></div>'
                                        +'</div>'
                                        +'<div class="layui-col-xs12 mt-20">'
                                            +'<fieldset class="layui-elem-field">'
                                                +'<legend>备注</legend>'
                                                +'<div class="layui-field-box pageCont">'+forRsNull(rs.remark)+'</div>'
                                            +'</fieldset>'
                                        +'</div>'
                                    +'</div>'
                                +'</div>' 
        
                            
                        layer.open({//
                            title:''+userName+' 档案详情',
                            content:seehtml,
                            type:1,
                            id:'dailFileUrs',
                            area:['80%','95%'],
                            btn: ['返回'],
                            
                        })
                    
        
                    }
                })
            } else if (layEvent == 'fileChang') { //编辑
                changFileUser(data.users_id)
            }
        })
        
        function forRsNull(tdo){//为空数据处理
            var s= tdo==null?'':''+tdo+'';
            return s
        }

        $("#searchUserFile").on("click",function(){  //搜索条件
            var u_name =$("#EName").val();
            var depart =$("#department").val();
            var u_status =$("#status").val();
            var entryTime =$("#entryTime").val();

            table.reload('userFileTable', {
                where: { //调用列表数据
                    departmentId: depart,
                    userName: u_name,
                    userStatus: u_status,
                    joinTime: entryTime,
                    currentIndex: 1,
                    pageSize: 10,
                }
            })
        })

        var  changFileUser =function(uid){
            layer.open({
                title:' ',
                type: 2,
                content: 'FileManagement.html', //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['', 'no']
                area:['100%', '100%'],                                
                maxmin: false,
                closeBtn: 0,
                success: function(layero, index){
                    var body = layer.getChildFrame('body', index);
                    var iframeWin = window[layero.find('iframe')[0]['name']]; //得到iframe页的窗口对象，执行iframe页的方法：iframeWin.method();
                    body.find('#userFileForm').attr('data-uid',uid)
                },
                end:function(){
                    var u_name =$("#EName").val();
                    var depart =$("#department").val();
                    var u_status =$("#status").val();
                    var entryTime =$("#entryTime").val();
                    
                    table.reload('userFileTable', {
                        where: { //调用列表数据
                            departmentId: depart,
                            userName: u_name,
                            userStatus: u_status,
                            joinTime: entryTime,
                            currentIndex: 1,
                            pageSize: 10,
                        }
                    })
                } 
            })
            
        }
    });
})