export const withParams = (request) => {
    request.proxy = new Proxy(request.proxy || request, {
        get: (obj, prop) => {
            if (obj[prop] !== undefined)
                return obj[prop];
            return obj?.params?.[prop];
        }
    });
};
//# sourceMappingURL=withParams.js.map