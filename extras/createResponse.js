export const createResponse = (format = 'text/plain; charset=utf-8', transform) => (body, options = {}) => {
    const { headers = {}, ...rest } = options;
    if (body?.constructor.name === 'Response')
        return body;
    return new Response(transform ? transform(body) : body, {
        headers: {
            'content-type': format,
            ...headers,
        },
        ...rest,
    });
};
//# sourceMappingURL=createResponse.js.map