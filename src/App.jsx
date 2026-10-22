
import { useState } from 'react'
import {
  Workflow,
  Sparkles,
  FileSearch,
  FileJson,
  ShieldCheck,
  Search,
  ArrowRight,
  Bot,
  Clock3,
} from 'lucide-react'
import './App.css'

const demoEndpoints = [
  {
    method: 'GET',
    path: '/pet/findByStatus',
    description: 'Find pets by status',
  },
  {
    method: 'GET',
    path: '/pet/{petId}',
    description: 'Get pet by ID',
  },
  {
    method: 'POST',
    path: '/pet',
    description: 'Add a new pet',
  },
]

function App() {
  const [docsUrl, setDocsUrl] = useState(
    'https://petstore3.swagger.io/api/v3/openapi.json'
  )
  const [search, setSearch] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [approved, setApproved] = useState(false)
  const [endpoints, setEndpoints] = useState(demoEndpoints)
  const [apiInfo, setApiInfo] = useState(null)
  const [apiError, setApiError] = useState('')
  const [collectionReady, setCollectionReady] = useState(false)

  const filteredEndpoints = endpoints.filter((endpoint) =>
    `${endpoint.method} ${endpoint.path} ${endpoint.description}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  let documentationHost = 'Not available'

  try {
    documentationHost = new URL(docsUrl).hostname
  } catch {
    documentationHost = 'Invalid URL'
  }

  async function analyzeDocs(event) {
    event.preventDefault()

    setAnalyzing(true)
    setAnalyzed(false)
    setApproved(false)
    setCollectionReady(false)
    setApiError('')
    setApiInfo(null)
    setEndpoints([])

    try {
      const response = await fetch(
        'http://localhost:3000/api/docs/analyze',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: docsUrl.trim() }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not analyze the documentation.'
        )
      }

      if (!Array.isArray(data.endpoints)) {
        throw new Error('The backend returned an invalid endpoint list.')
      }

      const discoveredEndpoints = data.endpoints.map((endpoint) => ({
        ...endpoint,
        description: endpoint.summary || 'No description provided',
      }))

      setApiInfo(data)
      setEndpoints(discoveredEndpoints)
      setAnalyzed(true)
    } catch (error) {
      setApiError(
        error.message || 'Could not connect to the SpecPilot backend.'
      )
    } finally {
      setAnalyzing(false)
    }
  }

  async function generatePostmanCollection() {
    setGenerating(true)
    setApiError('')
    setCollectionReady(false)

    try {
      const response = await fetch(
        'http://localhost:3000/api/docs/collection',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: docsUrl.trim() }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not generate the Postman collection.'
        )
      }

      if (!data.info || !Array.isArray(data.item)) {
        throw new Error('The backend returned an invalid collection.')
      }

      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: 'application/json' }
      )

      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')

      link.href = downloadUrl
      link.download = 'specpilot-collection.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(downloadUrl)

      setCollectionReady(true)
    } catch (error) {
      setApiError(
        error.message || 'Could not connect to the backend.'
      )
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-icon">
            <Workflow size={23} />
          </span>
          <span>
            SpecPilot
            <small>AGENTIC API ENGINEERING</small>
          </span>
        </a>

        <div className="nav-label">WORKSPACE</div>

        <button className="nav-item active" type="button">
          <Workflow size={18} />
          API Agent
        </button>

        <button className="nav-item" type="button">
          <FileJson size={18} />
          Collections
        </button>

        <button className="nav-item" type="button">
          <Clock3 size={18} />
          Test runs
        </button>

        <div className="sidebar-bottom">
          <span className="status-dot" />
          Frontend prototype
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>
            Workspace / <span className="muted">API Agent</span>
          </span>
          <span className="prototype-badge">PROTOTYPE</span>
        </header>

        <section className="hero">
          <div className="eyebrow">
            <Sparkles size={15} />
            YOUR API TESTING AGENT
          </div>

          <h1>
            From API docs to
            <br />
            tested requests<span>.</span>
          </h1>

          <p>
            Give your agent an API specification. Review its plan,
            approve execution, and inspect the results.
          </p>

          <form className="docs-form" onSubmit={analyzeDocs}>
            <label htmlFor="docsUrl">
              OPENAPI SPECIFICATION URL
            </label>

            <div className="url-row">
              <input
                id="docsUrl"
                type="url"
                value={docsUrl}
                onChange={(event) => setDocsUrl(event.target.value)}
                placeholder="https://example.com/openapi.json"
                required
              />

              <button
                className="primary-button"
                type="submit"
                disabled={analyzing || generating}
              >
                <Sparkles size={16} />
                {analyzing ? 'Analyzing...' : 'Analyze docs'}
              </button>
            </div>

            <div className="form-hint">
              <ShieldCheck size={14} />
              Connected to the SpecPilot analysis backend.
            </div>
          </form>

          {apiError && (
            <p className="error-message" role="alert">
              {apiError}
            </p>
          )}

          {apiInfo && (
            <div className="analysis-result">
              <h3>{apiInfo.title}</h3>
              <p>
                Version: {apiInfo.version} · {apiInfo.endpointCount}{' '}
                endpoints discovered
              </p>
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-heading">
            <div>
              <h2>Agent workflow</h2>
              <p>Track each stage from documentation to validation.</p>
            </div>

            <span className="step-count">
              {approved
                ? 'STEP 3 OF 3'
                : analyzed
                  ? 'STEP 2 OF 3'
                  : 'STEP 1 OF 3'}
            </span>
          </div>

          <div className="workflow-grid">
            <article
              className={`workflow-card ${!analyzed ? 'current' : ''}`}
            >
              <div className="card-top">
                <span className="workflow-icon">
                  <FileSearch size={20} />
                </span>
                <span
                  className={`step-status ${analyzed ? 'complete' : ''}`}
                >
                  {analyzed ? 'Complete' : 'Current'}
                </span>
              </div>
              <div className="step-number">01</div>
              <h3>Analyze documentation</h3>
              <p>Discover endpoints, parameters and schemas.</p>
            </article>

            <article
              className={`workflow-card ${
                analyzed && !approved ? 'current' : ''
              }`}
            >
              <div className="card-top">
                <span className="workflow-icon">
                  <FileJson size={20} />
                </span>
                <span className="step-status">
                  {collectionReady
                    ? 'Collection generated'
                    : analyzed
                      ? 'Ready for review'
                      : 'Pending'}
                </span>
              </div>
              <div className="step-number">02</div>
              <h3>Generate collection</h3>
              <p>Prepare downloadable Postman requests.</p>
            </article>

            <article
              className={`workflow-card ${approved ? 'current' : ''}`}
            >
              <div className="card-top">
                <span className="workflow-icon">
                  <ShieldCheck size={20} />
                </span>
                <span className="step-status">
                  {approved ? 'Approved' : 'Pending'}
                </span>
              </div>
              <div className="step-number">03</div>
              <h3>Approval and testing</h3>
              <p>Review requests before execution.</p>
            </article>
          </div>

          <div className="collection-actions">
            <button
              className="primary-button"
              type="button"
              onClick={generatePostmanCollection}
              disabled={!analyzed || generating}
            >
              <FileJson size={16} />
              {generating
                ? 'Generating collection...'
                : 'Generate Postman Collection'}
            </button>

            {collectionReady && (
              <p className="success-message" role="status">
                Collection downloaded. Import specpilot-collection.json
                into Postman.
              </p>
            )}
          </div>
        </section>

        <section className="section workspace-grid">
          <div className="panel">
            <div className="panel-heading">
              <div>
                <h2>Discovered endpoints</h2>
                <p>
                  {analyzed
                    ? 'Endpoints discovered from your OpenAPI specification'
                    : 'Analyze documentation to discover endpoints'}
                </p>
              </div>
              <span className="count-badge">{endpoints.length}</span>
            </div>

            <div className="search-box">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search endpoints..."
                aria-label="Search endpoints"
              />
            </div>

            <div className="endpoint-list">
              {filteredEndpoints.map((endpoint, index) => (
                <div
                  className="endpoint-row"
                  key={`${endpoint.method}-${endpoint.path}-${index}`}
                >
                  <span
                    className={`method ${endpoint.method.toLowerCase()}`}
                  >
                    {endpoint.method}
                  </span>
                  <div className="endpoint-info">
                    <code>{endpoint.path}</code>
                    <span>{endpoint.description}</span>
                  </div>
                  <ArrowRight
                    size={16}
                    className="endpoint-arrow"
                  />
                </div>
              ))}

              {filteredEndpoints.length === 0 && (
                <p className="empty-state">
                  {analyzing
                    ? 'Analyzing documentation...'
                    : apiError && endpoints.length === 0
                      ? 'Analysis failed. Check the error above.'
                      : 'No matching endpoints.'}
                </p>
              )}
            </div>

            <div className="demo-note">
              <Bot size={16} />
              {analyzed
                ? 'Endpoints loaded from your OpenAPI documentation.'
                : 'Analyze documentation to load real endpoints.'}
            </div>
          </div>

          <div className="panel approval-panel">
            <div className="panel-heading">
              <div>
                <h2>Execution approval</h2>
                <p>Human-controlled safety gate</p>
              </div>
              <ShieldCheck size={21} className="accent-icon" />
            </div>

            <div className="approval-callout">
              <ShieldCheck size={19} />
              <div>
                <strong>Review before execution</strong>
                <p>
                  Check the destination, HTTP method and request body
                  before allowing state-changing requests.
                </p>
              </div>
            </div>

            <div className="approval-detail">
              <span>Documentation host</span>
              <code>{documentationHost}</code>
            </div>

            <div className="approval-detail">
              <span>Execution status</span>
              <strong>
                {approved ? 'Demo approval recorded' : 'Not executed'}
              </strong>
            </div>

            <button
              className="secondary-button"
              type="button"
              onClick={() => setApproved(true)}
              disabled={!analyzed || approved}
            >
              <ShieldCheck size={16} />
              {approved ? 'Approval recorded' : 'Approve demo plan'}
            </button>

            {approved && (
              <p className="success-message">
                Demo approval recorded. No network request was sent.
              </p>
            )}
          </div>
        </section>

        <section className="report-bar">
          <div className="report-icon">
            <FileJson size={19} />
          </div>
          <div>
            <h3>Collection &amp; run report</h3>
            <p>
              {collectionReady
                ? 'Your Postman collection has been downloaded.'
                : 'Generate a collection to download your Postman JSON file.'}
            </p>
          </div>
          <span className="coming-soon">
            {collectionReady ? 'GENERATED' : 'COLLECTION READY'}
          </span>
        </section>
      </main>
    </div>
  )
}

export default App
