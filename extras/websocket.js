import { createResponse } from './createResponse';
export const websocket = (client, options = {}) => createResponse()(null, {
    status: 101,
    webSocket: client,
    ...options,
});
//# sourceMappingURL=websocket.js.map