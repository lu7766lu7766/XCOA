$(function(){
    
    layui.config({
		base: '../../../layui/' //静态资源所在路径
	}).extend({
		index: 'index' //主入口模块
	}).use(['index','form','laypage','layedit','table','upload'], function(){
        var $ = layui.$
        ,admin = layui.admin
        ,element = layui.element
        ,router = layui.router()
        ,layer = layui.layer
        ,form =layui.form;
        var layedit =layui.layedit;
        var upload = layui.upload;
       
       
        form.render();
        var emaileit = layedit.build("emailEit",{
            tool: [
                'strong' //加粗
                ,'italic' //斜体
                ,'underline' //下划线
                ,'del' //删除线
                ,'|' //分割线
                ,'left' //左对齐
                ,'center' //居中对齐
                ,'right' //右对齐
                ,'link' //超链接
                ,'unlink' //清除链接
                ,'face' //表情
                // ,'image' //插入图片
                // ,'help' //帮助
            ]
        })
        
        
       
    element.on('tab(emailTabBrief)', function(data){
        var eIndex = data.index;
        switch(eIndex){
            case 0:
                if(emailObj.isWriteShow){
                    saveCreateFun();
                    emailObj.isWriteShow = false;
                }
                var el=$("#mailNoReadBox table");
                emailObj.inBoxListFun(0,el);
                break;

            case 1:
                if(emailObj.isNewEmail){//1.只有为true时 才从新获取emilid 2.目前只有草稿打开详情时为false 3.草稿详情关闭，页面刷新等离开草稿页 该值为true
                    getMailId();
                    //如果是草稿详情打开新建页面，记录页面内容
                    //如果是新建打开 获取离开时是否有内容
                }
                emailObj.emailStatus=emailStatusFun()//记录下页面状态
                break;

            case 2:
                if(emailObj.isWriteShow){
                    saveCreateFun();
                    emailObj.isWriteShow = false;
                }
                var el=$("#mailInbox table");
                emailObj.inBoxListFun(3,el);
                break;
            case 3:
                if(emailObj.isWriteShow){
                    saveCreateFun();
                    emailObj.isWriteShow = false;
                }
                var el=$("#mailOutbox table");
                emailObj.sendListFun(1,el);
                break;
            case 4:
                if(emailObj.isWriteShow){
                    saveCreateFun();
                    emailObj.isWriteShow = false;
                }
                var el=$("#mailDelbox table");
                emailObj.inBoxListFun(2,el);
                break;
            case 5:
                if(emailObj.isWriteShow){
                    saveCreateFun();
                    emailObj.isWriteShow = false;
                }
                var el=$("#mailDraftbox table");
                emailObj.sendListFun(3,el);
                break;
        }
    });  
   
    var emailObj={
        intervals:{//用于每次更新接口时判断是否关闭定时器
            interval_0:false,
            interval_1:false,
            interval_2:false,
        },
        isWriteShow:false,
        isNewEmail:true,//用于判断是否获取新ID
        draft:{},
        emailId:0,//用于保存本次邮件的ID
        newMail:'',
        emailStatus:'',//保存页面初始状态
        repfor:{},//用于保存转发时所需ID
        AttachsId:'',//保存附件html字符串 用于转发 回复时新生成dom的后续渲染
        dowUrl:'/gateway/attach/download',//下载附件用
        upDatMail:function(send){//send=false不发送；send=true发送 
            if(emailObj.intervals.interval_0==false){ 
                clearInterval(emailObj.newMail);
            }

            if($("#consignee").length>0){//收件人
                var names=''
                $("#consignee>li").each(function(){
                    names+=''+$(this).text()+','
                })        
                names=names.substring(0,names.length-1);
            }

            if($("#cs_consignee").length>0){//抄送人
                var cs_names=''
                $("#cs_consignee>li").each(function(){
                    cs_names+=''+$(this).text()+','
                })        
                cs_names=cs_names.substring(0,cs_names.length-1);
            }

            if($("#ms_consignee").length>0){//密送人
                var ms_names=''
                $("#ms_consignee>li").each(function(){
                    ms_names+=''+$(this).text()+','
                })        
                ms_names=ms_names.substring(0,ms_names.length-1);
            }

            var markupStr = layedit.getContent(emaileit);
            var consignee =$("#consignee").attr("data-val");//收信人ID
            var csconsignee =$("#cs_consignee").attr("data-val");//收信人ID
            var msconsignee =$("#ms_consignee").attr("data-val");//收信人ID   
            var subject =$("#emailSubject").val();//主题
            var mail={
                toName:names,
                toUsers:consignee,
                copyToUsers:csconsignee,
                copyToNames:cs_names,
                secretToNames:ms_names,                
                secretToUsers:msconsignee,                
                emailId:emailObj.emailId,//
                subject:subject,
                detail:markupStr,
            }
            maid =$.extend(mail,emailObj.repfor);
            $.fetch({
                url: "/gateway/email/update",
                type: 'post',
                data:mail,
                cb:function(rs){
                    if(send){
                        var prama  = {
                            emailId:emailObj.emailId,
                        };
                        $.fetch({
                            url: "/gateway/email/send",
                            type: 'post',
                            data:prama,
                            cb:function(rs){
                                layer.msg("发送成功");
                                emailObj.removeWrit();//清空内容 跳到已发送页面
                                emailObj.isWriteShow = false;
                                element.tabChange('emailTabBrief','roleToOut');
                            } 
                        });
                    }
                } 
            })
        },
        openMailCont:function(id,types){
            var htmls =  '<button type="button" class="layui-btn layui-btn-primary" id="elmailfileUpload">'
                          +  '<i class="layui-icon">&#xe67c;</i>上传附件'
                         + '</button>'
                        +'<div id="mailFiles" class="UploadNames-box">'+ emailObj.AttachsId+'</div>'
            $("#fileUploadBox").html(htmls);
            //根据打开类型 渲染页面内容
            var uploadInst = upload.render({
                elem: '#elmailfileUpload' //绑定元素
                ,url: window.urls+"/gateway/attach/add" //上传接口
                ,accept:'file'
                ,data:{emailId:id}
                ,before: function(obj){ //obj参数包含的信息，跟 choose回调完全一致，可参见上文。
                    layer.load(); //上传loading
                }
                ,done: function(res){
                    //上传完毕回调
                    layer.closeAll('loading'); //关闭loading
                    $("#mailFiles").append('<a><span class="currentName">'+res.data.attachName+'</span><i data-file="'+res.data.attachId+'" class="del iconfont icon-guanbi"></i></a>')
                    
                }
                ,error: function(){
                    layer.closeAll('loading'); //关闭loading
                //请求异常回调
                }
            });
            
            switch(types){
                case 0:
                    emailObj.intervals={
                        interval_0:true,
                        interval_1:false,
                        interval_2:false,
                    }
                    emailObj.newMail = setInterval(emailObj.upDatMail,180000);//三分钟保存一次草稿
                    break;
    
            }
            //定时器每次执行前 判断变量是否为 ture 如果不是关闭定时器
        },
        removeWrit:function(){
            $("#consignee").html("").attr("data-val",'');
            $("#cs_consignee").html("").attr("data-val",'');
            $("#ms_consignee").html("").attr("data-val",'');
            $("#consignee").siblings(".layui-textarea").html("");
            $("#cs_consignee").siblings(".layui-textarea").html("");
            $("#ms_consignee").siblings(".layui-textarea").html("");
            $("#emailSubject").val("");
            $("#cs_input").hide();
            $("#ms_input").hide();
            $('#emailEit').html('');
            emaileit = layedit.build("emailEit", {
                tool: [
                    'strong' //加粗
                    ,'italic' //斜体
                    ,'underline' //下划线
                    ,'del' //删除线
                    ,'|' //分割线
                    ,'left' //左对齐
                    ,'center' //居中对齐
                    ,'right' //右对齐
                    ,'link' //超链接
                    ,'unlink' //清除链接
                    ,'face' //表情
                    // ,'image' //插入图片
                    // ,'help' //帮助
                ]
            })
            form.render();
            $("#mailFiles").html("");
            emailObj.AttachsId='';
            
        },
        sendListFun:function(status,el){//【必填，1 已发送列表 ， 3 草稿箱列表】 
            $(".chekAll").prop("checked",false);
            form.render('checkbox');
            function mailTable(o,el){
                if(status==3){
                    emailObj.draft=o;
                }
                var html='';
                if(o.length>0){
                    for(var i=0;i<o.length;i++){
                        var attachs='';
                        if(o[i].attach&&o[i].attach.length>0){
                            for(var k=0;k<o[i].attach.length;k++){
                                attachs+='<p data-id="'+o[i].attach[k].attachId+'">'+o[i].attach[k].original_name+'</p>'    
                            }
                        }else{
                             attachs='无附件';
                        }
                        html+='<tr  data-mailId="'+o[i].id+'">'
                                +'<td><input class="chekOne"  value="'+o[i].id+'" type="checkbox" name="chekOne" lay-filter="layTableOneChoose" lay-skin="primary"></td>'
                                +'<td data-user="'+(o[i].to_users==null?'无':o[i].to_users)+'" class="limit-width"><a class="toDetail" title="'+(o[i].to_name==null?'':o[i].to_name)+'">'+(o[i].to_name==null?'无':o[i].to_name)+'</a></td>'
                                +'<td ><a class="toTitle">'+(o[i].subject==null?'无主题':o[i].subject)+'</a></td>'
                                +'<td>'+attachs+'</td>'     
                                +(status==3?"":'<td>'+o[i].updated_at+'</td>')  //草稿列表不显示
                                +'<td>'+o[i].attachSize+'</td>'                     
                            +'</tr>'
                    }
                    
                    el.children("tbody").html(html);
                }else{
                    el.children("tbody").find("td").html('<div style="text-align:center">无邮件</div>');
                    
                }
                form.render();
                $('#mailOutbox').on("mouseenter",'.limit-width',function(){
                    var tipsCont1 = '<div style="width:auto; min-width:30px; max-width: 360px; word-wrap: break-word;">'+$(this).text();+'</div>'
                    var that = this;
                    layer.tips(tipsCont1, that,{
                        tips:[1,'#999']
                        ,maxWidth: 'auto'
                    });
                });
            }
            
            $.fetch({
                url: "/gateway/send/list",
                type: 'post',
                data:{
                    status:status,
                    currentIndex:1,
                    pageSize:10,
                },
                cb:function(rs){
                    var page={
                        last_page:rs.last_page,
                        page_index:rs.page_index,
                        page_size:rs.page_size,
                        total_count:rs.total_count,
                    }
                    var elem =el.next('.pagTop');
                    mailTable(rs.data_list,el);
                    $.pageFun({
                        elem:elem,
                        page:page,
                        url:"/gateway/send/list",
                        pram:{
                            status:status,
                            pageSize:10,
                        },
                        fun:function(rdata){
                            mailTable(rdata,el);
                        },
                    });
                } 
            });
        },
        inBoxListFun:function(status,el){//status = 0 未读，1 已读 ，2 已删除，3 已读未读
            $(".chekAll").prop("checked",false);
            form.render('checkbox');
            function mailTable(o,el){
                var html='';
                if(o.length>0){
                    for(var i=0;i<o.length;i++){
                        var attachs='';
                        if(o[i].attach&&o[i].attach.length>0){
                            for(var k=0;k<o[i].attach.length;k++){
                            
                                attachs+='<p data-id="'+o[i].attach[k].attachId+'">'+o[i].attach[k].original_name+'</p>'    
                            }
                        }else{
                            attachs='无附件';
                        }
                        var stat='',read='';
                        if(o[i].receive_status==0){
                            stat ='<i class="iconfont icon-weidu"></i>'
                            read ='noRead';
                        }else if(o[i].receive_status==1){
                            stat ='<i class="iconfont icon-yidu"></i>'
                            read ='isRead';
                        }
                        html+='<tr class="'+read+'" data-mailId="'+o[i].id+'">'
                                +'<td><input class="chekAll"  value="'+o[i].id+'" type="checkbox" name="chekOne" lay-filter="layTableOneChoose" lay-skin="primary"></td>'                                
                                +'<td data-user="'+o[i].from_user+'">'
                                   +'<a class="toDetail" title="'+o[i].from_name+'">'+stat+''+o[i].from_name+'</a>'
                                if(o[i].is_reply==1){
                                    html+='<i class="iconfont icon-huifu"></i>'
                                }
                                if(o[i].is_forward==1){
                                    html+='<i class="iconfont icon-zhuanfa"></i>'
                                }
                            html+='</td>'
                                +'<td class="toDetail"><a class="toTitle">'+(o[i].subject==null?'无主题':o[i].subject)+'</a></td>'
                                +'<td>'+attachs+'</td>'     
                                +'<td>'+o[i].updated_at+'</td>'  //草稿列表不显示
                                +'<td>'+o[i].attachSize+'</td>'                       
                            +'</tr>'
                    }
                }else{
                    html='<tr><td colspan="6" class="tc">无邮件</td></tr>';
                }
                el.children("tbody").html(html);
                form.render();
            }
            
            $.fetch({
                url: "/gateway/receive/list",
                type: 'post',
                data:{
                    status:status,
                    currentIndex:1,
                    pageSize:10,
                },
                cb:function(rs){
                    var page={
                        last_page:rs.last_page,
                        page_index:rs.page_index,
                        page_size:rs.page_size,
                        total_count:rs.total_count,
                    }
                    var elem =el.next('.pagTop');
                    mailTable(rs.data_list,el);
                    $.pageFun({
                        elem:elem,
                        page:page,
                        url:"/gateway/receive/list",
                        pram:{
                            status:status,
                            pageSize:10,
                        },
                        fun:function(rdata){
                            mailTable(rdata,el);
                        },
                    });
                } 
            });
            noReadNum();
        }

    }
    
    function getMailId(){//获取id 然后调用草稿
        emailObj.removeWrit();
        emailObj.isWriteShow = true;
        $.fetch({
            url: "/gateway/email/create",
            type: 'post',
            cb:function(rs){
                
                $("#sendEmalBtn").attr("data-sent",rs.emailId);
                emailObj.emailId=rs.emailId;
                emailObj.openMailCont(emailObj.emailId,0);
            } 
        }); 
 
    }

    //截取src 带过来的 id
    var tabId=location.href.split('?')[2]?location.href.split('?')[2]:false;//获取tab页第几个
    var widmailId=location.href.split('?')[1]?location.href.split('?')[1]:false;//获取邮件id
    // console.log()
    if(window.parent.isMassegOpen){//存在传入id则打开详情弹窗
        //截取数字
        var tabIndex=tabId.split('=')[1];
        var WmailId=widmailId.split('=')[1];
        //根据第几个tab 然后对应id=''切换
        if(tabIndex==3){
            element.tabChange('emailTabBrief','roleToIn' );
            
        }else if(tabIndex==5){
            element.tabChange('emailTabBrief','roleToDel' );
        }else if(tabIndex==1){
            element.tabChange('emailTabBrief','noReadEmail' );
        }
        //获取打开详情的类型
        var butns =(tabIndex==5)?3:1;
        // console.log(butns,tabIndex,tabId,WmailId)
        //调用打开详情的方法
        toMailDetail(false,"/gateway/receive/detail",butns,WmailId);
        window.parent.isMassegOpen=false//刷新后 详情页不打开
        // $(.document).find('div.layadmin-tabsbody-item.layui-show iframe').reload(false);
    }else{//如果没传入id为正常打开

        //进入页面显示收件箱
        element.tabChange('emailTabBrief','roleToIn');
    }
    
    function toMailDetail(el,url,btns,widmailId){//el 传入所点击的标签 url为详情接口地址
        if(el==false){
            var mailId=widmailId
        }else{
            var mailId=el.parent("td").parent("tr").attr("data-mailId");//获取当前的 emailid;
        }
        $.fetch({
            url: url,
            type: 'post',
            data:{
                emailId:mailId
            },
            cb:function(rs){
                var mrs =rs;
                var email_id =mrs.email_id;
                var attachs='',copy_to,secret_to;
                if(mrs.attach&&mrs.attach.length>0){//接口附件数据
                    for(var k=0;k<mrs.attach.length;k++){
                        attachs+='<a title="点击下载" class="seeXqOutIn" href="'+emailObj.dowUrl+'?id='+mrs.attach[k].attachId+'" >'+mrs.attach[k].original_name+'</a>'    
                    }
                }else{
                    attachs='无附件';
                }

                if(mrs.copy_to_user_names&&mrs.copy_to_user_names.length>0){//接口抄送
                    copy_to = mrs.copy_to_user_names.length;
                    var copy_to_name = mrs.copy_to_user_names.join(" ");
                }else{
                    copy_to=false;
                    var copy_to_name ='';
                }

                if(mrs.secret_to_user_names&&mrs.secret_to_user_names.length>0){//接口密送
                    secret_to = mrs.secret_to_user_names.length;
                    var secret_to_name = mrs.secret_to_user_names.join(" ");
                }else{
                    secret_to=false;
                    var secret_to_name ='';
                }
                var htmls = '<div  class="mailConts layui-card">'
                                +'<div class="layui-table-box layui-card-body">'
                        htmls +=  '<div class="layui-card">'
                                    +'<div class="reviewCont">'
                                        +'<div class="layui-form-item">'
                                            +'<div class="layui-elem-quote">'
                                                +'<p><label class="fl">主题：</label><u class="fr-width">'+(mrs.subject==null?" ":mrs.subject)+'</u></p>'
                                                +'<p><label class="fl" data-form="'+mrs.from_id+'">发件人：</label><u class="fr-width">'+(mrs.from_name==null?" ":mrs.from_name)+'</u></p>'
                                                +'<p><label class="fl" data-to="' + mrs.to_id + '">收件人：</label><span class="fr-width"><u class="ShowWidth hideCont ShowHidden">' + (mrs.to_name == null ? " " : mrs.to_name) + '<i class="iconfont icon-triangle-left"></i></u></span></p>'
                                                +(copy_to?'<p><label class="fl" data-to="'+mrs.copy_to_users+'">抄  送：</label><u class="fr-width">'+copy_to_name+'</u></p>':'')                                
                                                +(secret_to?'<p><label class="fl">密  送：</label><u class="fr-width">'+secret_to_name+'</u></p>':'')
                                                +'<p><label class="fl">发送于：</label><u class="fr-width">'+(mrs.updated_at==null?" ":mrs.updated_at)+'</u></p>'
                                                +'<p><label class="fl">附件：</label><u class="fr-width">'+attachs+'</u></p>'
                                            +'</div>'
                                        +'</div>'
                                        +'<fieldset class="layui-elem-field" data-mail="'+mrs.email_id+'">'
                                            +'<legend>邮件内容</legend>'
                                            +(mrs.is_secret?"<p style=\"width: 95%;margin: 0 auto;margin-top: 10px;background:#ffd705;color:#555;padding:10px 15px;\">提示:您是这封邮件的密送人</p>":"")+'<div class="layui-field-box pageCont">'+(mrs.detail==null?" ":mrs.detail)+'</div>'
                                        +'</fieldset>'
                                    +'</div>'
                                +'</div>'
                            +'</div>'
                        +'</div>';
                var emailDaReply =function(){//回复
                     emailObj.repfor={
                         replyId:email_id
                     }
                     emailObj.isNewEmail=true;//需要获取新id
                     element.tabChange('emailTabBrief','writeEmail');
                     //添加内容
                     $("#consignee").attr("data-val",mrs.from_id).html('<li class="pick" data-user="'+mrs.from_id+'">'+mrs.from_name+'</li>');
                     $("#consignee").siblings('#consigneeName').html(mrs.from_name+',');

                     $("#emailSubject").val(mrs.subject);
                     var markupStr = '<p>'+mrs.from_name+',您好</p>'
                                 +'<p>========'+mrs.from_name+'在'+mrs.updated_at+'的来信中写道：========</p>'
                                 +mrs.detail
                                 +'<p>=================================================</p>'
                                 +'<p style="padding-left:15px;">致</p><p>礼！</p>';
                    $('#emailEit').html(markupStr);
                    emaileit = layedit.build("emailEit", {
                        tool: [
                            'strong' //加粗
                            ,'italic' //斜体
                            ,'underline' //下划线
                            ,'del' //删除线
                            ,'|' //分割线
                            ,'left' //左对齐
                            ,'center' //居中对齐
                            ,'right' //右对齐
                            ,'link' //超链接
                            ,'unlink' //清除链接
                            ,'face' //表情
                            // ,'image' //插入图片
                            // ,'help' //帮助
                        ]
                    })
                     form.render();
                }
                var emailDaForward=function(){//转发
                    //按钮【按钮二】的回调
                    emailObj.repfor={
                        forwardId:email_id
                    }
                    emailObj.isNewEmail=true;//需要获取新id
                    // getMailId();
                    element.tabChange('emailTabBrief','writeEmail');

                    var forwardAttachs = '';
                    if(mrs.attach&&mrs.attach.length>0){
                        for(var k=0;k<mrs.attach.length;k++){
                            forwardAttachs+='<a><span class="currentName">'+mrs.attach[k].original_name+'</span><i data-file="'+mrs.attach[k].attachId+'" class="del iconfont icon-guanbi"></i></a>'    
                        }
                    }
                    //附件dom储存
                    emailObj.AttachsId =forwardAttachs;
                    //添加内容
                    // 
                    $("#emailSubject").val(mrs.subject);
                    var markupStr = '<p>转发自'+mrs.from_name+'在'+mrs.updated_at+'的邮件</p>'
                                    +'<p>========以下邮件原文:========</p>'
                                +mrs.detail
                                +'<p>=================================================</p>'
                                +'<p style="padding-left:15px;">致</p><p>礼！</p>';
                    $('#emailEit').html(markupStr);
                    emaileit = layedit.build("emailEit", {
                        tool: [
                            'strong' //加粗
                            ,'italic' //斜体
                            ,'underline' //下划线
                            ,'del' //删除线
                            ,'|' //分割线
                            ,'left' //左对齐
                            ,'center' //居中对齐
                            ,'right' //右对齐
                            ,'link' //超链接
                            ,'unlink' //清除链接
                            ,'face' //表情
                            // ,'image' //插入图片
                            // ,'help' //帮助
                        ]
                    })
                    form.render();
                }
                switch(btns){
                    case 1:
                        var emailDetail= layer.open({//详情弹窗
                            title:'查看邮件详情',
                            content:htmls,
                            type:1,
                            id:'emailDetail',
                            area:['800px','auto'],
                            btn: ['回复', '转发', '返回'],
                            yes:function(index, layero){
                                emailDaReply();
                                layer.close(index);
                            }
                            ,btn2: function(index, layero){
                                emailDaForward();
                                layer.close(index);
                            }
                            ,btn3:function(){
                                var el1=$("#mailInbox table");
                                var el2=$("#mailNoReadBox table");
                                emailObj.inBoxListFun(0,el2);
                                emailObj.inBoxListFun(3,el1);
                            }
        
                        });
                        break;
                    case 2:
                        var emailDetail= layer.open({//详情弹窗
                            title:'查看邮件详情',
                            content:htmls,
                            type:1,
                            id:'emailDetail',
                            area: ['800px', 'auto'],
                            btn: ['转发', '返回'],
                            yes: function(index, layero){
                                emailDaForward();
                                layer.close(index);
                            },
                            btn2:function(index, layero){
                                var el=$("#mailOutbox table");
                                emailObj.sendListFun(1,el);
                                layer.close(index);
                            }
        
                        })
                        break;
                    case 3:
                        var emailDetail= layer.open({//详情弹窗
                            title:'查看邮件详情',
                            content:htmls,
                            type:1,
                            id:'emailDetail',
                            area: ['800px', 'auto'],
                            btn: ['恢复至收件箱','销毁', '返回'],
                            yes: function(index, layero){
                                $.fetch({
                                    url: "/gateway/receive/recover",
                                    type: 'post',
                                    data:{
                                        emailId:email_id,
                                    },
                                    cb:function(rs){
                                        emailObj.inBoxListFun(2,$("#mailDelbox table"));
                                        emailObj.inBoxListFun(0,$("#mailInbox table"));
                                        layer.msg("已恢复至收件箱。")
                                        layer.close(index);
                                    } 
                                });
                                
                            }
        
                        })
                        break;
                }
                 var ContHeight = $(".ShowWidth").height();
                 if (ContHeight > 16) {
                     $('.ShowWidth').addClass("hideCont ShowHidden");
                 }
                 $(".ShowHidden i").on('click', function () {
                     if (!$(this).parent("u").hasClass('showCont')) {
                         $(this).parent(".hideCont").addClass("showCont ShowHiddenCont");
                         $(this).parent(".hideCont").removeClass("hideCont");
                         console.log("1233");
                     } else {
                         console.log("aaaaa");
                         $(this).parent("u").removeClass("showCont ShowHiddenCont");
                         $(this).parent("u").addClass("hideCont ShowHidden");
                     }
                 })
            } 
        });
    }

    


    //打开详情
    $("#mailInbox table").on("click","a.toTitle",function(){//收件--详情
        var el= $(this);
        toMailDetail(el,"/gateway/receive/detail",1);// 回复 转发  返回
        
    });
    $("#mailOutbox table").on("click","a.toTitle",function(){//发件箱--详情
        var el= $(this);
        toMailDetail(el,"/gateway/send/detail",2);// 转发  返回
    });
    $("#mailNoReadBox table").on("click","a.toTitle",function(){//未读--详情
        var el= $(this);
        toMailDetail(el,"/gateway/receive/detail",1);//  回复 转发  返回
    });
    $("#mailDelbox table").on("click","a.toTitle",function(){//删除--详情
        var el= $(this);
        toMailDetail(el,"/gateway/receive/detail",3);// 返回
    });


    $("#mailDraftbox table").on("click","a.toTitle",function(){//草稿详情
        var mailId=$(this).parent("td").parent("tr").attr("data-mailId");
        emailObj.isWriteShow = true;
        
        $.fetch({
            url: "/gateway/send/detail",
            type: 'post',
            data:{
                emailId:mailId,
            },
            cb:function(rs){
                emailObj.emailId = rs.email_id;
                emailObj.removeWrit();//清空原来的内容
                //添加内容
                emailObj.isNewEmail =false;
                var names='',nameArr,idArr
                ,cs_names='',cs_idArr='',cs_nameArr=''
                ,ms_idArr='',ms_names='',ms_nameArr='';
                var file_p='';//文件的显示
                if(rs.to_name&&rs.to_users){//循环的收件人
                   nameArr=rs.to_name.split(",");
                   idArr=rs.to_users.split(",");
                   for(var k=0;k<nameArr.length;k++){
                       names+='<li class="pick" data-user="'+idArr[k]+'">'+nameArr[k]+'</li>'
                   }
                }
                if(rs.copy_to_name&&rs.copy_to_name.length>0){//循环的抄送人
                   cs_nameArr=rs.copy_to_name.split(",");
                   cs_idArr=rs.copy_to_users.split(",");
                   for(var k=0;k<cs_nameArr.length;k++){
                       cs_names+='<li class="pick" data-user="'+cs_idArr[k]+'">'+cs_nameArr[k]+'</li>'
                   }
                   $("#cs_input").show();
                }
                if(rs.secret_to_name&&rs.secret_to_name.length>0){//循环的密送人
                   ms_nameArr=rs.secret_to_name.split(",");
                   ms_idArr=rs.secret_to_users.split(",");
                   for(var k=0;k< ms_nameArr.length;k++){
                       ms_names+='<li class="pick" data-user="'+ms_idArr[k]+'">'+ms_nameArr[k]+'</li>'
                   }
                   $("#ms_input").show();
                   
                }
                
                
                $("#consignee").attr("data-val",rs.to_users).html(names);
                $("#cs_consignee").attr("data-val",rs.copy_to_users).html(cs_names);
                $("#ms_consignee").attr("data-val",rs.secret_to_users).html(ms_names);

                $("#consigneeName").html(rs.to_name);
                $("#cs_consigneeName").html(rs.copy_to_name);
                $("#ms_consigneeName").html(rs.secret_to_name);

                $("#emailSubject").val(rs.subject);
                var markupStr = rs.detail;

                $('#emailEit').html(markupStr);
                emaileit = layedit.build("emailEit", {
                    tool: [
                        'strong' //加粗
                        ,'italic' //斜体
                        ,'underline' //下划线
                        ,'del' //删除线
                        ,'|' //分割线
                        ,'left' //左对齐
                        ,'center' //居中对齐
                        ,'right' //右对齐
                        ,'link' //超链接
                        ,'unlink' //清除链接
                        ,'face' //表情
                        // ,'image' //插入图片
                        // ,'help' //帮助
                    ]
                })
                $("#sendEmalBtn").attr("data-sent",mailId);       
                emailObj.openMailCont(emailObj.emailId,0);//调用 编辑页方法
                if(rs.attach&&rs.attach.length>0){//循环的附件
                    var arr =rs.attach;
                    for(var k=0;k<arr.length;k++){
                        file_p+='<a><span class="currentName">'+arr[k].original_name+'</span><i data-file="'+arr[k].attachId+'" class="del iconfont icon-guanbi"></i></a>'
                    }
                }
                $("#mailFiles").html(file_p);
                form.render();
                element.tabChange('emailTabBrief','writeEmail'); 
                
            } 
        });
    });
    
    $("#mailContent a.addDesc").on("click",function(){//添加联系人
        selMemberFun($(this));
    });
    $("#mailContent a.emptyDesc").on("click",function(){//添加联系人
        $(this).siblings("ul.SmallStatic").html("");
        $(this).siblings("ul.SmallStatic").attr("data-val","");
        $(this).siblings(".layui-textarea").html("");
    });
    $("#sendEmalBtn").on("click",function(){//发邮件
        // 发送 先存草稿
        emailObj.intervals.interval_0=false,
        emailObj.upDatMail(true);
    });
    var saveEmalFun=function(){
        emailObj.intervals.interval_0=false;
        if($("#consignee").length>0){
            var names=''
            $("#consignee>li").each(function(){
                names+=''+$(this).text()+','
            })        
            names=names.substring(0,names.length-1);
        }
        if($("#cs_consignee").length>0){//抄送人
            var cs_names=''
            $("#cs_consignee>li").each(function(){
                cs_names+=''+$(this).text()+','
            })        
            cs_names=cs_names.substring(0,cs_names.length-1);
        }

        if($("#ms_consignee").length>0){//密送人
            var ms_names=''
            $("#ms_consignee>li").each(function(){
                ms_names+=''+$(this).text()+','
            })        
            ms_names=ms_names.substring(0,ms_names.length-1);
        }

        var markupStr = layedit.getContent(emaileit);
        var consignee =$("#consignee").attr("data-val");//收信人ID
        var csconsignee =$("#cs_consignee").attr("data-val");//收信人ID
        var msconsignee =$("#ms_consignee").attr("data-val");//收信人ID   
        var subject =$("#emailSubject").val();//主题
        var mail={
            toName:names,
            toUsers:consignee,
            copyToUsers:csconsignee,
            copyToNames:cs_names,
            secretToNames:ms_names, 
            secretToUsers:msconsignee,                
            emailId:emailObj.emailId,
            subject:subject,
            detail:markupStr,
        }
        $.fetch({
            url: "/gateway/email/update",
            type: 'post',
            data:mail,
            cb:function(rs){
                layer.msg("保存成功!");
                emailObj.intervals.interval_0=false,//关掉定时器
                clearInterval(emailObj.newMail);

                emailObj.isNewEmail=true;//需要获取新id
                emailObj.isWriteShow = false;
                var el=$("#mailDraftbox table");
                emailObj.sendListFun(3,el);//刷新草稿列表

            } 
        })
    }
    $("#saveEmalBtn").on("click",function(){//保存草稿
        saveEmalFun();
        emailObj.isWriteShow = false;
        element.tabChange('emailTabBrief','roleToDraft');
    })
    
    //删除
    var delMailFun=function(elem,stu){
        var url,lstFun,stus,alertInfo;
        switch(stu){
            case 0://草稿箱
                stus=3;
                alertInfo="<p>确定删除该草稿？</p>"
                url="/gateway/send/delete";
                listFun=emailObj.sendListFun;
                break;
            case 1://已发送
                stus=1;
                alertInfo="<p>确定删除该邮件？</br>(未读的收件人邮件将会删除，已读的邮件不影响)</p>"
                url="/gateway/send/delete";
                listFun=emailObj.sendListFun;
                break;
            case 2://删除
                stus=2;
                alertInfo="<p>确定永久删除吗？</br>(删除后无法找回)</p>"
                url="/gateway/receive/delete";
                listFun=emailObj.inBoxListFun;
                break;
            case 3://全部
                stus=3;
                alertInfo="<p>确定删除该邮件？</br>(删除后可在已删除中找回)</p>"
                url="/gateway/receive/remove";
                listFun=emailObj.inBoxListFun;
                break;
        }
        var delId='';
        elem.find("input").each(function(key,val){
            var tid = $(this).val();
            var slecVal =$(this).prop("checked");
            if(slecVal){
                delId+= tid+',';
            }
        });
        if(delId==''){
           layer.msg("无选中")
        }else{
            delId = delId.substring(0,delId.length-1);
            layer.confirm(''+alertInfo+'', {icon: 3, title:' '}, function(index){
                $.fetch({//调用删除接口
                    url: url,
                    type: 'post',
                    data:{
                        emailId:delId,
                    },
                    cb:function(rs){
                    layer.msg("删除成功");
                        var el=elem.parent("table");
                        listFun(stus,el);
                    } 
                });
                layer.close(index);
            
            });
        }
    }

    $("#mailInbox .del").on('click',function(){
        var el=$("#mailInbox tbody");
        delMailFun(el,3);
    })
    $("#mailDelbox .del").on('click',function(){
        var el=$("#mailDelbox tbody");
        delMailFun(el,2);
    })
    $("#mailDelbox .cancelDel").on('click',function(){
        var el=$("#mailDelbox tbody");
        cancelDelFun(el);
    })

    $("#mailOutbox .del").on('click',function(){
        var el=$("#mailOutbox tbody");
        delMailFun(el,1);  
    })
    $("#mailDraftbox .del").on('click',function(){
        var el=$("#mailDraftbox tbody");
        delMailFun(el,0);
        
    })
    
     $("#fileUploadBox").on("click","i.del",function(){ //删除附件
         var id=$(this).attr("data-file");
         var a=$(this).parent('a');
        layer.confirm('确定删除该附件吗?',{"title":""},function(index){
            layer.close(index);
            layer.msg('正在删除附件',{icon:16})
            $.fetch({
                url: '/gateway/attach/del',
                type: 'post',
                data:{
                    attachId:id,
                },
                cb:function(rs){
                    layer.msg('删除成功',{icon:1});
                    a.remove();
                } 
            });
        })
     })
   
     
    function IsNoRead(stus){//标记已读
        var isReadArr='';
        $("#mailInbox tbody").find("input").each(function(key,val){
            var tid = $(this).val();
            var slecVal =$(this).prop("checked");
            if(slecVal){
                isReadArr+= tid+',';
            }
        });
        if(isReadArr==''){
            layer.msg("无选中")
        }else{
            isReadArr = isReadArr.substring(0,isReadArr.length-1);
            $.fetch({
                url: '/gateway/receive/setstatus',
                type: 'post',
                data:{
                    emailId:isReadArr,
                    status:stus,
                },
                cb:function(rs){
                    var el=$("#mailInbox table");
                    emailObj.inBoxListFun(3,el);
                } 
            });
        }
    }
    $("#mailInbox .isRead").on("click",function(){
        IsNoRead(1);
    })
    $("#mailInbox .noRead").on("click",function(){
        IsNoRead(0);
    })
    
    function noReadNum(){
        $.fetch({
            url: '/gateway/receive/list',
            type: 'post',
            data:{
                status:0,
                page_size:1000,
            },
            cb:function(rs){
                if(rs.data_list&&rs.data_list.length>0){
                    var w =rs.data_list.length>99?'+':'';
                    $("#noReadEmail .layui-badge").css('opacity','1').text(rs.data_list.length+w);
                    
                }else{
                    $("#noReadEmail .layui-badge").css('opacity','0');
                }
            } 
        });
    }
    var cancelDelFun =function(elem){//撤销删除
        var delId='';
        elem.find("input").each(function(key,val){
            var tid = $(this).val();
            var slecVal =$(this).prop("checked");
            if(slecVal){
                delId+= tid+',';
            }
        });
        if(delId==''){
            layer.msg("无选中")
        }else{
            delId = delId.substring(0,delId.length-1);
            $.fetch({
                url: "/gateway/receive/recover",
                type: 'post',
                data:{
                    emailId:delId,
                },
                cb:function(rs){
                    var el=elem.parent("table");
                    emailObj.inBoxListFun(2,el);
                    emailObj.inBoxListFun(0,$("#mailInbox table"));
                } 
            });
        }
    }
    var emailStatusFun =function(){//获取页面状态得方法
        var sendNmae = $("#consigneeName").html();
        var sendcNmae = $("#cs_consigneeName").html();
        var sendmNmae = $("#ms_consigneeName").html();
        var tit =$("#emailSubject").val();
        var markupStr = layedit.getContent(emaileit);
        var mailFiles =$("#mailFiles").html();
        var eStaStr = ''+sendNmae+'&'+sendcNmae+'&'+sendmNmae+'&'+tit+'&'+markupStr+'&'+mailFiles+'';
        return eStaStr;
    }
    
    var saveCreateFun = function(){//转到其他页面提示保存草稿 此前判断页面是否有变化
        //如果是草稿详情打开新建页面，记录页面内容
        //如果是新建打开 获取离开时是否有内容
        //此时获取得是离开时 页面得内容
        var nowEmailStatus =emailStatusFun();
        if(nowEmailStatus !=emailObj.emailStatus ){
            var saveCreate= layer.open({//详情弹窗
                title:' ',
                content:'<p style="text-align:center;padding:15px 0px 0px;">是否保存到草稿?</p>',
                type:1,
                icon: 3,
                area:['auto'],
                btn: ['保存','不保存'],
                yes: function(index, layero){
                    saveEmalFun();
                    layer.close(index); 
                }
                ,btn2: function(index, layero){
                    emailObj.intervals.interval_0=false,//关掉定时器
                    clearInterval(emailObj.newMail);
                    emailObj.removeWrit();
                    emailObj.isNewEmail=true;
                    layer.close(index);
                    return false
                }

            })
        }else{
            emailObj.intervals.interval_0=false,//关掉定时器
            clearInterval(emailObj.newMail);
        }
    }


    //c此处用于table全选
    form.on('checkbox(layTableAllChoose)', function(data){
        if(data.elem.checked){
            $(data.elem).parents("thead").next("tbody").find('input').prop("checked",true);
        }else{
            $(data.elem).parents("thead").next("tbody").find('input').prop("checked",false);
        }
        form.render();
    }); 
    form.on('checkbox(layTableOneChoose)', function(data){
        var alen = $(data.elem).parents("tbody").find('input').length;
        var clen = $(data.elem).parents("tbody").find('input:checkbox:checked').length;
        if(alen == clen){
            $(data.elem).parents("tbody").siblings("thead").find(".chekAll").prop("checked",true);
        }else{
            $(data.elem).parents("tbody").siblings("thead").find(".chekAll").prop("checked",false);
        }
        form.render();
    }); 

  
    noReadNum();


//关闭
    window.onbeforeunload = function(){
        var nowEmailStatus =emailStatusFun();
        if(emailObj.isWriteShow&&(nowEmailStatus !=emailObj.emailStatus)){
            return '系统可能不会保存您所做的更改。'    
       }
    };
//草稿 详情 到其他页 取消保存 未清空
})
})  