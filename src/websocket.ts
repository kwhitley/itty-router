import { createResponse } from './createResponse'

export const websocket = (client: WebSocket, options: object = {}) =>
  createResponse()(null, {
    status: 101,
    webSocket: client,
    ...options,
  })
