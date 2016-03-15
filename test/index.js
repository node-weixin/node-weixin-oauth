'use strict';

/* eslint camelcase: [2, {properties: "never"}] */

var assert = require('assert');

var nwc = require('node-weixin-config');

var nodeWeixinOauth = require('../');
var app = {
  id: process.env.APP_ID,
  secret: process.env.APP_SECRET,
  token: process.env.APP_TOKEN
};
var urls = {
  access: 'http://oauth.domain.com/weixin/access',
  redirect: 'http://oauth.domain.com/weixin/back',
  success: 'http://oauth.domain.com/weixin/success'
};

nwc.app.init(app);
nwc.urls.oauth.init(urls);

describe('node-weixin-oauth node module', function () {
  it('should be able to build oauth url', function () {
    var params = {
      a: 'a',
      b: 'b',
      c: 123,
      中国: 'nodd'
    };
    var url = nodeWeixinOauth.buildUrl(params);
    var result = 'https://open.weixin.qq.com/connect/oauth2/authorize?a=a&b=b&c=123&%E4%B8%AD%E5%9B%BD=nodd#wechat_redirect';
    console.log(url);
    console.log(result);
    assert.equal(true, url === result);
  });

  it('should create oauth url ', function () {
    var url = nodeWeixinOauth.createURL(app.id, urls.redirect, 'init', 1, 1);
    var genUrl =
      'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' +
      app.id + '&redirect_uri=http%3A%2F%2Foauth.domain.com%2Fweixin%2Fback&response_type=code&scope=snsapi_userinfo&state=init#wechat_redirect';
    assert(genUrl === url);
  });

  it('should be able to send a tokenize request', function (done) {
    var code = 'sosos';
    var params = {
      appid: app.id,
      secret: app.secret,
      grant_type: 'authorization_code',
      code: code
    };
    params.access_token = app.token;
    var nock = require('nock');
    var url = 'https://api.weixin.qq.com';
    // var query = util.toParam(params) + '#wechat_redirect';
    nock(url)
      .post('/sns/oauth2/access_token')
      .query(params)
      .reply(200, params);
    nodeWeixinOauth.authorize(app, code, function (error, body) {
      assert.equal(true, !error);
      assert.equal(true, Boolean(body));
      done();
    });
  });

  it('should fail to send a tokenize request', function (done) {
    var code = 'sosos';
    var params = {
      appid: app.id,
      secret: app.secret,
      grant_type: 'authorization_code',
      code: code
    };
    params.access_token = app.token;
    var nock = require('nock');
    var url = 'https://api.weixin.qq.com';
    nock(url)
      .post('/sns/oauth2/access_token')
      .query(params)
      .reply(500, params);
    nodeWeixinOauth.authorize(app, code, function (error) {
      assert.equal(true, error);
      done();
    });
  });

  it('should be able to refresh', function (done) {
    var refreshToken = 'hsosos';
    var nock = require('nock');
    var params = {
      appId: app.id,
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    };
    var url = 'https://api.weixin.qq.com';

    nock(url)
      .post('/sns/oauth2/refresh_token')
      .query(params)
      .reply(200, params);
    nodeWeixinOauth.refresh(app.id, refreshToken, function (error, body) {
      assert.equal(true, !error);
      assert.equal(true, Boolean(body));
      done();
    });
  });

  it('should be able to request info', function (done) {
    var accessToken = 'hsosos';
    var openId = 'aaaa';
    var nock = require('nock');
    var params = {
      access_token: accessToken,
      openid: openId,
      lang: 'zh_CN'
    };
    var url = 'https://api.weixin.qq.com';

    nock(url)
      .post('/sns/userinfo')
      .query(params)
      .reply(200, params);
    nodeWeixinOauth.profile(openId, accessToken, function (error, body) {
      assert.equal(true, !error);
      assert.equal(true, Boolean(body));
      done();
    });
  });

  it('should be able to profile a user info', function (done) {
    var accessToken = 'aa';
    var openId = 'ssoos';
    var nock = require('nock');

    var params = {
      access_token: accessToken,
      openid: openId,
      lang: 'zh_CN'
    };
    var url = 'https://api.weixin.qq.com';

    nock(url)
      .post('/sns/userinfo')
      .query(params)
      .reply(200, params);
    nodeWeixinOauth.profile(openId, accessToken, function (error, body) {
      assert.equal(true, !error);
      assert.equal(true, Boolean(body));
      done();
    });
  });

  it('should be able to validate a token', function (done) {
    var accessToken = 'aa';
    var openId = 'ssoos';
    var nock = require('nock');

    var params = {
      access_token: accessToken,
      openid: openId
    };
    var url = 'https://api.weixin.qq.com';

    nock(url)
      .post('/sns/auth')
      .query(params)
      .reply(200, {
        errcode: 1
      });
    nodeWeixinOauth.validate(openId, accessToken, function (error) {
      assert.equal(true, !error);
      done();
    });
  });

  it('should fail to validate a token', function (done) {
    var accessToken = 'aa';
    var openId = 'ssoos';
    var nock = require('nock');

    var params = {
      access_token: accessToken,
      openid: openId
    };
    var url = 'https://api.weixin.qq.com';

    nock(url)
      .post('/sns/auth')
      .query(params)
      .reply(200, {
        errcode: 0
      });
    nodeWeixinOauth.validate(openId, accessToken, function (error) {
      assert.equal(true, error);
      done();
    });
  });

  it('should be able to handler success', function (done) {
    var code = 'aaa';
    var nock = require('nock');
    var params = {
      appid: app.id,
      secret: app.secret,
      grant_type: 'authorization_code',
      code: code,
      access_token: app.token
    };
    var url = 'https://api.weixin.qq.com';
    var reply = {
      openid: 'sofdso',
      access_token: 'sossoso',
      refresh_token: 'refresh_token'
    };

    nock(url)
      .post('/sns/oauth2/access_token')
      .query(params)
      .reply(200, reply);
    nodeWeixinOauth.success(app, code, function (error, json) {
      assert.equal(true, !error);
      assert.equal(true, json.openid === reply.openid);
      assert.equal(true, json.access_token === reply.access_token);
      assert.equal(true, json.refresh_token === reply.refresh_token);
      done();
    });
  });

  it('should fail to handler success', function (done) {
    var code = 'aaa';
    var nock = require('nock');
    var params = {
      appid: app.id,
      secret: app.secret,
      grant_type: 'authorization_code',
      code: code,
      access_token: app.token
    };
    var url = 'https://api.weixin.qq.com';
    var reply = {
      openid: 'sofdso',
      access_token: 'sossoso',
      refresh_token: 'refresh_token'
    };

    nock(url)
      .post('/sns/oauth2/access_token')
      .query(params)
      .reply(500, reply);
    nodeWeixinOauth.success(app, code, function (error) {
      assert.equal(true, error);
      done();
    });
  });

  it('should fail to handler success', function (done) {
    var code = 'aaa';
    var nock = require('nock');
    var params = {
      appid: app.id,
      secret: app.secret,
      grant_type: 'authorization_code',
      code: code,
      access_token: app.token
    };
    var url = 'https://api.weixin.qq.com';
    var reply = {
      access_token: 'sossoso',
      refresh_token: 'refresh_token'
    };

    nock(url)
      .post('/sns/oauth2/access_token')
      .query(params)
      .reply(200, reply);
    nodeWeixinOauth.success(app, code, function (error) {
      assert.equal(true, error);
      done();
    });
  });
});
