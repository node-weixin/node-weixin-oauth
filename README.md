# node-weixin-auth [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]


微信服务器Auth模块是([node-weixin-api](https://github.com/node-weixin/node-weixin-api) 或者 [node-weixin-express](https://github.com/node-weixin/node-weixin-express))的一个子项目。
它提供了几个重要的方法

  tokenize： 用于跟服务器验证配置信息

  determine:  用于自动tokenize所有的api请求，而不需要手动在超时时重新请求

  ips:  获取服务IP列表

  ack: 用于服务器有效性验证

交流QQ群: 39287176


## Installation

```sh
$ npm install --save node-weixin-auth
```


## Usage

```js


var nodeWeixinAuth = require('node-weixin-auth');

var app = {
  id: '',
  secret: '',
  token: ''
};

//手动得到accessToken
nodeWeixinAuth.tokenize(app, function (error, json) {
  var accessToken = json.access_token;
});

//自动获得accessToken，并发送需要accessToken的请求
nodeWeixinAuth.determine(app, function () {
  //这里添加发送请求的代码
});

//获取服务器IP
nodeWeixinAuth.ips(app, function (error, data) {
  //error == false
  //data.ip_list获取IP列表
});


//与微信对接服务器的验证
var errors = require('web-errors').errors;
var request = require('supertest');
var express = require('express');
var bodyParser = require('body-parser');

var server = express();

server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json());

server.post('/weixin/ack', function (req, res) {
  var data = nodeWeixinAuth.extract(req.body);
  nodeWeixinAuth.ack(app.token, data, function (error, data) {
    if (!error) {
      res.send(data);
      return;
    }
    switch (error) {
      case 1:
        res.send(errors.INPUT_INVALID);
        break;
      case 2:
        res.send(errors.SIGNATURE_NOT_MATCH);
        break;
      default:
        res.send(errors.UNKNOWN_ERROR);
        break;
    }
  });
});

```

## License

Apache-2.0 © [calidion](calidion.github.io)


[npm-image]: https://badge.fury.io/js/node-weixin-auth.svg
[npm-url]: https://npmjs.org/package/node-weixin-auth
[travis-image]: https://travis-ci.org/node-weixin/node-weixin-auth.svg?branch=master
[travis-url]: https://travis-ci.org/node-weixin/node-weixin-auth
[daviddm-image]: https://david-dm.org/node-weixin/node-weixin-auth.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/node-weixin/node-weixin-auth
[coveralls-image]: https://coveralls.io/repos/node-weixin/node-weixin-auth/badge.svg
[coveralls-url]: https://coveralls.io/r/node-weixin/node-weixin-auth
