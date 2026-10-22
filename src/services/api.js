
const API_BASE_URL = ''

export async function analyzeDocumentation(url) {
  const response = await fetch(`${API_BASE_URL}/docs/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })

  if (!response.ok) {
    throw new Error('Failed to analyze API documentation.')
  }

  return response.json()
}
