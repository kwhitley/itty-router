export const text = (message: string, options?: ResponseInit): Response =>
  new Response(message, options)
