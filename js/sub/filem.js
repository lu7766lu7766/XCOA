$(function(){
    layui.config({
        base: '../../layui/' //静态资源所在路径
    }).extend({
        index: 'index' //主入口模块
    }).use(['index','table','laydate','upload'], function(){
        var $ = layui.$
        ,admin = layui.admin
        ,element = layui.element
        ,router = layui.router()
        ,layer = layui.layer;
        element.render();
    
        var table = layui.table,laydate = layui.laydate;
      
        table.render({
          elem: '#table-checkbox',
          //,page: true
          limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000],
        });
        var upload = layui.upload;
        var upurls =window.urls;
        //执行实例
        var uploadInst = upload.render({
            elem: '#uploadExl' //绑定元素
            ,accept:"file"
            ,exts: "xlsx"
            ,url:""+upurls+"/gateway/user/import" //上传接口
            ,before: function(obj){ //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
                layer.load(); //上传loading
            }
            ,done: function(res, index, upload){
                //上传完毕回调
                layer.closeAll('loading'); //关闭loading
                if(res.status_code==200){
                    var rs =res.data;
                   
                    layer.msg("导入完成");
                    var phtml='';
                    if(rs.fail_message&&rs.fail_message.length>0){
                        for(var i=0;i<rs.fail_message.length;i++){
                            phtml +=' <p>'+rs.fail_message[i]+'</p>'
                        }
                    }
    
                    var fileMsgHt='<div class="layui-card">'
                                   +' <div class="layui-card-body">'
                                       +' <fieldset class="layui-elem-field">'
                                           +' <legend>导入信息</legend>'
                                           +' <div class="layui-field-box red">'
                                               + '您共导入了'+ rs.total_count+'条信息，错误了'+rs.fail_count+'条，成功了'+rs.success_count+'条。'
                                           +' </div>'
                                       +' </fieldset>'
                                   +' </div>'
                                   +' <div class="layui-card-body">'
                                       +' <blockquote class="layui-elem-quote layui-quote-nm">'
                                            +phtml
                                            +'(提示信息)'
                                       +' </blockquote>'
                                   +' </div>'
                               +' </div>'
    
                    var fileMsg= layer.open({//新增排班人员弹窗
                        title:' ',
                        content:fileMsgHt,
                        type:1,
                        id:'dailWorkUrs',
                        area:['60%','60%'],
                        btn:['确定']
                    })
                }else{
                    layer.msg(res.message);
                }
               
            }
            ,error: function(index, upload){
                //请求异常回调
                layer.closeAll('loading'); //关闭loading
            }
        });
        $("a#dowmFile").attr("href",""+upurls+"/gateway/template/download")
      });
})