$(function(){
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
            ,form = layui.form
            ,laypage=layui.laypage
            ,laydate = layui.laydate;

        var tableIndex = table.render({
            elem: '#allsurveyTb'
            ,url: window.urls+"/gateway/survey/list"
            // ,limit:10
            ,limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000]
            ,method:'post'
            ,contentType: 'application/json'
            ,page:true
            ,loading:true
            ,defaultToolbar:[]
            ,toolbar: '<div>'
                            +'<div class="layui-inline mb-5">'
                                +'<label class="layui-form-label modify-form-label">开始日期：</label>'
                                +'<div class="layui-input-block">'
                                +'<input type="text" class="layui-input" id="SurveyItemStart">'
                                +'</div>'
                            +'</div>'
                            +'<div class="layui-inline mb-5">'
                                +'<label class="layui-form-label modify-form-label">结束日期：</label>'
                                +'<div class="layui-input-block">'
                                    +'<input type="text" class="layui-input" id="SurveyItemEnd">'
                                +'</div>'
                            +'</div>'
                            +'<div class="layui-inline mb-5">'
                                +'<label class="layui-form-label modify-form-label">问卷名称：</label>'
                                +'<div class="layui-input-block">'
                                    +'<input type="text" class="layui-input" id="SurveyTit">'
                                +'</div>'
                            +'</div>'
                            +'<div class="layui-inline ml-5 mb-5">'
                                +'<button id="InquireSur" class="layui-btn" lay-event="InquireSur" title="查询"><i class="iconfont icon-sousuo"></i></button>'
                                +'<button id="InquireSurBack" class="layui-btn layui-btn-primary" style="display:none;"  lay-event="InquireSurBack">返回</button>'
                                +'<button id="addSurvey" class="layui-btn" lay-event="addSurvey">新增</button>'
                            +'</div>'
                        +'</div>'
            ,cols:  [[ //标题栏
                {field: 'id', title: 'ID',width:80}
                ,{field: 'survey_title', title:'名称'}
                ,{field: 'survey_starttime', title: '开始时间',sort: true,width:180}
                ,{field: 'survey_endtime', title: '结束时间',sort: true,width:180}
                ,{field: 'created_at', title: '创建时间',sort: true ,width:180}
                ,{field: 'survey_status', title: '状态',width:80, templet:function(d){
                    return d.survey_status==0?'<button class="layui-btn layui-btn-primary layui-btn-xs layui-btn-disabled">禁用</button>':
                    (d.survey_status==1?'<button class="layui-btn layui-btn-warm layui-btn-xs">初始化</button>':
                    (d.survey_status==2?'<button class="layui-btn layui-btn-normal layui-btn-xs">已发布</button>':''))
                }}
                ,{fixed: 'right'
                    ,title:'操作'
                    ,width:305
                    ,toolbar:'<div><a class="layui-btn layui-btn-xs" lay-event="edit">修改</a>'+
                            '<a class="layui-btn layui-btn-xs" lay-event="copy">复制</a>'+
                            '<a class="layui-btn layui-btn-xs layui-btn-danger"  lay-event="del">删除</a>'+
                            '<a class="layui-btn layui-btn-xs layui-btn-normal"  lay-event="openQ">问题管理</a>'+
                            '<a class="layui-btn layui-btn-xs layui-btn-normal" lay-event="openA">答卷管理</a></div>'
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
                laydate.render({
                    elem: '#SurveyItemStart',
                    //,type: 'date' //默认，可不填
                    value:this.where.startTime
                });
                laydate.render({
                    elem: '#SurveyItemEnd',
                    value:this.where.endTime
                    
                    //,type: 'date' //默认，可不填
                });
                $("#SurveyTit").val(this.where.title);
                form.render();
            }
            
            //,…… //其他参数
        });
       

        //***** */
        table.on('toolbar(allsurveyTb)', function (obj) { //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="对应的值"
            var checkStatus = table.checkStatus(obj.config.id);
            if (obj.event === 'InquireSur') { //ss
                var starT = $("#SurveyItemStart").val();
                var endT = $("#SurveyItemEnd").val();
                var title = $("#SurveyTit").val();
                tableIndex.reload({
                    where: {//记录搜索状态
                        startTime: starT,
                        endTime: endT,
                        title: title,
                    },
                    page: {
                        curr: 1 //重新从第 1 页开始
                    }
                });
                if (starT !== "" || endT !== "" || title !== "") {
                    $("#InquireSurBack").css('display', 'inline-block');
                } else {
                    $("#InquireSurBack").css('display', 'none');
                }
            } else if (obj.event === 'InquireSurBack') { //删除
                tableIndex.reload({
                    where:{},
                    page: {
                        curr: 1 //重新从第 1 页开始
                    }
                });
                $("#InquireSurBack").css('display', 'none');
            } else if (obj.event === 'addSurvey') { //编辑
                 var index = layer.open({
                     title: '',
                     type: 2,
                     content: 'SurveyAdd.html', //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['', 'no']
                     area: ['100%', '100%'],
                     maxmin: false,
                     closeBtn: 0,
                     success: function (layero, index) {
                         var body = layer.getChildFrame('body', index);
                         var iframeWin = window[layero.find('iframe')[0]['name']];

                     },
                     end: function () {
                         tableIndex.reload({});
                     }
                 })

            } 
        });
        /************* */
        table.on('tool(allsurveyTb)', function(obj){ //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="对应的值"
        
            var tdata = obj.data; //获得当前行数据
            var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
            var tr = obj.tr; //获得当前行 tr 的DOM对象
            if(layEvent === 'openQ'){ //问题管理
                var index=layer.open({
                    title:'',
                    type: 2,
                    content: 'ProblemLiet.html?v=20181204', //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['', 'no']
                    area:['100%', '100%'],                                
                    maxmin: false,
                    closeBtn: 0,
                    success: function(layero, index){
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']]; 
                        
                        iframeWin.window.ctableNowPage={
                            surveyId:tdata.id,
                            topic:'',
                            currentIndex:1,
                            pageSize:10,
                        }
                    },
                    end:function(){
                        //关闭层后刷新列表
                        tableIndex.reload({});
                    } 
                })
            } else if(layEvent === 'del'){ //删除
                layer.confirm('确定删除该问卷？',{title:' '}, function(index){
                    $.fetch({
                        url:"/gateway/survey/delete",
                        type: 'post',
                        data:{
                            surveyId: tdata.id,
                        },
                        cb:function(rs){
                            //删除对应行（tr）的DOM结构，并更新缓存
                            layer.close(index);
                            tableIndex.reload({});
                        }
                    });
                    //向服务端发送删除指令
                });
            } else if(layEvent === 'edit'){ //编辑
            //do something
                var index=layer.open({
                    title:'',
                    type: 2,
                    //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['', 'no']
                    content: 'SurveyAdd.html', //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['', 'no']
                    area:['100%', '100%'],                                
                    maxmin: false,
                    closeBtn: 0,
                    success: function(layero, index){
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']]; 
                        $(body).attr("data-new","0");
                        $(body).attr("data-Eid",tdata.id);
                        iframeWin.window.formData = tdata;
                    },
                    end:function(){
                        //关闭层后刷新列表
                        tableIndex.reload({});
                    } 
                })
            //同步更新缓存对应的值
                
            }else if(layEvent === 'openA'){
                var index=layer.open({
                    title:'',
                    type: 2,
                     //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['', 'no']
                    content: 'AnswerSurvey.html?v=2018120501', //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['', 'no']
                    area:['100%', '100%'],                                
                    maxmin: false,
                    closeBtn: 0,
                    success: function(layero, index){
                        var body = layer.getChildFrame('body', index);
                        var iframeWin = window[layero.find('iframe')[0]['name']]; 
                        $(body).attr("data-Eid",tdata.id);
                        iframeWin.window.surveyId=tdata.id;
                    },
                    end:function(){
                        //关闭层后刷新列表
                        tableIndex.reload({});
                    } 
                })
            }else if (obj.event === 'copy') { //编辑
                layer.confirm('确定复制问卷《'+tdata.survey_title+'》？',{title:' '}, function(index){
                    $.fetch({
                        url:"/gateway/survey/copy",
                        type: 'post',
                        data:{
                            surveyId: tdata.id,
                        },
                        cb:function(rs){
                             //删除对应行（tr）的DOM结构，并更新缓存
                            layer.msg('复制成功');
                            layer.close(index);
                            tableIndex.reload({});
                        }
                    });
                    //向服务端发送删除指令
                });

           } 
        });

    });
})