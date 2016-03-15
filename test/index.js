'use strict';
var assert = require('assert');
var express = require('express');
var bodyParser = require('body-parser');
var settings = require('node-weixin-settings');
var events = require('node-weixin-events');

var request = require('supertest');

var nodeWeixinAuth = require('../');

var callbacks = [];

var app = {
  id: process.env.APP_ID,
  secret: process.env.APP_SECRET,
  token: process.env.APP_TOKEN
};

var server = express();
server.use(bodyParser.urlencoded({
  extended: false
}));
server.use(bodyParser.json());
server.post('/weixin', function (req, res) {
  var data = nodeWeixinAuth.extract(req.body);

  nodeWeixinAuth.ack(app.token, data, function (error, data) {
    if (!error) {
      res.send(data);
      return;
    }
    switch (error) {
      case 1:
        res.send('INPUT_INVALID');
        break;
      case 2:
        res.send('SIGNATURE_NOT_MATCH');
        break;
      default:
        res.send('UNKNOWN_ERROR');
        break;
    }
  });
});

server.post('/weixinfail', function (req, res) {
  nodeWeixinAuth.ack(app.token, {}, function (error, data) {
    if (!error) {
      res.send(data);
      return;
    }
    switch (error) {
      case 1:
        res.send('INPUT_INVALID');
        break;
      case 2:
        res.send('SIGNATURE_NOT_MATCH');
        break;
      default:
        res.send('UNKNOWN_ERROR');
        break;
    }
  });
});

server.post('/weixinfail2', function (req, res) {
  var data = nodeWeixinAuth.extract(req.body);

  nodeWeixinAuth.ack('sdfsfdfds', data, function (error, data) {
    if (!error) {
      res.send(data);
      return;
    }
    switch (error) {
      case 1:
        res.send('INPUT_INVALID');
        break;
      case 2:
        res.send('SIGNATURE_NOT_MATCH');
        break;
      default:
        res.send('UNKNOWN_ERROR');
        break;
    }
  });
});

events.on(events.ACCESS_TOKEN_NOTIFY, function (eventApp, eventAuth) {
  settings.get(app.id, 'auth', function (auth) {
    assert.deepEqual(eventApp, app);
    assert.equal(true, eventAuth.accessToken === auth.accessToken);
    callbacks.push([eventApp, eventAuth]);
  });
});

describe('node-weixin-auth node module', function () {
  it('should generate signature and check it', function () {
    var timestamp = 1439402998232;
    var nonce = 'wo1cn2NJPRnZWiTuQW8zQ6Mzn4qQ3kWi';
    var token = 'sososso';
    var sign = nodeWeixinAuth.generateSignature(token, timestamp, nonce);
    assert.equal(true, sign ===
      '886a1db814d97a26c081a9814a47bf0b9ff1da9c');
  });

  it('should check failed', function () {
    var timestamp = 1439402998232;
    var nonce = 'wo1cn2NJPRnZWiTuQW8zQ6Mzn4qQ3kWi';
    var token = 'sososso';
    var result = nodeWeixinAuth.check(token, 'soso', timestamp, nonce);
    assert.equal(true, !result);
  });

  it('should be able to get a token', function (done) {
    nodeWeixinAuth.tokenize(app, function (error, json) {
      settings.get(app.id, 'auth', function (auth) {
        assert.equal(true, !error);
        assert.equal(true, json.access_token.length > 1);
        assert.equal(true, json.expires_in <= 7200);
        assert.equal(true, json.expires_in >= 7000);
        assert.equal(true, json.access_token === auth.accessToken);
        done();
      });
    });
  });
  it('should be able to determine to request within expiration', function (done) {
    nodeWeixinAuth.determine(app, function (passed) {
      var timeOut = function () {
        nodeWeixinAuth.determine(app, function (passed) {
          assert.equal(true, passed);
          done();
        });
      };
      settings.get(app.id, 'auth', function (auth) {
        assert.equal(true, auth.lastTime !== null);
        assert.equal(true, !passed);
        setTimeout(timeOut, 1000);
      });
    });
  });
  it('should be able to determine not to request within expiration',
    function (done) {
      // Change access token expiration to 7200 for testing purpose
      nodeWeixinAuth.ACCESS_TOKEN_EXP = 700;
      setTimeout(function () {
        nodeWeixinAuth.determine(app, function (passed) {
          assert.equal(true, !passed);
          done();
        });
      }, 1000);
    });
  it('should be able to get a token and checkit', function (done) {
    nodeWeixinAuth.tokenize(app, function (error, json) {
      assert.equal(true, !error);
      assert.equal(true, json.access_token.length > 1);
      assert.equal(true, json.expires_in <= 7200);
      assert.equal(true, json.expires_in >= 7000);
      done();
    });
  });
  it('should be able to auth weixin signature', function (done) {
    var time = new Date().getTime();
    var nonce = 'nonce';
    var signature = nodeWeixinAuth.generateSignature(app.token, time,
      nonce);
    var echostr = 'Hello world!';
    var data = {
      signature: signature,
      timestamp: time,
      nonce: nonce,
      echostr: echostr
    };
    request(server).post('/weixin').send(data).expect(200).expect(
      echostr).end(done);
  });

  it('should be failed to auth weixin signature', function (done) {
    var time = new Date().getTime();
    var nonce = 'nonce';
    var signature = nodeWeixinAuth.generateSignature(app.token, time,
      nonce);
    var data = {
      signature: signature,
      timestamp: time,
      nonce: nonce
    };
    request(server).post('/weixin').send(data).expect(200).end(done);
  });

  it('should be fail to auth weixin signature', function (done) {
    var time = new Date().getTime();
    var nonce = 'nonce';
    var signature = nodeWeixinAuth.generateSignature(app.token, time,
      nonce);
    var echostr = 'Hello world!';
    var data = {
      signature: signature,
      timestamp: time,
      nonce: nonce,
      echostr: echostr
    };
    request(server).post('/weixinfail').send(data).expect(200).expect(
      'UNKNOWN_ERROR').end(done);
  });

  it('should be fail to auth weixin signature 2', function (done) {
    var time = new Date().getTime();
    var nonce = 'nonce';
    var signature = nodeWeixinAuth.generateSignature(app.token, time,
      nonce);
    var echostr = 'Hello world!';
    var data = {
      signature: signature,
      timestamp: time,
      nonce: nonce,
      echostr: echostr
    };
    request(server).post('/weixinfail2').send(data).expect(200).expect(
      'UNKNOWN_ERROR').end(done);
  });

  it('should be able to get server ips', function (done) {
    nodeWeixinAuth.ips(app, function (error, data) {
      assert.equal(true, !error);
      assert.equal(true, data.ip_list.length > 1);
      done();
    });
  });

  it('should be able to get notified when access Token updated', function (done) {
    settings.get(app.id, 'auth', function (auth) {
      for (var i = 0; i < callbacks.length; i++) {
        var callback = callbacks[i];
        var appInfo = callback[0];
        var authInfo = callback[1];
        assert.equal(true, appInfo.id === app.id);
        assert.equal(true, appInfo.token === app.token);
        assert.equal(true, appInfo.secret === app.secret);
        assert.equal(true, authInfo.accessToken === auth.accessToken);
      }
      assert.equal(true, callbacks.length >= 1);
      done();
    });
  });
});
