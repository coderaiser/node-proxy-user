import {Buffer} from 'node:buffer';
import httpProxy from 'http-proxy';

const isFn = (a) => typeof a === 'function';

export const web = (options) => {
    options = options || {};
    const {logout} = options;
    
    if (logout && !isFn(logout))
        throw Error('logout should be function');
    
    return (req, res, next) => {
        const {url} = req;
        const {port} = options;
        const user = options.user || {};
        const target = options.target || 'localhost';
        const username = getNameByUrl(url);
        
        const logout = (req) => {
            options.logout?.(req);
        };
        
        if (username !== user.username)
            return next(userNotFound`${username}`);
        
        if (url === `/${username}/logout`)
            logout(req);
        
        const proxy = httpProxy.createProxyServer({
            target: buildUrl(target, port),
        });
        
        const {password} = user;
        
        if (password)
            req.headers.Authorization = 'Basic ' + Buffer
                .from(`${username}:${password}`)
                .toString('base64');
        
        proxy.web(req, res, next);
        proxy.on('error', next);
    };
};

export const socket = (options) => {
    const {port} = options;
    const target = options.target || 'localhost';
    
    return (req, socket, head) => {
        const proxy = httpProxy.createProxyServer({
            ws: true,
            target: buildUrl(target, port),
        });
        
        proxy.ws(req, socket, head);
        
        return proxy;
    };
};

function getNameByUrl(url) {
    const [, name] = url.match(/^\/(\w*)\/?/) || [];
    
    return name;
}

function buildUrl(target, port) {
    port = !port ? '' : `:${port}`;
    target = `http://${target}${port}`;
    
    return target;
}

function userNotFound(username) {
    const msg = `User with username "${username}" not found`;
    
    return Error(msg);
}
