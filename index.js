'use strict';
var assert = require('assert');
var restful = require('node-weixin-request');

var oauth = {
  app: {
    id: null,
    secret: null,
    token: null
  },
  urls: {
    //用户首次访问的URL地址
    init: '',
    //用户通过验证后的返回地址
    redirect: '',
    //成功获取用户openid后的地址
    success: ''
  },
  /**
   *
   * @param app
   * @param urls
   */
  initApp: function(app) {
    oauth.app = app;
  },
  initUrl: function(urls) {
    oauth.urls = urls;
  },
  /**
   *  Create a url for weixin oauth
   *
   * @param state     User defined state to check use validation
   * @param scope     The scope of user info which app want to have
   * @param type      Response type of weixin api, currently on 'code' is supported
   * @returns {*}
   */
  createURL: function (state, scope, type) {
    assert((scope >= 0) && (scope <= 1));
    assert(state !== null);
    type = 0;
    var params = {
      appid: this.app.id,
      redirect_uri: this.urls.redirect,
      //Only on type currently
      response_type: ['code'][type],
      scope: ['snsapi_base', 'snsapi_userinfo'][scope],
      state: state
    };
    return this.buildUrl(params);
  },
  refresh: function(refreshToken, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/oauth2/refresh_token';
    var params = {
      appId: this.app.id,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };
    var url = oauthUrl + '?' + restful.toParam(params, true);
    restful.request(url, null, cb);
  },
  info: function(openid, accessToken, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/userinfo';
    var params = {
      access_token: accessToken,
      openid: openid,
      lang: 'zh_CN'
    };
    var url = oauthUrl + '?' + restful.toParam(params, true);
    restful.request(url, null, cb);
  },
  validate: function(openid, accessToken, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/auth';
    var params = {
      access_token: accessToken,
      openid: openid
    };
    var url = oauthUrl + '?' + restful.toParam(params, true);
    restful.request(url, null, function(error, json) {
      if (!json.errcode) {
        cb(true);
      } else {
        cb(false);
      }
    });
  },
  buildUrl: function(params) {
    var oauthUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    return oauthUrl + '?' + restful.toParam(params) + '#wechat_redirect';
  },
  tokenize: function(accessToken, params, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token';
    params['access_token'] = accessToken;
    var url = oauthUrl + '?' + restful.toParam(params) + '#wechat_redirect';
    restful.request(url, null, cb);
  },
  authorize: function(code, state, cb) {
    var params = {
      appid: this.app.id,
      secret: this.app.secret,
      grant_type: 'authorization_code',
      code: code
    };
    this.tokenize(params, function(error, json) {
      if (error) {
        cb(true);
      } else {
        cb(false, json);
      }

    });
  }
};

module.exports = oauth;

