// withContent - embeds any request body as request.content
const withContent = async request => {
  let contentType = request.headers.get('content-type')
  request.content = undefined

  try {
    if (contentType) {
      if (contentType.includes('application/json')) {
        request.content = await request.json()
      }
    }
  } catch (err) {} // silently fail on error
}

module.exports = { withContent }
