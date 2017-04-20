var KEY_TOKEN = 'QQAccessToken';
var KEY_EXPIRE = 'QQAccessExpireTime';

/**
 * 这块是为了实现发起登录的页面
 * 能够在登录成功回跳回来的时候，能够知道当前是从未登录到登录的第一次访问
 * 这样可以显示一些登录成功的状态提示
 *
 * 登录的中转页会在登录成功之后记录QQLoginSuccess 和 QQLoginSuccessTime 到本地
 *
 * 脚本这块会在识别此状态之后，立马清空上述两个值，避免干扰下次判断
 */
var KEY_FROM_LOGIN_SUCCESS = 'QQLoginSuccess'; // 表明是否登录成功
var KEY_FROM_LOGIN_SUCCESS_TIME = 'QQLoginSuccessTime'; // 记录登录成功发生的时间
var stateIsFromLoginSuccess = false;

// 初次登录成功这个状态的有效期
// 避免用户在中转页的时候关闭了网页隔了很长时间再进入
// 还会错误的识别为登录成功
var successTriggerTime = 1 * 60 * 1000; 

/**
 * 清理掉临时变量
 *
 */
function clearTemp(){
    localStorage.removeItem(KEY_FROM_LOGIN_SUCCESS);
    localStorage.removeItem(KEY_FROM_LOGIN_SUCCESS_TIME);
}

var API = {
    /**
     * 跳转登录
     *
     * @param {Object} opt 配置信息 {
     *  redirectUrl {String} 回调的地址
     *  appId {String} QQ开放平台获取的APPID
     *  scope {String} 要获取的权限 参考 http://wiki.open.qq.com/wiki/%E3%80%90QQ%E7%99%BB%E5%BD%95%E3%80%91%E4%BD%BF%E7%94%A8Implicit_Grant%E6%96%B9%E5%BC%8F%E8%8E%B7%E5%8F%96Access_Token#2._.E8.BF.87.E7.A8.8B.E8.AF.A6.E8.A7.A3
     *  display {String} 风格 pc|mobile 默认mobile
     * }
     */
    toLogin: function(opt){
        var baseUrl = 'https://graph.qq.com/oauth2.0/authorize';
        var dfOpt = {
            redirectUrl: 'http://www.feiyun.tv/user/sourceLogin?source=loginredirect',
            scope: 'all',
            appId: 'YOUR APP ID',
            display: 'mobile'
        };

        if (opt) {
            dfOpt = $.extend(dfOpt, opt);
        }

        var query = {
            response_type: 'token',
            client_id: dfOpt.appId,
            scope: dfOpt.scope,
            display: dfOpt.display,
            redirect_uri: dfOpt.redirectUrl+'&redirect='+encodeURIComponent(location.href)
        };

        // $.param 会自动给每个query的key的value做encodeURIComponent
        location.href = baseUrl + '?' + $.param(query);
    },

    /**
     * 清理localStorage里面的数据，避免干扰后续逻辑
     *
     */
    clear: function(){
        clearTemp();
        localStorage.removeItem(KEY_TOKEN);
        localStorage.removeItem(KEY_EXPIRE);
    },

    /**
     * 用户退出
     *
     */
    quit: function(){
        API.clear();
    },

    /**
    * 通过检测本地数据的方式检测QQ登录是否还有效
    *
    * @returns {Boolean} true 登录有效 false 需要重新授权
    */
    isLogin: function(){
        var currDateTime = (new Date()).valueOf(),
            expireDateTime = localStorage.getItem(KEY_EXPIRE);
        var transTime = 10 * 60 * 1000; // 离过期时间前多久算过期 毫秒级
        if (!localStorage.getItem(KEY_TOKEN) || !expireDateTime) {
            API.clear();
            return false;
        }

        expireDateTime = parseInt(expireDateTime, 10);
        if (isNaN(expireDateTime)) {
            API.clear();
            return false;
        }

        if ((currDateTime + transTime) >= expireDateTime) {
            API.clear();
            return false;
        }

        return true;
    },

    /**
     * 判断当前页面是否是从登录成功跳转过来的
     *
     * @returns {Boolean} true 是 flase 不是
     */
    isFromLoginSuccess: function(){
        return stateIsFromLoginSuccess;
    },

    isUnlogin: function() {
        return !API.isLogin();
    },

    /**
     * 获取AccessToken的方法，仅供API内部调用
     *
     * @returns {String} AccessToken
     */
    _getAccessToken: function(){
        if (API.isUnlogin()) {
            throw new Error('请先登录再尝试获取用户信息');
        }
        return localStorage.getItem(KEY_TOKEN);
    },

    /**
     * 获取QQ用户的基本信息(openid,token)
     *
     * @param {Function} cb 获取成功之后的回调
     */
    getUserInfo: function(cb){
        if (API.isUnlogin()) {
            throw new Error('请先登录再尝试获取用户信息');
        }

        var token = API._getAccessToken();

        $.ajax({
            url: 'https://graph.qq.com/oauth2.0/me?access_token='+token,
            type: 'GET',
            dataType: 'jsonp',
            jsonpCallback: 'callback', // QQ的这个接口写死了回调函数的名称叫callback
            success: function(data){
                cb(data.openid, token);
            }
        });
    }
};


var successTime  = parseInt(localStorage.getItem(KEY_FROM_LOGIN_SUCCESS_TIME), 10);
if (API.isLogin()) {
    if (localStorage.getItem(KEY_FROM_LOGIN_SUCCESS) && !isNaN(successTime)) {
        if ((new Date()).valueOf() >= (successTime + successTriggerTime)) {
            clearTemp();
        } else {
            stateIsFromLoginSuccess = true;
        }
    } else {
        clearTemp();
    }
}

module.exports = API;
