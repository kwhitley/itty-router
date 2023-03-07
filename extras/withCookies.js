// withCookies - embeds cookies object into the request
export const withCookies = (request) => {
    request.cookies = (request.headers.get('Cookie') || '')
        .split(/;\s*/)
        .map((pair) => pair.split(/=(.+)/))
        .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});
};
//# sourceMappingURL=withCookies.js.map