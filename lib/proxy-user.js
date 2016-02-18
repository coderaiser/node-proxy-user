'use strict';

let httpProxy   = require('http-proxy');

module.exports.web = (options) => {
    options = options || {};
    const logout = options.logout;
    
    if (logout && typeof logout !== 'function')
        throw Error('logout should be function');
    
    return (req, res, next) => {
        const url       = req.url;
        const port      = options.port;
        const user      = options.user || {};
        const target    = options.target || 'localhost';
        const username  = getNameByUrl(url);
        
        if (username !== user.username) {
            let error = Error(`User with username "${username}" not found`);
            return next(error);
        } else {
            const isLogout  = typeof options.logout === 'function';
            
            if (url === `/${username}/logout` && isLogout)  {
                options.logout(req);
            }
            
            let proxy = httpProxy.createProxyServer({
                target: buildUrl(target, port)
            });
            
            const password  = user.password;
            
            if (password)
                req.headers.Authorization = 'Basic ' + Buffer(`${username}:${password}`).toString('base64');
            
            proxy.web(req, res, next);
        }
    };
};

module.exports.socket = options => {
    const port = options.port;
    const target = options.target || 'localhost';
    
    return (req, socket, head) => {
        let proxy = httpProxy.createProxyServer({
            ws: true,
            target: buildUrl(target, port)
        });
        
        proxy.ws(req, socket, head);
    };
};

function getNameByUrl(url) {
    let match = url.match(/^\/(\w*)\/?/) || [];
    let name = match[1];
    
    return name;
}

function buildUrl(target, port) {
    port    = !port ? '' : ':' + port;
    target     = `http://${target}${port}`;
    
    return target;
}
