#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Weixin Oauth module for node


## Install

```sh
$ npm install --save node-weixin-oauth
```


## Usage

```js
var nodeWeixinOauth = require('node-weixin-oauth');

var app = {
  id: 'id',
  secret: 'secret',
  token: 'c9be82f386afdb214b0285e96cb9cb82'
};
var urls = {
  redirect: 'http://oauth.domain.com/weixin/back'
};
nodeWeixinOauth.initApp(app);
nodeWeixinOauth.initUrl(urls);


nodeWeixinOauth.profile(req, res, function(info) {
  console.log(info);
});
```


## License

MIT © [JSSDKCN](blog.3gcnbeta.com)


[npm-image]: https://badge.fury.io/js/node-weixin-oauth.svg
[npm-url]: https://npmjs.org/package/node-weixin-oauth
[travis-image]: https://travis-ci.org/JSSDKCN/node-weixin-oauth.svg?branch=master
[travis-url]: https://travis-ci.org/JSSDKCN/node-weixin-oauth
[daviddm-image]: https://david-dm.org/JSSDKCN/node-weixin-oauth.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/JSSDKCN/node-weixin-oauth
