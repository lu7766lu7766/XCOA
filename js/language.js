var language_pack = {
	now_lang : 0, // 0:ch,1:en
	loadProperties : function(new_lang){
		var self = this;
		var tmp_lang = '';
		if(new_lang == 0){
			tmp_lang = 'zh';
			$('body').removeClass('en').addClass('zh');
		}else{
			tmp_lang = 'en';
			$('body').removeClass('zh').addClass('en');
		}
		jQuery.i18n.properties({//加载资浏览器语言对应的资源文件
			name: 'strings', //资源文件名称
			path:'language/', //资源文件路径
			language: tmp_lang,
			cache: false,
			mode:'map', //用Map的方式使用资源文件中的值
            callback: function() {//加载成功后设置显示内容
				for(var i in $.i18n.map){
                    $('[data-lang="'+i+'"]').text($.i18n.map[i]);//text标签
                    $('[data-lang-placeholder="'+i+'"]').attr('placeholder',$.i18n.map[i]);//input标签
				}
				document.title = $.i18n.map['string_title'];
			}
		});
        self.now_lang = new_lang;
		// $.cookie('cookie_now_lang', new_lang, { expires: 30 ,secure: true ,raw: false});
        $.cookie('cookie_now_lang',new_lang, { expires: 30 });
		
	}
}
$(document).ready(function(){  
    var nowLang = $.cookie('cookie_now_lang');/*cookie 存在：0 或 1，不存在：NULL */
   /* { "cookieName":"cookieValue" } */    
    if(nowLang==0||nowLang==1){
        language_pack.loadProperties(nowLang);
    }else{
        language_pack.loadProperties(0);
    }
});