'use strict';
var assert = require('assert');
var restful = require('node-weixin-request');
var util = require('node-weixin-util');

function Oauth() {

};

var oauth = {
  session: {},

  /**
   * Build parameters into oauth2 url
   * @param params
   * @returns {string}
   */
  buildUrl: function (params) {
    var oauthUrl = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    return oauthUrl + '?' + util.toParam(params) + '#wechat_redirect';
  },

  /**
   *  Step 1: Create a url for weixin oauth give state, scope and type
   *
   * @param state     User defined state to check use validation
   * @param scope     The scope of user info which app want to have
   * @param type      Response type of weixin api, currently on 'code' is supported
   * @returns {*}
   */
  createURL: function (appId, redirectUri, state, scope, type) {
    assert((scope >= 0) && (scope <= 1));
    assert(state !== null);
    type = 0;
    var params = {
      appid: appId,
      redirect_uri: redirectUri,
      //Only on type currently
      response_type: ['code'][type],
      scope: ['snsapi_base', 'snsapi_userinfo'][scope],
      state: state
    };
    return this.buildUrl(params);
  },

  /**
   * Refresh authorization info when the access token expires
   * @param appId
   * @param refreshToken
   * @param cb
   */

  refresh: function (appId, refreshToken, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/oauth2/refresh_token';
    var params = {
      appId: appId,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };
    var url = oauthUrl + '?' + util.toParam(params);
    restful.request(url, null, cb);
  },

  /**
   * Get user profile
   *
   * @param openId
   * @param accessToken
   * @param cb
   */
  profile: function (openId, accessToken, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/userinfo';
    var params = {
      access_token: accessToken,
      openid: openId,
      lang: 'zh_CN'
    };
    var url = oauthUrl + '?' + util.toParam(params);
    restful.request(url, null, cb);
  },

  /**
   * Validate if the accessToken is still valid
   * @param openid
   * @param accessToken
   * @param cb
   */
  validate: function (openid, accessToken, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/auth';
    var params = {
      access_token: accessToken,
      openid: openid
    };
    var url = oauthUrl + '?' + util.toParam(params, true);
    restful.request(url, null, function (error, json) {
      if (!json.errcode) {
        cb(true);
      } else {
        cb(false);
      }
    });
  },

  /**
   * Get access token from server
   *
   * @param appToken
   * @param params
   * @param cb
   */
  tokenize: function (appToken, params, cb) {
    var oauthUrl = 'https://api.weixin.qq.com/sns/oauth2/access_token';
    params['access_token'] = appToken;
    var url = oauthUrl + '?' + util.toParam(params) + '#wechat_redirect';
    restful.request(url, null, cb);
  },

  /**
   * Get access token after code retrieved
   * @param app
   * @param code
   * @param cb
   */
  authorize: function (app, code, cb) {
    var params = {
      appid: app.id,
      secret: app.secret,
      grant_type: 'authorization_code',
      code: code
    };
    this.tokenize(app.token, params, function (error, json) {
      if (error) {
        cb(true, error);
      } else {
        cb(false, json);
      }
    });
  },

  /**
   * Callback when oauth from weixin is successful.
   *
   * @param app
   * @param code
   * @param cb
   */
  success: function (app, code, cb) {
    var self = this;
    this.authorize(app, code, function (error, json) {
      if (error) {
        cb(true, json);
        return;
      }
      if (json.openid) {
        self.session = {
          openId: json.openid,
          accessToken: json.access_token,
          refreshToken: json.refresh_token
        };
        if (cb) {
          cb(false, json);
        }
        return;
      }
      cb(true, json);
    });
  },
  create: function() {
    return new Oauth();
  }
};

var _ = require("lodash");
_.extend(Oauth.prototype, oauth);

module.exports = new Oauth();

