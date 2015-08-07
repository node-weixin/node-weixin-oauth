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
   * Build parameters into oauth2 url
   * @param params
   * @returns {string}
   */
  buildUrl: function(params) {
    var oauthUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    return oauthUrl + '?' + restful.toParam(params) + '#wechat_redirect';
  },

  /**
   *  Create a url for weixin oauth give state, scope and type
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

  /**
   * Get user info
   *
   * @param openId
   * @param accessToken
   * @param cb
   */
  info: function(openId, accessToken, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/userinfo';
    var params = {
      access_token: accessToken,
      openid: openId,
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
  },

  /**
   * Callback when oauth from weixin is successful.
   *
   * @param req       HTTP Request
   * @param res       HTTP Response
   * @param cb        Callback when the openid is retrieved from the server
   * @param redirect  redirect if it is true
   */
  success: function(req, res, cb, redirect) {
    var code = req.param('code');
    var state = req.param('state');
    if (!code) {
      res.redirect(this.urls.init);
      return;
    }

    this.authorize(code, state, function (error, json) {
      if (error) {
        res.notFound();
      } else {
        if (json.openid) {
          req.session.weixin = {
            openId: json.openid,
            accessToken: json.access_token,
            refreshToken: json.refresh_token
          };
          if (cb) {
            cb(json);
          }
          if (redirect) {
            res.redirect(this.urls.success);
          }
          return;
        }
        res.redirect(this.urls.init);
      }
    });
  },

  profile: function(req, res, cb) {
    this.success(req, res, function (json) {
      oauth.info(json.openid, json.access_token, function (error, info) {
        if (error) {
          res.redirect(oauth.urls.init);
          return;
        }
        var ip = req.headers['x-forwarded-for'] ||
          req.connection.remoteAddress || req.ip;
        info.ip = ip;
        cb(info);
      });
    });
  }

};

module.exports = oauth;

