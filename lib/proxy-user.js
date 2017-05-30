'use strict';

const httpProxy = require('http-proxy');

module.exports.web = (options) => {
    options = options || {};
    const logout = options.logout;
    
    if (logout && typeof logout !== 'function')
        throw Error('logout should be function');
    
    return (req, res, next) => {
        const url = req.url;
        const port = options.port;
        const user = options.user || {};
        const target = options.target || 'localhost';
        const username = getNameByUrl(url);
        const logout = (req) => {
            if (typeof options.logout === 'function')
                options.logout(req);
        }
        
        if (username !== user.username)
            return next(userNotFound`${username}`);
        
        if (url === `/${username}/logout`)
            logout(req);
        
        const proxy = httpProxy.createProxyServer({
            target: buildUrl(target, port)
        });
        
        const password = user.password;
        
        if (password)
            req.headers.Authorization = 'Basic ' + Buffer(`${username}:${password}`).toString('base64');
        
        proxy.web(req, res, next);
        proxy.on('error', next);
    };
};

module.exports.socket = options => {
    const port = options.port;
    const target = options.target || 'localhost';
    
    return (req, socket, head) => {
        const proxy = httpProxy.createProxyServer({
            ws: true,
            target: buildUrl(target, port)
        });
        
        proxy.ws(req, socket, head);
        
        return proxy;
    };
};

function getNameByUrl(url) {
    const match = url.match(/^\/(\w*)\/?/) || [];
    const name = match[1];
    
    return name;
}

function buildUrl(target, port) {
    port    = !port ? '' : ':' + port;
    target     = `http://${target}${port}`;
    
    return target;
}

function userNotFound(username) {
    const msg = `User with username "${username}" not found`;
    
    return Error(msg);
}

