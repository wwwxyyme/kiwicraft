(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'underscore'], factory);
    } else if (typeof exports === 'object') {
        factory(require('jquery'), require('underscore'));
    } else {
        factory(jQuery, _);
    }
}(function ($, _) {

    // 默认文字
    var defaultI18n = {
        Close: 'Close',
        None: 'None',
        OK: 'OK',
        Cancel: 'Cancel',
        Yes: 'Yes',
        No: 'No',
        Retry: 'Retry',
        Ignore: 'Ignore',
        Abort: 'Abort',
        DefaultTitle: 'Dialog message',
        InfoTitle: 'Infomation',
        QuestionTitle: 'Question',
        SuccessTile: 'Success',
        WarningTitle: 'Warning',
        ErrorTitle: 'Error'
    };

    window["DialogResult"] = {
        None : 'none',
        OK : 'ok',
        Cancel : 'cancel',
        Abort : 'abort',
        Retry : 'retry',
        Ignore : 'ignore',
        Yes : 'yes',
        No : 'no'
    };

    function Dialog(element, options) {
        this.element = element;
        this.overlay = undefined;
        this.result = undefined;
        this.data = undefined;
        this.options = $.extend(true, {
            zIndex: undefined
        }, options);
    }

    Dialog.zIndex = 3000;

    Dialog.prototype = {
        show:function() {
            var dlg = this;

            var $o = $('<div class="dialog__overlay" style="position:fixed; left:0; top:0; width:100%; height:100%; background-color:#000"></div>').css({
                'z-Index': ++Dialog.zIndex,
                opacity: 0.6
            }).appendTo('body').hide();
            this.overlay = $o.get(0);
            
            //$o.on('click',function(){
            //    dlg.close();
            //});
            var $w = $(this.element).css({
                'z-Index': ++Dialog.zIndex,
                position:'fixed',
                left:0,
                top:0,
                opacity:1
            }).hide();
            dlg.position();

            // 触发 dialog.showing 事件, 并确定用户是否取消显示
            var e = $.Event("dialog.showing",{ dialog: dlg });
            $w.trigger(e);
            if (e.isDefaultPrevented()) return;

            // 显示对话框
            $o.show();
            $w.velocity('transition.swoopIn', {
                duration: 300,
                complete:function() {
                    // 触发 dialog.shown 事件
                    e = $.Event("dialog.shown",{ dialog: dlg });
                    $w.trigger(e);
                }
            });
        },

        position:function(options){
            var opt = $.extend(true,{
                of: window,
                my: 'center center',
                at: 'center center',
                collision: 'flip flip'
            },options);

            $(this.element).position(opt);
        },

        close:function(result, data) {
            // 默认赋予 DialogResult.None
            if(!result) result=window["DialogResult"].None;

            var dlg = this,
                $w = $(this.element);
            dlg.result = result;
            dlg.data = data;

            var e = $.Event("dialog.closing",{ dialog: dlg });
            $w.trigger(e);
            if (e.isDefaultPrevented()) return;
            
            $(this.element).velocity('transition.swoopOut', {
                duration: 300,
                complete:function() {
                    $(dlg.element).hide();
                    $(dlg.overlay).remove();

                    // 在特效之后触发对话框关闭事件
                    e = $.Event( "dialog.closed", { dialog: dlg });
                    $w.trigger(e);
                }
            });
        }
    };


    $.fn.dialog = function(options) {
        return this.each(function() {
            var dlg = new Dialog(this, options);
            $(this).data('dialog', dlg);
        });
    };

    $.showDialog = function(options) {
        var options = $.extend(true,{
            icon:'',
            buttons: undefined,
            title:undefined,
            content: undefined, // 可以是字符串，HTML
            url:'',
            i18n: defaultI18n
        },options);

        if(options.title === undefined) {
            options.title = 
                options.icon ==='info' ? options.i18n.InfoTitle :
                options.icon ==='question' ? options.i18n.QuestionTitle :
                options.icon ==='success' ? options.i18n.SuccessTile :
                options.icon ==='warning' ? options.i18n.WarningTitle :
                options.icon ==='error' ? options.i18n.ErrorTitle :
                options.i18n.DefaultTitle;
        }

        var $html = $('\
            <div class="dialog">\
                <div class="dialog__hd">\
                    <a class="dialog__closer" data-result="none" href="javascript:;"></a>\
                    <h4 class="dialog__title">' + options.title + '</h4>\
                </div>\
                <div class="dialog__bd"></div>\
                <div class="dialog__ft" style="display:none"><!--存放按钮--></div>\
            </div>').appendTo('body');

        // 构建dialog对象，并扩展方法
        var dlg = $html.dialog().data('dialog');
        $.extend(true, dlg, {
            showLoading:function() {
                var $bd = $('.dialog__bd',this.element);
                $('<div class="dialog__loading"></div>').appendTo($bd).spin();
            },
            hideLoading:function(){
                var $bd = $('.dialog__bd',this.element);
                $('.dialog__loading', $bd).spin('stop').remove();
            },
            content:function(html, icon) {
                var $bd = $('.dialog__bd',this.element).html('');
                if(icon) {
                    $('<i class="dialog__icon"></i>').appendTo($bd);
                    $html.addClass('dialog--' + icon);
                    $('<div class="dialog__content"></div>').html(html).appendTo($bd);
                } else {
                    $(html).appendTo($bd);
                }
            },
            buttons:function(buttons) {
                var $buttons = $html.find('.dialog__ft').html('').hide();
                if (buttons === 'OKCancel') {
                    $('<button class="btn btn--primary">' + options.i18n.OK + '</button>').attr('data-result', window["DialogResult"].OK).appendTo($buttons);
                    $('<button class="btn">' + options.i18n.Cancel + '</button>').attr('data-result',window["DialogResult"].Cancel).appendTo($buttons);
                } else if (buttons === 'AbortRetryIgnore') {
                    $('<button class="btn btn--primary">' + options.i18n.Abort + '</button>').attr('data-result',window["DialogResult"].Abort).appendTo($buttons);
                    $('<button class="btn btn--default">' + options.i18n.Retry + '</button>').attr('data-result',window["DialogResult"].Retry).appendTo($buttons);
                    $('<button class="btn btn--default">' + options.i18n.Ignore + '</button>').attr('data-result',window["DialogResult"].Ignore).appendTo($buttons);
                } else if (buttons === 'YesNoCancel') {
                    $('<button class="btn btn--primary">' + options.i18n.Yes + '</button>').attr('data-result',window["DialogResult"].Yes).appendTo($buttons);
                    $('<button class="btn btn--default">' + options.i18n.No + '</button>').attr('data-result',window["DialogResult"].No).appendTo($buttons);
                    $('<button class="btn btn--default">' + options.i18n.Cancel + '</button>').attr('data-result',window["DialogResult"].Cancel).appendTo($buttons);
                } else if (buttons === 'YesNo') {
                    $('<button class="btn btn--primary">' + options.i18n.Yes + '</button>').attr('data-result',window["DialogResult"].Yes).appendTo($buttons);
                    $('<button class="btn btn--default">' + options.i18n.No + '</button>').attr('data-result',window["DialogResult"].No).appendTo($buttons);
                } else if (buttons === 'RetryCancel') {
                    $('<button class="btn btn--primary">' + options.i18n.Retry + '</button>').attr('data-result',window["DialogResult"].Retry).appendTo($buttons);
                    $('<button class="btn btn--default">' + options.i18n.Cancel + '</button>').attr('data-result',window["DialogResult"].Cancel).appendTo($buttons);
                } else if (buttons === 'OK') {
                    $('<button class="btn btn--primary">' + options.i18n.OK + '</button>').attr('data-result',window["DialogResult"].OK).appendTo($buttons);
                } else {
                    return;
                }
                $buttons.show();
            },
            buttonHandler :function(e) {
                // 这里的this代表的是button元素
                var result = $(this).attr('data-result');
                e.dialog.close(result, undefined);
            },
            position:function(options){
                var opt = $.extend(true,{
                    of: window,
                    my: 'center center',
                    at: 'center center',
                    collision: 'flip flip',
                    width : undefined,
                    height: undefined
                },options);
                
                if(opt.width || opt.height) {
                    var $dialog = $(this.element),
                        $dialog_bd = $('.dialog__bd', $dialog);
                    if(opt.width) $dialog.width(opt.width);
                    if(opt.height) $dialog_bd.height(opt.height);

                    //$('<div style="position:fixed"></div>').css({
                    //    left:$element.left,
                    //    top:options.top,
                    //})
                }
                $(this.element).position(opt);
            }
            //setIframeSize:function(width, height) {
            //    var $dialog = $(this.element),
            //        $bd = $('.dialog__bd', $dialog),
            //        ;

            //    
            //    $iframe.height(height);
            //    //.height(height);
            //}
        });

        //var $bd = $('.dialog__bd',$html);
        // 装配内容区域
        if(options.url) {
            dlg.content('<iframe class="dialog__iframe" scrolling="no"></iframe>');
        } else {
            dlg.content(options.content, options.icon);
            dlg.buttons(options.buttons);
        }

        $html.on('click','[data-result]',function(e){
            e.dialog = dlg;
            dlg.buttonHandler.apply(this, [e]);
        });
        
        //$html.appendTo('body').hide();
        

        // 构建异步处理对象
        var dtd = $.Deferred();
        $html.on('dialog.showing',function(e){
            // 遮罩层是在显示前创建的，所以需要在dialog.showing事件里面进行绑定
            $(e.dialog.overlay).on('click', function(e){
                dlg.close();
            });
        }).on('dialog.shown', function(e) {
            if(e.isDefaultPrevented()) return;
            if(options.url) {
                var $iframe = $html.find('iframe').hide(),
                    iframeWindow = $iframe[0].contentWindow;

                dlg.showLoading();
                $iframe.load(function(e) {
                    $iframe.show();
                    iframeWindow.window.init(dlg);
                    $('.dialog__title').text($(iframeWindow.document).find('title').text());
                    dlg.hideLoading();
                });
                $iframe.attr('src',options.url);
            }
        }).on('dialog.closed',function(e) {
            if(e.isDefaultPrevented()) return;
            $html.remove();
            dtd.resolve(e.dialog.result, e.dialog.data);
        });
        dlg.show();

        return dtd.promise();
    };

    $.alert = function(options) {
        if(_.isString(options)) options = { content:options };

        var options = $.extend(true,{
            icon:'info',
            buttons:'OK',
            title:undefined,
            content:'',
            i18n: defaultI18n
        },options);

        return $.showDialog(options);
    };

    $.confirm = function(options) {
        if(_.isString(options)) options = { content:options };

        var options = $.extend(true,{
            icon:'warning',
            buttons:'YesNo',
            title:undefined,
            content:'',
            i18n: defaultI18n
        },options);

        return $.showDialog(options);
    };

    $.loading = function(content){
        if(!content) content="正在加载中...";
        
        var $html = $('\
            <div class="dialog">\
                <div class="dialog__bd">\
                    <i class="dialog__icon"></i><div class="dialog__content">'+content+'</div>\
                </div>\
            </div>').addClass('dialog--loading').appendTo('body');

        // 构建dialog对象
        var dlg = $html.dialog().data('dialog');

        $html.on('dialog.showing',function(e){
            $('.dialog__icon',e.dialog.element).spin();
        }).on('dialog.closed',function(e) {
            if(e.isDefaultPrevented()) return;
            $html.remove();
        });
        dlg.show();
        return $html;
    }
    // $.showDialog = function(options) {
    //     var options = $.extend(true,{
    //         icon:'',
    //         buttons:'OKCancel',
    //         title:undefined,
    //         url:'',
    //         i18n: defaultI18n
    //     },options);
    // };
}));