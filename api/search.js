const ROLE_MAP = [
  {
    keywords: ['product manager', 'product owner', 'pm ', ' pm', 'po '],
    titles: ['"Head of Product"', '"VP of Product"', 'CPO', '"Director of Product"', '"Product Lead"'],
  },
  {
    keywords: ['frontend', 'backend', 'fullstack', 'full-stack', 'engineer', 'developer', 'software'],
    titles: ['"Head of Engineering"', '"VP of Engineering"', 'CTO', '"Engineering Manager"', '"Tech Lead"'],
  },
  {
    keywords: ['design', 'ux ', ' ux', 'ui ', ' ui'],
    titles: ['"Head of Design"', '"VP of Design"', '"Creative Director"', '"Design Lead"'],
  },
  {
    keywords: ['marketing', 'growth', 'seo', 'content', 'brand'],
    titles: ['"Head of Marketing"', 'CMO', '"VP of Marketing"', '"Marketing Director"', '"Growth Lead"'],
  },
  {
    keywords: ['data', 'analyst', 'analytics', 'bi ', ' bi'],
    titles: ['"Head of Data"', '"Chief Data Officer"', '"VP of Data"', '"Data Director"'],
  },
  {
    keywords: ['sales', 'account manager', 'account executive'],
    titles: ['"Head of Sales"', '"VP of Sales"', 'CSO', '"Sales Director"'],
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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { company, jobTitle } = req.query
  if (!company) return res.status(400).json({ error: 'Brak nazwy firmy' })

  const apiKey = process.env.BRAVE_API_KEY
  const companyLower = company.toLowerCase()
  const dmTitles = getDecisionMakerTitles(jobTitle || '')

  const recruiterQuery = `site:linkedin.com/in "${company}" (recruiter OR rekruter OR "talent acquisition" OR HR)`
  const dmQuery = `site:linkedin.com/in "${company}" (${dmTitles.join(' OR ')})`

  try {
    const recruiterData = await braveSearch(recruiterQuery, apiKey)
    await new Promise((r) => setTimeout(r, 1100))
    const dmData = await braveSearch(dmQuery, apiKey)

    res.json({
      recruiters: parseResults(recruiterData, companyLower),
      decisionMakers: parseResults(dmData, companyLower),
    })
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'Wyszukiwanie nie powiodło się' })
  }
}
