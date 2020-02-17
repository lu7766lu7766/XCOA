
$(function(){
    layui.config({
		base: '../../../layui/' //静态资源所在路径
	}).extend({
		index: 'index' //主入口模块
	}).use(['index','form','laydate','laypage','table','upload'], function(){
        var $ = layui.$
        ,admin = layui.admin
        ,element = layui.element
        ,router = layui.router();
        element.render();
        element.on('tab(component-tabs-brief)', function(obj){});

		var laydate = layui.laydate,form = layui.form,layer = layui.layer,laypage = layui.laypage,table=layui.table, form = layui.form;
        var isgroup =$("#statiDepSel").attr("data-isgroup")==1?true:false;	
        var iscompanies;
	    // 起始，截止时间选择
        var d = new Date();
        var StartTime=  d.getFullYear() + '-' + lay.digit(d.getMonth()+1) + '-01';
        var EndTime = d.getFullYear() + '-' + lay.digit(d.getMonth() + 1) + '-' + lay.digit(d.getDate());
        laydate.render({
            elem: '#StartItem'
            ,range: '~'
            ,value:StartTime+' ~ '+EndTime

        });
        form.verify({
            startItem:function(value){
                if(!value.match(/\d{4}(\-|\/|.)\d{1,2}\1\d{1,2}/)){
                    return '请选择正确日期';
                };
            },

         
        })
        form.on('submit(statiBtn)', function(data){
            var times = $("#StartItem").val();
            var  star = times.slice(0,10);
            var  end  = times.slice(13,23);
            var  depr='',comp='';
            var iscompanies=$("#statiDepSel").find("option:selected").hasClass("l-company");

            
            if(iscompanies){
                comp=$("#statiDepSel").val();
                comp = comp.slice(2);
            }else{
                depr=$("#statiDepSel").val();
            };
            getStstis(star,end,depr,comp);
            return false;
        })
    
    var now= new Date();
    
    var year = now.getFullYear(),
        month = now.getMonth() + 1,
        date = now.getDate(),
        wHtml = "",
        zmonth ='',zdate='';
        if(month<10){
            zmonth = "0"+month;
        }else{
            zmonth = month;
        }
        if(date<10){
            zdate = "0"+date;
        }else{
            zdate = date;
        }
    $("#DeadlineItem").val(""+year+"-"+zmonth+"-"+zdate+"");

   
    var depatmetsle="";
    var groupSlecFun=function(obj,elem,comp){
        var html = ' ';
        var ss=''; 
        function deparOpsle(o,jj){
            jj+='&nbsp;';
            var nn=jj;
            if(o&&o.length>0){
                for(var i =0; i<o.length;i++){
                    if(o[i].children&&o[i].children.length>0){
                        html+= '<option  value="'+o[i].id+'">'+jj+''+o[i].name+'</option>'
                        deparOpsle(o[i].children,jj);
                    }else{
                        html+= '<option value="'+o[i].id+'">'+nn+''+o[i].name+'</option>'
                    }
                    
                }
            }else{
                html+= '<option value="'+o[i].id+'">'+jj+''+o[i].name+'</option>'
            }
           
        }

        if(comp){
            for(var i =0; i<obj[0].children.length;i++){
                html+= '<option class="l-company" value="c-'+obj[0].children[i].id+'">'+obj[0].children[i].name+'</option>';
                if(obj[0].children[i].children&&obj[0].children[i].children.length>0){
                    deparOpsle(obj[0].children[i].children,ss);
                }   
            }
        }else{
            html+='<option  value="0">'+obj[0].children[0].name+'</option>'
            deparOpsle(obj[0].children[0].children,ss);
        }

        elem.html(html);
    }
    
    $.fetch({
        url: "/gateway/department/tree",
        type: 'post',
        dataType: 'JSON',
        cb:function(rs){
            depatmetsle=rs;
            var html = ""
            groupSlecFun(depatmetsle, $("#statiDepSel"),isgroup);
            form.render('select'); 
        }
    })
    var getStstis =function(st,et,depr,comp){
        // $(".stati.sxbTj").show();
        // $(".starTimeShow").text(st);
        // $(".endTimeShow").text(et);
        
        if(isgroup){
            var src= "/gateway/checkinout/groupstatistics";
            var prama={
                DepartmentID:depr,
                CompanyID:comp,
                StartTime:st,
                EndTime:et,
            }
        }else{
            var src= "/gateway/checkinout/statistics";
            var prama={
                DepartmentID:depr,
                StartTime:st,
                EndTime:et,
            }
        }
        layer.open({
            title:false,
            type:1,
            closeBtn: 0,
            content:'<div class="layui-fluid" style="padding: 0px 10px;"><table class="layui-table" lay-filter="allStaList" id="allStaList"></table></div>',
            area:['100%', '100%'],
            // btn:['返回'],
            success:function(layero,index){
                table.render({
                    elem: '#allStaList',
                    url: urls + src,
                    // limit: 10,
                    limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000,5000],
                    where:prama,
                    method: 'post',
                    contentType: 'application/json',
                    page:false,
                    loading: true,
                    toolbar:'<div class="layui-card-header"><i class="iconfont icon-suyaniconchanpinleibufenzuodaohangbufen87"></i>上下班统计（从【<span class="starTimeShow">'+st+'</span>】至【<span class="endTimeShow">'+et+'</span>】）<a lay-event="back" class="layui-btn layui-btn-sm fr">返回</a></div> ',
                    // toolbar: ['filter', 'print', 'exports'],
                    // defaultToolbar: ['filter', 'print', 'exports'],
                    text: {
                        none: '暂无' 
                    },
                    size:'sm',
                    even:true,
                    height: 'full-50',
                    cols: [[
                        {field:'department_name',title:'部门',sort:true},
                        {field:'name',title:'姓名',sort:true},
                        {field:'quanqin_count',title:'全勤（天）',sort:true},
                        {field:'work_time_long',title:'时长',sort:true},
                        {field:'check_in_times',title:'打卡次数',sort:true},
                        {field:'chidao_count',title:'迟到',sort:true},
                        {field:'no_checkin_count',title:'上班未登记',sort:true},
                        {field:'zaotui_count',title:'早退',sort:true},
                        {fixed:'right',field:'event',title:'操作',toolbar: '<div><a class="layui-btn layui-btn-xs" lay-event="detail">详情信息</a></div>'},
                    ]]
                    // ,request: {
                    //     pageName: 'currentIndex' //页码的参数名称，默认：page
                    //     ,limitName: 'pageSize' //每页数据量的参数名，默认：limit
                    // }
                    ,parseData: function(res){ //res 即为原始返回的数据
                        return {
                            "status_code":res.status_code, //解析接口状态
                            "message": res.message, //解析提示文本
                        // "count": res.data.total_count, //解析数据长度
                            "data": res.data, //解析数据列表
                        // "curr":res.data.page_index
                        };
                    }
                })
                table.on('tool(allStaList)', function(obj){ //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="对应的值"
                    var data = obj.data; //获得当前行数据
                    var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
                    var tr = obj.tr; //获得当前行 tr 的DOM对象
                    
                    if(layEvent === 'detail'){ //查看
                        //do somehing
                        var sat ={
                           UserID:data.id,
                           StartTime:st,
                           EndTime:et,
                        }
                        $.fetch({
                            url: "/gateway/checkinout/statdetail",
                            type: 'post',
                            data: sat,
                            cb:function(rs){
                                // $(".statiDetBox .username").text();
                                var oList =rs;
                                var html ='';
                                if(oList&&oList.length==0){
                                    html ='<tr><td colspan="2" class="tc">无记录</td></tr>' //添加一个类名
                                }
                                $.each(oList,function(key,val){
                                    var s='',c='',p='';

                                    if(oList[key].length>1){
                                        s = oList[key].length;
                                    }

                                    if(oList[key][0].desc=='迟到'){
                                        c='class="cd red"'
                                        p = '/<b class="">'+oList[key][0].desc+'</b>';
                                    }
                                    if(oList[key][0].desc=='早退'){
                                        c='class="zt red"'
                                        p = '/<b class="">'+oList[key][0].desc+'</b>';
                                    }
                                    if(oList[key][0].desc=='正常'){
                                        c=''
                                        p = '/'+oList[key][0].desc;
                                    }
                                    var q = oList[key][0].source==0?'同步':'补录';

                                    html+='<tr><td rowspan="'+s+'">'+key+'</td><td  '+c+'>'+oList[key][0].check_time+'（'+q+''+p+'）</td></tr>'
                                    for(var i=1;i<oList[key].length;i++){
                                        if(oList[key][i].desc=='迟到'){
                                            c='class="cd red"'
                                            p = '/<b class="">'+oList[key][i].desc+'</b>';
                                        }
                                        if(oList[key][i].desc=='早退'){
                                            c='class="zt red"'
                                            p = '/<b class="">'+oList[key][i].desc+'</b>';
                                        }
                                        if(oList[key][i].desc=='正常'){
                                            c=''
                                            p = '/'+oList[key][i].desc;
                                        }
                                        var q = oList[key][i].source==0?'同步':'补录';
                                        html+='<tr><td '+c+'>'+oList[key][i].check_time+'（'+q+''+p+'）</td></tr>'
                                    }
                                });
                                layer.open({
                                    title:'用户名:' +data.name+'',
                                    type:1,
                                    content:'<div class="stati statiDetBox layui-fluid layui-card"><div class="layui-card-header"><i class="iconfont icon-suyaniconchanpinleibufenzuodaohangbufen87"></i>上下班考勤统计（从【<span class="starTimeShow">'+st+'</span>】至【<span class="endTimeShow">'+et+'</span>】）<span class=username></span></div><div class="AllStati"><table class="layui-table"><thead><tr><th>日期</th><th>打卡记录</th></tr></thead><tbody id="statiDetailList">'+html+'</tbody></table></div></div>',
                                    area:['50%', '50%'],
                                    btn:['返回'],
                                }) 
                            }
                        })
                    } 
                });
                table.on('toolbar(allStaList)', function(obj){
                    var checkStatus = table.checkStatus(obj.config.id);
                    switch(obj.event){
                      case 'back':
                        layer.close(index);
                      break;
                    }
                      
                  });
            }
        })
    }
})
})