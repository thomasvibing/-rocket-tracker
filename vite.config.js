import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const ROLE_MAP = [
  {
    keywords: ['product manager', 'product owner', 'pm ', ' pm'],
    titles: ['"Head of Product"', '"VP of Product"', 'CPO', '"Director of Product"'],
  },
  {
    keywords: ['frontend', 'backend', 'fullstack', 'full-stack', 'engineer', 'developer', 'software'],
    titles: ['"Head of Engineering"', '"VP of Engineering"', 'CTO', '"Engineering Manager"'],
  },
  {
    keywords: ['design', 'ux ', ' ux', 'ui ', ' ui'],
    titles: ['"Head of Design"', '"VP of Design"', '"Creative Director"'],
  },
  {
    keywords: ['marketing', 'growth', 'seo', 'content', 'brand'],
    titles: ['"Head of Marketing"', 'CMO', '"VP of Marketing"', '"Marketing Director"'],
  },
  {
    keywords: ['data', 'analyst', 'analytics'],
    titles: ['"Head of Data"', '"Chief Data Officer"', '"VP of Data"'],
  },
  {
    keywords: ['sales', 'account manager'],
    titles: ['"Head of Sales"', '"VP of Sales"', 'CSO'],
  },
]

function getDecisionMakerTitles(jobTitle) {
  const lower = (jobTitle || '').toLowerCase()
  for (const entry of ROLE_MAP) {
    if (entry.keywords.some((k) => lower.includes(k))) return entry.titles
  }
  return ['"Head of"', '"VP of"', 'Director', '"Team Lead"']
}

async function braveSearch(query, apiKey) {
  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
    {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
    }
  )
  if (!res.ok) throw new Error(`Brave API ${res.status}`)
  return res.json()
}

function parseResults(data, companyLower) {
  const companyRegex = new RegExp(`^${companyLower}(\\.(pl|com|eu|io|co|net|org))?$`, 'i')
  // LinkedIn używa zarówno " - " (hyphen) jak i " – " (em dash) jako separatora
  const splitTitle = (t) => t.replace(/ – /g, ' - ').split(' - ')

  return (data.web?.results || [])
    .filter((r) => {
      if (!r.url.includes('linkedin.com/in/')) return false
      const titleClean = (r.title || '').replace(' | LinkedIn', '').replace(' - LinkedIn', '')
      const lastSegment = splitTitle(titleClean).pop().trim()
      return companyRegex.test(lastSegment)
    })
    .map((r) => {
      const raw = r.title.replace(' | LinkedIn', '').replace(' - LinkedIn', '')
      const name = splitTitle(raw)[0].split(' | ')[0].trim()
      const desc = r.description || ''
      return {
        name,
        title: desc.split('\n')[0].split('·')[0].trim(),
        url: r.url,
      }
    })
    .slice(0, 5)
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      {
        name: 'local-api',
        configureServer(server) {
          server.middlewares.use('/api/search', async (req, res) => {
            const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : ''
            const params = new URLSearchParams(qs)
            const company = params.get('company')
            const jobTitle = params.get('jobTitle') || ''

            if (!company) {
              res.writeHead(400, { 'Content-Type': 'application/json' })
              return res.end(JSON.stringify({ error: 'Brak nazwy firmy' }))
            }

            const apiKey = env.BRAVE_API_KEY
            const companyLower = company.toLowerCase()
            const dmTitles = getDecisionMakerTitles(jobTitle)

            const recruiterQuery = `site:linkedin.com/in "${company}" (recruiter OR rekruter OR "talent acquisition" OR HR)`
            const dmQuery = `site:linkedin.com/in "${company}" (${dmTitles.join(' OR ')})`

            try {
              const recruiterData = await braveSearch(recruiterQuery, apiKey)
              await new Promise((r) => setTimeout(r, 1100))
              const dmData = await braveSearch(dmQuery, apiKey)

              res.writeHead(200, { 'Content-Type': 'application/json' })
              res.end(
                JSON.stringify({
                  recruiters: parseResults(recruiterData, companyLower),
                  decisionMakers: parseResults(dmData, companyLower),
                })
              )
            } catch (e) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'Search failed' }))
            }
          })
        },
      },
    ],
  }
})
