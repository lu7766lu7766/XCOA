$(function(){
    layui.config({
        base: '../../../layui/', //静态资源所在路径
        version:'20190223'
    }).extend({
        index: 'index' //主入口模块
    }).use(['index','table','laydate','laypage','util','formSelects'], function(){
        var $ = layui.$
        ,admin = layui.admin
        ,element = layui.element
        ,router = layui.router();
        element.render();

        var laydate = layui.laydate
        ,form = layui.form
        ,layer = layui.layer
        ,table=layui.table
        ,util=layui.util
        ,laydate =layui.laydate
        ,formSelects = layui.formSelects;
        var d = new Date();
        var isGrop =$("#isGrop").attr("data-cgid");
        var sticsUrl,detalUrl,CategoryUrl;
        var isGropuData={
            StartTime:'',
            EndTime:'',
            CurrencyId:'',
            CompanyId:'',
            oneLevelName:'',
            twoLevelName:''
        }
        if(isGrop ==1){//集团
           sticsUrl ='/gateway/financial/groupstatistics';
           detalUrl='/gateway/financial/groupreportdetail';
           CategoryUrl="/gateway/financial/groupCategory";//获取集团财务分级类型列表
            var gropArr=[];
            var companyArr=[];
            var nowIsList=1;
        }else{
           sticsUrl ='/gateway/financial/companystatistics';
           detalUrl='/gateway/financial/companyreportdetail';
           CategoryUrl="/gateway/financial/companyCategory";//获取公司财务分级类型列表
        }
        laydate.render({
            elem: '#statisticsTime' //指定元素
            ,range: '~'
            ,value:d.getFullYear() + '-' + lay.digit(d.getMonth()+1) + '-01 ~ '+d.getFullYear() + '-' + lay.digit(d.getMonth() + 1) + '-' + lay.digit(d.getDate())
            ,done: function(value, date, endDate){
                if(value==''){
                    layer.msg('查询起始时间不能为空',{icon:5,anim: 6},function(){})
                }else{
                    var timesArr= value.split(" ~ "); 
                    var STime = timesArr[0];
                    var Eime =timesArr[1];
                    isGropuData.StartTime=STime;
                    isGropuData.EndTime=Eime;                    
                    getStatisticsFun(isGropuData);   
                }     
            }
        });
        
        function addCommas(nStr)//金额显示 三位加一个逗号
        {
            nStr += '';
            x = nStr.split('.');
            x1 = x[0];
            x2 = x.length > 1 ? '.' + x[1] : '';
            var rgx = /(\d+)(\d{3})/;
            while (rgx.test(x1)) {
                x1 = x1.replace(rgx, '$1' + ',' + '$2');
            }
            return x1 + x2;
        }
        var statisticsFun =function(list,obj){//统计列表
            // console.log(list)
            if(isGrop ==1&&nowIsList==1){//集团
                var btnGrop ='<button id="toCompanyList" class="layui-btn fr">查看公司明细</button>';
            }else if(isGrop ==1&&nowIsList!=1){
                var btnGrop ='<button id="toCompanyList" class="layui-btn fr">返回集团明细</button>';
            }else{
                var btnGrop='';
            }
            $("#roleCompanyBtn").html(btnGrop);
            var listHtml='';
            //18.23  获取货币列表
            // URI： /gateway/financial/currency 
            var theadArr = [
                {name:'单位名称',id:'company'}
                ,{name:'流程类型',id:'oneLevel'}
                ,{name:'费用类型',id:'towLevel'}
            ];
            var companyNameArr=[];
            var onetypeArr=[];            
            var twotypeArr_1=[];            
            var twotypeArr_2=[];         
            // console.log(obj);//当前选框状态   
            //CurrencyId =="" 全部币种 否则只显示当前币种
            //
            $.fetch({
                url: "/gateway/financial/currency",
                type: 'post',
                cb:function(rs){
                        // console.log(obj,obj);
                    for(var v=0;v<rs.length;v++){
                        if(obj.CurrencyId==''||obj.CurrencyId=='-2'){
                            theadArr.push({name:''+rs[v].zh_name+'('+rs[v].short_code+')',id:rs[v].id});//币种
                        }else{
                            if(rs[v].id==obj.CurrencyId){
                                theadArr.push({name:''+rs[v].zh_name+'('+rs[v].short_code+')',id:rs[v].id});//币种
                            }
                        }
                    }
                    theadArr.push({name:'总金额 (人民币)',id:'人民币'});//总金额
                    // console.log(theadArr);
                    if(list&&list.length>0){
                        for(var i =0;i<list.length;i++){//循环行
                            var cList = list[i];
                            if(isGrop ==1&&cList.id==1){//集团
                                var toClass ='g_todetail';
                                var toClass2 ='g_toTitle';
                                var toClass3='g_toOnedetail';
                            }else{
                                var toClass ='todetail';
                                var toClass2 ='toTitle';
                                var toClass3='toOnedetail';
                            }
                            companyNameArr.push({
                                name:list[i].name,
                                id:list[i].id,
                                onetypeArr:[],
                                twotypeArr_1:[],
                                twotypeArr_2:[],
                            });//单位名称列
                        }
                    }
                    
                    //费用类型列
                    if(isGrop ==1){
                        var typeData={
                            companyId:''
                        }
                    }else{
                        typeData='';
                    }
                    $.fetch({
                        url: CategoryUrl,
                        type: 'post',
                        data:typeData,
                        cb:function(rs){
                            //  console.log(rs);
                            var twotypeArr_1Id,twotypeArr_2Id;
                            for(var i=0;i<rs.length;i++){
                                 //oneLevelName=='' 全部
                                //twoLevelName=='' 全部
                                if(rs[i].parent_id=='0'&&rs[i].level==1&&rs[i].is_init==1){//流程类型
                                    if(obj.oneLevelName==''){
                                        for(var j = 0;j<companyNameArr.length;j++){
                                            if((companyNameArr[j].id==rs[i].company_id)||(rs[i].company_id==2&&companyNameArr[j].id==1)){
                                                companyNameArr[j].onetypeArr.push({name:rs[i].name,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});
                                            }
                                        }
                                        // onetypeArr.push({name:rs[i].name,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});
                                    }else{
                                        if(obj.oneLevelName==rs[i].name){
                                            for(var j = 0;j<companyNameArr.length;j++){
                                                if((companyNameArr[j].id==rs[i].company_id)||(rs[i].company_id==2&&companyNameArr[j].id==1)){
                                                    companyNameArr[j].onetypeArr.push({name:rs[i].name,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});
                                                }
                                            }
                                            // onetypeArr.push({name:rs[i].name,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});
                                        }
                                    }
                                }else if(rs[i].code=="BX"&&rs[i].level==2&&rs[i].is_init==1){
                                    if(obj.twoLevelName==''){
                                        for(var j = 0;j<companyNameArr.length;j++){
                                            if((companyNameArr[j].id==rs[i].company_id)||(rs[i].company_id==2&&companyNameArr[j].id==1)){
                                                // onetypeArr.push({name:rs[i].name,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});
                                                companyNameArr[j].twotypeArr_1.push({name:rs[i].name,pid:rs[i].parent_id,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id}); 
                                                
                                            }
                                        }
                                        // twotypeArr_1.push({name:rs[i].name,pid:rs[i].parent_id,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id}); 
                                    }else{
                                        if(obj.twoLevelName==rs[i].name){
                                            for(var j = 0;j<companyNameArr.length;j++){
                                                if((companyNameArr[j].id==rs[i].company_id)||(rs[i].company_id==2&&companyNameArr[j].id==1)){
                                                    // onetypeArr.push({name:rs[i].name,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});
                                                    companyNameArr[j].twotypeArr_1.push({name:rs[i].name,pid:rs[i].parent_id,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id}); 
                                                    
                                                }
                                            }
                                             
                                        }
                                    }
                                    // twotypeArr_1.push({name:rs[i].name,pid:rs[i].parent_id,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});                                 
                                }else if(rs[i].code=="FK"&&rs[i].level==2&&rs[i].is_init==1){
                                    if(obj.twoLevelName==''){
                                        for(var j = 0;j<companyNameArr.length;j++){
                                            if((companyNameArr[j].id==rs[i].company_id)||(rs[i].company_id==2&&companyNameArr[j].id==1)){
                                                // onetypeArr.push({name:rs[i].name,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});
                                                companyNameArr[j].twotypeArr_2.push({name:rs[i].name,pid:rs[i].parent_id,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id}); 
                                                
                                            }
                                        }
                                        //  twotypeArr_2.push({name:rs[i].name,pid:rs[i].parent_id,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});
                                    }else{
                                        if(obj.twoLevelName==rs[i].name){
                                            for(var j = 0;j<companyNameArr.length;j++){
                                                if((companyNameArr[j].id==rs[i].company_id)||(rs[i].company_id==2&&companyNameArr[j].id==1)){
                                                    // onetypeArr.push({name:rs[i].name,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});
                                                    companyNameArr[j].twotypeArr_2.push({name:rs[i].name,pid:rs[i].parent_id,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id}); 
                                                    
                                                }
                                            }
                                            //  twotypeArr_2.push({name:rs[i].name,pid:rs
                                            //  twotypeArr_2.push({name:rs[i].name,pid:rs[i].parent_id,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});
                                        }
                                    }
                                } 
                            }
                            if(obj.twoLevelName==''||obj.twoLevelName=='其他'){
                                for(var j = 0;j<companyNameArr.length;j++){
                                        // onetypeArr.push({name:rs[i].name,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id});
                                        // companyNameArr[j].twotypeArr_2.push({name:rs[i].name,pid:rs[i].parent_id,id:rs[i].id,code:rs[i].code,compaanyId:rs[i].company_id}); 
                                        companyNameArr[j].twotypeArr_1.push({name:'其他',id:'-1'});   
                                        companyNameArr[j].twotypeArr_2.push({name:'其他',id:'-1'});
                                   
                                }
                                // twotypeArr_1.push({name:'其他',id:'-1'});   
                                // twotypeArr_2.push({name:'其他',id:'-1'});
                            }
                                
                            // console.log(companyNameArr)
                            //生成表格  以下为全部显示
                            listHtml+='<thead><tr>'
                            for(var c =0;c<theadArr.length;c++){
                                listHtml+='<td data-id="'+theadArr[c].id+'">'+theadArr[c].name+'</td>'
                            }
                            // console.log(twotypeArr_1,twotypeArr_2)
                            listHtml+='</tr></thead>'
                            for(var i=0;i<companyNameArr.length;i++){//公司列
                                if(isGrop ==1&&companyNameArr[i].id==1){//集团
                                    var toClass ='g_todetail';
                                    var toClass2 ='g_toTitle';
                                    var toClass3='g_toOnedetail';
                                    var toClass4='g_toTwodetail';//单一流程 单一费用类型 全部币种
                                }else{
                                    var toClass ='todetail';
                                    var toClass2 ='toTitle';
                                    var toClass3='toOnedetail';
                                    var toClass4='toTwodetail';
                                }

                                listHtml+='<tbody data-id="'+companyNameArr[i].id+'">'//公司id
                                // console.log(companyNameArr);                                
                                if(companyNameArr[i].onetypeArr.length==0){
                                    
                                    listHtml+='<tr>'
                                    for(var m=0;m<theadArr.length;m++){
                                        if(m==0){
                                            listHtml+='<td class="companyName">'+companyNameArr[i].name+'</td>'
                                        }else if(m==1){
                                            listHtml+='<td colspan="'+(theadArr.length-2)+'"><div style="text-align:center">暂无费用类型</div></td>'
                                        }else if(m==theadArr.length-1){
                                            listHtml+='<td></td>'
                                        }
                                    }
                                    listHtml+='</tr>'
                                }else{
                                    // console.log(companyNameArr[i].onetypeArr.length);
                                    //如果 companyNameArr[i].onetypeArr.length==1 获取companyNameArr[i].onetypeArr下的twotypeArr_1 和twotypeArr_2的长度是否为1
                                    var codeHaveBX=false;
                                    for(var j=0;j<companyNameArr[i].onetypeArr.length;j++){//流程列
                                        if(companyNameArr[i].onetypeArr[j].code=="BX"){
                                            // console.log(companyNameArr[i].onetypeArr[j],companyNameArr[i].twotypeArr_1);
                                            for(var k=0;k<companyNameArr[i].twotypeArr_1.length;k++){// 流程子列1
                                                listHtml+='<tr >'
                                                    for(var m=0;m<theadArr.length;m++){
                                                    //  console.log(companyNameArr[i].onetypeArr.length,companyNameArr[i].twotypeArr_1,companyNameArr[i].twotypeArr_2)
                                                     
                                                        
                                                        if(m==0&&k==0){//第一列 第一行
                                                            if(companyNameArr[i].onetypeArr.length==1&&companyNameArr[i].twotypeArr_1.length==1){
                                                                var rowspanComNameBX=''
                                                            }else{
                                                                var rowspanComNameBX= companyNameArr[i].twotypeArr_1.length+companyNameArr[i].twotypeArr_2.length+1                                            
                                                            }
                                                            codeHaveBX=true;//如果存在这一行
                                                            listHtml+='<td class="companyName" rowspan="'+rowspanComNameBX+'">'+companyNameArr[i].name+'</td>'//公司名称
                                                        }
                                                        if(m==1&&k==0){//第二列 第一行
                                                            listHtml+='<td class="levelType" rowspan="'+(companyNameArr[i].twotypeArr_1.length)+'"><a data-symid="-2" data-twoid="" data-oneid="'+companyNameArr[i].onetypeArr[j].id+'"  data-twoname="全部" data-onename="'+companyNameArr[i].onetypeArr[j].name+'" class="'+toClass3+'">'+companyNameArr[i].onetypeArr[j].name+'</a></td>'//公司名称
                                                        }
                                                        if(m==2){//第三列 
                                                            listHtml+='<td><a data-symid="-2" data-twoid="'+companyNameArr[i].twotypeArr_1[k].id+'" data-oneid="'+companyNameArr[i].onetypeArr[j].id+'"  data-twoname="'+companyNameArr[i].twotypeArr_1[k].name+'" data-onename="'+companyNameArr[i].onetypeArr[j].name+'" class="'+toClass4+'">'+companyNameArr[i].twotypeArr_1[k].name+'</a></td>'//公司名称
                                                        }
                                                        if(m>2){//插入数据列
                                                            listHtml+='<td data-id="cell-'+companyNameArr[i].name+'-'+companyNameArr[i].onetypeArr[j].name+'-'+companyNameArr[i].twotypeArr_1[k].name+'-'+theadArr[m].id+'" ></td>'
                                                        } 
                                                    }
                                                listHtml+='</tr>'
                                            } 
                                        }else if(companyNameArr[i].onetypeArr[j].code=="FK"){
                                            // console.log(companyNameArr[i].onetypeArr[j]);
                                            
                                            for(var k=0;k<companyNameArr[i].twotypeArr_2.length;k++){// 流程子列2
                                                listHtml+='<tr >'
                                                    for(var m=0;m<theadArr.length;m++){
                                                        if(!codeHaveBX){//判断第一列第一行是否存在 存在则第二行第一列空 不存在则添加
                                                            if(m==0&&k==0){//第一列 第一行
                                                                if(companyNameArr[i].onetypeArr.length==1&&companyNameArr[i].twotypeArr_2.length==1){
                                                                    var rowspanComNameFK=''
                                                                }else{
                                                                    var rowspanComNameFK= companyNameArr[i].twotypeArr_1.length+companyNameArr[i].twotypeArr_2.length+1                                            
                                                                }
                                                                codeHaveBX=true;//如果存在这一行
                                                                listHtml+='<td class="companyName" rowspan="'+rowspanComNameFK+'">'+companyNameArr[i].name+'</td>'//公司名称
                                                            }
                                                        }                
                                                        if(m==1&&k==0){//第二列 第一行
                                                            listHtml+='<td class="levelType"  rowspan="'+(companyNameArr[i].twotypeArr_2.length)+'"><a data-symid="-2" data-twoid="" data-oneid="'+companyNameArr[i].onetypeArr[j].id+'"  data-twoname="全部" data-onename="'+companyNameArr[i].onetypeArr[j].name+'" class="'+toClass3+'">'+companyNameArr[i].onetypeArr[j].name+'</a></td>'//公司名称
                                                        }
                                                        if(m==2){//第三列 
                                                            // listHtml+='<td>'+companyNameArr[i].twotypeArr_2[k].name+'</td>'//公司名称
                                                            listHtml+='<td><a data-symid="-2" data-twoid="'+companyNameArr[i].twotypeArr_2[k].id+'" data-oneid="'+companyNameArr[i].onetypeArr[j].id+'"  data-twoname="'+companyNameArr[i].twotypeArr_2[k].name+'" data-onename="'+companyNameArr[i].onetypeArr[j].name+'" class="'+toClass4+'">'+companyNameArr[i].twotypeArr_2[k].name+'</a></td>'//公司名称
                                                        }
                                                        if(m>2){//插入数据列
                                                            listHtml+='<td data-id="cell-'+companyNameArr[i].name+'-'+companyNameArr[i].onetypeArr[j].name+'-'+companyNameArr[i].twotypeArr_2[k].name+'-'+theadArr[m].id+'" ></td>'
                                                        } 
                                                    }
                                                listHtml+='</tr>'
                                            } 
                                        }
                                    }
                                }  
                                
                                if(obj.twoLevelName==''&&companyNameArr[i].onetypeArr.length==2){//
                                    listHtml+='<tr class="allManeyTr">'
                                    for(var m=0;m<theadArr.length;m++){//汇总行
                                        //第一列空
                                        if(m==1){//第二列 横跨两列
                                            listHtml+='<td colspan="2" style="text-align:center"><a class="'+toClass2+'"  data-symid="-2"  >汇总</a></td>'
                                        }
                                        if(m>2){//插入数据列
                                            listHtml+='<td data-id="'+theadArr[m].id+'" ></td>'
                                        } 
                                    }
                                    listHtml+='</tr>'
                                }else if(obj.twoLevelName==''&&companyNameArr[i].onetypeArr.length==1){
                                    // console.log()
                                    
                                    listHtml+='<tr class="allManeyTr">'
                                    for(var m=0;m<theadArr.length;m++){//汇总行
                                        //第一列空
                                        if(m==1){//第二列 横跨两列
                                            listHtml+='<td colspan="2" style="text-align:center"><a class="'+toClass2+'" data-oneid="'+companyNameArr[i].onetypeArr[0].id+'"   data-onename="'+companyNameArr[i].onetypeArr[0].name+'" data-symid="-2"  >汇总</a></td>'
                                        }
                                        if(m>2){//插入数据列
                                            listHtml+='<td data-id="'+theadArr[m].id+'" ></td>'
                                        } 
                                    }
                                    listHtml+='</tr>'
                                }
                                // console.log(companyNameArr[i].onetypeArr.length,companyNameArr[i].onetypeArr.length)
                                
                                listHtml+='</tbody>'
                                
                            }
                            $("#statisticList").html(listHtml);
                            var tdHeight=$("#statisticList tbody").find("tr:first-child").find("td:first-child").height();
                            // console.log(tdHeight)
                            $("#statisticList tr").find("td:last-child").addClass("rmbSumTd");
                            if(list&&list.length>0){
                                for(var i =0;i<list.length;i++){//循环行 //公司名称行
                                    var cList = list[i];
                                    if(isGrop ==1&&cList.id==1){//集团
                                        var toClass ='g_todetail';
                                        var toClass2 ='g_toTitle';
                                        var toClass3='g_toOnedetail';
                                    }else{
                                        var toClass ='todetail';
                                        var toClass2 ='toTitle';
                                        var toClass3='toOnedetail';
                                    }
                                    if(cList.summary&&cList.summary.length>0){//每隔币种
                                        for(var k=0;k<cList.summary.length;k++){//币种总金额
                                            // console.log(cList.summary[k].detail);
                                            var onnTypeLn = Object.getOwnPropertyNames(cList.summary[k].detail==null?{}:cList.summary[k].detail).length;
                                            var onetypeId ='';
                                            if(onnTypeLn==1){
                                                for(key in cList.summary[k].detail){
                                                    onetypeId='data-oneid="'+cList.summary[k].detail[key].oneLevelId+'"';
                                                }
                                            }
                                            $("#statisticList>tbody[data-id='"+cList.id+"']>tr.allManeyTr>td[data-id='"+cList.summary[k].financial_currency_unit_id+"']").html('<a class="'+toClass2+'" '+onetypeId+' data-symid="'+cList.summary[k].financial_currency_unit_id+'">'+cList.summary[k].total_amount+'');
                                            for(key in cList.summary[k].detail){//类型
                                                for(var v=0;v<cList.summary[k].detail[key].detail.length;v++){//子类
                                                    var rmbSum =cList.summary[k].detail[key].detail[v].rmb_sum;
                                                    $("#statisticList>tbody[data-id='"+cList.id+"']>tr>td[data-id='cell-"+cList.name+"-"+cList.summary[k].detail[key].name+"-"+cList.summary[k].detail[key].detail[v].name+"-"+cList.summary[k].financial_currency_unit_id+"']").html('<a data-symid="'+cList.summary[k].financial_currency_unit_id+'" data-twoid="'+cList.summary[k].detail[key].detail[v].twoLevelId+'" data-oneid="'+cList.summary[k].detail[key].oneLevelId+'"  data-twoname="'+cList.summary[k].detail[key].detail[v].name+'" data-onename="'+cList.summary[k].detail[key].name+'"  data-rmbsum="'+rmbSum+'"  class="'+toClass+'">'+cList.summary[k].detail[key].detail[v].sum+'</a>');
                                                }
                                            }
                                        
                                        }
                                    }
                                }
                            }
                            var rmbsumTable;
                            $("#statisticList").find("tbody").each(function(){
                                rmbsumTable=0;
                                var cloneTallA='';//全部总金额
                                var tbodyH = $(this);
                                // console.log(tbodyH,rmbsumTable)
                                tbodyH.find("tr").each(function(){//计算总金额
                                    var rmbsumTr =0,cloneA='';
                                    $(this).find("a").each(function(){
                                        var rmbsumTd = $(this).attr("data-rmbsum");
                                        if(rmbsumTd!=undefined){
                                            rmbsumTd=parseFloat(rmbsumTd);
                                            rmbsumTr=rmbsumTd+rmbsumTr;
                                            rmbsumTable=parseFloat(rmbsumTd)+rmbsumTable;
                                        }
                                        if($(this).hasClass("g_toTwodetail")||$(this).hasClass("toTwodetail")){
                                            cloneA=$(this).clone(true);
                                        }
                                    })
                                    if(rmbsumTr!=0){
                                        cloneA.html(''+parseFloat(rmbsumTr.toFixed(2))+'')
                                        $(this).find("td.rmbSumTd").html(cloneA);
                                    }
                                    // console.log(rmbsumTable!=0)
                                    if(rmbsumTable!=0 && $(this).hasClass("allManeyTr")){
                                        cloneTallA =$(this).find("td").first().find("a").clone(true);
                                        cloneTallA.html(parseFloat(rmbsumTable.toFixed(2)));
                                        $(this).find("td.rmbSumTd").html(cloneTallA);
                                    }
                                })
                            })
                        } 
                    });
                } 
            });

            // $("#statisticsBox").html(listHtml);
            $("#toCompanyList").on("click",function(){
                if(nowIsList==1){
                    nowIsList=2;
                    statisticsFun(companyArr,isGropuData);
                    isGropuData.CompanyId='';
                    isGropuData.twoLevelName='';
                    isGropuData.oneLevelName='';
                    isGropuData.CurrencyId='';
                    // console.log(isGropuData)
                    // getStatisticsFun(isGropuData);                    
                    IqSelectGroup(true,isGropuData);
                }else{  
                    nowIsList=1;
                    isGropuData.CompanyId='';
                    isGropuData.twoLevelName='';
                    isGropuData.oneLevelName='';
                    isGropuData.CurrencyId='';
                    getStatisticsFun(isGropuData);
                    
                    IqSelectGroup(false,isGropuData);    
                    
                }
            })
        }
        
        var getStatisticsFun =function(obj={}){
            $.fetch({
                url: sticsUrl,
                type: 'post',
                data:obj,
                cb:function(rs){

                    if(isGrop ==1){//集团
                        gropArr=[];
                        companyArr=[];
                        if(rs ==null){
                            rs =[];
                        }
                        for(var i =0;i<rs.length;i++){
                            if(rs[i].id == 1){
                                gropArr.push(rs[i]);
                            }else{
                                companyArr.push(rs[i]);
                            }
                        }
                        if(nowIsList==1){
                            statisticsFun(gropArr,obj);
                        }else{
                            statisticsFun(companyArr,obj);                            
                        }
                    }else{
                        statisticsFun([rs],obj);
                    }
                } 
            });
        }
        
        $("#statisticsBox").on("click",".todetail,.toTitle,.toOnedetail,.g_todetail,.g_toTitle,.g_toOnedetail,.toTwodetail,.g_toTwodetail,.toCompanyList,.toRmbetail",function(){
            var thisClassName =$(this).attr("class");
            var timeStr =$("#statisticsTime").val();
            var timesArr= timeStr.split(" ~ "); 
            var STime = timesArr[0];
            var Eime =timesArr[1];
            var cid =$(this).parents("tbody").attr("data-id");//公司id
            var cName =$(this).parents(".layui-timeline-content").find("h3.layui-timeline-title>span").text();
            var syText =$(this).parents('.layui-table').find("thead strong").text();
            var symid =$(this).attr("data-symid");
            symid=symid=="-2"?'':symid;
            switch(thisClassName)
            {
                case 'todetail':
                    var twoLevelId=$(this).attr("data-twoid");
                    var oneLevelId=$(this).attr("data-oneid");
                    toDetailFun({
                        data:{
                            StartTime:STime,
                            EndTime:Eime,
                            CurrencyUnitId:symid,
                            CompanyId:cid,
                            OneLevelId:oneLevelId,
                            TwoLevelId:twoLevelId
                        },
                        cid:cid,
                        cName:cName,
                        syText:syText
                    });
                break;
                case 'toTitle':
                    var twoLevelId=$(this).attr("data-twoid");
                    var oneLevelId=$(this).attr("data-oneid");
                    // console.log(twoLevelId,oneLevelId);
                    if(oneLevelId){
                        var prodata ={
                            StartTime:STime,
                            EndTime:Eime,
                            CurrencyUnitId:symid,
                            CompanyId:cid,
                            OneLevelId:oneLevelId
                        }
                    }else if(twoLevelId){
                        var prodata ={
                            StartTime:STime,
                            EndTime:Eime,
                            CurrencyUnitId:symid,
                            CompanyId:cid,
                            TwoLevelId:twoLevelId
                        }
                    }else{
                        var prodata ={
                            StartTime:STime,
                            EndTime:Eime,
                            CurrencyUnitId:symid,
                            CompanyId:cid,
                            // 
                        }
                    }
                    toDetailFun({
                        data:prodata,
                        cid:cid,
                        cName:cName,
                        syText:syText
                    });
                break;
                case 'toOnedetail':
                    var oneLevelId=$(this).attr("data-oneid");
                    toDetailFun({
                        data:{
                            StartTime:STime,
                            EndTime:Eime,
                            CurrencyUnitId:symid,
                            CompanyId:cid,
                            OneLevelId:oneLevelId,
                        },
                        cid:cid,
                        cName:cName,
                        syText:syText
                    });
                break;
                case 'toTwodetail':
                    var oneLevelId=$(this).attr("data-oneid");
                    var twoLevelId=$(this).attr("data-twoid");
                    toDetailFun({
                        data:{
                            StartTime:STime,
                            EndTime:Eime,
                            CurrencyUnitId:'',
                            CompanyId:cid,
                            OneLevelId:oneLevelId,
                            TwoLevelId:twoLevelId,
                        },
                        cid:cid,
                        cName:cName,
                        syText:syText
                    });
                break;
                //以上公司 以下集团
                case 'g_todetail':
                    // var twoLevelId=$(this).attr("data-id");
                    // var oneLevelId=$(this).parents('tr').attr("data-id");
                    var twoLevelId=$(this).attr("data-twoname");
                    var oneLevelId=$(this).attr("data-onename");
                    isGropuData={
                        StartTime:STime,
                        EndTime:Eime,
                        CurrencyId:symid,
                        CompanyId:'',
                        oneLevelName:oneLevelId,
                        twoLevelName:twoLevelId
                    }
                    nowIsList=2;
                    getStatisticsFun(isGropuData);
                    IqSelectGroup(true,isGropuData);
                break;
                case 'g_toTitle':
                //    var symid =$(this).attr("data-symid");
                    isGropuData={
                        StartTime:STime,
                        EndTime:Eime,
                        CurrencyId:symid,
                        CompanyId:'',
                        oneLevelName:'',
                        twoLevelName:''
                    }
                    nowIsList=2;
                    getStatisticsFun(isGropuData);
                    IqSelectGroup(true,isGropuData);
                break;
                case 'g_toOnedetail':
                    var oneLevelId=$(this).attr("data-onename");
                // var oneLevelId=$(this).parents('tr').attr("data-id");
                    isGropuData={
                        StartTime:STime,
                        EndTime:Eime,
                        CurrencyId:'',
                        CompanyId:'',
                        oneLevelName:oneLevelId,
                        twoLevelName:''
                    }
                    nowIsList=2;
                    getStatisticsFun(isGropuData);
                    IqSelectGroup(true,isGropuData);
                break;
                case 'g_toTwodetail':
                    var oneLevelId=$(this).attr("data-onename");
                    var twoLevelId=$(this).attr("data-twoname");
                    // console.log(twoLevelId)
                // var oneLevelId=$(this).parents('tr').attr("data-id");
                    isGropuData={
                        StartTime:STime,
                        EndTime:Eime,
                        CurrencyId:'',
                        CompanyId:'',
                        oneLevelName:oneLevelId,
                        twoLevelName:twoLevelId
                    }
                    nowIsList=2;
                    getStatisticsFun(isGropuData);
                    IqSelectGroup(true,isGropuData);
                break;
                case 'toCompanyList':
                    // var oneLevelId=$(this).attr("data-onename");
                    // var twoLevelId=$(this).attr("data-twoname");
                    // console.log(twoLevelId)
                // var oneLevelId=$(this).parents('tr').attr("data-id");
                    isGropuData={
                        StartTime:STime,
                        EndTime:Eime,
                        CurrencyId:'',
                        CompanyId:'',
                        oneLevelName: '',
                        twoLevelName:''
                    }
                    nowIsList=2;
                    getStatisticsFun(isGropuData);
                    IqSelectGroup(true,isGropuData);
                break;
            }
        })
        var getCompanyCategoryFun=function(obj){//传入公司id
            $.fetch({//调用分页类型接口的 公司状态改变 值改变
                url: CategoryUrl,
                data:{
                    companyId:obj.data.CompanyId,
                },
                type: 'post',
                cb:function(rs){
                    // var oneHtml='',twoHtml='';
                    var oneArr=[],twoArr=[],threeArr=[],twoThreeArr=[];
                    var formSelectsArr=[];
                    for(var i=0;i<rs.length;i++){
                        if(rs[i].level==1){//第一及
                            // oneHtml+='<option value="'+rs[i].id+'">'+rs[i].name+'</option>'//两个流程类型
                            // oneArr.push({
                            //     name: 
                            //     ,id:
                            // })
                            formSelectsArr.push({
                                name: rs[i].name
                                ,value:  rs[i].id
                                ,xslkdf: '1'
                                ,children:[]
                            })
                            // formSelectsArr.push({
                            //     name: rs[i].name
                            //     ,value: rs[i].id
                            //     ,xslkdf: '123'
                            //     ,children: []
                            // })
                        }else if(rs[i].level==2){
                            twoArr.push({id:rs[i].id,name:rs[i].name,pid:rs[i].parent_id});
                        }else if(rs[i].level==3){
                            threeArr.push({id:rs[i].id,name:rs[i].name,pid:rs[i].parent_id});
                        }
                    }
                    // console.log(oneArr,twoArr,threeArr);
                    for(var i=0;i<formSelectsArr.length;i++){
                        for(var j=0;j<twoArr.length;j++){
                            if(twoArr[j].pid==formSelectsArr[i].value){
                                formSelectsArr[i].children.push({
                                    name: twoArr[j].name
                                    ,value: twoArr[j].id
                                    ,xslkdf: '11'
                                    ,children: []
                                })
                            }
                        }
                    }
                    for(var i=0;i<formSelectsArr.length;i++){
                        for(var j=0;j<formSelectsArr[i].children.length;j++){
                            for(var k=0;k<threeArr.length;k++){
                                if(threeArr[k].pid==formSelectsArr[i].children[j].value){
                                    formSelectsArr[i].children[j].children.push({
                                        name: formSelectsArr[i].children[j].name+'/'+threeArr[k].name
                                        ,value: threeArr[k].id
                                        ,xslkdf: '111'
                                    })
                                }
                            }
                        }
                    }
                    layui.formSelects.data('onePayType', 'local', {
                        arr:formSelectsArr
                    });
                    //
                   var isSelectArr=[];
                    if(obj.data.TwoLevelId==-1){
                        for(var i=0;i<rs.length;i++){
                            if(rs[i].level==2&&rs[i].is_init==0&&obj.data.OneLevelId==rs[i].parent_id){//第一及
                                isSelectArr.push(rs[i].id);
                            }
                        }
                        formSelects.value('onePayType', isSelectArr);
                    }else if(obj.data.TwoLevelId==''||obj.data.TwoLevelId==undefined){
                        formSelects.value('onePayType', [obj.data.OneLevelId]);
                    }else{
                        formSelects.value('onePayType', [obj.data.OneLevelId,obj.data.TwoLevelId]);                        
                    }
                }
            })

        }
        var toDetailFun =function(obj={}){
            if(isGrop ==1){//集团
                $.fetch({//调用分页类型接口的 公司状态改变 值改变
                    url: '/gateway/financial/allfinandept',
                    data:{
                        CompanyID:obj.data.CompanyId,
                    },
                    type: 'post',
                    cb:function(rs){
                        var op='<option value="">全部</option>';
                        for(var i=0;i<rs.length;i++){
                            op+='<option value="'+rs[i].id+'">'+rs[i].department_name+'</option>'
                        }
                        $("#FinanDeptID").html(op);
                        form.render();
                    }
                })
            }else{//公司
                $.fetch({//调用分页类型接口的 公司状态改变 值改变
                    url: '/gateway/financial/allfinandept',
                    // data:{
                    //     companyId:obj.data.CompanyId,
                    // },
                    type: 'post',
                    cb:function(rs){
                        // console.log(rs);
                        // var op="";
                        var op='<option value="">全部</option>';
                        
                        for(var i=0;i<rs.length;i++){
                            op+='<option value="'+rs[i].id+'">'+rs[i].department_name+'</option>'
                        }
                        $("#FinanDeptID").html(op);
                        form.render();
                    }
                })
            }
            var chtml = '<div class="layui-fluid"><div class="layui-card">'
                        +'<div class="layui-form" id="disabled">'
                            +'<div class="layui-inline my-10">'
                            +'<label class="layui-form-label">开始日期：</label>'
                            +'<div class="layui-input-inline">'
                            +'<input type="text" class="layui-input" id="SurveyItemStart">'
                            +'</div>'
                        +'</div>'
                        +'<div class="layui-inline my-10">'
                            +'<label class="layui-form-label">结束日期：</label>'
                            +'<div class="layui-input-inline">'
                                +'<input type="text" class="layui-input" id="SurveyItemEnd">'
                            +'</div>'
                        +'</div>'
                        // +'<div class="layui-inline my-10">'
                        //     +'<label class="layui-form-label">固定费用：</label>'
                        //     +'<div class="layui-input-inline">'
                        //         +'<select name="FixedCost" id="FixedCost" lay-filter="FixedCost">'
                        //             +'<option value="-1">全部</option>'
                        //             +'<option value="1">是</option>'
                        //             +'<option value="0">否</option>'                                    
                        //         +'</select>'
                        //     +'</div>'
                        // +'</div>'
                        if(isGrop ==1){
                            chtml +='<div class="layui-inline my-10">'
                            +'<label class="layui-form-label">公司名称：</label>'
                            +'<div class="layui-input-inline">'
                                +'<select name="companyId" id="companyId" lay-filter="companyId">'
                                +'</select>'
                            +'</div>'
                        +'</div>'
                        }
                        chtml +='<div class="layui-inline my-10">'
                                +'<label class="layui-form-label">币种名称：</label>'
                                +'<div class="layui-input-inline">'
                                    +'<select name="moneyType" id="moneyType" lay-filter="moneyType">'
                                    +'</select>'
                                +'</div>'
                            +'</div>'
                            +'<div class="layui-inline my-10">'
                                +'<label class="layui-form-label">费用部门：</label>'
                                +'<div class="layui-input-inline">'
                                    +'<select name="FinanDeptID" id="FinanDeptID" lay-filter="FinanDeptID">'
                                    +'</select>'
                                +'</div>'
                            +'</div>'

                        +'<div class="layui-block my-10">'
                            +'<label class="layui-form-label">费用类型：</label>'
                            +'<div class="layui-input-block">'
                                +'<select name="onePayType" id="onePayType" lay-filter="onePayType" xm-select="onePayType" xm-select-search>'
                                +'</select>'
                            +'</div>'
                        +'</div>'
                        // +'<div class="layui-block my-10">'
                        //     +'<label class="layui-form-label">费用类型：</label>'
                        //     +'<div class="layui-input-block">'
                        //         +'<div id="twoPayType" lay-filter="twoPayType">'
                        //         +'</div>'
                        //     +'</div>'
                        // +'</div>'
                        // +'<div class="layui-inline my-10" style="display:none;">'
                        //     +'<label class="mx-10">其他费用类型：</label>'
                        //     +'<div class="layui-input-inline">'
                        //         +'<select name="threePayType" id="threePayType" lay-filter="threePayType">'
                        //         +'</select>'
                        //     +'</div>'
                        // +'</div>'
                    +'</div>'
                    +'<table class="layui-table"  id="statisticsTable" lay-filter="statisticsTable"></table></div></div>'

                    var listCont = null;
                    var indexs=layer.open({
                        title:' '+obj.cName,
                        type: 1,
                        content: chtml, //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['', 'no']
                        area:['100%', '100%'],
                        success:function(index,layero){
                            
                            // var index = layer.getFrameIndex(window.name);
                         var statisticsTable=  table.render({
                                elem: '#statisticsTable'
                                ,url: window.urls+detalUrl
                                ,where:obj.data
                                ,defaultToolbar:['exports', 'print']
                                // ,limit:10
                                // ,limits:[10,20,30,40,50,60,70,80,90,100,200,500,1000]
                                ,limits: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 200, 500, 1000, 5000]
                                ,method:'post'
                                ,contentType: 'application/json'
                                ,page:true
                                ,loading:true
                                ,totalRow: true
                                ,toolbar: '<div>'
                                    
                                    +'<div class="layui-inline ml-5">'
                                        +'<button id="InquireSur" class="layui-btn" lay-event="InquireSur">查询</button>'
                                        // +'<button id="delSurvey" class="layui-btn" lay-event="delSurvey">删除</button>'
                                        +'<button id="backComany" class="layui-btn">返回</button>'                                        
                                    +'</div>'
                                +'</div>'
                                ,cellMinWidth: 100
                                ,text: {
                                    none: '暂无相关数据' //默认：无数据。注：该属性为 layui 2.2.5 开始新增
                                }
                                ,cols: [[ //标题栏
                                    {field: 'applyUserName', title: '申请人',minWidth:90, fixed: 'left', sort: true, rowspan: 2}
                                    ,{field: 'created_at', title:'申请时间',sort: true,minWidth:120, rowspan: 2,unresize: true}
                                    ,{align: 'center',title: '类型',colspan:3,}
                                    ,{//
                                        sort:true,
                                        field: 'finan_dept_name',
                                        unresize: true,
                                        minWidth: 100,
                                        rowspan: 2,
                                        title: '费用部门'
                                    } 
                                    ,{field: 'fee_remark2',  title: '费用摘要',  rowspan: 2}
                                    // ,{field: 'is_fixed_costs_desc', title: '固定费用',sort: true, minWidth:100, rowspan: 2,unresize: true}  
                                    ,{field: 'cashierUserName', title: '出纳审核人', rowspan: 2,totalRowText: '本页合计金额：'}
                                    ,{field: 'cashierTime', title: '出纳审核时间',sort: true, minWidth:130, rowspan: 2,unresize: true}
                                    ,{field: 'fee_receipt_count', title: '单据数量',sort: true,minWidth:100,rowspan: 2,unresize: true}
                                    ,{align: 'center', title: '金额' ,colspan:3}
                                    ,{field: '',align: 'center', title: '操作',toolbar:'<div><button lay-event="detail" class="layui-btn layui-btn-sm">详情</button></div>', rowspan: 2,fixed:'right'}
                                ],[
                                    { title: '流程类型',field: 'oneCateName',minWidth:100 }
                                    ,{ title: '费用类型',field: 'twoCateName',minWidth:100 }
                                    ,{ title: '费用子类型',field: 'threeCateName',minWidth:100 }
                                    ,{title: '原币种名称',field: 'zh_name',minWidth:120 }
                                    ,{title: '原币种金额',totalRow:true,minWidth:120,field: 'fee_amount',sort: true
                                    }
                                    ,{title: '换算人民币',field: 'rmb_amount',minWidth:120,sort: true,totalRow:true}
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
                                        "curr":res.data.page_index,
                                        "total_amount":res.data.total_amount,
                                        "total_rmb_amount":res.data.total_rmb_amount

                                    };
                                }
                                ,done: function(res){
                                    listCont = res.data;
                                    // $(".layui-table-total table tr").find("td[data-field='cashierTime']").remove()
                                    var totalAmount=(res.total_amount==null||res.total_amount=="")?' ':res.total_amount;
                                    var total_rmbAmount=(res.total_rmb_amount==null||res.total_rmb_amount=="")?' ':res.total_rmb_amount;
                                    // $(".layui-table-total table tr").find("td[data-field='cashierUserName']").colSpan="2";                                    
                                    var newSelect = $(".layui-table-total table tr").clone(true);
                                    $(newSelect).find("td[data-field='cashierUserName']>div").text("总合计金额：");
                                    $(newSelect).find("td[data-field='fee_amount']>div").text(totalAmount);
                                    $(newSelect).find("td[data-field='rmb_amount']>div").text(total_rmbAmount);
                                    if($("#moneyType").val()=='-2'||res.total_amount==""){
                                        $(".layui-table-total table tr").find("td[data-field='fee_amount']>div").text('');
                                        $(newSelect).find("td[data-field='fee_amount']>div").text('');
                                    }
                                    $(".layui-table-total table tbody").append(newSelect);

                                    // 表格不显示时间，显示日期
                                    $(".layui-table-body table tr").find("td[data-field='created_at']>div").css('white-space', 'inherit');
                                    $(".layui-table-body table tr").find("td[data-field='cashierTime']>div").css('white-space', 'inherit');
                                    // 弹出显示时间
                                    res.data.forEach((item, index) => {
                                        $('.layui-table-body table tr').eq(index).on("mouseenter", "td[data-field='cashierTime']>div", function (e) {
                                             e.stopPropagation();
                                            var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">' + item.cashierTime + "</div>";
                                            var that = this;
                                            layer.tips(tipsCont1, that, {
                                                tips: [1, '#999'],
                                                maxWidth: 'auto'
                                            });
                                        });
                                        $('.layui-table-body table tr').eq(index).on("mouseenter", "td[data-field='created_at']>div", function (e) {
                                             e.stopPropagation();
                                            var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">' + item.created_at + "</div>";
                                            var that = this;
                                            layer.tips(tipsCont1, that, {
                                                tips: [1, '#999'],
                                                maxWidth: 'auto'
                                            });
                                        });
                                    });
                                    // 内容摘要
                                    $(".layui-table-body table tr").find("td[data-field='fee_remark2']").addClass('disabledNone');
                                    // 弹出内容
                                    res.data.forEach((item, index) => {
                                        $('.layui-table-body table tr').eq(index).on("mouseover", "td[data-field='fee_remark2']>div", function (e) {
                                            e.stopPropagation();
                                            // $(".layui-table-body table tr").find("td[data-field='fee_remark2']>.layui-table-grid-down").hide();
                                            var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">' + item.fee_remark2 + "</div>";
                                            var that = this;
                                            layer.tips(tipsCont1, that, {
                                                tips: [1, '#999'],
                                                maxWidth: 'auto'
                                            });
                                        });
                                    });
                                    
                                }
                            }); 
                       
                            //监听工具条
                            table.on('tool(statisticsTable)', function(obj){ //注：tool是工具条事件名，test是table原始容器的属性 lay-filter="对应的值"
                                var data = obj.data; //获得当前行数据
                                var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
                                var tr = obj.tr; //获得当前行 tr 的DOM对象

                                if(layEvent === 'detail'){ //查看
                                //do somehing
                                var fid =data.id;
                                $.fetch({
                                    url:"/gateway/financial/detail",
                                    type: 'post',
                                    data:{
                                        ID:fid,
                                    },
                                    cb:function(rs){
                                        if(rs.is_fixed_costs==1){
                                            var attachesUrl='/gateway/financial/downloadfixedcost/'
                                        }else{
                                            var attachesUrl='/gateway/financial/download/'
                                        }
                                        var details ='',attaches='',apprList='';
                                        
                                        for(var i=0;i<rs.details.length;i++){
                                            details+='<tr><td>'+rs.details[i].fee_type_name+'</td><td class="expandingArea "><pre style="display:block;visibility:hidden;"><span>'+rs.details[i].remark+'</span><br></pre><textarea readonly  class="layui-textarea Remark">'+rs.details[i].remark+'</textarea></td><td>'+rs.details[i].receipt_count+'</td><td>'+rs.details[i].amount+'</td></tr>'
                                        }
                                        if(rs.attaches&&rs.attaches.length>0){
                                            for(var j=0;j<rs.attaches.length;j++){
                                                attaches+='<a  title="点击下载" target="_blank" href="'+attachesUrl+''+rs.attaches[j].id+'">'+rs.attaches[j].original_name+'</a>'
                                            }
                                        }else{
                                            attaches='无附件'
                                        }
                                        var approval =rs.approval_history;
                                        if(approval.length==0){
                                        apprList ='暂无';
                                        }else{
                                            for(var k=0;k< approval.length;k++){
                                                var res='';
                                                var classList = '';
                                                if(approval[k].is_forward ==1){//是转发的
                                                    res ='--转发-->';
                                                apprList+='<p>【'+approval[k].username+''+res+ ''//名字
                                                                //意见
                                                            +'<em class="green"> '+approval[k].forward_username+' '+approval[k].approval_time+'</em>】：'//时间
                                                                +approval[k].content+'</p>'//意见内容
                        
                                                }else{//是审批的
                                                    if(approval[k].approval_result==1){
                                                        res ="未批准";
                                                        classList = "red";
                                                    }else if(approval[k].approval_result==2){
                                                        res ="已批准";
                                                        classList = 'green';
                                                    }
                                                apprList+='<p><span> 【'+approval[k].username +'<em class='+classList+'>'+res+' '+approval[k].approval_time+'</em>'+'】</span>'+approval[k].content+'</p>'
                                                }
                                            };
                                        }
                                        var detailPop='<div class="layui-fluid">'
                                                                +'<div class="layui-form" id="printHtml">'
                                                                    // +'<div class="layui-form-mid layui-word-aux">IP：'+rs.createor_ip+'</div>'
                                                                    // +'<div class="fr layui-word-aux" style="padding: 9px 0!important;">填写时间：'+rs.created_at+'</div>'
                                                                    +'<div class="layui-form-item">'
                                                                    +'<div class="layui-inline layui-word-aux">'
                                                                        +'<label class="layui-form-label modify-layui-label ">填写时间</label>'
                                                                        +'<div class="layui-input-block layui-input-lineHeight">'
                                                                            +'<span>'+rs.created_at+'</span>'
                                                                        +'</div>'
                                                                    +'</div>'
                                                                    // if(rs.is_fixed_costs==1){
                                                                    //     detailPop+='<div class="layui-inline layui-word-aux">'
                                                                    //         +'<label class="layui-form-label modify-layui-label ">开始日期</label>'
                                                                    //         +'<div class="layui-input-block layui-input-lineHeight">'
                                                                    //             +'<span>'+rs.fixed_cost_start_month+'</span>'
                                                                    //         +'</div>'
                                                                    //     +'</div>'
                                                                    //     +'<div class="layui-inline layui-word-aux">'
                                                                    //         +'<label class="layui-form-label modify-layui-label ">结束日期</label>'
                                                                    //         +'<div class="layui-input-block layui-input-lineHeight">'
                                                                    //             +'<span>'+rs.fixed_cost_end_month+'</span>'
                                                                    //         +'</div>'
                                                                    //     +'</div>'
                                                                    //     +'<div class="layui-inline layui-word-aux">'
                                                                    //         +'<label class="layui-form-label modify-layui-label">生效时间</label>'
                                                                    //         +'<div class="layui-input-block layui-input-lineHeight">'
                                                                    //             +'<span>'+rs.fixed_cost_job_date+'</span>'
                                                                    //         +'</div>'
                                                                    //     +'</div>'
                                                                    // }
                                                                    detailPop+='</div>'
                                                                    +'<div class="layui-form-item">'
                                                                        +'<div class="layui-inline">'
                                                                            +'<label class="layui-form-label modify-layui-label">姓名</label>'
                                                                            +'<div class="layui-input-block layui-input-lineHeight">'
                                                                                +'<span>'+rs.creator+'</span>'
                                                                            +'</div>'
                                                                        +'</div>'
                                                                        +'<div class="layui-inline">'
                                                                            +'<label class="layui-form-label modify-layui-label">部门</label>'
                                                                            +'<div class="layui-input-block layui-input-lineHeight">'
                                                                                +'<span>'+rs.dept_name+'</span>'
                                                                            +'</div>'
                                                                        +'</div>'
                                                                        +'<div class="layui-inline">'
                                                                            +'<label class="layui-form-label modify-layui-label">列支年月</label>'
                                                                            +'<div class="layui-input-block layui-input-lineHeight">'
                                                                                +'<span>'+rs.liezhi_month+'</span>'
                                                                            +'</div>'
                                                                        +'</div>'
                                                                        +'<div class="layui-inline fr">'
                                                                            +'<button id="printId" class="no-print layui-btn">打印</button>'
                                                                        +'</div>'
                                                                        
                                                                    +'</div>'
                                                                    // +'<div class="layui-form-item">'
                                                                    //     +'<label class="layui-form-label modify-layui-label">列支科目</label>'
                                                                    //     +'<div class="layui-input-block layui-input-lineHeight">'
                                                                    //         +'<span>'+rs.liezhi_kemu+'</span>'
                                                                    //     +'</div>'
                                                                    // +'</div>'
                                                                    +'<div class="layui-form-item">'
                                                                        +'<div class="layui-inline">'
                                                                            +'<label class="layui-form-label modify-layui-label">流程类型</label>'
                                                                            +'<div class="layui-input-block layui-input-lineHeight">'
                                                                            +'<span>'+rs.process_type_name+'</span>'
                                                                            +'</div>'
                                                                        +'</div>'
                                                                        +'<div class="layui-inline">'
                                                                            +'<label class="layui-form-label modify-layui-label">类型</label>'
                                                                            +'<div class="layui-input-block layui-input-lineHeight">'
                                                                                +'<span>'+rs.baoxiao_type_name+'</span>'
                                                                            +'</div>'
                                                                        +'</div>'
                                                                        +'<div class="layui-inline">'
                                                                            +'<label class="layui-form-label modify-layui-label">费用部门</label>'
                                                                            +'<div class="layui-input-block layui-input-lineHeight">'
                                                                                +'<span>'+(rs.finan_dept_name==null?'暂无':''+rs.finan_dept_name+'')+'</span>'
                                                                            +'</div>'
                                                                        +'</div>'
                                                                    +'</div>'
                                                                    +'<div class="layui-form-item">'
                                                                    +'<label class="layui-form-label modify-layui-label">支付明细</label>'
                                                                        +'<div class="layui-input-block">'
                                                                            +'<table class="layui-table" id="lzmFormData">'
                                                                                +'<thead><tr></tr></thead>'
                                                                                +'<tbody><tr><td>暂无</td></tr></tbody>'
                                                                            +'</table>'
                                                                        +'</div>'
                                                                    +'</div>'
                                                                    +'<div class="layui-form-item">'
                                                                        +'<label class="layui-form-label">费用明细</label>'
                                                                        +'<div class="layui-input-block">'
                                                                            +'<table class="layui-table">'
                                                                                +'<colgroup><col width="150"><col><col width="150"><col width="150"><col width="130"></colgroup>'
                                                                                +'<thead><tr><th>费用类型</th><th>费用摘要</th><th>单据数量</th><th>金额 '+rs.zh_name+'('+rs.short_code+')</th></tr></thead>'
                                                                                +'<tbody>'+details+'</tbody>'
                                                                            +'</table>'
                                                                        +'</div>'
                                                                    +'</div>'
                                                                    
                                            if(rs.financial_type_code=='FK'){
                                                detailPop+='<div class="layui-form-item">'
                                                           +'<label class="layui-form-label">付款信息</label>'
                                                           +'<div class="layui-input-block">'
                                                           +'<table class="layui-table">'
                                                            +'<tr><td>'
                                                            +'<div class="layui-form-item">'
                                                                +'<div class="layui-inline">'
                                                                    +'<label class="layui-form-label"><span class="red"> ＊</span>银行</label>'
                                                                    +'<div class="layui-input-inline"><input  type="text" readonly class="layui-input" name="BankName" id="BankName"   value="'+(rs.bank_name==null?'':rs.bank_name)+'"></div>'
                                                                +'</div>'
                                                                +'<div class="layui-inline">'
                                                                    +'<label class="layui-form-label">开户支行</label>'
                                                                    +'<div class="layui-input-inline"> <input type="text" readonly  name="Branch" id="Branch" class="layui-input" value="'+(rs.branch==null?'':rs.branch)+'"></div>'
                                                                +'</div>'
                                                                +'<div class="layui-inline">'
                                                                    +'<label class="layui-form-label"><span class="red"> ＊</span> 银行账号</label>'
                                                                    +'<div class="layui-input-inline"><input type="text" readonly  name="BankAccount" id="BankAccount"  class="layui-input" value="'+(rs.bank_account==null?'':rs.bank_account)+'"></div>'
                                                                +'</div>'
                                                                +'<div class="layui-inline">'
                                                                    +'<label class="layui-form-label"><span class="red"> ＊</span> 开户人</label>'
                                                                    +'<div class="layui-input-inline"><input type="text" readonly  name="AccountName" id="AccountName"  class="layui-input" value="'+(rs.account_name==null?'':rs.account_name)+'"></div>'
                                                                +'</div>'
                                                                +'<div class="layui-inline">'
                                                                    +'<label class="layui-form-label">省份</label>'
                                                                    +'<div class="layui-input-inline"><input type="text" readonly name="Province" id="Province" class="layui-input" value="'+(rs.province==null?'':rs.province)+'"></div>'
                                                                +'</div>'
                                                                +'<div class="layui-inline">'
                                                                    +'<label class="layui-form-label">城市</label>'
                                                                    +'<div class="layui-input-inline"><input type="text" readonly name="City" id="City" class="layui-input" value="'+(rs.city==null?'':rs.city)+'"></div>'
                                                                +'</div>'
                                                            +'</div>'
                                                        +'</td><tr>'
                                                        +'</table>'
                                                           +'</div>'
                                                       +'</div>'
                                               }
                                               detailPop+='<div class="layui-form-item">'
                                                                        +'<div class="layui-inline">'
                                                                            +'<label class="layui-form-label modify-layui-label">总金额</label>'
                                                                            +'<div class="layui-input-block layui-input-lineHeight">'
                                                                                +'<span>'+rs.short_code+' '+rs.amount+''+rs.symbol+'，'+rs.capital_amount+''+rs.zh_name+'</span>'
                                                                            +'</div>'
                                                                        +'</div>'
                                                                        +'<div class="layui-inline">'
                                                                            +'<label class="layui-form-label modify-layui-label">单据总数</label>'
                                                                            +'<div class="layui-input-block layui-input-lineHeight">'
                                                                                +'<span>'+rs.receipt_count+'</span>'
                                                                            +'</div>'
                                                                        +'</div>'
                                                                    +'</div>'
                                                                    +'<div class="layui-form-item">'
                                                                        +'<label class="layui-form-label modify-layui-label">附件</label>'
                                                                        +'<div class="layui-input-block layui-input-lineHeight UploadNames-box">'
                                                                            +attaches
                                                                        +'</div>'
                                                                    +'</div>'
                                                                    if(rs.cancel_remark!=null){
                                                                        detailPop+='<div class="layui-form-item">'
                                                                            +'<label class="layui-form-label modify-layui-label">取消原因</label>'
                                                                            +'<div class="layui-input-block layui-input-lineHeight UploadNames-box">'
                                                                                +rs.cancel_remark
                                                                            +'</div>'
                                                                        +'</div>'
                                                                    }
                
                                                                    detailPop+='<div class="layui-form-item">'
                                                                        +'<label class="layui-form-label modify-layui-label layui-overflow-lineHeight">审批历史</label>'
                                                                        +'<div class="layui-input-block layui-input-lineHeight UploadNames-box layui-overflow-lineHeight">'
                                                                            +apprList
                                                                        +'</div>'
                                                                    +'</div>'
                                                                    +'<div class="layui-form-item">'
                                                                        +'<label class="layui-form-label modify-layui-label label-six">出纳审批记录</label>'
                                                                        +'<div class="layui-input-block layui-input-lineHeight layui-overflow-lineHeight">'
                                                                            if(rs.cashier_approval == null){
                                                                                detailPop+='暂无'
                                                                            }else{
                                                                                detailPop+='<p><span>【'+rs.cashier_approval.name +':<em class="">'
                                                                                +(rs.cashier_approval.approval_result==0?"待审批":(rs.cashier_approval.approval_result==1?"未通过":(rs.cashier_approval.approval_result==2?"已同意":"")))
                                                                                +''+rs.cashier_approval.approval_time+'</em>】</span>'
                                                                                +rs.cashier_approval.content+'</p>'
                                                                            }
                                                                            detailPop+='</div>'
                                                                    +'</div>'
                                                                +'</div>'
                                                                +'<div class="layui-form-item" style="margin-left:118px;">'
                                                                    +'<div class="layui-input-blocklayui-input-lineHeight">'
                                                                        +'<button id="closeId" class=" layui-btn layui-btn-primary">关闭</button>'
                                                                    +'</div>'
                                                                +'</div>'
                                                    +'</div>'
                                        layer.open({
                                            title: '报销付款单详情',
                                            type: 1, 
                                            content:detailPop,
                                            area:['80%','80%'],
                                            success:function(layero,index){
                                                $("#closeId").on("click",function(){
                                                    layer.close(index)
                                                })
                                                $("#printId").on("click",function(){
                                                    var index = layer.load(2, {time: 2000});
                                                    $("#printHtml").jqprint({
                                                        debug: false,
                                                        importCSS: true,
                                                        printContainer: true,
                                                        operaSupport: false
                
                                                    });  
                                                })  
                                                // console.log(data);//id 
                                               
                                            }
                                        })
                                    }
                                });
                                      
                                } 
                            });
                            table.on('sort(statisticsTable)', function (obj) {
                                 // 表格不显示时间，显示日期
                                 $(".layui-table-body table tr").find("td[data-field='created_at']>div").css('white-space', 'inherit');
                                 $(".layui-table-body table tr").find("td[data-field='cashierTime']>div").css('white-space', 'inherit');

                                 // 弹出显示时间
                                 listCont.forEach((item, index) => {
                                     $('.layui-table-body table tr').eq(index).on("mouseenter", "td[data-field='cashierTime']>div", function () {
                                         var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">' + item.cashierTime + "</div>";
                                         var that = this;
                                         layer.tips(tipsCont1, that, {
                                             tips: [1, '#999'],
                                             maxWidth: 'auto'
                                         });
                                     });
                                     $('.layui-table-body table tr').eq(index).on("mouseenter", "td[data-field='created_at']>div", function () {
                                         var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">' + item.created_at + "</div>";
                                         var that = this;
                                         layer.tips(tipsCont1, that, {
                                             tips: [1, '#999'],
                                             maxWidth: 'auto'
                                         });
                                     });
                                 });
                            })
                            laydate.render({
                                elem: '#SurveyItemStart',
                                value:obj.data.StartTime
                            });
                            laydate.render({
                                elem: '#SurveyItemEnd',
                                value:obj.data.EndTime
                            });

                            getCompanyCategoryFun(obj);//初始化时传入 obj 刷新表格 并没有刷新下拉的参数

                            $.fetch({
                                url: "/gateway/financial/currency",
                                type: 'post',
                                cb:function(rs){
                                    var moneyType='';
                                    moneyType+='<option value="-2">全部</option>'
                                    for(var i=0;i<rs.length;i++){
                                        moneyType+='<option value="'+rs[i].id+'">'+rs[i].zh_name+'('+rs[i].short_code+')</option>'
                                    }
                                    moneyType+='<option value="-2">全部</option>'                                    
                                    $("#moneyType").html(moneyType);
                                    if(obj.data.CurrencyUnitId==''||obj.data.CurrencyUnitId==undefined){
                                        $("#moneyType").val('-2')
                                    }else{
                                        $("#moneyType").val(obj.data.CurrencyUnitId);
                                    }
                                    form.render();
                                }
                            })
                            if(isGrop ==1){
                                $.fetch({
                                    url: "/gateway/company/tree",
                                    type: 'post',
                                    cb:function(rs){
                                        var companyId='';
                                        for(var i=0;i<rs[0].children.length;i++){
                                            companyId+='<option value="'+rs[0].children[i].id+'">'+rs[0].children[i].name+'</option>'
                                        }
                                        $("#companyId").html(companyId);
                                        $("#companyId").val(obj.data.CompanyId)
                                        form.render();
                                        //监听公司选择变化
                                        form.on('select(companyId)', function(data){
                                            obj.data.CompanyId=data.value;
                                            getCompanyCategoryFun(obj);
                                            if(isGrop ==1){//集团
                                                $.fetch({//调用分页类型接口的 公司状态改变 值改变
                                                    url: '/gateway/financial/allfinandept',
                                                    data:{
                                                        CompanyID:data.value,
                                                    },
                                                    type: 'post',
                                                    cb:function(rs){
                                                        // var op="";
                                                        var op='<option value="">全部</option>';
                                                        
                                                        if(rs&&rs.length>0){
                                                            for(var i=0;i<rs.length;i++){
                                                                op+='<option value="'+rs[i].id+'">'+rs[i].department_name+'</option>'
                                                            }
                                                        }else{
                                                            op+='<option value="">暂无费用部门</option>'                                                            
                                                        }
                                                        $("#FinanDeptID").html(op);
                                                        form.render();
                                                    }
                                                })
                                            }
                                        }); 
                                    }
                                })
                            }
                            form.render();
                            // form.on('select(twoPayType)', function(data){
                            //     if(data.value == -1){
                            //         $("#threePayType").parents(".layui-inline").show();
                            //     }else{
                            //         $("#threePayType").parents(".layui-inline").hide();
                            //     }
                            // });
                     
                            table.on('toolbar(statisticsTable)', function(obj){
                                var checkStatus = table.checkStatus(obj.config.id);
                                switch(obj.event){
                                    case 'InquireSur':
                                    var oneLevelId=[];
                                    var twoLevelId=[];
                                    var threeLevelId=[];
                                    // var FixedCost=($("#FixedCost").val()=='-1'?'':$("#FixedCost").val());
                                    
                                    var symid = $("#moneyType").val()== -2?'':$("#moneyType").val();
                                    var FinanDeptID = $("#FinanDeptID").val();
                                    var STime = $("#SurveyItemStart").val();
                                    var Eime = $("#SurveyItemEnd").val();
                                    var companyId = $("#companyId").val();
                                    var onePayTypeArr=layui.formSelects.value('onePayType');
                                    for(var i=0;i<onePayTypeArr.length;i++){
                                        if(onePayTypeArr[i].xslkdf=='1'){
                                            oneLevelId.push(onePayTypeArr[i].value);
                                        }else if(onePayTypeArr[i].xslkdf=='11'){
                                            twoLevelId.push(onePayTypeArr[i].value);
                                        }else if(onePayTypeArr[i].xslkdf=='111'){
                                            threeLevelId.push(onePayTypeArr[i].value);
                                        }
                                    }
                                    var oneLevelIdStr =oneLevelId.join(',');
                                    var twoLevelIdStr =twoLevelId.join(',');
                                    var threeLevelIdStr =threeLevelId.join(',');
                                    //  $("#twoPayType") 
                                    
                                    // if(twoLevelId == -1){
                                    //     twoLevelId = $("#threePayType").val();
                                    // }
                                    // if(oneLevelId == ''){
                                    //     twoLevelId='';
                                    // }
                                    statisticsTable.reload({
                                        where:{
                                            EndTime: Eime
                                            ,FinanDeptID:FinanDeptID
                                            // ,FixedCost:FixedCost
                                            ,OneLevelId: oneLevelIdStr
                                            ,StartTime:STime
                                            ,TwoLevelId: twoLevelIdStr
                                            ,CurrencyUnitId:symid
                                            ,CompanyId:companyId
                                            ,ThreeLevelId:threeLevelIdStr
                                        },
                                        page: {
                                            curr: 1 //重新从第 1 页开始
                                        }
                                    });
                                    break;
                                   // case 'backComany':
                                        // var index = parent.layer.getFrameIndex(window.name); //先得到当前iframe层的索引
                                       // console.log(index)
                                       // layer.close(thisLayer); //再执行关闭   
                                   // break;
                                    case 'delSurvey':
                                        var STime = $("#SurveyItemStart").val();
                                        var Eime = $("#SurveyItemEnd").val();
                                        var company =$("#companyId").val();
                                        var companyName =' '+$("#companyId").find("option:selected").text()+' ';
                                        
                                        layer.open({
                                            title:'删除'+companyName+'数据',
                                            type: 1,
                                            content: '<div class="layui-form layui-card-body">'
                                                +'<div class="llayui-form-item py-5">'
                                                    +'<div class="layui-block">'
                                                        +'请选择删除的起始时间'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="llayui-form-item py-5">'
                                                    +'<label class="layui-form-label">开始日期：</label>'
                                                    +'<div class="layui-input-block">'
                                                        +'<input type="text" class="layui-input" id="delStart">'
                                                    +'</div>'
                                                +'</div>'
                                                +'<div class="llayui-form-item py-5">'
                                                    +'<label class="layui-form-label">结束日期：</label>'
                                                    +'<div class="layui-input-block">'
                                                        +'<input type="text" class="layui-input" id="delEnd">'
                                                    +'</div>'
                                                 +'</div>'
                                                +'</div>', //这里content是一个URL，如果你不想让iframe出现滚动条，你还可以content: ['', 'no']
                                            area:'auto',
                                            success:function(){
                                                laydate.render({
                                                    elem: '#delStart',
                                                    type: 'datetime', //默认，可不填
                                                    value:STime+' 00:00:00'
                                                });
                                                laydate.render({
                                                    elem: '#delEnd',
                                                    type: 'datetime', //默认，可不填
                                                    value:Eime+' 00:00:00'
                                                });
                                            },
                                            btn:['确定'],
                                            yes: function(index, layero){
                                                //按钮【按钮一】的回调
                                                
                                                var staTimes= $("#delStart").val();
                                                var delTimes= $("#delEnd").val();

                                                var pindex =index;
                                                layer.confirm('确定删除'+companyName+'以下时段数据？<br><span style="color:#FF5722">'+staTimes+'</span>~<span style="color:#FF5722">'+delTimes+'</span>', {title:' '},function(index){
                                                    $.fetch({
                                                        url:'/gateway/financial/del',
                                                        data:{
                                                            StartTime:staTimes,
                                                            EndTime:delTimes,
                                                            CompanyId:company
                                                        },
                                                        type: 'post',
                                                        cb:function(rs){
                                                            layer.msg('删除成功。');
                                                            layer.close(index);
                                                            layer.close(pindex);
                                                            statisticsTable.reload({
                                                                page: {
                                                                    curr: 1 //重新从第 1 页开始
                                                                }
                                                            });
                                                        }
                                                    })
                                                })
                                               
                                            }
                                        })
                                        
                                     
                                    break;
                                }
                            });

                        }
                    })
                    $("body").off("click").on("click","#backComany",function(){
                        layer.close(indexs);
                    })
                            
        }
       
        var IqSelectGroup =function(show,obj={}){
            if(show){
                $("#CompanyListForm .ishide").show();
                if(obj.CompanyId==''){
                    var CategoryCompanyId=2;
                }else{
                    var CategoryCompanyId=obj.CompanyId;
                }
                $.fetch({
                    url: CategoryUrl,
                    data:{
                        companyId:CategoryCompanyId,
                    },
                    type: 'post',
                    cb:function(rs){
                        var oneHtml='',twoHtml='',threeHtml='';
                        for(var i=0;i<rs.length;i++){
                            if(rs[i].level==1){
                                oneHtml+='<option value="'+rs[i].name+'">'+rs[i].name+'</option>'
                            }else if(rs[i].level==2){
                                if(rs[i].is_init==1){
                                    twoHtml+='<option data-pid="'+rs[i].parent_id+'" value="'+rs[i].name+'">'+rs[i].name+'</option>'
                                }
                            }
                        }
                        oneHtml+='<option data-pid="0" value="-2">全部</option>'
                        twoHtml+='<option data-pid="0" value="-2">全部</option>'
                        twoHtml+='<option data-pid="0" value="其他">其他</option>'
                        $("#g_onePayType").html(oneHtml);
                        $("#g_twoPayType").html(twoHtml);
                            
                        $("#g_twoPayType option").each(function() {   /*作用：遍历select option */
                            var getText = $(this).text();
                            if($("#g_twoPayType option:contains("+getText+")").length > 1)   /*作用：select option:contains("+text+")")包含text的个数 */
                            {
                             $("#g_twoPayType option:contains("+getText+"):gt(0)").remove();  /*作用：包含text大于个数0的选项就移除*/
                            }
                        });
                        
                        if(obj.oneLevelName==undefined||obj.oneLevelName==''){
                            $("#g_onePayType").val("-2");                                   
                        }else{
                            $("#g_onePayType").val(obj.oneLevelName);
                        }
                        if(obj.twoLevelName==undefined||obj.twoLevelName==''){
                            $("#g_twoPayType").val("-2");
                        }else{
                            $("#g_twoPayType").val(obj.twoLevelName);
                        }
                        form.render();
                    }
                })
                $.fetch({
                    url: "/gateway/financial/currency",
                    type: 'post',
                    cb:function(rs){
                        var moneyType='';
                        for(var i=0;i<rs.length;i++){
                            moneyType+='<option value="'+rs[i].id+'">'+rs[i].zh_name+'('+rs[i].short_code+')</option>'
                        }
                        moneyType+='<option value="-2">全部</option>'
                        $("#g_moneyType").html(moneyType);

                        if(obj.CurrencyId==''){
                            $("#g_moneyType").val(-2);
                        }else{
                            $("#g_moneyType").val(obj.CurrencyId)
                        }
                        form.render();
                    }
                })
                if(isGrop ==1){
                    $.fetch({
                        url: "/gateway/company/tree",
                        type: 'post',
                        cb:function(rs){
                            var companyId='';
                            for(var i=0;i<rs[0].children.length;i++){
                                companyId+='<option value="'+rs[0].children[i].id+'">'+rs[0].children[i].name+'</option>'
                            }
                            companyId+='<option value="-2">全部</option>'
                            
                            $("#g_companyId").html(companyId);
                            if(obj.CompanyId==''){
                                $("#g_companyId").val(-2);
                            }else{
                                $("#g_companyId").val(obj.CompanyId);
                            }

                            isGropuData.CompanyId=''
                             getStatisticsFun(isGropuData);
                            
                            form.render();
                        }
                    })
                }
                form.render();
                form.on('select(g_twoPayType)', function(data){
                    var TwoLevelId=$("#g_twoPayType").find("option:selected").text();
                    isGropuData.twoLevelName= TwoLevelId=="全部"?'':TwoLevelId;
                    getStatisticsFun(isGropuData);
                });  
                form.on('select(g_onePayType)', function(data){
                    var OneLevelId=$("#g_onePayType").find("option:selected").text();
                    isGropuData.oneLevelName= OneLevelId=="全部"?'':OneLevelId;
                    getStatisticsFun(isGropuData);
                });  
                form.on('select(g_moneyType)', function(data){
                    // console.log(data.value)
                    isGropuData.CurrencyId= data.value=="-2"?'':data.value;
                    // console.log(isGropuData);

                    getStatisticsFun(isGropuData);
                });  
                form.on('select(g_companyId)', function(data){
                    isGropuData.CompanyId=data.value =="-2"?'':data.value;
                    getStatisticsFun(isGropuData);
                });  
            }else{
                $("#CompanyListForm .ishide").hide();
            }
        }
        isGropuData.StartTime=  d.getFullYear() + '-' + lay.digit(d.getMonth()+1) + '-01';
        isGropuData.EndTime = d.getFullYear() + '-' + lay.digit(d.getMonth() + 1) + '-' + lay.digit(d.getDate());
        getStatisticsFun(isGropuData);
        util.fixbar({ });
    })
})