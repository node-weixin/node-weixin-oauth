'use strict';
/* eslint camelcase: [2, {properties: "never"}] */

var crypto = require('crypto');
var restful = require('node-weixin-request');
var util = require('node-weixin-util');
var validator = require('node-form-validator');
var emitter = require('node-weixin-events');
var settings = require('node-weixin-settings');

module.exports = {
  ACCESS_TOKEN_EXP: 7200 * 1000,
  TIME_GAP: 500,
  generateSignature: function (token, timestamp, nonce) {
    var mixes = [token, timestamp, nonce];
    mixes.sort();
    var str = mixes.join('');
    var sha1 = crypto.createHash('sha1');
    sha1.update(str);
    return sha1.digest('hex');
  },
  check: function (token, signature, timestamp, nonce) {
    var newSignature = this.generateSignature(token, timestamp, nonce);
    if (newSignature === signature) {
      return true;
    }
    return false;
  },
  determine: function (app, cb) {
    var self = this;
    settings.get(app.id, 'auth', function (auth) {
      var now = new Date().getTime();
      auth = auth || {};
      if (auth.lastTime && ((now - auth.lastTime) < (self.ACCESS_TOKEN_EXP - self.TIME_GAP))) {
        cb(true);
        return;
      }
      auth.lastTime = now;
      settings.set(app.id, 'auth', auth, function () {
        self.tokenize(app, function () {
          cb(false);
        });
      });
    });
  },
  tokenize: function (app, cb) {
    var baseUrl = 'https://api.weixin.qq.com/cgi-bin/';
    var params = {
      grant_type: 'client_credential',
      appid: app.id,
      secret: app.secret
    };
    var url = baseUrl + 'token?' + util.toParam(params);
    restful.request(url, null, function (error, json) {
      if (error) {
        cb(error, json);
        return;
      }
      settings.get(app.id, 'auth', function (auth) {
        auth = auth || {};
        auth.accessToken = json.access_token;
        settings.set(app.id, 'auth', auth, function () {
          emitter.emit(emitter.ACCESS_TOKEN_NOTIFY, [app, auth]);
          cb(error, json);
        });
      });
    });
  },
  extract: function (data) {
    var conf = require('./validations/ack');
    return validator.json.extract(data, conf);
  },
  ack: function (token, data, cb) {
    var error = {};
    var conf = require('./validations/ack');
    if (!validator.validate(data, conf, error)) {
      cb(true, error);
      return;
    }
    var check = this.check(token, data.signature, data.timestamp, data.nonce);
    if (check) {
      cb(false, data.echostr);
    } else {
      cb(true, 2);
    }
  },
  ips: function (app, cb) {
    this.determine(app, function () {
      settings.get(app.id, 'auth', function (auth) {
        var url = 'https://api.weixin.qq.com/cgi-bin/getcallbackip?' + util.toParam({
          access_token: auth.accessToken
        });
        restful.json(url, null, cb);
      });
    });
  }
  // tokenized: require('./lib/tokenized')
};
