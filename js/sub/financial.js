$(function () {
    layui.config({
        base: '../../../layui/' //静态资源所在路径
    }).extend({
        index: 'index' //主入口模块
    }).use(['index', 'table', 'laydate', 'form', 'upload'], function () {
        var $ = layui.$,
            admin = layui.admin,
            element = layui.element,
            router = layui.router();
        element.render();
        var laydate = layui.laydate,
            form = layui.form,
            layer = layui.layer,
            table = layui.table,
            upload = layui.upload;
        laydate.render({
            elem: '#lzMon',
            type: 'month',
            value: new Date()
        });

        // var FixedCostJobFun = function (mon) {
        //     var option = ''
        //     for (var i = 1; i <= mon; i++) {
        //         option += '<option value="' + i + '">' + i + ' 日</option>'
        //     }
        //     $("#FixedCostJobDate").html(option);
        //     form.render();
        // }
        var d = new Date();
        d.setMonth(d.getMonth() + 1);
        d.setDate(0);
        // var y = dd.getFullYear();
        // 	var m = dd.getMonth() + 1;
        // 	var d = dd.getDate();
        var lastDay = new Date(d).getDate();
        // FixedCostJobFun(lastDay);

        // var FixedCostStartMonth = laydate.render({
        //     elem: '#FixedCostStartMonth',
        //     type: 'month',
        //     value: new Date(),
        //     done: function (value, date, endDate) {
        //         FixedCostEndMonth.config.min = {
        //             year: date.year,
        //             month: date.month-1,
        //             // date: date.date,
        //         };
        //         var endMonth = $("#FixedCostEndMonth").val();
        //         if (value > endMonth) {
        //             $("#FixedCostEndMonth").val(value)
        //         }
        //         // ////console.log(value); //得到日期生成的值，如：2017-08-18
        //         // ////console.log(date); //得到日期时间对象：{year: 2017, month: 8, date: 18, hours: 0, minutes: 0, seconds: 0}
        //         // ////console.log(endDate); //得结束的日期时间对象，开启范围选择（range: true）才会返回。对象成员同上。
        //         var mon = laydate.getEndDate(date.month, date.year);
        //         //////console.log(mon);
        //         FixedCostJobFun(mon);
        //     }
        // });
        // FixedCostStartMonth.config.min = { //初始化限制最小月份
        //     year: d.getFullYear(),
        //     month: d.getMonth(),
        //     // date:d.getDate(),
        // };

        // var FixedCostEndMonth = laydate.render({
        //     elem: '#FixedCostEndMonth',
        //     type: 'month',
        //     value: new Date(),
        //     done: function (value, date, endDate) {
        //         // FixedCostStartMonth.config.max = { //动态限制范围
        //         //     year: date.year,
        //         //     month: date.month-1,
        //         //     // date: date.date,
        //         // }
        //     }
        // });
        // FixedCostEndMonth.config.min = {
        //     year: d.getFullYear(),
        //     month: d.getMonth(),
        //     // date:d.getDate(),
        // };

        // laydate.render({
        //     elem: '#FixedCostJobDate'
        //     // ,type: 'time'
        //     ,value: new Date()
        // });

        var subFormDatas = []; //保存自定义表单提交字段
        var financialObj = { //保存财务相关数据的对象
            finanTypesArr: [],
            FeeDetail: '', //保存新增html用
            localCurrency:'',
            NextApprovalStep: '', //下一步审批人所属环节
            finaFiles: [], //附件id数组
            enabled:0,
        }
        var payTypeFormFun = function (ItemID) {
            $.fetch({
                url: "/gateway/formtpl/getform",
                type: 'post',
                data: {
                    ItemID: ItemID,
                    FormType: 1,
                },
                cb: function (rs) {
                    if (rs.form_page != null) {
                        $("#subFinanForm").attr('data-FormId', rs.form_page.id);

                    }
                    var rs = rs.form_template;
                    subFormDatas = []; //切换子类时清空空
                    var formTypeFun = function (type, n) {
                        var formHtml = '';
                        switch (type.component_type) {
                            case 'text':
                                formHtml = ' <input type="text" ' + (type.required == 0 ? 'lay-verify="required"' : '') + ' value="' + ((type.attr && type.attr.textVal) ? type.attr.textVal : '') + '" name="text_' + n + '" placeholder="请输入" autocomplete="off" class="layui-input">'

                                break;
                            case 'select':
                                var arr = type.attr ? type.attr.option : [];
                                formHtml = '<select name="select_' + n + '" lay-filter="aihao">';
                                for (var k = 0; k < arr.length; k++) {
                                    formHtml += '<option value="' + arr[k] + '">' + arr[k] + '</option>'
                                }
                                formHtml += '</select>';
                                break;
                            case 'checkbox':
                                var arr = type.attr ? type.attr.option : [];
                                for (var k = 0; k < arr.length; k++) {
                                    formHtml += '<input type="checkbox" name="checkbox_' + n + '" title="' + arr[k] + '" lay-skin="primary">'
                                }
                                break;
                            case 'radio':
                                var arr = type.attr ? type.attr.option : [];
                                for (var k = 0; k < arr.length; k++) {
                                    formHtml += '<input type="radio" name="radio_' + n + '" value="' + arr[k] + '" title="' + arr[k] + '" ' + (k == 0 ? 'checked' : '') + '>'
                                }
                                break;
                            case 'textarea':
                                formHtml = '<textarea name="textarea_' + n + '" ' + (type.required == 0 ? 'lay-verify="required"' : '') + ' placeholder="请输入内容" class="layui-textarea">' + ((type.attr && type.attr.textVal) ? type.attr.textVal : '') + '</textarea>'
                                break;
                            case 'datetime':
                                formHtml = '<input type="text"  ' + (type.required == 0 ? 'lay-verify="required"' : '') + ' name="datetime_' + n + '" class="layui-input datetime" id="test_' + n + '">';
                                break;
                        }
                        return formHtml
                    }
                    // var forDataFormFun=function(rs,ors){
                    if (rs && rs.length > 0) {
                        var tr = '';

                        for (var i = 0; i < rs.length; i++) {
                            if (typeof (rs[i].attr) == 'string' && rs[i].attr != '') {
                                rs[i].attr = JSON.parse(rs[i].attr);
                            }
                            subFormDatas.push({
                                name: rs[i].component_type + '_' + i,
                                FormTemplateID: rs[i].template_id,
                                component_type: rs[i].component_type,
                                label: rs[i].label,
                            })
                            tr += '<div class="layui-inline"><label class="layui-form-label">' + (rs[i].required == 0 ? '<b class="red">*</b>' : '') + rs[i].label + '</label><div class="modify-layui layui-input-inline"  >' + formTypeFun(rs[i], i) + '</div>' + ((rs[i].attr && rs[i].attr.formode) ? '<div class="layui-form-mid layui-word-aux">' + rs[i].attr.formode + '</div>' : '') + '</div>'
                        }
                        $("#payDetailsForm").html('<div class="layui-fluid"><div class="layui-form"><div class="layui-form-item">' + tr + '</div></div></div>');
                        //处理时间控件 
                        $("#payDetailsForm").find(".datetime").each(function () {
                            var tid = $(this).attr("id");
                            var arrindex = parseInt(tid.split('_')[1]);
                            var dateIsRange = false,
                                datetype = 'date';
                            if (typeof (rs[arrindex].attr) == 'string') {
                                rs[arrindex].attr = JSON.parse(rs[arrindex].attr);
                            }
                            if (rs[arrindex].attr) {
                                dateIsRange = rs[arrindex].attr.dateIsRange == 0 ? '~' : false;
                                datetype = ['date', 'month', 'year', 'datetime'][rs[arrindex].attr.dateFormType];
                            }
                            laydate.render({
                                elem: '#' + tid + '' //指定元素
                                    ,
                                range: dateIsRange,
                                type: datetype
                            });
                        })
                        form.render();
                    } else {
                        $("#payDetailsForm").html('<tr><td><div style="text-align:center;line-height: 36px;">暂无</div></td></tr>');

                    }
                    // }
                }
            })
        }
        var payTypeFun = function (val) { //根据类型获取费用类型
            var payTypeHtml = '';
            $.fetch({
                url: '/gateway/financialtype/subtypes',
                type: 'post',
                data: {
                    pid: val,
                },
                cb: function (rs) {
                    for (var i = 0; i < rs.length; i++) {
                        payTypeHtml += '<option value="'+rs[i].id+'" data-spec="'+rs[i].is_special+'">' + rs[i].name + '</option>'
                    }
                    $("#payType").html(payTypeHtml);
                    form.render('select');
                    
                    //根据子类型调用审批人
                    var val = $("#payType").val();
                    if(rs.length&&rs.length>0){
                        var isSpecial =rs[0].is_special

                    }else{
                        isSpecial='-1'
                    }
                    finanAppr(val, 1,isSpecial);
                    payTypeFormFun(val);

                    form.on('select(payType)', function (data) {
                        //console.log(data.elem)
                        var isSpecial= $(data.elem).find('option[value="'+data.value+'"]').attr("data-spec");
                        finanAppr(data.value, 1,isSpecial);
                        payTypeFormFun(data.value);
                    });
                    //根据子类 获取明细表单

                }
            });

        }
     
        var finanTypesFun = function (val) { //根据流程类型 获取类型
            var finaTypeHtml = '';
            for (var i = 0; i < financialObj.finanTypesArr.length; i++) {
                if (financialObj.finanTypesArr[i].id == val) {
                    var subnodess = financialObj.finanTypesArr[i].subnodes;
                    if (subnodess && subnodess.length > 0) {
                        for (var j = 0; j < subnodess.length; j++) {
                            var ischecked = j == 0 ? 'checked' : ''; //第一个默认选中
                            finaTypeHtml += '<option name="finaType" value="' + subnodess[j].id + '"  ' + ischecked + '>' + subnodess[j].name + '</option>'
                        }
                    }
                    payTypeFun(subnodess[0].id)
                }
            }
            $("#finaType").html(finaTypeHtml);
            form.render('select');
            form.on('select(finaType)', function (data) {
                payTypeFun(data.value)
            });
        }
        var newfinanForm = function (o,ors) {
            if (o && o.length > 0) {
                financialObj.finanTypesArr = o;
                var finaStepHtml = '';
                for (var i = 0; i < financialObj.finanTypesArr.length; i++) {
                    var ischecked = i == 0 ? 'checked' : ''; //第一个默认选中
                    finaStepHtml += '<option data-code="'+financialObj.finanTypesArr[i].code+'"  value="' + financialObj.finanTypesArr[i].id + '"  ' + ischecked + '>' + financialObj.finanTypesArr[i].name + '</option>'
                    if(financialObj.finanTypesArr[i].code==='BX'){
                        var yzId = -financialObj.finanTypesArr[i].id;
                    }
                }
                finaStepHtml += '<option data-code="BX"  value="'+yzId+'">预支</option>'
                finanTypesFun(financialObj.finanTypesArr[0].id);

                $("#finaStepType").html(finaStepHtml);
                form.render('select');

                form.on('select(finaStepType)', function (data) {
                    // console.log()
                    var finVal=(data.value<0)?-data.value:data.value;
                    finanTypesFun(finVal);
                    finaStepTypeCode= $("#finaStepType").find("option[value='"+finVal+"']").attr("data-code");
                    //console.log(finaStepTypeCode)
                    if(finaStepTypeCode=="FK"||financialObj.enabled==0||ors.local_currency.id==$("#currencyUnitrd").val()){
                        $("#Exchange").parents(".layui-form-item").hide();
                        $("#localUnit").parents("th").hide();
                        $(".localCurrency").parent("td").hide();
                    }else{
                        $("#Exchange").parents(".layui-form-item").show();
                        $("#localUnit").parents("th").show();
                        $(".localCurrency").parent("td").show();
                    }
                    if(finaStepTypeCode=="FK"){
                        $("#fkxxForm").show();
                          
                        $("#fkxxForm input[name='BankName']").attr('lay-verify','required');
                        $("#fkxxForm input[name='BankAccount']").attr('lay-verify','required');
                        $("#fkxxForm input[name='AccountName']").attr('lay-verify','required');
                    }else{
                        $("#fkxxForm").hide();
                        $("#fkxxForm input[name='BankName']").attr('lay-verify','');
                        $("#fkxxForm input[name='BankAccount']").attr('lay-verify','');
                        $("#fkxxForm input[name='AccountName']").attr('lay-verify','');
                    }
                });
            }
        }
        var rateListArr=[];
        var ExchangeFun=function(rateList,val,num){//本地币种名称,id,金额
            var isRateList=false;
            // for(var i =0;i<rateList.length;i++){
            //     if(rateList[i].foreign_currency_unit_id==val){//计算总金额
                    // $("#ExchangeText").text(rateList);
                    var sum = 0;
                    $(".localCurrency").each(function () {
                        var num = $(this).text();
                        ////console.log(num)
                        if (num == "" || num == null) {
                            num = 0;
                        }
                        // sum =sum+
                        sum = (parseFloat(( sum*100 + parseFloat(num*100) )/100).toFixed(2))
                    })
                    sum = sum=='NaN'?0:sum
                  //  //console.log(sum)
                    $("#Exchange").val(sum);
                   // isRateList=true;
            //     }
            // }
           // //console.log(financialObj.enabled)
            if(financialObj.enabled==1){
              //  //console.log(isRateList)
                // if(!isRateList){
                //     layer.msg('当前币种未设置汇率,无法提交',{time:1000,icon:5})
                //    
                // } else {
                   
                // }
            }
        }
        var currencyUnitrdFun = function (trs,rateList,local_currency) {
            var unit = '';
            for (var i = 0; i < trs.length; i++) {
                unit += '<option  data-symbolZn="' + trs[i].zh_name + '" data-symboln="' + trs[i].symbol + '" data-symbolp="' + trs[i].short_code + '" value="' + trs[i].id + '" t>' + trs[i].zh_name + '(' + trs[i].short_code + ')</option>'
            }
            $("#currencyUnitrd").html(unit);
            $("#currencyUnitrd option:first").attr('checked', 'checked');
            form.render('select');
            var unittext = '<span>' + trs[0].zh_name + '<span>(' + trs[0].short_code + ')';
            var symbolP = trs[0].short_code;
            var symbolN = trs[0].symbol;
            var symbolZname = trs[0].zh_name;
            $("#currencyUnit").html(unittext);
            $("#symbolMoneyP").text(symbolP);
            $("#symbolMoneyN").text(symbolN);
            $("#symbolMoneyZname").text(symbolZname);
            // rateListArr=rateList;
           // //console.log(trs,rateList)
            form.on('select(currencyUnitrd)', function (data) {
             //   //console.log(data);
                unittext = $(data.elem).find("option:selected").text();
                symbolP = $(data.elem).find("option:selected").attr('data-symbolp');
                symbolN = $(data.elem).find("optio n:selected").attr('data-symboln');
                var symbolZname = $(data.elem).find("option:selected").attr('data-symbolZn');
                $("#currencyUnit").html(unittext);

                $("#symbolMoneyZname").text(symbolZname);
                $("#symbolMoneyP").text(symbolP);
                $("#symbolMoneyN").text(symbolN);
                
                $(".receiptCount").val('');
                $(".localCurrency").html('');
                $("#totalPrice").val('');
                $("#Exchange").val('');
                var finaStepTypeVal=$("#finaStepType").val()<0?-$("#finaStepType").val():$("#finaStepType").val();
                var finaStepTypeCode=$("#finaStepType").find("option[value='"+finaStepTypeVal+"']").attr("data-code");
                // //console.log(finaStepTypeCode)
                if(local_currency.id==data.value||finaStepTypeCode=='FK'){
                    $("#Exchange").parents(".layui-form-item").hide();
                    $("#localUnit").parents("th").hide();
                    $(".localCurrency").parent("td").hide();
                }else{
                  var finaStepTypeVal=$("#finaStepType").val()<0?-$("#finaStepType").val():$("#finaStepType").val();
                // var finaStepTypeVal=$("#finaStepType").val();
                    var finaStepTypeCode=$("#finaStepType").find("option[value='"+finaStepTypeVal+"']").attr("data-code");
                    // console.log(finaStepTypeCode)
                    if(financialObj.enabled==1&&finaStepTypeCode=='BX'){
                        $("#Exchange").parents(".layui-form-item").show();
                        $("#localUnit").parents("th").show();
                        $(".localCurrency").parent("td").show();
                        var nums=$("#totalPrice").val();
                        ExchangeFun('',data.value,nums);
                    }else{
                        $("#Exchange").parents(".layui-form-item").hide();
                        $("#localUnit").parents("th").hide();
                        $(".localCurrency").parent("td").hide();
                    }

                }
            });
        }
        form.on('radio(toIsGroup)', function (data) {
            if (data.value == 1) {
                $("#finanApprList").attr("disabled", 'disabled');
            } else {
                $("#finanApprList").removeAttr("disabled");
            }
            form.render();
        });
        var finanAppr = function (typrID, step,isSpecial) {
            // ////console.log(typrID)
            if (typrID == '' || typrID == null) {
                layer.msg("当前费用类型未设置子类型,请先设置子类型。", {
                    icon: 5
                });
                $("#subFinanForm").attr("disabled", "disabled").addClass("layui-disabled");
            } else {
                $("#subFinanForm").removeAttr("disabled", "disabled").removeClass("layui-disabled");

                $.fetch({ //新建报销预支单初始化数据
                    url: '/gateway/financial/getapprovaluser',
                    type: 'post',
                    data: {
                        financialTypeId: typrID,
                        step: step,
                        itemId: 0,
                        departmentId: window.userInfo.dapartId,
                        applyuserId: window.userInfo.userId,
                    },
                    cb: function (rs) {
                        var apprHtml = '';
                        if(isSpecial==0){
                            if (rs.dept_list.length == 0) {
                                apprHtml += '<option value="">无审核人</option>';
                                layer.msg("未设置审批人或审批人与当前提交用户为同一人,无法提交。", {
                                    icon: 5
                                });
                                $("#subFinanForm").attr("disabled", "disabled").addClass("layui-disabled");
                            } else {
                                for (var i = 0; i < rs.dept_list.length; i++) {
                                    apprHtml += '<option value="' + rs.dept_list[i].id + '">' + rs.dept_list[i].name + '</option>'
                                }
                                $("#subFinanForm").removeAttr("disabled", "disabled").removeClass("layui-disabled");
                            }
                        }else if(isSpecial==1){
                            if (rs.userList.length == 0) {
                                apprHtml += '<option value="">无审核人</option>';
                                layer.msg("未设置审批人或审批人与当前提交用户为同一人,无法提交。", {
                                    icon: 5
                                });
                                $("#subFinanForm").attr("disabled", "disabled").addClass("layui-disabled");
                            } else {
                                for (var i = 0; i < rs.userList.length; i++) {
                                    apprHtml += '<option value="' + rs.userList[i].id + '">' + rs.userList[i].name + '</option>'
                                }
                                $("#subFinanForm").removeAttr("disabled", "disabled").removeClass("layui-disabled");
                            }


                        }
                        $("#finanApprList").html(apprHtml);
                        form.render('select');
                        financialObj.NextApprovalStep = rs.step; //下一个审批人所属的审批环节
                    }
                });

            }
        }
        $.fetch({ //新建报销预支单初始化数据
            url: '/gateway/financial/newfinancialorder',
            type: 'post',
            cb: function (rs) {
             
                var Htmldept='<option  value="">请选择</option>';
                for (var i = 0; i < rs.finan_dept_list.length; i++) {
                    Htmldept += '<option value="' + rs.finan_dept_list[i].id + '">' + rs.finan_dept_list[i].department_name + '</option>'
                }
                $("#FinanDeptId").html(Htmldept);
                form.render('select');
        
               
                financialObj.enabled=rs.enabled;
                if(rs.enabled==1){
                    financialObj.localCurrency=rs.local_currency.id?rs.local_currency.id:'';
                }else{
                    financialObj.localCurrency='';
                }
                if( rs.enabled==0){
                    $("#Exchange").parents(".layui-form-item").hide();
                    $("#localUnit").parents("th").hide();
                    $(".localCurrency").parent("td").hide();
                    financialObj.FeeDetail = '<tr class="FeeDetail">'
                        +
                        '<td><textarea lay-verify="required" class="layui-textarea textarea-modify Remark" ></textarea></td>' +
                        '<td><input lay-verify="required" type="tel" autocomplete="off" class="layui-input receiptCount"  value=""></td>' +
                        '<td style="display:none;"><div class="localCurrency"></div></td>' +
                        '<td><input lay-verify="required" type="tel"  autocomplete="off" class="layui-input amountNumber" onkeypress="return (/[\\d]/.test(String.fromCharCode(event.keyCode)))" ></td>' +
                        '<td><button class="layui-btn layui-btn-danger delFee">删除</button></td>' +
                        '</tr>'
                }else if(rs.enabled==1){
                    $("#Exchange").parents(".layui-form-item").show();
                    $("#localUnit").parents("th").show();
                    $(".localCurrency").parent("td").show();
                    
                    //ExchangeFun(rs.rate_list,rs.currency_unit[0].id,0);//汇率修改逻辑
                    ExchangeFun('',rs.currency_unit[0].id,0);//汇率修改逻辑


                    financialObj.FeeDetail = '<tr class="FeeDetail">'
                        +
                        '<td><textarea lay-verify="required" class="layui-textarea textarea-modify Remark" ></textarea></td>' +
                        '<td><input lay-verify="required" type="tel" autocomplete="off" class="layui-input receiptCount"  value=""></td>' +
                        '<td><div class="localCurrency"></div></td>' +
                        '<td><input lay-verify="required" type="tel"  autocomplete="off" class="layui-input amountNumber" onkeypress="return (/[\\d]/.test(String.fromCharCode(event.keyCode)))" ></td>' +
                        '<td><button class="layui-btn layui-btn-danger delFee">删除</button></td>' +
                        '</tr>'
                }
                newfinanForm(rs.financialTypes,rs); //流程 类型 费用类型
                // finanAppr(rs.userList,rs.step);//审核人
                
              //  currencyUnitrdFun(rs.currency_unit,rs.rate_list,rs.local_currency,rs.enabled);//汇率修改逻辑
                currencyUnitrdFun(rs.currency_unit,'',rs.local_currency,rs.enabled);//汇率修改逻辑


                $("#finaName").val(rs.username);
                $("#finaDepa").val(rs.department_name);
                if(rs.enabled==1){
                    $("#localUnit").html(rs.local_currency.zh_name)
                    $("#ExchangeText").html(rs.local_currency.zh_name)
                }                
                // $("#FinancialFeeList").on("input propertychange", ".receiptCount", function () {
                //     var sum = 0;
                //     $(".receiptCount").each(function () {//动态计算
                //         var num = $(this).val();
                //         if (num == "" || num == null) {
                //             num = 0;
                //         }
                //         // sum =sum+
                //         sum = parseFloat((sum + parseFloat(num)).toFixed(10))
                //     })
                //     $("#totalPrice").val(NumberCheck('' + sum));
                //     var b_totalPrice = changeMoneyToChinese(sum);
                //     $("#b_totalPrice").text(b_totalPrice);
                //     var currencyUnitrdVal=$("#currencyUnitrd").val();
                //     var thisNum ='';
                //     var thisAmount =$(this).val();
                //     // var finaStepTypeVal=$("#finaStepType").val();
                //     var finaStepTypeVal=$("#finaStepType").val()<0?-$("#finaStepType").val():$("#finaStepType").val();
                    
                //     var finaStepTypeCode=$("#finaStepType").find("option[value='"+finaStepTypeVal+"']").attr("data-code");
                //     //console.log(finaStepTypeCode)
                //     if(rs.enabled==1&&finaStepTypeCode!="FK"){//切换付款时 不显示
                //         //console.log(finaStepTypeCode)
                //         var localCurrency=$(this).parent('td').next('td').children('.localCurrency');
                //         $.fetch({
                //             url: '/gateway/financialrate/convert',
                //             type: 'post',
                //             data: {
                //                 OriginalCurrencyID:currencyUnitrdVal,
                //                 FinalCurrencyID:rs.local_currency.id,
                //                 Amount:thisAmount
                //             },
                //             cb: function (rs) {
                //                 // financialObj.finaFiles.splice($.inArray(delId, financialObj.finaFiles), 1);
                //                 // elem.remove();
                //                 if(!rs.msg){
                //                     //console.log(rs)
                //                     thisNum=rs;
                //                     thisNum=thisNum=="NaN"?0:thisNum;
                //                     //console.log(thisNum)
                                    
                //                     localCurrency.text(thisNum)
                //                     ExchangeFun('',currencyUnitrdVal,NumberCheck('' + sum))
                //                     $("#subFinanForm").removeAttr("disabled", "disabled").removeClass("layui-disabled");
                //                 }else{
                //                     layer.msg(rs.msg);
                //                     $("#subFinanForm").attr("disabled", "disabled").addClass("layui-disabled");
                //                     $(".receiptCount").val('');
                //                     $(".localCurrency").html('');
                //                     $("#totalPrice").val('');
                //                     $("#Exchange").val('');
                //                 }
                //             }
                //         });
                        

                //     }
                //     // console.log()
                //     if(rs.local_currency.id==$("#currencyUnitrd").val()||finaStepTypeCode=="FK"){
                //         $("#Exchange").parents(".layui-form-item").hide();
                //         $("#localUnit").parents("th").hide();
                //         $(".localCurrency").parent("td").hide();
                //     }else{
                //         if(financialObj.enabled==1){
                //             $("#Exchange").parents(".layui-form-item").show();
                //             $("#localUnit").parents("th").show();
                //             $(".localCurrency").parent("td").show();
                //         }else{
                //             $("#Exchange").parents(".layui-form-item").hide();
                //             $("#localUnit").parents("th").hide();
                //             $(".localCurrency").parent("td").hide();
                //         }
                //     }
                // })

                $("#FinancialFeeList").on("blur", ".receiptCount", function () {
                    console.log(1*99999);
                    var sum = 0;
                    $(".receiptCount").each(function () {//动态计算
                        var num = $(this).val();
                        if (num == "" || num == null) {
                            num = 0;
                        }
                        // sum =sum+
                        sum = parseFloat((sum + parseFloat(num)).toFixed(10))
                    })
                    $("#totalPrice").val(NumberCheck('' + sum));
                    var b_totalPrice = changeMoneyToChinese(sum);
                    $("#b_totalPrice").text(b_totalPrice);
                    var currencyUnitrdVal=$("#currencyUnitrd").val();
                    var thisNum ='';
                    var thisAmount =$(this).val();
                    // var finaStepTypeVal=$("#finaStepType").val();
                    var finaStepTypeVal=$("#finaStepType").val()<0?-$("#finaStepType").val():$("#finaStepType").val();
                    
                    var finaStepTypeCode=$("#finaStepType").find("option[value='"+finaStepTypeVal+"']").attr("data-code");
                    //console.log(finaStepTypeCode)
                    if(rs.enabled==1&&finaStepTypeCode!="FK"){//切换付款时 不显示
                        //console.log(finaStepTypeCode)
                        var localCurrency=$(this).parent('td').next('td').children('.localCurrency');
                        $.fetch({
                            url: '/gateway/financialrate/convert',
                            type: 'post',
                            data: {
                                OriginalCurrencyID:currencyUnitrdVal,
                                FinalCurrencyID:rs.local_currency.id,
                                Amount:thisAmount
                            },
                            cb: function (rs) {
                                // financialObj.finaFiles.splice($.inArray(delId, financialObj.finaFiles), 1);
                                // elem.remove();
                                if(!rs.msg){
                                    //console.log(rs)
                                    thisNum=rs;
                                    thisNum=thisNum=="NaN"?0:thisNum;
                                    //console.log(thisNum)
                                    
                                    localCurrency.text(thisNum)
                                    ExchangeFun('',currencyUnitrdVal,NumberCheck('' + sum))
                                    $("#subFinanForm").removeAttr("disabled", "disabled").removeClass("layui-disabled");
                                }else{
                                    layer.msg(rs.msg);
                                    $("#subFinanForm").attr("disabled", "disabled").addClass("layui-disabled");
                                    $(".receiptCount").val('');
                                    $(".localCurrency").html('');
                                    $("#totalPrice").val('');
                                    $("#Exchange").val('');
                                }
                            }
                        });
                        

                    }
                    // console.log()
                    if(rs.local_currency.id==$("#currencyUnitrd").val()||finaStepTypeCode=="FK"){
                        $("#Exchange").parents(".layui-form-item").hide();
                        $("#localUnit").parents("th").hide();
                        $(".localCurrency").parent("td").hide();
                    }else{
                        if(financialObj.enabled==1){
                            $("#Exchange").parents(".layui-form-item").show();
                            $("#localUnit").parents("th").show();
                            $(".localCurrency").parent("td").show();
                        }else{
                            $("#Exchange").parents(".layui-form-item").hide();
                            $("#localUnit").parents("th").hide();
                            $(".localCurrency").parent("td").hide();
                        }
                    }
                })
                // form.on('select(currencyUnitrd)', function(data){
                //     var sum = 0;
                //     $(".receiptCount").val('');
                //     $(".localCurrency").html('');
                //     $("#totalPrice").val('');
                //     $("#Exchange").val('');
                    
                    // $("#FinancialFeeList").find('.receiptCount').each(function(){             
                    //     var currencyUnitrdVal=data.value;
                    //     var thisAmount=$(this).val();
                    //     var num = $(this).val();
                    //     if (num == "" || num == null) {
                    //         num = 0;
                    //     }
                    //     //console.log($(this))
                    //     // sum =sum+
                    //     sum = parseFloat((sum + parseFloat(num)).toFixed(10))
                    //     $.fetch({
                    //         url: '/gateway/financialrate/convert',
                    //         type: 'post',
                    //         data: {
                    //             OriginalCurrencyID:currencyUnitrdVal,
                    //             FinalCurrencyID:rs.local_currency.id,
                    //             Amount:thisAmount
                    //         },
                    //         cb: function (rs) {
                    //             var localCurrency=$(this).parent('td').next('td').children('.localCurrency');  
                    //             // financialObj.finaFiles.splice($.inArray(delId, financialObj.finaFiles), 1);
                    //             // elem.remove();
                    //             if(!rs.msg){
                    //                 //console.log(rs)
                    //                 thisNum=rs;
                    //                 thisNum=thisNum=="NaN"?0:thisNum;
                    //                 //console.log(thisNum)
                                    
                    //                 localCurrency.text(thisNum)
                    //                 ExchangeFun('',currencyUnitrdVal,NumberCheck('' + sum))
                    //                 $("#subFinanForm").removeAttr("disabled", "disabled").removeClass("layui-disabled");
                    //             }else{
                    //                 layer.msg(rs.msg);
                    //                 $("#subFinanForm").attr("disabled", "disabled").addClass("layui-disabled");
                    //                 $(".receiptCount").val('');
                    //                 $(".localCurrency").html('');
                    //                 $("#totalPrice").val('');
                    //                 $("#Exchange").val('');
                    //               //  return false
                    //             }
                    //         }
                    //     });

                    // })
                //});      
                        
            }
        });
        var uploadInst = upload.render({ //上传附件
            elem: '#finaAttach' //绑定元素
                ,
            url: window.urls + "/gateway/financial/addattach" //上传接口
                ,
            accept: 'file',
            before: function (obj) { //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
                layer.load(); //上传loading
            },
            done: function (res) {
                //上传完毕回调
                layer.closeAll('loading'); //关闭loading
                $("#finaFiles").append('<a><span class="currentName">' + res.data.attachName + '</span><i data-file="' + res.data.attachId + '" class="del iconfont icon-guanbi"></i></a>')
                financialObj.finaFiles.push(res.data.attachId);
            },
            error: function () {
                layer.closeAll('loading'); //关闭loading
                //请求异常回调
            }
        });
        $("#finaFiles").on("click", 'i.del', function () { //删除附件
            var delId = $(this).attr("data-file");
            var elem = $(this).parent("a");
            //layer.load();
            $.fetch({
                url: '/gateway/financial/delattach',
                type: 'post',
                data: {
                    AttachId: delId
                },
                cb: function (rs) {
                    financialObj.finaFiles.splice($.inArray(delId, financialObj.finaFiles), 1);
                    elem.remove();
                }
            });
        })
        //新增费用单
        $("#addFeeDetail").on("click", function () {
            // var finaStepTypeVal=$("#finaStepType").val();
            var finaStepTypeVal=$("#finaStepType").val()<0?-$("#finaStepType").val():$("#finaStepType").val();
            
            var finaStepTypeCode=$("#finaStepType").find("option[value='"+finaStepTypeVal+"']").attr("data-code");
            if( financialObj.enabled==0||finaStepTypeCode=="FK"||financialObj.localCurrency==$("#currencyUnitrd").val()){
                financialObj.FeeDetail = '<tr class="FeeDetail">'
                    +
                    '<td><textarea lay-verify="required" class="layui-textarea textarea-modify Remark" ></textarea></td>' +
                    '<td><input lay-verify="required" type="tel" autocomplete="off" class="layui-input receiptCount"  value=""></td>' +
                    '<td style="display:none;"><div class="localCurrency" ></div></td>' +
                    
                    '<td><input lay-verify="required" type="tel"  autocomplete="off" class="layui-input amountNumber" onkeypress="return (/[\\d]/.test(String.fromCharCode(event.keyCode)))" ></td>' +
                    '<td><button class="layui-btn layui-btn-danger delFee">删除</button></td>' +
                    '</tr>'
                $("#Exchange").parents(".layui-form-item").hide();
                $("#localUnit").parents("th").hide();
                $(".localCurrency").parent("td").hide();
            }else {
                // ExchangeFun(rs.rate_list,rs.currency_unit[0].id,0);
                financialObj.FeeDetail = '<tr class="FeeDetail">'
                    +
                    '<td><textarea lay-verify="required" class="layui-textarea textarea-modify Remark" ></textarea></td>' +
                    '<td><input lay-verify="required" type="tel" autocomplete="off" class="layui-input receiptCount"  value=""></td>' +
                    '<td><div class="localCurrency"></div></td>' +
                    '<td><input lay-verify="required" type="tel"  autocomplete="off" class="layui-input amountNumber" onkeypress="return (/[\\d]/.test(String.fromCharCode(event.keyCode)))" ></td>' +
                    '<td><button class="layui-btn layui-btn-danger delFee">删除</button></td>' +
                    '</tr>'
                    $("#Exchange").parents(".layui-form-item").show();
                    $("#localUnit").parents("th").show();
                    $(".localCurrency").parent("td").show();
            }
            var str = financialObj.FeeDetail;
            $("#FinancialFeeList tbody").append(str);
            form.render('select')
            var trNum = $("#FinancialFeeList tbody tr").length;
            if (trNum > 1) {
                $(".FeeDetail .delFee").removeClass('layui-disabled').prop('disabled', false);
            }
        })
        //删除费用单
        $("#FinancialFeeList").on("click", ".delFee", function () {
            $(this).parents("tr.FeeDetail").remove();
            var trNum = $("#FinancialFeeList tbody tr").length;
            if (trNum == 1) {
                $(".FeeDetail .delFee").addClass('layui-disabled').prop('disabled', true);
            }
            var sum = 0;
            $(".receiptCount").each(function () {
                var num = $(this).val();
                if (num == "" || num == null) {
                    num = 0;
                }
                // sum += parseFloat(num);
                sum = parseFloat((sum + parseFloat(num)).toFixed(10))

            })

            $("#totalPrice").val(NumberCheck('' + sum));
            var b_totalPrice = changeMoneyToChinese(sum);
            $("#b_totalPrice").text(b_totalPrice);

            var amoun = 0;
            $(".amountNumber").each(function () {
                var anum = $(this).val();
                if (anum == "" || anum == null) {
                    anum = 0;
                }
                // amoun += parseFloat(anum);
                // ////console.log(amoun,parseFloat(anum))
                amoun = parseFloat((amoun + parseFloat(anum)).toFixed(10))
                // ////console.log(amoun)
            })
            $("#totalAmount").val(NumberAmount('' + amoun));

        })
        //动态计算单据总金额
        //动态计算单据总数
        $("#FinancialFeeList").on("input propertychange", ".amountNumber", function () {
            var sum = 0;
            $(".amountNumber").each(function () {
                var num = $(this).val();
                if (num == "" || num == null) {
                    num = 0;
                }
                // sum += parseFloat(num);
                sum = parseFloat((sum + parseFloat(num)).toFixed(10))

            })
            $("#totalAmount").val(NumberAmount('' + sum));
        })

        //转成大写方法
        function changeMoneyToChinese(money) {
            var cnNums = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"); //汉字的数字
            var cnIntRadice = new Array("", "拾", "佰", "仟"); //基本单位
            var cnIntUnits = new Array("", "万", "亿", "兆"); //对应整数部分扩展单位
            var cnDecUnits = new Array("角", "分"); //对应小数部分单位
            var cnIntLast = "元"; //整型完以后的单位
            var maxNum = 999999999999999.999; //最大处理的数字

            var IntegerNum; //金额整数部分
            var DecimalNum; //金额小数部分
            var ChineseStr = ""; //输出的中文金额字符串
            var parts; //分离金额后用的数组，预定义
            if (money == "") {
                return "";
            }
            money = parseFloat(money);
            if (money >= maxNum) {
                layer.msg('超出最大处理数字');
                return "";
            }
            if (money == 0) {
                ChineseStr = cnNums[0] + cnIntLast;
                return ChineseStr;
            }
            money = money.toString(); //转换为字符串
            if (money.indexOf(".") == -1) {
                IntegerNum = money;
                DecimalNum = '';
            } else {
                parts = money.split(".");
                IntegerNum = parts[0];
                DecimalNum = parts[1].substr(0, 2);
            }
            if (parseInt(IntegerNum, 10) > 0) { //获取整型部分转换
                zeroCount = 0;
                IntLen = IntegerNum.length;
                for (i = 0; i < IntLen; i++) {
                    n = IntegerNum.substr(i, 1);
                    p = IntLen - i - 1;
                    q = p / 4;
                    m = p % 4;
                    if (n == "0") {
                        zeroCount++;
                    } else {
                        if (zeroCount > 0) {
                            ChineseStr += cnNums[0];
                        }
                        zeroCount = 0; //归零
                        ChineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
                    }
                    if (m == 0 && zeroCount < 4) {
                        ChineseStr += cnIntUnits[q];
                    }
                }
                ChineseStr += cnIntLast;
                //整型部分处理完毕
            }
            if (DecimalNum != '') { //小数部分
                decLen = DecimalNum.length;
                for (i = 0; i < decLen; i++) {
                    n = DecimalNum.substr(i, 1);
                    if (n != '0') {
                        ChineseStr += cnNums[Number(n)] + cnDecUnits[i];
                    }
                }
            }
            if (ChineseStr == '') {
                ChineseStr += cnNums[0] + cnIntLast;
            }
            return ChineseStr;
        }
        //提交表单
        /*JQuery 限制文本框只能输入数字*/
        $("#FinancialFeeList").on('keyup', '.receiptCount', function () {
            $(this).val(NumberCheck($(this).val()));
        }).on("paste", '.receiptCount', function (e) { //CTR+V事件处理
            var pastedText = undefined;
            if (window.clipboardData && window.clipboardData.getData) { // IE
                pastedText = window.clipboardData.getData('Text');
            } else {
                pastedText = e.originalEvent.clipboardData.getData('Text'); //e.clipboardData.getData('text/plain');
            }
            // alert(pastedText);
            setTimeout(() => {
                this.value = NumberCheck(pastedText.replace(/^\D*([1-9]\d*\.?\d{0,3})?.*$/, '$1'));
                var sum = 0;
                $(".receiptCount").each(function () {
                    var num = $(this).val();
                    if (num == "" || num == null) {
                        num = 0;
                    }
                    // sum =sum+
                    sum = parseFloat((sum + parseFloat(num)).toFixed(10))
                })
                $("#totalPrice").val(NumberCheck('' + sum));
                var b_totalPrice = changeMoneyToChinese(sum);
                $("#b_totalPrice").text(b_totalPrice);
            }, 0);
        }).css("ime-mode", "disabled"); //CSS设置输入法不可用

        $("#FinancialFeeList").on('keyup', '.amountNumber', function () {
            $(this).val(NumberAmount($(this).val()));
        }).on("paste", '.amountNumber', function (e) { //CTR+V事件处理
            // $(this).val($(this).val());
            var pastedText = undefined;
            if (window.clipboardData && window.clipboardData.getData) { // IE
                pastedText = window.clipboardData.getData('Text');
            } else {
                pastedText = e.originalEvent.clipboardData.getData('Text'); //e.clipboardData.getData('text/plain');
            }
            setTimeout(() => {
                this.value = NumberCheck(pastedText.replace(/^\D*([1-9]\d*)?.*$/, '$1'));
                var sum = 0;
                $(".amountNumber").each(function () {
                    var num = $(this).val();
                    if (num == "" || num == null) {
                        num = 0;
                    }
                    // sum += parseFloat(num);
                    sum = parseFloat((sum + parseFloat(num)).toFixed(10))

                })
                $("#totalAmount").val(NumberAmount('' + sum));
            }, 0);
        }).css("ime-mode", "disabled"); //CSS设置输入法不可用

        // form.on('radio(IsFixedCosts)', function (data) {
        //     if (data.value == 1) {
        //         // 起始时间
        //         FixedCostStartMonth.config.min = { //初始化限制最小月份
        //             year: d.getFullYear(),
        //             month: d.getMonth(),
        //             // date:d.getDate(),
        //         };
        //         // 结束时间
        //          FixedCostEndMonth.config.min = {
        //              year: d.getFullYear(),
        //              month: d.getMonth(),
        //              // date:d.getDate(),
        //          };
        //         $(".IsFixedCostsShow").show();
        //         $(".IsFixedCostsShow").find('input').each(function () {
        //             $(this).attr('lay-verify', 'required')
        //         })
        //     } else {
        //         $(".IsFixedCostsShow").hide();
        //         $(".IsFixedCostsShow").find('input').each(function () {
        //             $(this).removeAttr('lay-verify')
        //         })
        //     }
        // });
        form.on('submit(subFinanForm)', function (data) {
            var FinancialFeeTypes = [],
                AttachID = []; //费用明细,附件
            var FeeType = $('select#payType').val();
            var FormDatas = [];
            if (subFormDatas && subFormDatas.length > 0) {
                for (var i = 0; i < subFormDatas.length; i++) {
                    if (subFormDatas[i].component_type == 'textarea') {
                        $("#payDetailsForm").find('textarea[name="' + subFormDatas[i].name + '"]').val();
                        var values = $("#payDetailsForm").find('textarea[name="' + subFormDatas[i].name + '"]').val();
                        FormDatas.push({
                            FormTemplateID: subFormDatas[i].FormTemplateID,
                            Value: JSON.stringify(values),
                        })
                    } else if (subFormDatas[i].component_type == 'checkbox') {
                        var values = [];
                        $("#payDetailsForm").find('input[name="' + subFormDatas[i].name + '"]:checked').each(function () {
                            values.push($(this).attr('title'));
                        })
                        FormDatas.push({
                            FormTemplateID: subFormDatas[i].FormTemplateID,
                            Value: JSON.stringify(values),
                        })
                    } else if (subFormDatas[i].component_type == 'select') {
                        var values = $("#payDetailsForm").find('select[name="' + subFormDatas[i].name + '"]').val();
                        FormDatas.push({
                            FormTemplateID: subFormDatas[i].FormTemplateID,
                            Value: JSON.stringify(values),
                        })
                    } else if (subFormDatas[i].component_type == 'radio') {
                        $("#payDetailsForm").find('input[name="' + subFormDatas[i].name + '"]:checked').each(function () {
                            var values = $(this).val();
                            FormDatas.push({
                                FormTemplateID: subFormDatas[i].FormTemplateID,
                                Value: JSON.stringify(values),
                            });
                        })
                    } else {
                        var values = $("#payDetailsForm").find('input[type="text"][name="' + subFormDatas[i].name + '"]').val();
                        FormDatas.push({
                            FormTemplateID: subFormDatas[i].FormTemplateID,
                            Value: JSON.stringify(values),
                        })
                    }
                    //文本域 //复选框

                }
            }
            $("#FinancialFeeList tbody tr").each(function (key, val) {
                // var FeeType= $(this).find('select.payType').val();
                var Remark = $(this).find('.Remark').val().replace(/,/ig,'，'); //摘要
                var Amount = parseFloat($(this).find('.receiptCount').val()); //金额
                var ReceiptCount = parseFloat($(this).find('.amountNumber').val()); //数量
                FinancialFeeTypes.push({
                    Remark: Remark,
                    Amount: Amount,
                    ReceiptCount: ReceiptCount,
                }) 
            })
            // console.log(FinancialFeeTypes)
            var FormPageID = $("#subFinanForm").attr('data-FormId');
            var CapitalAmount = $("#b_totalPrice").text();
            var AttachIDArr = financialObj.finaFiles.join();
            var NextApprovalUserID = data.field.toIsGroup == 1 ? '' : data.field.finanApprList
            var ProcessType=data.field.finaStepType<0?-data.field.finaStepType:data.field.finaStepType;
            // FeeType
                //预支相关提交字段
            if(data.field.finaStepType<0){
                var IsYZ=1;
                var IsYzToBx=0
            }else{
                var IsYZ=0;
                var IsYzToBx=0
            }
            var pram = {
                FeeType: FeeType,                
                ProcessType: ProcessType,
                BaoXiaoType: data.field.finaType,
                LiezhiMonth: data.field.lzMon,
                IsGroup: data.field.toIsGroup,
                FinanDeptId:data.field.FinanDeptId,
                // IsFixedCosts: data.field.IsFixedCosts,
                // LiezhiKemu:'假装这里有列支科目',
                Amount: data.field.totalPrice,
                CapitalAmount: CapitalAmount,
                NextApprovalUserID: NextApprovalUserID,
                NextApprovalStep: financialObj.NextApprovalStep,
                ReceiptCount: data.field.totalAmount,
                AttachIDArr: AttachIDArr,
                FinancialFeeTypes: FinancialFeeTypes,
                FinancialCurrencyUnitId: data.field.currencyUnitrd,
                FormPageID: FormPageID,
                FormDatas: FormDatas,

                BankName: data.field.BankName,
                Branch: data.field.Branch,
                BankAccount: data.field.BankAccount,
                AccountName: data.field.AccountName,
                Province: data.field.Province,
                City: data.field.City,

                IsYZ:IsYZ,
                IsYzToBx:IsYzToBx,
            }
            // if (data.field.IsFixedCosts == 1) {
            //     pram['FixedCostStartMonth'] = data.field.FixedCostStartMonth;
            //     pram['FixedCostEndMonth'] = data.field.FixedCostEndMonth;
            //     pram['FixedCostJobDate'] = data.field.FixedCostJobDate;
            // } else {
            //     pram['FixedCostStartMonth'] = '';
            //     pram['FixedCostEndMonth'] = '';
            //     pram['FixedCostJobDate'] = '';
            // }
            // if (data.field.FixedCostEndMonth>=data.field.FixedCostStartMonth){
                $.fetch({
                    url: '/gateway/financial/add',
                    type: 'post',
                    data: pram,
                    cb: function (rs, date) {
                        layer.msg('提交成功', {
                            anim: 5,
                            time: 1500
                        }, function () {
                            location.reload();
                        });
                    }
                });
                return false; //阻止表单跳转。如果需要表单跳转，去掉这段即可。
            // }else{
            //     layer.msg('结束月份要大于开始月份，请您重新选择！', {
            //         anim: 5,
            //         time: 1500
            //     });
            // }
            // ////console.log(FormDatas);
            
            
        });
        $("#resetFinanForm").on("click", function () {
            layer.confirm('确定重置页面？', {
                "title": " "
            }, function (index) {
                location.reload();
            })
        })
    })
})