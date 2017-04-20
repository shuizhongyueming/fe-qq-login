# fe-qq-login

纯前端的QQ内置浏览器内网页的QQ登录实现

## 适用范围

和上方简述里面描写的一样，首先这比较适合用在移动端上，PC有更好的无刷新登录的[方式](http://wiki.open.qq.com/wiki/%E3%80%90QQ%E7%99%BB%E5%BD%95%E3%80%91JS_SDK%E4%BD%BF%E7%94%A8%E8%AF%B4%E6%98%8E)

然后这个适合在检测到当前页面是QQ内置浏览器的时候使用，因为在内置浏览器内，用户的信息是会由QQ那边自动填充当前登录的帐号。如果在其它浏览器内，需要用户手动来写帐号密码，体验太差。

如果你的项目满足以上两点，那么可以考虑使用本项目了 :)

## 部署

首先需要在QQ的开放平台注册网站，配置好域名并获取你的appId

然后把项目里面的`login-redirect.html`放到注册的网站下的某个路径，同时需要登录的页面也是在网站域名下的。

修改`qq-login.js`的`toLogin`方法里面由花括号包裹的两个地方的配置。

以上，配置完成，可以顺利在项目里面使用了

## DEMO

```javascript

// main.js

var qqLogin = require('qq-login');

// 这个用来判断用户是否是上次跳转登录回来的，保证了一个简单的上下文的承接
if (qqLogin.isFromLoginSuccess()) {
    console.log('恭喜，登录成功!'); 
}

if (qqLogin.isLogin()) {
    qqLogin.getUserInfo(function(openId, token){

        // 基于这两个数据，可以获取QQ用户相关其它信息
        console.log('你的openId: '+openId+', token: '+token);
    });
} else {
    $loginBtn.show().click(qqLogin.toLogin);
}

```

更多的说明，可以参考我的[文章](http://www.shuizhongyueming.com/2017/04/20/qq%E5%86%85%E7%BD%AE%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%8B%E7%9A%84qq%E7%99%BB%E5%BD%95%E5%AE%9E%E7%8E%B0/)

## TODO 

把QQ的相关接口整合进来。
