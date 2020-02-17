layui.config({
    base: '../../../layui/' //静态资源所在路径
}).extend({
    index: 'index' //主入口模块
}).use(['index','form','laydate','laypage','table'], function(){
    var $ = layui.$
    ,admin = layui.admin
    , table = layui.table
    ,element = layui.element
    ,router = layui.router();
    element.render();
    element.on('tab(component-tabs-brief)', function(obj){

    });

    var laydate = layui.laydate
        ,form = layui.form
        ,laypage =layui.laypage
        ,layedit = layui.layedit;

    // 更换为数据表格
    table.render({
        elem: '#newNotice',
        url: urls + '/gateway/notice/index',
        limit: 10,
        method: 'post',
        contentType: 'application/json',
        page:true,
        loading: true,
        defaultToolbar: '',
        text: {
            none: '暂无公告' 
        },
        cols: [[
            {field:'creater',title:'发布人'},
            {
                field: 'title',
                title: '标题',
                templet: function (d){
                    return '<a class = "toTitle" lay-event="show">' + d.title + '</a>'
                }
            },
            {field:'to_users',title:'发布范围'},
            {field:'created_at',title:'发布时间'}
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
    })
    table.on('tool(newNotice)', function(obj) {
        var data = obj.data; //获得当前行数据
        var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
        if (layEvent === 'show') {
            var nid =data.id;
            $.fetch({
                url:"/gateway/notice/readnotice",
                type: 'post',
                data:{
                    NoticeId:nid,
                },
                cb:function(rs){

                    var atta='';
                    if(rs.attaches&&rs.attaches!=''){
                        for(var i=0; i<rs.attaches.length; i++){      
                            atta+='<a title="点击下载" class="seeXqOutIn" target="_blank" href="/gateway/notice/download/'+rs.attaches[i].id+'" >'+rs.attaches[i].original_name+'</a>'
                        }
                    }else{
                        atta='<span>无附件</span>'
                    }

                    var htmls ='<div class="layui-card" style="min-height:300px">'
                                +'<div class="reviewCont layui-card-body">'
                                    +' <div class="layui-form-item">'
                                        +' <p style="margin-bottom: 3px;"><label class="fl">发布部门：</label><u class="hideCont">'+obj.data.to_users+'<i class="iconfont icon-triangle-left"></i></u></p>'
                                        +'<div class="layui-elem-quote" style="padding: 15px 0px;">'
                                            +' <p><label class="fl">发布人：</label><u class="fr-width">'+obj.data.creater+'</u></p>'
                                            +' <p><label class="fl">发布于：</label><u class="fr-width">'+obj.data.validity_starttime+'</u></p>'
                                            +' <p><label class="fl">标题：</label><u class="fr-width">'+obj.data.title+'</u></p>'                                    
                                            +' <p><label class="fl">附件：</label><u class="fr-width">'+atta+'</u></p>'
                                        +'</div>'
                                    +' </div>'
                                    +'<fieldset class="layui-elem-field"><legend>内容公告</legend><div class="layui-field-box pageCont">'+obj.data.content+'</div></fieldset>'
                                +'</div>'
                            +'</div>'
                    var noticeDetail= layer.open({
                        title:'查看公告详情',
                        content:htmls,
                        type:1,
                        id:'noticeDetail',
                        area:['60%','auto'],
                     
                    });
                    $(".reviewCont i").click(function(){
                        if(!$(this).parent("u").hasClass('showCont')){
                            $(this).parent(".hideCont").addClass("showCont");
                            $(this).parent(".hideCont").removeClass("hideCont"); 
                        }else {
                            $(this).parent(".showCont").removeClass("showCont"); 
                            $(this).parent("u").addClass("hideCont");
                        }
                    })
                }
            });
        }
    })

    $('#newNotice').on("mouseenter", '.limit-width',function(){
        var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">'+$(this).text();+'</div>'
        var that = this;
        layer.tips(tipsCont1, that,{
              tips:[1,'#999']
              ,maxWidth: 'auto'
        });
    });
})