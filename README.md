# proxy-user

Proxy requests according to username.

## Install

`npm i proxy-user --save`

## API

```js
let proxyUser = require('proxy-user');
```

### proxyUser.web(options)
Proxy http requests.
`options` could contain:
- `logout` function on `/[username]/logout`
- `port` to redirect to
- `user` data (`username`, `password`)
- `target` url to redirect to

```js
proxyUser.web({
    logout: req => console.log('logout'),
    port: 80,           // default
    target: 'localhost',// default
    user: {
        username: 'coderaiser',
        password: 'hello'
    }
});
```

### proxyUser.web(options)
Proxy socket requests.
`options` could contain:
- `port` to redirect to
- `user` data (`username`, `password`)
- `target` url to redirect to

```js
proxy.socket({
    port: 80            // default
    target: 'localhost',// default
})
```

## Example
`proxy-user` could be used as [express](http://expressjs.com) middleware.

```js
let http    = require('http'),
    app     = require('express')(),
    server  = http.createServer(app);

const PORT = 31337;

server.on('upgrade', proxy.socket());

app.use(proxyUser.web({
    username: 'coderaiser',
    password: 'hello'
});

server.listen(PORT, () => {
    console.log('url: http://%s:%d', 'localhost', PORT);
});
```

## License

MIT
