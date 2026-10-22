
const SwaggerParser = require('@apidevtools/swagger-parser')

async function analyzeDocumentation(docsUrl) {
  const parsed = await SwaggerParser.validate(docsUrl)
  const endpoints = []

  const supportedMethods = [
    'get',
    'post',
    'put',
    'patch',
    'delete',
    'options',
    'head',
    'trace',
  ]

  for (const [path, pathItem] of Object.entries(parsed.paths || {})) {
    for (const method of supportedMethods) {
      const operation = pathItem?.[method]

      if (!operation) continue

      endpoints.push({
        method: method.toUpperCase(),
        path,
        summary: operation.summary || 'No description provided',
        operationId: operation.operationId || null,
      })
    }
  }

  const baseUrl = parsed.servers?.[0]?.url || ''

  return {
    title: parsed.info?.title || 'Untitled API',
    version: parsed.info?.version || 'Unknown',
    baseUrl,
    endpointCount: endpoints.length,
    endpoints,
  }
}

module.exports = { analyzeDocumentation }
