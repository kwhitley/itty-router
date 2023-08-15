export const text = (message: any, options?: ResponseInit): Response =>
  new Response(String(message), options)
