#  [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url]  [![Coveralls Status][coveralls-image]][coveralls-url]

> 微信 Oauth 模块，用于验证微信用户，并且获取用户信息


## 说明

这个项目是
([node-weixin-api](https://github.com/node-weixin/node-weixin-api) 
或者
[node-weixin-express](https://github.com/node-weixin/node-weixin-express))
的一个子项目。

作用是完成用户的Oauth验证。

微信Oauth模块与Auth模块在node-weixin里是两个不同的模块。
  1. Oauth主要用于用户身份的验证。
  2. Auth主要用于应用服务器的验证。即运行着auth模块的用户服务器被腾讯官方的微信服务器所验证。
  
Oauth的实现主要分成以下几个部分。
  1. 重新向到验证服务，并且提交返回URL
  2. 在验证服务器输入用户登录信息(在微信中，由于用户已经登录，所以不需要这个过程)
  3. 成功则返回到提交的URL,并提交code给用户的应用服务器。
  4. 用户的应用服务器根据code,结合自己的appid, appsecret向微信服务器请求acess token, refresh token, openid等

交流QQ群: 39287176

注:

 [node-weixin-express](https://github.com/node-weixin/node-weixin-express)是基于node-weixin-*的服务器端参考实现。

 [node-weixin-api](https://github.com/node-weixin/node-weixin-api)是基于node-weixin-*的API接口SDK。

 它们都是由下列子项目组合而成:

 1. [node-weixin-config](https://github.com/node-weixin/node-weixin-config)
    用于微信配置信息的校验

 2. [node-weixin-auth](https://github.com/node-weixin/node-weixin-auth)
    用于与微信服务器握手检验

 3. [node-weixin-util](https://github.com/node-weixin/node-weixin-util)
    一些常用的微信请求，加密，解密，检验的功能与处理

 4. [node-weixin-request](https://github.com/node-weixin/node-weixin-request)
    微信的各类服务的HTTP请求的抽象集合

 5. [node-weixin-oauth](https://github.com/node-weixin/node-weixin-oauth)
    微信OAuth相关的操作

 6. [node-weixin-pay](https://github.com/node-weixin/node-weixin-pay)
    微信支付的服务器接口

 7. [node-weixin-jssdk](https://github.com/node-weixin/node-weixin-jssdk)
    微信JSSDK相关的服务器接口

 8. [node-weixin-menu](https://github.com/node-weixin/node-weixin-menu)
    微信菜单相关的操作与命令
    
 9. [node-weixin-user](https://github.com/node-weixin/node-weixin-user)
    微信用户API
    
10. [node-weixin-media](https://github.com/node-weixin/node-weixin-media)
    微信多媒体API

11. [node-weixin-qrcode](https://github.com/node-weixin/node-weixin-qrcode)
    微信二维码API


## 安装

```sh
$ npm install --save node-weixin-oauth
```


## 使用

1、得到oauth对象

```js
var nwo = require('node-weixin-oauth');
```
2、创建用户通过微信可访问的URL
  - state是随意表示当前程序状态的值
  - userInfo: 0 表示最少的基本信息， 1表示获取更多用户信息
  - 创建好URL后，需要将用户引导到创建的地址进行校验

```js
var url = nwo.createURL(appId, redirectUri, state, userInfo)
res.redirect(url);
```

3、在重定向函数里处理调用信息
 在校验用户成功后，微信会将用户带回到redirectUri指定的地址进行下一步操作
 在redirectUri里需要使用success来对返回的code进行校验，并获取以下三样数据：
  1. 微信服务器的access token
  2. 微信服务器的refresh token
  3. 用户的openid
 可以通过nwo.session访问，也可以通过返回的body访问。
 nwo.session里的数据结构如下：

```js
        {
        oauth.session = {
          openId: json.openid,
          accessToken: json.access_token,
          refreshToken: json.refresh_token
        };
```

      调用如下:
*   其中
    - app:是node-weixin-config通过app.init校验的数据
    - code:服务器返回校验数据

```js
nwo.success(app, code, function(error, body) {
  if (!error) {
    var accessToken = body.acess_token;
    var refreshToken = body.refresh_token;
  }
});
```

4、获取用户信息(可选)
  当scope为1时，我们还可以进一步的获取用户信息
 
 
```js
nwo.profile(openId, accessToken, function(error, body) {
});
```
5、刷新access token(可选)

```js
nwo.refresh(appId, refreshToken, function(error, body) {
});
```

6、检验token有效性(可选)

```js
nwo.validate(openid, refreshToken, function(error, body) {
});
```

>实际的调用过程参考node-weixin-express


## License

MIT © [node-weixin](www.node-weixin.com)


[npm-image]: https://badge.fury.io/js/node-weixin-oauth.svg
[npm-url]: https://npmjs.org/package/node-weixin-oauth
[travis-image]: https://travis-ci.org/node-weixin/node-weixin-oauth.svg?branch=master
[travis-url]: https://travis-ci.org/node-weixin/node-weixin-oauth
[daviddm-image]: https://david-dm.org/node-weixin/node-weixin-oauth.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/node-weixin/node-weixin-oauth
[coveralls-image]: https://coveralls.io/repos/node-weixin/node-weixin-oauth/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/node-weixin/node-weixin-oauth?branch=master
