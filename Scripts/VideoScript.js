// ==UserScript==
// @name              解析腾讯，优酷，爱奇艺等全网会员视频，vip视频，添加百度网盘超级会员账号共享
// @namespace         https://greasyfork.org/zh-CN/users/704106
// @version           2.9.3
// @icon              
// @description       解析会员视频，vip视频，支持腾讯，优酷，爱奇艺，芒果，pptv等
// @antifeature      The script copies the URL to the parsing site, so the page contains part of the parsing site ads
// @author            jlmf
// @license           MIT
// @supportURL        https://greasyfork.org/zh-CN/users/704106
// @include            *://v.youku.com/v_*
// @include             *://m.youku.com/v*
// @include             *://m.youku.com/a*
// @include             *://*.iqiyi.com/v_*
// @include            *://*.iqiyi.com/w_*
// @include             *://*.iqiyi.com/a_*
// @include             *://*.iqiyi.com/dianying/*
// @include            *://*.le.com/ptv/vplay/*
// @include             *v.qq.com/x/cover/*
// @include             *v.qq.com/x/page/*
// @include             *v.qq.com/play*
// @include             *://pan.baidu.com/*
// @include             *://*.tudou.com/listplay/*
// @include             *://*.tudou.com/albumplay/*
// @include             *://*.tudou.com/programs/view/*
// @include             *://*.mgtv.com/b/*
// @include             *://film.sohu.com/album/*
// @include             *://tv.sohu.com/*
// @include             *://*.bilibili.com/video/*
// @include             *://*.bilibili.com/anime/*
// @include             *://*.bilibili.com/bangumi/play/*
// @include             *://vip.pptv.com/show/*
// @include            *://v.pptv.com/show/*
// @include             *://*.baofeng.com/play/*
// @include             *://v.yinyuetai.com/video/*
// @include             *://v.yinyuetai.com/playlist/*
// @include             *://vip.1905.com/play/*
// @require           https://cdn.bootcss.com/jquery/1.12.4/jquery.min.js
// @run-at            document-idle
// @grant             unsafeWindow
// @grant             GM_addStyle
// ==/UserScript==

(function () {
  'use strict';

  GM_addStyle('.h-icon-play {color: #d926b5;fill: #d926b5;height: 80px;width: 80px;position: fixed;z-index: 99999;top: 0px;left: 0;cursor: pointer;}  .h-ol {position: fixed;top: 30px;left: 20px;z-index: 99999;counter-reset: li;list-style: none;font-size: 8px;padding: 0;margin-bottom: 2em;text-shadow: 0 1px 0 rgba(255, 255, 255, .5);display: none;}  .h-ol a {position: relative;display: block;padding: 3px 10px 3px 2em;margin: 0.5em 0;background: #ddd;color: #444;text-decoration: none;border-radius: 0.3em;transition: all 0.3s ease-out;}  .h-ol a:hover {background: #eee;color: #ff6f5c;transition: all 0.3s ease-out;}  .h-ol a::before {content: counter(li);counter-increment: li;position: absolute;left: -1.2em;top: 50%;margin-top: -1.2em;background: #87ceeb;height: 2em;width: 2em;line-height: 2em;border: 0.2em solid #fff;text-align: center;font-weight: bold;border-radius: 2em;}');

  let api = [
{"name":"OK解析","url":"https://okjx.cc/?url="},  
{"name":"2k","url":"https://vip.2ktvb.com/player/?url="},   
{"name":"Parwix","url":"https://vip.parwix.com:4433/player/?url="},
{"name":"bl","url":"https://vip.bljiex.com/?v="},   
{"name":"mmkv","url":"https://jx.mmkv.cn/tv.php?url="},
{"name":"视频流","url":"https://jx.m3u8.tv/jiexi/?url="},    
{"name":"解析la","url":"https://api.jiexi.la/?url="},
{"name":"1717yun","url":"https://www.1717yun.com/jx/ty.php?url="},  
{"name":"ckmov2","url":"https://ckmov.ccyjjd.com/ckmov/?url="},  
{"name":"play","url":"https://www.playm3u8.cn/jiexi.php?url="}, 
{name: 'M1970', url: 'https://z1.m1907.cn/?jx='},
{"name":"盘古","url":"https://www.pangujiexi.cc/jiexi.php?url="},
{"name":"夜幕","url":"https://www.yemu.xyz/?url="},
{"name":"CK","url":"https://www.ckplayer.vip/jiexi/?url="}, 
{"name":"H8","url":"https://www.h8jx.com/jiexi.php?url="}, 
{"name":"0523","url":"https://go.yh0523.cn/y.cy?url="},
{"name":"qianqi","url":"https://api.qianqi.net/vip/?url="},
{"name":"administratorw","url":"https://www.administratorw.com/video.php?url="}, 
{"name":"8090g","url":"https://www.8090g.cn/?url="},
{"name":"laoban","url":"https://vip.laobandq.com/jiexi.php?url="},];

  let main = {
    showButton: function () {
      if (location.host.match(/youku|iqiyi|le|qq|tudou|mgtv|sohu|acfun|bilibili|pptv|baofeng|yinyuetai/ig)) {
        let mainButton = '<div class="h-icon-play" title="Click show resolve address"><svg viewBox="0 0 512 512"><path d="M422.6 193.6c-5.3-45.3-23.3-51.6-59-54 -50.8-3.5-164.3-3.5-215.1 0 -35.7 2.4-53.7 8.7-59 54 -4 33.6-4 91.1 0 124.8 5.3 45.3 23.3 51.6 59 54 50.9 3.5 164.3 3.5 215.1 0 35.7-2.4 53.7-8.7 59-54C426.6 284.8 426.6 227.3 422.6 193.6zM222.2 303.4v-94.6l90.7 47.3L222.2 303.4z"></path></svg></div>';
        let apiList = '<ol class="h-ol"></ol>';
        let github = '<iframe src="https://greasyfork.org/zh-CN/users/704106&repo=media&type=star&count=true" frameborder="0" scrolling="0" style="height: 20px;max-width: 110px;padding: 0 5px;box-sizing: border-box;margin-top: 10px;"></iframe>';
(function() {
                        $("body").on('mouseover', '.item a', function(e) {

                            let objfj = $(this), href = objfj.attr('href') || objfj.data("href");
                            objfj.off('click.chrome');

                            objfj.on('click.chrome', function() {
                                window.location.href = href
                            }).attr('data-href', href).css({
                                cursor: 'pointer'
                            }).removeAttr('href')
                        })
                    })();
        $(top.document.body).append(mainButton);
        $(top.document.body).append(apiList);

        api.forEach((val, index) => {
          $('.h-ol').append(`<li><a target="_blank" href="${val.url + encodeURI(location.href)}">${val.name}</a></li>`)
        });
        //Feedback button
        $('.h-ol').append(`<li><a target="_blank" style="color: #999;" href="https://greasyfork.org/zh-CN/users/704106">Click on the feedback</a></li>`);
        $('.h-ol').append(github);

        $(top.document.body).on('click', '.h-icon-play', () => {
          $('.h-ol').fadeToggle('fast');
        });
      }
    }
  };

  $(function () {
    main.showButton();
  });
})();
(function () {
  'use strict';

  GM_addStyle('.h-icon-play {color: #d926b5;fill: #d926b5;height: 80px;width: 80px;position: fixed;z-index: 99999;top: 0px;left: 0;cursor: pointer;}  .h-ol {position: fixed;top: 30px;left: 20px;z-index: 99999;counter-reset: li;list-style: none;font-size: 8px;padding: 0;margin-bottom: 2em;text-shadow: 0 1px 0 rgba(255, 255, 255, .5);display: none;}  .h-ol a {position: relative;display: block;padding: 3px 10px 3px 2em;margin: 0.5em 0;background: #ddd;color: #444;text-decoration: none;border-radius: 0.3em;transition: all 0.3s ease-out;}  .h-ol a:hover {background: #eee;color: #ff6f5c;transition: all 0.3s ease-out;}  .h-ol a::before {content: counter(li);counter-increment: li;position: absolute;left: -1.2em;top: 50%;margin-top: -1.2em;background: #87ceeb;height: 2em;width: 2em;line-height: 2em;border: 0.2em solid #fff;text-align: center;font-weight: bold;border-radius: 2em;}');

  let api = [
{"name":"百度网盘会员共享","url":"https://mp.weixin.qq.com/s?__biz=MzI3OTU0Njk0NA==&mid=2247485346&idx=1&sn=2d4781f73d392d4c09dafe2315110425&chksm=eb475a8ddc30d39b2771ce7d93aa6bbd8e3c1191b05fc48f3b27ce4fed1f5c9b1f9ea5bb9eef#rd"},];

  let main = {
    showButton: function () {
      if (location.host.match(/pan.baidu|yun.baidu/ig)) {
        let mainButton = '<div class="h-icon-play" title="Click show resolve address"><svg viewBox="0 0 512 512"><path d="M422.6 193.6c-5.3-45.3-23.3-51.6-59-54 -50.8-3.5-164.3-3.5-215.1 0 -35.7 2.4-53.7 8.7-59 54 -4 33.6-4 91.1 0 124.8 5.3 45.3 23.3 51.6 59 54 50.9 3.5 164.3 3.5 215.1 0 35.7-2.4 53.7-8.7 59-54C426.6 284.8 426.6 227.3 422.6 193.6zM222.2 303.4v-94.6l90.7 47.3L222.2 303.4z"></path></svg></div>';
        let apiList = '<ol class="h-ol"></ol>';
        let github = '<iframe src="https://greasyfork.org/zh-CN/users/704106&repo=media&type=star&count=true" frameborder="0" scrolling="0" style="height: 20px;max-width: 110px;padding: 0 5px;box-sizing: border-box;margin-top: 10px;"></iframe>';

        $(top.document.body).append(mainButton);
        $(top.document.body).append(apiList);

        api.forEach((val, index) => {
          $('.h-ol').append(`<li><a target="_blank" href="${val.url}">${val.name}</a></li>`)
        });
        //Feedback button
        $('.h-ol').append(`<li><a target="_blank" style="color: #999;" href="https://greasyfork.org/zh-CN/users/704106">Click on the feedback</a></li>`);
        $('.h-ol').append(github);

        $(top.document.body).on('click', '.h-icon-play', () => {
          $('.h-ol').fadeToggle('fast');
        });
      }
    }
  };

  $(function () {
    main.showButton();
  });
})();
