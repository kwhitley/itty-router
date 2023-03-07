// withContent - embeds any request body as request.content
export const withContent = async (request) => {
    let contentType = request.headers.get('content-type');
    if (contentType?.includes('json'))
        request.content = await request.json();
};
//# sourceMappingURL=withContent.js.map