#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]

> Weixin Oauth module for node


## Install

```sh
$ npm install --save node-weixin-oauth
```


## Usage

```js
var nwo = require('node-weixin-oauth');

//第一步：创建用户通过微信可访问的URL
nwo.createURL()
//第二步：在重定向函数里处理调用信息
nwo.authorize()
//第三步：刷新access token(可选)
nwo.refresh()
//第四步：获取用户信息(scope为 snsapi_userinfo时有效)
nwo.profile()
//第五步：检验token有效性(可选)
nwo.validate()

```

>实际的调用过程参考node-weixin-express


## License

MIT © [JSSDKCN](blog.3gcnbeta.com)


[npm-image]: https://badge.fury.io/js/node-weixin-oauth.svg
[npm-url]: https://npmjs.org/package/node-weixin-oauth
[travis-image]: https://travis-ci.org/JSSDKCN/node-weixin-oauth.svg?branch=master
[travis-url]: https://travis-ci.org/JSSDKCN/node-weixin-oauth
[daviddm-image]: https://david-dm.org/JSSDKCN/node-weixin-oauth.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/JSSDKCN/node-weixin-oauth
