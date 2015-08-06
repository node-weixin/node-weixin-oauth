'use strict';
var assert = require('assert');
var nodeWeixinOauth = require('../');
var app = {
  id: 'wx0201661ce8fb3e11',
  secret: '483585a84eacd76693855485cb88dc8a',
  token: 'c9be82f386afdb214b0285e96cb9cb82'
};
var urls = {
  redirect: 'http://oauth.domain.com/weixin/back'
};
nodeWeixinOauth.initApp(app);
nodeWeixinOauth.initUrl(urls);

describe('node-weixin-oauth node module', function () {
  it('should create oauth url ', function () {
    var url = nodeWeixinOauth.createURL('init', 1, 1);
    var genUrl =
      'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx0201661ce8fb3e11&redirect_uri=http%3A%2F%2Foauth.domain.com%2Fweixin%2Fback&response_type=code&scope=snsapi_userinfo&state=init#wechat_redirect';
    assert(genUrl === url);
  });
});
