import { useState, useEffect } from 'react'

const DOMAIN_MAP = [
  { keywords: ['product manager', 'product owner'],      domain: 'zarządzaniu produktem' },
  { keywords: ['frontend', 'react', 'vue', 'angular'],   domain: 'tworzeniu interfejsów frontendowych' },
  { keywords: ['backend', 'node', 'java', 'python', 'ruby'], domain: 'developmencie backendowym' },
  { keywords: ['fullstack', 'full-stack'],                domain: 'fullstack developmencie' },
  { keywords: ['ux', 'ui', 'designer', 'design'],        domain: 'projektowaniu UX/UI' },
  { keywords: ['marketing', 'growth', 'seo', 'content'], domain: 'marketingu cyfrowym' },
  { keywords: ['data', 'analyst', 'analytics', 'bi'],    domain: 'analityce danych' },
  { keywords: ['sales', 'account executive'],            domain: 'sprzedaży' },
  { keywords: ['devops', 'cloud', 'infrastructure'],     domain: 'infrastrukturze i DevOps' },
  { keywords: ['mobile', 'ios', 'android', 'flutter'],   domain: 'tworzeniu aplikacji mobilnych' },
]

function getDomain(jobTitle) {
  const lower = jobTitle.toLowerCase()
  for (const entry of DOMAIN_MAP) {
    if (entry.keywords.some((k) => lower.includes(k))) return entry.domain
  }
  return 'tej dziedzinie'
}

function lata(n) {
  const num = parseInt(n, 10)
  if (num === 1) return '1 rok'
  if (num >= 2 && num <= 4) return `${num} lata`
  return `${num} lat`
}

function recruiterMessage(recruiterName, jobTitle, company, profile) {
  const first = recruiterName ? recruiterName.split(' ')[0] : ''
  const domain = getDomain(jobTitle)
  const exp = lata(profile.years)
  const senderName = profile.name
  return `Cześć ${first},

Właśnie aplikowałem/am na stanowisko ${jobTitle} w ${company}.

Zamiast czekać aż moje CV samo się obroni – chciałem/am się bezpośrednio przedstawić 👋

Mam ${exp} doświadczenia w ${domain} i uważam, że mój background świetnie wpisuje się w to, czego szukacie.

Czy masz 15 minut na krótką rozmowę w tym tygodniu?

Pozdrawiam,
${senderName}`
}

function decisionMakerMessage(recruiterName, jobTitle, company, profile) {
  const first = recruiterName ? recruiterName.split(' ')[0] : ''
  const domain = getDomain(jobTitle)
  const exp = lata(profile.years)
  const senderName = profile.name
  return `Cześć ${first},

Widzę, że kierujesz zespołem w ${company} – właśnie aplikowałem/am na stanowisko ${jobTitle}.

Chciałem/am się bezpośrednio przedstawić, bo wierzę, że moje ${exp} doświadczenia w ${domain} może realnie wzmocnić Twój zespół.

[Jedno konkretne osiągnięcie lub pomysł na tę rolę]

Czy znajdziesz 15 minut żebyśmy porozmawiali?

Pozdrawiam,
${senderName}`
}

function PersonList({ people, selected, onSelect, copiedLink, onCopyLink }) {
  if (people.length === 0) {
    return (
      <div className="modal__center">
        <p>Brak wyników. Brave Search ma ograniczony indeks LinkedIn.</p>
        <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text3)' }}>
          Spróbuj wyszukać ręcznie używając przycisku poniżej.
        </p>
      </div>
    )
  }
  return (
    <div className="recruiter-list">
      {people.map((r, i) => (
        <div
          key={i}
          className={`recruiter-card ${selected === i ? 'recruiter-card--active' : ''}`}
          onClick={() => onSelect(selected === i ? null : i)}
        >
          <div className="r-avatar">{r.name.charAt(0).toUpperCase()}</div>
          <div className="r-info">
            <div className="r-name">{r.name}</div>
            <div className="r-title">{r.title || 'LinkedIn Profile'}</div>
          </div>
          <div className="r-msg-hint">
            {selected === i ? '✓ wiadomość ↓' : '💬 wiadomość'}
          </div>
          <div className="r-actions">
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-li"
              onClick={(e) => e.stopPropagation()}
            >
              in
            </a>
            <button
              className={`btn-copy-link ${copiedLink === i ? 'btn--copied' : ''}`}
              onClick={(e) => { e.stopPropagation(); onCopyLink(r.url, i) }}
              title="Kopiuj link"
            >
              {copiedLink === i ? '✓' : '⎘'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function RecruiterModal({ job, profile, onClose }) {
  const [recruiters, setRecruiters] = useState([])
  const [decisionMakers, setDecisionMakers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retry, setRetry] = useState(0)
  const [activeTab, setActiveTab] = useState('recruiters')
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copiedLink, setCopiedLink] = useState(null)

  useEffect(() => {
    setSelected(null)
    setActiveTab('recruiters')
  }, [job.company])

  useEffect(() => {
    setSelected(null)
  }, [activeTab])

  useEffect(() => {
    const controller = new AbortController()

    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const url = `/api/search?company=${encodeURIComponent(job.company)}&jobTitle=${encodeURIComponent(job.title)}`
        const res = await fetch(url, { signal: controller.signal })
        const data = await res.json()
        if (data.error) throw new Error(data.error)
        setRecruiters(data.recruiters || [])
        setDecisionMakers(data.decisionMakers || [])
      } catch (e) {
        if (e.name === 'AbortError') return
        setError('Nie udało się wyszukać. Sprawdź połączenie lub klucz API.')
      } finally {
        setLoading(false)
      }
    }

    run()
    return () => controller.abort()
  }, [job.company, job.title, retry])

  const currentPeople = activeTab === 'recruiters' ? recruiters : decisionMakers
  const buildMsg = activeTab === 'recruiters' ? recruiterMessage : decisionMakerMessage

  const copyMessage = () => {
    if (selected === null) return
    navigator.clipboard.writeText(buildMsg(currentPeople[selected].name, job.title, job.company, profile))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const copyLink = (url, idx) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(idx)
    setTimeout(() => setCopiedLink(null), 2000)
  }

  const linkedInFallback = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(job.company + ' ' + (activeTab === 'recruiters' ? 'recruiter' : 'head of'))}`

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal__header">
          <div>
            <h3 className="modal__title">{job.company} · {job.title}</h3>
            <p className="modal__sub">Znajdź osoby do kontaktu na LinkedIn</p>
          </div>
          <button className="modal__close" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'recruiters' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('recruiters')}
          >
            🎯 Rekruterzy
            {!loading && <span className="tab-count">{recruiters.length}</span>}
          </button>
          <button
            className={`tab ${activeTab === 'decisionMakers' ? 'tab--active' : ''}`}
            onClick={() => setActiveTab('decisionMakers')}
          >
            👔 Decydenci
            {!loading && <span className="tab-count">{decisionMakers.length}</span>}
          </button>
        </div>

        {/* Body */}
        <div className="modal__body">
          {loading && (
            <div className="modal__center">
              <div className="spinner" />
              <p>Szukam kontaktów w {job.company}…</p>
            </div>
          )}

          {error && (
            <div className="modal__center">
              <p style={{ color: 'var(--red)', marginBottom: 12 }}>{error}</p>
              <button className="btn-retry" onClick={() => setRetry((r) => r + 1)}>
                Spróbuj ponownie
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <p className="results-hint">
                {activeTab === 'recruiters'
                  ? 'Osoby z HR / Talent Acquisition w tej firmie'
                  : 'Managerowie i liderzy działu, który rekrutuje'}
                {' · '}
                <a href={linkedInFallback} target="_blank" rel="noopener noreferrer" className="hint-link">
                  Szukaj na LinkedIn →
                </a>
              </p>
              <p className="click-hint">👆 Kliknij osobę, żeby wygenerować gotową wiadomość</p>

              <PersonList
                people={currentPeople}
                selected={selected}
                onSelect={setSelected}
                copiedLink={copiedLink}
                onCopyLink={copyLink}
              />

              {selected !== null && currentPeople[selected] && (
                <div className="message-box">
                  <div className="message-box__header">
                    <span>
                      {activeTab === 'recruiters' ? '📨' : '🤝'} Wiadomość do{' '}
                      {currentPeople[selected].name.split(' ')[0]}
                    </span>
                    <button
                      className={`btn-copy-msg ${copied ? 'btn--copied' : ''}`}
                      onClick={copyMessage}
                    >
                      {copied ? '✓ Skopiowano!' : 'Kopiuj wiadomość'}
                    </button>
                  </div>
                  <pre className="message-text">
                    {buildMsg(currentPeople[selected].name, job.title, job.company, profile)}
                  </pre>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal__footer">
          <span className="powered">Powered by Brave Search</span>
          <button className="btn-close" onClick={onClose}>Zamknij</button>
        </div>
      </div>
    </div>
  )
}
