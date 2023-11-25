export const status = (status: number, options?: ResponseInit): Response =>
  new Response(null, { ...options, status })
