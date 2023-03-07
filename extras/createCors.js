export const createCors = (options = {}) => {
    const { origins = ['*'], maxAge, methods = ['GET'], headers = {}, } = options;
    let allowOrigin;
    const responseHeaders = {
        'content-type': 'application/json',
        'Access-Control-Allow-Methods': methods.join(', '),
        ...headers,
    };
    if (maxAge) {
        responseHeaders['Access-Control-Max-Age'] = maxAge;
    }
    const preflight = (r) => {
        const useMethods = [...new Set(['OPTIONS', ...methods])];
        const origin = r.headers.get('origin') || '';
        // set allowOrigin globally
        allowOrigin = (origins.includes(origin) || origins.includes('*')) &&
            { 'Access-Control-Allow-Origin': origin };
        if (r.method === 'OPTIONS') {
            // Make sure the necessary headers are present
            // for this to be a valid pre-flight request
            if (r.headers.get('Origin') !== null &&
                r.headers.get('Access-Control-Request-Method') !== null &&
                r.headers.get('Access-Control-Request-Headers') !== null) {
                // Handle CORS pre-flight request.
                // If you want to check or reject the requested method + headers
                // you can do that here.
                const headers = {
                    ...responseHeaders,
                    'Access-Control-Allow-Methods': useMethods.join(', '),
                    'Access-Control-Allow-Headers': r.headers.get('Access-Control-Request-Headers'),
                    ...allowOrigin,
                };
                return new Response(null, { headers });
            }
            // Handle standard OPTIONS request.
            // If you want to allow other HTTP Methods, you can do that here.
            return new Response(null, {
                headers: {
                    Allow: useMethods.join(', '),
                },
            });
        }
    };
    const corsify = (response) => {
        if (!response) {
            throw new Error('No fetch handler responded and no upstream to proxy to specified.');
        }
        const { headers, status, body } = response;
        // bypass for protocol shifts or redirects
        if ([101, 301, 302, 308].includes(status))
            return response;
        const existingHeaders = Object.fromEntries(headers);
        // terminate immediately if CORS already set
        if (existingHeaders['access-control-allow-origin'])
            return response;
        return new Response(body, {
            status,
            headers: {
                ...existingHeaders,
                ...responseHeaders,
                ...allowOrigin,
                'content-type': headers.get('content-type'),
            },
        });
    };
    return {
        corsify,
        preflight,
    };
};
//# sourceMappingURL=createCors.js.map