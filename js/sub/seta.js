$(function(){


    var now= new Date();
    var year = now.getFullYear(),
        month = now.getMonth() + 1,
        zmonth ='';
        if(month<10){
            zmonth = "0"+month;
        }else{
            zmonth = month;
        };
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

        laydate.render({
            elem: '#test-laydate-type-workTimeSelec'
            ,type: 'month'
            ,value:''+year+'-'+zmonth+''
            ,change: function(value, date){
                workList.getWorkList(value);
                workList.YearMot=value;
            }
        });
        laydate.render({
            elem: '#test-laydate-type-workMonth'
            ,type: 'month'
            
        });
        laydate.render({ 
            elem: '#setTime1'
            ,type: 'time'
        });
        laydate.render({ 
            elem: '#setTime2'
            ,type: 'time'
        });
        laydate.render({ 
            elem: '#setTime3'
            ,type: 'time'
        });
        laydate.render({ 
            elem: '#setTime4'
            ,type: 'time'
        });
        $.fetch({
            url: "/gateway/worktime/showuser",
            type: 'post',
            cb:function(rs){
                var oplhtml ='';
                if(rs&&rs.length!=0){
                    for(var i=0;i<rs.length;i++){
                        oplhtml+='<option value="'+rs[i].user_id+'">'+rs[i].user_name+'</option>'
                    }
                    $("#nextDacApp").html(oplhtml); 
                }else{
                    $("#nextDacApp").parents('.layui-form-item').remove();
                }
                
                form.render();
            }
        })
        form.on('submit(form-newwork)', function(data){//外出提交
            var time1 =$("#setTime1").val(); 
            var time2 =$("#setTime2").val(); 
            var time3 =$("#setTime3").val(); 
            var time4 =$("#setTime4").val();
            var IsFixed= data.field.switch==1?1:0;
            var nextDacApp=$("#nextDacApp").val();
            var param ={
                Name  :data.field.newName, 
                Time1 :time1, 
                Time2 :time2, 
                Time3 :time3, 
                Time4 :time4, 
                IsFixed:IsFixed, 
                ApprovalUserid:nextDacApp,
                YearMonth:data.field.YearMonth,
            }
            $.fetch({
                url: "/gateway/worktime/add",
                type: 'post',
                data: param,
                cb:function(rs){
                    layer.msg("新建成功");
                    $("#cloneNew").hide();
                    $(".NewUser").show();
                    $("#subSetTimes").hide();
                    //刷新排班列表
                    form.val("component-form-newwork", {
                        "newName": "" // "name": "value"
                        ,"setTime1": "00:00:00"
                        ,"setTime2": "00:00:00"
                        ,"setTime3": "00:00:00"
                        ,"setTime4": "00:00:00"
                        ,"IsFixed": 1
                        ,"YearMonth": ''
                        
                    })
                    $("#test-laydate-type-workTimeSelec").prop("placeholder",param.YearMonth);
                    workList.getWorkList(param.YearMonth);
                }
            })
            return false;
        });

        $("#workSetList").on("click",'.workBj',function(){
            $('#cloneNew').show();
            $("div.NewUser").hide();
            $("#changSetTimes").show();
            $('#subSetTimes').hide();
    
            var workname = $(this).parents('td').siblings(".workname").text();
            var Time1=$(this).parents('td').siblings(".time1").text();
            var Time2=$(this).parents('td').siblings(".time2").text();
            var Time3=$(this).parents('td').siblings(".time3").text();
            var Time4=$(this).parents('td').siblings(".time4").text();
            var fix = $(this).parents('td').siblings(".fixeds").attr("data-fixed");
            var workDy =$("#test-laydate-type-workTimeSelec").val();
            var fixeds = fix==1?true:false;
            
            workList.workId =$(this).parents("td").siblings(".workid").text();
            form.val("component-form-newwork", {
                    "newName": workname // "name": "value"
                    ,"setTime1": Time1
                    ,"setTime2": Time2
                    ,"setTime3": Time3
                    ,"setTime4": Time4
                    ,"switch": fixeds 
                    ,"YearMonth": workDy
                })
    
        });
        $("#workSetList").on("click",".workPbry",function(){
            var wrId =$(this).parents("td").siblings(".workid").text();
            param ={
                TypeID:wrId,
            }
            $.fetch({
                url: "/gateway/worktime/users",
                type: 'post',
                data: param,
                cb:function(rs){
                    if(rs.length==0){
                        html ='<div>暂无</div>';
                        layer.open({
                            title:"排班人员",
                            content: html,
                        })
                    }else{
                        var html ="<ul class='layui-layer-punch'>"
                        for(var i =0;i<rs.length;i++){
                            html+='<li><span>'+rs[i].id+'</span><span>'+rs[i].name+'</span></li>'
                        }
                        html +="</ul>"
                        
                        layer.open({
                            title:"排班人员",
                            content: html,
                            area:['50%', '50%'],
                        })
                    }
                }
            })
        })

        $("#workSetList").on("click",".workDel",function(){
            var delid = $(this).parents("td").attr("data-id");
            
            var elme = $(this).parents("tr");
            //弹窗方法
            layer.confirm('确认删除?',function(index){
                workList.wokeDel();
                layer.close(index);
                var param={
                    ID:delid
                }
                $.fetch({
                    url: "/gateway/worktime/del",
                    type: 'post',
                    data: param,
                    cb:function(rs){
                        layer.msg("删除成功");
                        elme.remove();
                    }
                })
            })
         
        });
        $("#workSetList").on("click",".workHoli",function(){//公休日
            var delid = $(this).parents("td").attr("data-id");
            var workDy =$("#test-laydate-type-workTimeSelec").val();
            var elme = $(this).parents("tr");
            var wname = $(this).parents("td").siblings('.workname').text();
            

            var timesArr= workDy.split("-");
            var y= timesArr[0];
            var m=timesArr[1];
            var param={
                delid,
                y,
                m,
            }
           
             layer.open({
                title:'公休日设置--'+wname+'',
                type: 2, 
                content: 'SettingPublic.html', //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['', 'no']
                area:['100%', '100%'],                                
                maxmin: false,
                id:'setworkHoliday',//设置表格的id
                success:function(layero,index){
                var dayTable= nowMonth(y,m);
                    $("#setworkHoliday iframe").contents().find("#calendar  tbody").html(dayTable);
                    $("#setworkHoliday iframe").contents().find("#calendar  tbody").attr('data-id',""+delid+"/"+y+"/"+m+"");
                    $("#setworkHoliday iframe").contents().find("#calendar  tbody").attr('data-delid',""+delid+"");
                }
            }); 

         
        });
        form.on('submit(form-changwork)', function(data){//修改提交
            var IsFixed= data.field.switch==1?1:0;
            var param ={
                Name  :data.field.newName, 
                Time1 :data.field.setTime1, 
                Time2 :data.field.setTime2, 
                Time3 :data.field.setTime3, 
                Time4 :data.field.setTime4, 
                IsFixed:IsFixed, 
                ID:workList.workId,
                ApprovalUserid:data.field.nextDacApp, 
                YearMonth:data.field.YearMonth,
            }
            $.fetch({
                url: "/gateway/worktime/update",
                type: 'post',
                data: param,
                cb:function(rs){
                    layer.msg("修改成功");
                    $("#cloneNew").hide();
                    $(".NewUser").show();
                    $("#subSetTimes").hide();
                    //刷新排班列表
                    form.val("component-form-newwork", {
                        "newName": "" // "name": "value"
                        ,"setTime1": "00:00:00"
                        ,"setTime2": "00:00:00"
                        ,"setTime3": "00:00:00"
                        ,"setTime4": "00:00:00"
                        ,"IsFixed": 1
                        ,"YearMonth": ''
                        
                        
                    })
                    $("#test-laydate-type-workTimeSelec").prop("placeholder",param.YearMonth);
                    workList.getWorkList(param.YearMonth);
                }
            })
            return false;
        });
  







        var workList ={
            YearMot:"",//保存当前月
            workId:'',
            getWorkList:function(t){//传入公司id 时间获取排班列表
                var param={
                    YearMonth:t,
                }
                $.fetch({
                    url: "/gateway/worktime/index",
                    type: 'post',
                    data: param,
                    cb:function(rs){
                        workList.worTableHtml(rs);
                    }
                })
            },
            wokeDel:function(id,elme){
            
            },
            worTableHtml:function(o){//生成html页面
                var table = ""
                if(o&&o.length>0){
                    
                    for(var i = 0;i<o.length;i++){
                        var fixed,crossday,result=''; 
                        if(o[i].is_fixed === 1){
                            fixed ='<div class="layui-input-inline">'
                                    +'<input lay-filter="fixeds" type="checkbox" name="switch" lay-skin="switch" lay-text="是|否" checked>'
                                +'</div>'
                        }else if(o[i].is_fixed === 0){//否
                            fixed  ='<div class="layui-input-inline">'
                                        +'<input lay-filter="fixeds"  type="checkbox" name="switch" lay-skin="switch"  lay-text="是|否">'
                                    +'</div>'
                        }
                        if(o[i].is_crossday === 1){
                            crossday  ="是"
                        }else if(o[i].is_crossday === 0){
                            crossday  ="否"
                        }
                        if(o[i].approval_result==2){
                            result="result-ok"
                        }else if(o[i].approval_result==1){
                            result="result-no"
                        }else if(o[i].approval_result==0){
                            result="result-await"
                        }
                        console.log(o[i].approval_result_desc, o[i],"1-1-1-1-1-1-1")
                        var resultDesc = "";
                        if (o[i].approval_result_desc == "已通过") {
                            resultDesc = '<button class="layui-btn layui-btn-normal  layui-btn-xs">' + o[i].approval_result_desc + '</button>'
                        }else if(o[i].approval_result_desc == "未审核"){
                            resultDesc = '<button class="layui-btn layui-btn-primary layui-btn-xs">' + o[i].approval_result_desc + '</button>'
                        }
                        table+='<tr><td class="workid '+result+'">'+o[i].id+
                            '</td><td  class="workname">'+o[i].name+
                            '</td><td  class="time1">'+o[i].time1+
                            '</td><td  class="time2">'+o[i].time2+
                            '</td><td  class="time3">'+o[i].time3+
                            '</td><td  class="time4">'+o[i].time4+
                            '</td><td class="cros" data-cros="'+o[i].is_crossday+'">'+crossday+
                            '</td><td class="fixeds" data-fixed="'+o[i].is_fixed+'">'+fixed+
                            '</td>'+
                            '<td>' + resultDesc + '</td>' +
                            '<td data-id="'+o[i].id+'">'
                                if(o[i].approval_result==2){
                                    table+= '<div style="min-width:135px;"><button class="layui-btn layui-btn-sm layui-btn-normal workHoli">公休日</button>'+
                                    '<button class="layui-btn layui-btn-sm layui-btn-normal workPbry">排班人员</button>'
                                }else if(o[i].approval_result==1||o[i].approval_result==0){
                                    table+= '<div style="min-width:135px;"><button class="layui-btn layui-btn-sm workBj">编辑</button>'
                                }
                                table+= '<button class="layui-btn layui-btn-sm layui-btn-danger workDel">删除</button></div>' 
                        table+='</td>'
                            '</tr>'
                    }


                }else{
                    table='<tr><td colspan="10" class="tc">暂无排班内容</td></tr>'
                }
                $("#workSetList tbody").html(table);
                //同时绑定对应的操作事件
                
                form.render()
            
                form.on('switch(fixeds)', function(data){
                    var tid=$(data.elem).parents("td").siblings("td.workid").text();
                    var x=data.elem.checked;//记录当前要改变的状态

                    var isfixed = x==false?0:1;//先获取要改变成的状态
                    var text = x==false?"确定修改为非固定排班？":"确定修改为固定排班？";

                    data.elem.checked=!x;//切换回初始状态
                    form.render();

                    layer.open({
                        content: text
                        ,title:' '
                        ,btn: ['确定', '取消']
                        ,yes: function(index, layero){
                            $.fetch({
                                url: "/gateway/worktime/change",
                                type: 'post',
                                data: {
                                    ID:tid,
                                    IsFixed:isfixed,
                                },
                                cb:function(rs){
                                    data.elem.checked=x;
                                    form.render();
                                    workList.getWorkList(workList.YearMot);//修改成功后刷新当前月列表
                                }
                            })
                            layer.close(index);
                            //按钮【按钮一】的回调
                        }
                        ,btn2: function(index, layero){
                            //按钮【按钮二】的回调
                            data.elem.checked=!x;//切换回初始状态
                            form.render();
                            layer.close(index);
                            //return false 开启该代码可禁止点击该按钮关闭
                        }
                        ,cancel: function(){
                            //右上角关闭回调
                            data.elem.checked=!x;//切换回初始状态
                            form.render();
                            //return false 开启该代码可禁止点击该按钮关闭
                        }
                    });
                    return false;
        
                });  
                
            }
        }  
        workList.getWorkList(""+year+"-"+zmonth+"");
        workList.YearMot =""+year+"-"+zmonth+"";
    });
    
    //排班类型
    
    //当前月日历
    var nowMonth =function(y,m){
        var  month = parseInt(m-1, 10);
        //当前月的第一天的日期
        var firstDay = new Date(y,month,01);
        //第一天是星期几
        var weekday = firstDay.getDay();
        // console.log(weekday)
        if(weekday==0){
            weekday=7;
        }
        //求当前月一共有多少天
        //new Date(year,month+1,0) ： month+1是下一个月，day为0代表的是上一个月的最后一天，即我们所需的当前月的最后一天。
        //getDate（）则返回这个日期对象是一个月中的第几天，我们由最后一天得知这个月一共有多少天
        var days =new Date(y, month+1, 0).getDate();
        var res = "<tr>";
        //输出第一天之前的空格
        for(var i=1;i<weekday;i++){
            res+="<td> </td>";
        }
        

        for(var j=1;j<=days ;j++){

            var dayname= j<10? ''+y+'-'+m+'-0'+j+'':''+y+'-'+m+'-'+j+''
            var classT= 't-'+dayname+'';
            res += '<td><p class="isDay">'+dayname+'</p><div class="layui-table-name '+classT+'"></div></td>';
            
            //如果是周日则换行
            if(weekday%7 == 0){
                weekday = 0;
                res += '</tr><tr>';
            }
            weekday++;
        }
        return res;
    }
    
})