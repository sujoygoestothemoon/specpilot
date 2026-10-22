
const express = require('express')
const cors = require('cors')
require('dotenv').config()

const { generateCollection } = require('./services/collectionGenerator')
const { analyzeDocumentation } = require('./services/docsAnalyzer')

const app = express()
const PORT = process.env.PORT || 3000

// Allow the Vite frontend to communicate with the backend
app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  })
)

app.use(express.json())

// Check whether the backend is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'SpecPilot backend is running!',
  })
})

// Analyze OpenAPI documentation
app.post('/api/docs/analyze', async (req, res) => {
  const { url } = req.body || {}

  console.log('Documentation analysis requested:', url)

  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({
      error: 'Please provide an OpenAPI documentation URL.',
    })
  }

  try {
    const result = await analyzeDocumentation(url.trim())
    return res.json(result)
  } catch (error) {
    console.error('Documentation analysis failed:', error.message)

    return res.status(400).json({
      error: 'Could not read valid OpenAPI documentation.',
      details: error.message,
    })
  }
})

// Generate a Postman collection
app.post('/api/docs/collection', async (req, res) => {
  const { url } = req.body || {}

  console.log('Collection generation requested:', url)

  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({
      error: 'Please provide an OpenAPI documentation URL.',
    })
  }

  try {
    const collection = await generateCollection(url.trim())

    // Log one generated request URL to help debug URL generation
    const firstItem = collection.item?.[0]
    const firstRequestUrl = firstItem?.request?.url?.raw

    console.log('Generated request count:', collection.item?.length || 0)
    console.log('First generated request URL:', firstRequestUrl)

    return res.json(collection)
  } catch (error) {
    console.error('Collection generation failed:', error.message)

    return res.status(400).json({
      error: 'Could not generate a collection from this specification.',
      details: error.message,
    })
  }
})

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.path}`,
  })
})

// Start the backend server
app.listen(PORT, () => {
  console.log(`SpecPilot backend running at http://localhost:${PORT}`)
})
