import { useState, useEffect, useRef } from 'react'

const STATUSES = [
  { id: 'applied',   label: 'Wysłano',   color: '#573FFF' },
  { id: 'screening', label: 'Screening', color: '#D97706' },
  { id: 'interview', label: 'Rozmowa',   color: '#1D4ED8' },
  { id: 'offer',     label: 'Oferta',    color: '#15803D' },
  { id: 'rejected',  label: 'Odrzucono', color: '#B91C1C' },
]

const SALARY_OPTIONS = [
  { value: 0,     label: 'Każde wynagrodzenie' },
  { value: 10000, label: 'min. 10 000 PLN' },
  { value: 15000, label: 'min. 15 000 PLN' },
  { value: 20000, label: 'min. 20 000 PLN' },
  { value: 25000, label: 'min. 25 000 PLN' },
]

function getDaysAgo(isoDate) {
  if (!isoDate) return null
  const diff = Date.now() - new Date(isoDate).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Dzisiaj'
  if (days === 1) return 'Wczoraj'
  return `${days} dni temu`
}

/* ── Match Score engine ─────────────────────────────────────── */

const STAGE_BONUSES = { applied: 5, screening: 18, interview: 38, offer: 62, rejected: 0 }

// ─── Tier 1: Oferta pracy potwierdzona → status = 'offer', score ≥ 97% ────────
const OFFER_CONFIRMED = [
  'zatrudnimy cię', 'zatrudniamy cię', 'zatrudnimy cię od', 'zatrudniamy cię od',
  'chcemy cię zatrudnić', 'chcemy zatrudnić właśnie ciebie',
  'jesteś zatrudniony', 'jesteś zatrudniona',
  'masz tę pracę', 'masz tę pozycję', 'dostałeś tę pracę', 'dostałaś tę pracę',
  'składamy ci ofertę', 'złożymy ci ofertę', 'chcemy złożyć ci ofertę',
  'wysyłamy ci ofertę', 'przesyłamy ofertę', 'prześlemy ofertę',
  'przygotowujemy dla ciebie ofertę', 'przygotowujemy umowę',
  'przesyłamy umowę', 'podpiszemy umowę', 'wyślemy kontrakt',
  'witamy w zespole', 'witamy na pokładzie', 'welcome on board',
  'zostałeś przyjęty', 'zostałaś przyjęta', 'zostałeś wybrany', 'zostałaś wybrana',
  'wybraliśmy ciebie', 'wybraliśmy właśnie ciebie', 'zdecydowaliśmy się na ciebie',
  'zdecydowaliśmy się na twoją kandydaturę',
  'jesteś naszym kandydatem', 'to twoja praca', 'proponujemy ci stanowisko',
  'oferta jest dla ciebie', 'oferta pracy dla ciebie',
  'było super, zatrudnimy', 'super rozmowa, zatrudniamy',
]

// ─── Tier 2: Silnie pozytywne → duży boost score ────────────────────────────
const STRONG_POSITIVE = [
  'jesteś idealnym kandydatem', 'idealnie pasujesz', 'idealne dopasowanie',
  'świetnie pasujesz do zespołu', 'pasujesz do naszego zespołu',
  'zachwycił nas', 'zachwyciłeś nas', 'zachwyciłaś nas', 'byłeś zachwycający',
  'najlepszy kandydat jakiego widzieliśmy', 'jeden z najlepszych',
  'zdecydowanie cię chcemy', 'bardzo chcemy cię w zespole',
  'chcemy cię w naszym zespole', 'zależy nam na tobie',
  'szybko podejmiemy decyzję', 'decydujemy się bardzo szybko',
  'przejdziesz do finału', 'zapraszamy do kolejnego etapu',
  'dostałeś się do następnego', 'dostałaś się do następnego',
  'byłeś najlepszy', 'byłaś najlepsza', 'wyróżniasz się',
  'twoje doświadczenie jest dokładnie tym', 'twój profil jest idealny',
]

// ─── Tier 3: Pozytywne sygnały → umiarkowany boost ──────────────────────────
const POSITIVE_SIGNALS = [
  'bardzo dobrze', 'świetna rozmowa', 'dobra rozmowa', 'super rozmowa',
  'bardzo zainteresowani', 'jesteśmy zainteresowani', 'interesuje nas',
  'pozytywne wrażenie', 'dobre wrażenie', 'pozytywny feedback',
  'imponujące doświadczenie', 'imponujące umiejętności', 'imponujące',
  'dobrze ci poszło', 'poszło ci świetnie', 'rewelacyjnie',
  'rozważamy cię', 'bierzemy cię pod uwagę', 'jesteś w naszym shortliście',
  'damy ci znać do końca tygodnia', 'szybko się odezwiemy',
  'mamy pozytywne odczucia', 'pozytywne wrażenie zrobiłeś',
  'twoje portfolio robi wrażenie', 'twoje cv jest mocne',
  'znamy twoje oczekiwania finansowe i to się zgadza',
]

// ─── Tier 4: Negatywne sygnały → obniżenie score ────────────────────────────
const NEGATIVE_SIGNALS = [
  'nie spełniasz wszystkich', 'brakuje ci doświadczenia', 'za mało doświadczenia',
  'za mały staż', 'zbyt krótki staż', 'nie tego szukamy', 'nie tego oczekujemy',
  'nie spełnia naszych', 'za wysoki budżet', 'za wysokie oczekiwania finansowe',
  'oczekiwania finansowe są za wysokie', 'budżet nie pozwala',
  'mamy wątpliwości', 'pewne obawy', 'nie do końca', 'niewystarczające',
  'brakuje umiejętności', 'luki w doświadczeniu', 'za słabe portfolio',
  'za mała znajomość', 'zbyt mała znajomość', 'niedostateczna wiedza',
  'trochę za słaby', 'trochę za słaba', 'nie pasujesz do kultury',
  'bardzo dużo kandydatów', 'silna konkurencja', 'mamy lepszych kandydatów',
  'długi proces decyzyjny', 'decyzja zajmie czas', 'skontaktujemy się kiedyś',
]

// ─── Tier 5: Odrzucenie potwierdzone → status = 'rejected', score = 0% ──────
const REJECTION_CONFIRMED = [
  // Brak zainteresowania
  'nie jesteśmy tobą zainteresowani', 'nie jesteśmy zainteresowani twoją kandydaturą',
  'nie jesteśmy zainteresowani', 'nie interesuje nas twoja kandydatura',
  'nie interesuje nas kandydatura', 'twoja kandydatura nas nie interesuje',
  // Bezpośrednie
  'nie jesteś odpowiednim kandydatem', 'nie jesteś tym, kogo szukamy',
  'nie spełniasz naszych wymagań', 'rezygnujemy z twojej kandydatury',
  'nie kontynuujemy procesu z tobą', 'wycofujemy twoją kandydaturę',
  'nie przejdziesz do kolejnego etapu', 'nie przeszedłeś do kolejnego',
  'nie przeszłaś do kolejnego', 'nie przejdziesz dalej',
  'nie zakwalifikowałeś się', 'nie zakwalifikowałaś się',
  'nie możemy kontynuować z tobą', 'kończymy nasz proces z tobą',
  // Wybranie kogoś innego
  'wybraliśmy inną osobę', 'wybraliśmy innego kandydata', 'wybraliśmy kogoś innego',
  'zdecydowaliśmy się na innego kandydata', 'zdecydowaliśmy się na inną osobę',
  'zatrudniliśmy kogoś', 'zatrudniliśmy inną osobę', 'zatrudniliśmy innego kandydata',
  'poszliśmy z innym kandydatem',
  // Zamknięcie rekrutacji
  'zamykamy rekrutację', 'zakończyliśmy rekrutację', 'wstrzymujemy rekrutację',
  'rekrutacja została wstrzymana', 'zamrażamy rekrutację', 'anulujemy rekrutację',
  // Grzeczne
  'nie możemy ci zaoferować', 'niestety nie możemy zaoferować',
  'niestety nie możemy kontynuować', 'przykro nam, ale nie',
  'z przykrością informujemy', 'niestety twoja kandydatura',
  'dziękujemy, ale nie', 'dziękujemy za rozmowę, jednak',
  'jednak nie możemy', 'musimy cię poinformować, że niestety',
]

// Regex patterns catch short/varied rejection phrasing that exact strings miss
const REJECTION_REGEX = [
  /nie\s+(chcemy|chcę)\s+(cię|ciebie|twojej)/,
  /nie\s+zatrudni(my|ę)\s*(cię|ciebie)?/,
  /nie\s+(przyjmiem|przyjmujemy|przyjm[eę])\s*(cię|ciebie)?/,
  /nie\s+widzim(y|u)\s+(cię|ciebie|tu\s+miejsca)/,
  /nie\s+(decydujemy|zdecydowali(śmy)?)\s+(się\s+)?na\s+(cię|ciebie)/,
  /nie\s+pasujesz\s+(nam|do\s+nas)/,
  /nie\s+pasuje(sz)?\s+(nam|do\s+nas|do\s+naszego)/,
  /niestety\s+nie\s+(możemy|będziemy|chcemy|decydujemy)/,
  /z\s+przykrością\s+(musimy|chcemy|informujemy|przekazujemy)/,
  /dziękujemy[,\s]+(ale|jednak|niestety)/,
  /nie\s+(będziemy|chcemy)\s+kontynuować/,
  /rezygnujemy\s+z\s+(ciebie|twojej|pana|pani)/,
  /odrzucamy\s+(twoją|twoje)\s+kandydatur/,
  /nie\s+ma\s+(dla\s+ciebie|dla\s+cię|miejsca\s+dla\s+ciebie)/,
  /nie\s+możemy\s+(ci|cię|tobie)\s+(zaoferować|zaproponować)/,
  /nie\s+mamy\s+(dla\s+ciebie|dla\s+cię)\s+(oferty|miejsca|roli)/,
  /nie\s+jesteś\s+(tym|tą|osobą|kandydatem|kandydatką)\s*(,|\.|którego|której)/,
  /postanowili(śmy)?\s+(wybrać|zatrudnić)\s+(kogoś|inną|innego)/,
]

const OFFER_REGEX = [
  /zatrudni(my|amy)\s+(cię|ciebie)/,
  /chcemy\s+(cię|ciebie)\s+zatrudnić/,
  /masz\s+tę\s+(pracę|pozycję|rolę)/,
  /dostał(eś|aś)\s+(tę|tą)\s+(pracę|pozycję)/,
  /składam(y|i)?\s+(ci|tobie)\s+ofertę/,
  /wyślemy\s+(ci|tobie)\s+(ofertę|kontrakt|umowę)/,
  /witam(y)?\s+(w\s+zespole|na\s+pokładzie)/,
  /welcome\s+on\s+board/,
  /zostałe(ś|ś)\s+(przyjęty|przyjęta|wybrany|wybrana)/,
  /wybrali(śmy)?\s+(ciebie|właśnie\s+ciebie)/,
  /jesteś\s+zatrudnion(y|a)/,
  /proponujem(y|u)\s+(ci|tobie)\s+stanowisko/,
  /oferta\s+(jest\s+)?dla\s+(ciebie|cię)/,
]

function isOfferText(text) {
  const lower = text.toLowerCase()
  return OFFER_CONFIRMED.some((k) => lower.includes(k)) || OFFER_REGEX.some((re) => re.test(lower))
}

function isRejectionText(text) {
  const lower = text.toLowerCase()
  return REJECTION_CONFIRMED.some((k) => lower.includes(k)) || REJECTION_REGEX.some((re) => re.test(lower))
}

function calculateScore(app, profile) {
  if (app.status === 'rejected') {
    return { score: 0, factors: [{ label: 'Aplikacja odrzucona', pts: 0, type: 'neg' }] }
  }

  const factors = []
  let score = 0

  // 1. Stage bonus (0–62 pts) — real funnel conversion rates
  const stagePts = STAGE_BONUSES[app.status] ?? 5
  score += stagePts
  if (stagePts > 0) {
    const stageLabel = STATUSES.find((s) => s.id === app.status)?.label ?? app.status
    factors.push({ label: `Etap rekrutacji: ${stageLabel}`, pts: stagePts, type: 'stage' })
  }

  // 2. Skill match (0–15 pts)
  const profileSkills = (profile?.skills ?? []).map((s) => s.toLowerCase())
  const jobTags = (app.tags ?? []).map((t) => t.toLowerCase())
  if (jobTags.length > 0 && profileSkills.length > 0) {
    const matching = jobTags.filter((t) =>
      profileSkills.some((s) => s.includes(t) || t.includes(s))
    )
    const ratio = matching.length / jobTags.length
    const skillPts = Math.round(ratio * 15)
    score += skillPts
    factors.push({
      label: `Skills: ${matching.length}/${jobTags.length} dopasowanych`,
      pts: skillPts,
      type: skillPts >= 8 ? 'pos' : 'neutral',
    })
  }

  // 3. Experience bonus (0–5 pts)
  const years = parseInt(profile?.years ?? 0, 10) || 0
  const expPts = Math.min(5, Math.floor(years / 2))
  if (expPts > 0) {
    score += expPts
    factors.push({ label: `Doświadczenie: ${years} lat`, pts: expPts, type: 'neutral' })
  }

  // 3.5 Experience gap penalty (0 to –15 pts) — za mało lat vs wymagania oferty
  const jobExpMin = app.experienceMin ?? 0
  if (jobExpMin > 0 && years < jobExpMin) {
    const gap = jobExpMin - years
    const penalty = -Math.min(15, gap * 4)
    score += penalty
    factors.push({ label: `Wymagania: ${years}/${jobExpMin} lat`, pts: penalty, type: 'neg' })
  }

  // 4. Profile completion bonus (0–5 pts)
  const skillBonus = (profile?.skills ?? []).length >= 3 ? 3 : 0
  const histBonus = (profile?.history ?? []).some((h) => h.company) ? 2 : 0
  const completionPts = skillBonus + histBonus
  if (completionPts > 0) {
    score += completionPts
    factors.push({ label: 'Profil uzupełniony', pts: completionPts, type: 'neutral' })
  }

  // 5. Transcript sentiment (–15 to +25 pts; offer/rejection override everything)
  const notes = (app.notes ?? '').toLowerCase()
  if (notes.length > 20) {
    const rejCount = REJECTION_CONFIRMED.filter((k) => notes.includes(k)).length
    if (rejCount > 0) {
      return {
        score: 0,
        factors: [{ label: 'Odrzucenie potwierdzone w transkrypcie', pts: -100, type: 'neg' }],
      }
    }
    // Offer confirmed → guaranteed 99%
    const offerCount = OFFER_CONFIRMED.filter((k) => notes.includes(k)).length
    if (offerCount > 0) {
      factors.push({ label: '🎉 Oferta pracy potwierdzona!', pts: 99, type: 'pos' })
      return { score: 99, factors }
    }
    // Strong positive → big boost
    const strongCount = STRONG_POSITIVE.filter((k) => notes.includes(k)).length
    if (strongCount > 0) {
      const pts = Math.min(25, strongCount * 15)
      score += pts
      factors.push({ label: `Silnie pozytywne sygnały (${strongCount})`, pts, type: 'pos' })
    }
    const posCount = POSITIVE_SIGNALS.filter((k) => notes.includes(k)).length
    const negCount = NEGATIVE_SIGNALS.filter((k) => notes.includes(k)).length
    if (posCount > 0) {
      const pts = Math.min(15, posCount * 8)
      score += pts
      factors.push({ label: `Pozytywne sygnały w rozmowie (${posCount})`, pts, type: 'pos' })
    }
    if (negCount > 0) {
      const pts = -Math.min(15, negCount * 6)
      score += pts
      factors.push({ label: `Negatywne sygnały w rozmowie (${negCount})`, pts, type: 'neg' })
    }
  }

  return { score: Math.max(0, Math.min(100, score)), factors }
}

/* ── MatchScore component ───────────────────────────────────── */

function MatchScore({ app, profile }) {
  const [open, setOpen] = useState(false)
  const { score, factors } = calculateScore(app, profile)

  const label = (() => {
    if (app.status === 'rejected') return 'Odrzucono'
    if (score >= 97) return 'Oferta!'
    if (app.status === 'offer') return 'Wysokie'
    if (score >= 75) return 'Wysokie'
    if (score >= 45) return 'Średnie'

    // Niski wynik — seniority decyduje o "tonie", konkretne problemy stają się sufiksem
    const skillF    = factors.find((f) => f.label.startsWith('Skills:'))
    const gapF      = factors.find((f) => f.label.startsWith('Wymagania:'))
    const expAbsF   = factors.find((f) => f.label.startsWith('Doświadczenie:'))
    const lowSkills = skillF && skillF.pts <= 3
    const lowExp    = gapF && gapF.pts <= -8   // gap ≥ 2 lat
    const seniority = profile?.seniority ?? 'junior'

    if (seniority === 'brak' || seniority === 'junior') {
      // Junior/brak: "Wstępne" jako baza, problemy jako suffix
      if (app.status === 'applied' && !skillF && !expAbsF && !gapF) return 'Nieznane'
      if (lowSkills && lowExp) return 'Wstępne (skills + staż)'
      if (lowSkills) return 'Wstępne (niskie skills)'
      if (lowExp) return 'Wstępne (brak dośw.)'
      return 'Wstępne'
    }

    // Mid/Senior/Lead: problemy obniżają label do "Niskie"
    if (lowSkills && lowExp) return 'Niskie (skills + staż)'
    if (lowSkills) return 'Niskie (skills)'
    if (lowExp) return 'Niskie (doświadczenie)'
    if (seniority === 'mid') {
      return skillF && skillF.pts >= 8 ? 'Średnie (mid + skills)' : 'Średnie (mid)'
    }
    const senLabel = seniority === 'lead' ? 'lead' : 'senior'
    return skillF && skillF.pts >= 8
      ? `Wysokie (${senLabel} + skills)`
      : `Wysokie (${senLabel})`
  })()

  const color = (() => {
    if (app.status === 'rejected') return '#B91C1C'
    if (app.status === 'offer' || score >= 97) return '#15803D'
    if (score >= 61) return '#15803D'
    if (score >= 31) return '#D97706'
    // Niski score, ale label może być wyższy (np. senior na etapie wysłano)
    if (label === 'Wysokie') return '#15803D'
    if (label === 'Średnie') return '#D97706'
    if (label === 'Nieznane' || label === 'Wstępne') return '#8A8A8A'
    return '#573FFF'  // Niskie (skills) / Niskie (staż)
  })()

  return (
    <div
      className="match-score"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <div className="match-score__inner">
        <div className="match-score__bar-wrap">
          <div
            className="match-score__bar"
            style={{ width: `${score}%`, background: color }}
          />
        </div>
        <span className="match-score__pct" style={{ color }}>{score}%</span>
      </div>
      <span className="match-score__label" style={{ color }}>{label}</span>

      {open && (
        <div className="match-tooltip">
          <div className="match-tooltip__title">Szanse na ofertę</div>
          {factors.map((f, i) => (
            <div key={i} className={`match-tooltip__row match-tooltip__row--${f.type}`}>
              <span>{f.label}</span>
              <span>{f.pts >= 0 ? '+' : ''}{f.pts} pkt</span>
            </div>
          ))}
          <div className="match-tooltip__total">
            <span>Wynik końcowy</span>
            <span style={{ color }}>{score} / 100</span>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Interview summary helpers ─────────────────────────────── */

function generateMockSummary(app) {
  const today = new Date()
  const dateStr = today.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
  const daysUntilFriday = ((5 - today.getDay() + 7) % 7) || 7
  const friday = new Date(today)
  friday.setDate(today.getDate() + daysUntilFriday)
  const fridayStr = friday.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long' })
  const tags = app.tags?.slice(0, 2).join(' i ') || 'techniczne zagadnienia'
  return `📞 Rozmowa kwalifikacyjna — ${app.company}
Data: ${dateStr} · Czas trwania: 48 min

👥 Rozmówcy
• Anna Kowalska — Talent Acquisition, ${app.company}
• Marcin Wiśniewski — Engineering Manager

📋 Omawiane tematy
• Doświadczenie z ${tags} — pytania praktyczne
• Architektura rozwiązań i podejście do problemów
• Kultura pracy i sposób współpracy w zespole
• Oczekiwania finansowe i ścieżka kariery

✅ Następne kroki
• Decyzja o II etapie do ${fridayStr}
• Możliwa rozmowa techniczna z CTO (live coding, ~45 min)
• Anna wyśle szczegóły oferty i benefitów mailowo

💬 Ogólny wydźwięk: pozytywny — obopólne zainteresowanie`
}

function parseRawTranscript(text, app) {
  if (!text.trim()) return ''
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  const today = new Date().toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })
  const speakers = new Set()
  lines.forEach((line) => {
    const m1 = line.match(/\[?\d+:\d+\]?\s+([A-ZŁŚŻŹ][^\s:,]+(?:\s+[A-ZŁŚŻŹ][^\s:,]+)+)\s*:/)
    if (m1) speakers.add(m1[1])
    const m2 = line.match(/^([A-ZŁŚŻŹ][a-ząęółśżźćń]+\s+[A-ZŁŚŻŹ][a-ząęółśżźćń]+)\s*:/)
    if (m2) speakers.add(m2[1])
  })
  const nextKeywords = ['wyślę', 'przyślę', 'damy znać', 'skontaktujemy', 'decyzja', 'drugi etap', 'II etap', 'zaproszenie', 'do piątku', 'do środy', 'do czwartku', 'przyszły tydzień', 'do końca tygodnia', 'live coding', 'task', 'zadanie']
  const nextSteps = lines.filter((l) => nextKeywords.some((k) => l.toLowerCase().includes(k))).slice(0, 4)
  const lower = text.toLowerCase()
  // Use module-level constants — rejection takes priority over any positive signals
  const isOffered = isOfferText(text)
  const isRejected = !isOffered && isRejectionText(text)
  const posCount = (isRejected || isOffered) ? 0 : POSITIVE_SIGNALS.filter((k) => lower.includes(k)).length
  const negCount = (isRejected || isOffered) ? 0 : NEGATIVE_SIGNALS.filter((k) => lower.includes(k)).length
  const sentiment = isOffered
    ? '🎉 Oferta pracy potwierdzona!'
    : isRejected
    ? '❌ Odrzucenie potwierdzone'
    : negCount > posCount ? '⚠️ Mieszany / Negatywny'
    : posCount > 0 ? '✅ Pozytywny'
    : '🔍 Trudny do określenia'
  const speakerList = speakers.size > 0 ? [...speakers].map((s) => `• ${s}`).join('\n') : '• (nie wykryto)'
  const nextList = nextSteps.length > 0 ? nextSteps.map((s) => `• ${s.slice(0, 100)}`).join('\n') : '• (nie wykryto)'
  return `📞 Rozmowa kwalifikacyjna — ${app.company}
Data: ${today}

👥 Rozmówcy
${speakerList}

✅ Następne kroki
${nextList}

💬 Wydźwięk: ${sentiment}`
}

/* ── Interview Summary ──────────────────────────────────────── */

function InterviewSummary({ app, onApplicationUpdate, onStatusChange }) {
  const [state, setState] = useState('idle')
  const [pasteText, setPasteText] = useState('')
  const [displayed, setDisplayed] = useState('')
  const timerRef = useRef(null)
  const mockSummary = generateMockSummary(app)

  useEffect(() => {
    if (state !== 'typing') return
    setDisplayed('')
    let i = 0
    timerRef.current = setInterval(() => {
      i += 4
      if (i >= mockSummary.length) {
        setDisplayed(mockSummary)
        clearInterval(timerRef.current)
        setState('done')
        onApplicationUpdate(app.id, { notes: mockSummary })
        if (isRejectionText(mockSummary)) {
          onStatusChange(app.id, 'rejected')
        } else if (app.status === 'applied' || app.status === 'screening') {
          onStatusChange(app.id, 'interview')
        }
      } else {
        setDisplayed(mockSummary.slice(0, i))
      }
    }, 14)
    return () => clearInterval(timerRef.current)
  }, [state]) // eslint-disable-line

  const runDemo = () => { setState('loading'); setTimeout(() => setState('typing'), 2400) }
  const parsePaste = () => {
    if (!pasteText.trim()) return
    const rejected = isRejectionText(pasteText)
    const offered = isOfferText(pasteText)
    const summary = parseRawTranscript(pasteText, app)
    onApplicationUpdate(app.id, { notes: summary })
    if (rejected) {
      onStatusChange(app.id, 'rejected')
    } else if (offered) {
      onStatusChange(app.id, 'offer')
    } else if (app.status === 'applied' || app.status === 'screening') {
      onStatusChange(app.id, 'interview')
    }
    setState('done'); setDisplayed(summary)
  }
  const reset = () => { clearInterval(timerRef.current); setState('idle'); setPasteText(''); setDisplayed('') }

  return (
    <div className="interview-section">
      <div className="interview-section__header">
        <span className="interview-section__label">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1"/>
            <circle cx="6" cy="6" r="2" fill="currentColor"/>
          </svg>
          Podsumowanie rozmowy rekrutacyjnej
        </span>
        {state !== 'idle' && <button className="interview-reset" onClick={reset}>↺ reset</button>}
      </div>

      {state === 'idle' && (
        <div className="interview-actions">
          <button className="btn-recall-demo" onClick={runDemo}>
            <span className="recall-dot recall-dot--red" />
            Symuluj Recall.ai
          </button>
          <button className="btn-paste-transcript" onClick={() => setState('paste')}>
            Wklej transkrypt →
          </button>
        </div>
      )}

      {state === 'loading' && (
        <div className="recall-loading">
          <div className="recall-badge">
            <span className="recall-dot recall-dot--pulse" />
            <span>Recall.ai &nbsp;·&nbsp; Przetwarzam nagranie (48 min)…</span>
          </div>
          <div className="recall-progress"><div className="recall-progress__fill" /></div>
        </div>
      )}

      {(state === 'typing' || state === 'done') && (
        <div className="recall-result">
          <div className="recall-badge recall-badge--done">
            <span className="recall-dot recall-dot--green" />
            <span>Recall.ai &nbsp;·&nbsp; Transkrypt gotowy &nbsp;·&nbsp; 48 min</span>
          </div>
          <pre className="recall-summary">
            {displayed}
            {state === 'typing' && <span className="cursor-blink">▌</span>}
          </pre>
        </div>
      )}

      {state === 'paste' && (
        <div className="paste-section">
          <textarea
            className="paste-textarea"
            placeholder={`Wklej transkrypt z Google Meet, Zoom, Otter.ai…\n\nFormat:\n[00:15] Anna Kowalska: Opowiedz nam o sobie...\n[00:45] Kandydat: Oczywiście, mam 3 lata doświadczenia...`}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
          />
          <div className="paste-actions">
            <button className="btn-recall-demo" onClick={parsePaste} disabled={!pasteText.trim()}>
              Analizuj transkrypt →
            </button>
            <button className="btn-paste-transcript" onClick={() => setState('idle')}>Anuluj</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Company mark ───────────────────────────────────────────── */

function CompanyMark({ company, logo, domain, color }) {
  const [failed, setFailed] = useState(false)
  const initials = company.replace(/\./g, '').split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
  const src = !failed && (logo || domain) ? logo || `https://www.google.com/s2/favicons?sz=128&domain=${domain}` : null
  if (src) return <img src={src} alt={company} width={36} height={36} className="company-logo-img company-logo-img--sm" onError={() => setFailed(true)} />
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-label={company}>
      <rect width="36" height="36" rx="7" fill={color || '#0A0A0A'} />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill="#fff" fontSize={initials.length === 1 ? 16 : 12} fontFamily="Archivo, sans-serif" fontWeight="800" letterSpacing="-0.5">{initials}</text>
    </svg>
  )
}

/* ── Recruiter icon ─────────────────────────────────────────── */

function RecruiterIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5.5" cy="4.5" r="2.75" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M1 12.5C1 10.015 3.015 8 5.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="11" cy="11" r="2.75" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M13 13L14.5 14.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  )
}

/* ── Stats bar (clickable filters + drop targets) ───────────── */

function StatsBar({ applications, filterStatus, onFilterChange, dragOver, onDragOver, onDrop }) {
  return (
    <div className={`stats-bar ${dragOver ? 'stats-bar--dragging' : ''}`}>
      {/* "All" chip */}
      <div
        className={`stat-item stat-item--total ${filterStatus === 'all' ? 'stat-item--active-all' : ''}`}
        onClick={() => onFilterChange('all')}
        title="Pokaż wszystkie"
      >
        <span className="stat-count">{applications.length}</span>
        <span className="stat-label">Wszystkie</span>
      </div>

      <div className="stats-bar__sep" />

      {STATUSES.map((s) => {
        const count = applications.filter((a) => a.status === s.id).length
        const isActive   = filterStatus === s.id
        const isDragOver = dragOver === s.id

        return (
          <div
            key={s.id}
            className={`stat-item ${isActive ? 'stat-item--active' : ''} ${isDragOver ? 'stat-item--dragover' : ''}`}
            style={isActive || isDragOver ? { '--s-color': s.color } : undefined}
            onClick={() => onFilterChange(isActive ? 'all' : s.id)}
            onDragOver={(e) => { e.preventDefault(); onDragOver(s.id) }}
            onDragLeave={(e) => {
              // only clear if leaving entirely (not entering a child)
              if (!e.currentTarget.contains(e.relatedTarget)) onDragOver(null)
            }}
            onDrop={(e) => {
              e.preventDefault()
              const appId = parseInt(e.dataTransfer.getData('appId'), 10)
              if (!isNaN(appId)) onDrop(s.id, appId)
            }}
            title={isDragOver ? `Przenieś do: ${s.label}` : `Filtruj: ${s.label}`}
          >
            <span className="stat-dot" style={{ background: s.color }} />
            <span className="stat-count">{count}</span>
            <span className="stat-label">{isDragOver ? `→ ${s.label}` : s.label}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ── Tracker row ────────────────────────────────────────────── */

function TrackerRow({ app, profile, onStatusChange, onApplicationUpdate, onFindRecruiter, onDragStart, onDragEnd }) {
  const [open, setOpen] = useState(false)
  const daysAgo = getDaysAgo(app.appliedAtRaw)

  return (
    <div
      className={`tracker-row ${open ? 'tracker-row--open' : ''}`}
      data-status={app.status}
      draggable={true}
      onDragStart={(e) => {
        e.dataTransfer.setData('appId', String(app.id))
        e.dataTransfer.effectAllowed = 'move'
        // Delay so the ghost renders before the element fades
        setTimeout(() => e.target.classList.add('tracker-row--dragging'), 0)
        onDragStart?.()
      }}
      onDragEnd={(e) => {
        e.target.classList.remove('tracker-row--dragging')
        onDragEnd?.()
      }}
    >
      <div className="tracker-row__summary" onClick={() => setOpen((v) => !v)}>

        {/* Status label — far left */}
        <div className="tr__status-label" data-status={app.status}>
          {STATUSES.find((s) => s.id === app.status)?.label ?? app.status}
        </div>

        {/* Drag handle */}
        <div className="tr__drag-handle" title="Przeciągnij aby zmienić status">
          <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
            {[0,4,8,12].map(y => (
              <g key={y}>
                <circle cx="3" cy={y+2} r="1.2" fill="currentColor"/>
                <circle cx="7" cy={y+2} r="1.2" fill="currentColor"/>
              </g>
            ))}
          </svg>
        </div>

        <div className="tr__logo">
          <CompanyMark company={app.company} logo={app.logo} domain={app.domain} color={app.brandColor} />
        </div>

        <div className="tr__identity">
          <div className="tr__title">{app.title}</div>
          <div className="tr__company">
            {app.company}
            {daysAgo && <span className="days-badge">{daysAgo}</span>}
          </div>
        </div>

        <div className="tr__salary">{app.salary}</div>

        {/* Recruiter button — visible in main row */}
        <button
          className="tr__recruiter-btn"
          onClick={(e) => { e.stopPropagation(); onFindRecruiter(app) }}
          title="Znajdź rekrutera lub decydenta"
        >
          <RecruiterIcon />
          <span>Kontakt</span>
        </button>

        <div className="tr__status" onClick={(e) => e.stopPropagation()}>
          <select
            className="status-select"
            value={app.status}
            data-status={app.status}
            onChange={(e) => onStatusChange(app.id, e.target.value)}
          >
            {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>

        <div className="tr__match" onClick={(e) => e.stopPropagation()}>
          <MatchScore app={app} profile={profile} />
        </div>

        <div className="tr__followup" onClick={(e) => e.stopPropagation()}>
          <input
            type="date"
            className="followup-input"
            value={app.followUp || ''}
            onChange={(e) => onApplicationUpdate(app.id, { followUp: e.target.value })}
            title="Data follow-up"
          />
        </div>

        <div className="tr__chevron">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d={open ? 'M4 10l4-4 4 4' : 'M4 6l4 4 4-4'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

      </div>

      {open && (
        <div className="tracker-row__detail">
          <div className="tr__detail-inner">
            <div className="tr__notes-col">
              <label className="tr__detail-label">Notatki z procesu</label>
              <textarea
                className="notes-area"
                placeholder="Dodaj notatki — z kim rozmawiałeś, kolejne kroki, wrażenia..."
                value={app.notes || ''}
                onChange={(e) => onApplicationUpdate(app.id, { notes: e.target.value })}
              />
            </div>
            <div className="tr__meta-col">
              <div className="tr__meta-block">
                <span className="tr__detail-label">Tryb pracy</span>
                <span className="tr__meta-val">{app.remote ? 'Remote' : app.location || '—'}</span>
              </div>
              <div className="tr__meta-block">
                <span className="tr__detail-label">Tagi</span>
                <div className="tr__tags-row">
                  {app.tags?.slice(0, 4).map((t) => <span key={t} className="tag">{t}</span>)}
                </div>
              </div>
              <div className="tr__meta-block">
                <span className="tr__detail-label">Data aplikacji</span>
                <span className="tr__meta-val">{app.appliedAt}</span>
              </div>
            </div>
          </div>
          <InterviewSummary app={app} onApplicationUpdate={onApplicationUpdate} onStatusChange={onStatusChange} />
        </div>
      )}
    </div>
  )
}

/* ── Sort arrow icon ────────────────────────────────────────── */

function SortArrow({ active, dir }) {
  if (!active) {
    return (
      <svg className="sort-arrow sort-arrow--idle" width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M6 2v8M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 7l-3 3-3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  return (
    <svg className="sort-arrow sort-arrow--active" width="12" height="12" viewBox="0 0 12 12" fill="none">
      {dir === 'asc'
        ? <path d="M6 2v8M3 5l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        : <path d="M6 10V2M9 7l-3 3-3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      }
    </svg>
  )
}

/* ── Main Tracker ───────────────────────────────────────────── */

// fields where first click = descending (highest first makes more sense)
const SORT_DESC_FIRST = new Set(['salary', 'stars'])

export default function Tracker({ applications, profile, onStatusChange, onApplicationUpdate, onFindRecruiter }) {
  const [search, setSearch]         = useState('')
  const [filterStatus, setFilter]   = useState('all')
  const [minSalary, setMinSalary]   = useState(0)
  const [sortField, setSortField]   = useState(null)   // null = default newest-first
  const [sortDir, setSortDir]       = useState('asc')
  const [dragOver, setDragOver]     = useState(null)

  const handleDrop = (statusId, appId) => {
    onStatusChange(appId, statusId)
    setDragOver(null)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      const flipped = sortDir === 'asc' ? 'desc' : 'asc'
      const defaultDir = SORT_DESC_FIRST.has(field) ? 'desc' : 'asc'
      if (sortDir !== defaultDir) {
        // third state: reset to no sort
        setSortField(null)
        setSortDir('asc')
      } else {
        setSortDir(flipped)
      }
    } else {
      setSortField(field)
      setSortDir(SORT_DESC_FIRST.has(field) ? 'desc' : 'asc')
    }
  }

  if (applications.length === 0) {
    return (
      <div className="tracker-empty">
        <div className="tracker-empty__icon">📋</div>
        <p>Przejdź do <strong>Ofert pracy</strong> i kliknij „Aplikuj →"</p>
        <p>Aplikacje pojawią się tutaj automatycznie</p>
      </div>
    )
  }

  const filtered = applications
    .filter((app) => {
      const matchSearch = !search || app.title.toLowerCase().includes(search.toLowerCase()) || app.company.toLowerCase().includes(search.toLowerCase())
      const matchStatus = filterStatus === 'all' || app.status === filterStatus
      const matchSalary = minSalary === 0 || (app.salaryMax || 0) >= minSalary
      return matchSearch && matchStatus && matchSalary
    })
    .sort((a, b) => {
      const mul = sortDir === 'asc' ? 1 : -1
      switch (sortField) {
        case 'status': {
          const ai = STATUSES.findIndex((s) => s.id === a.status)
          const bi = STATUSES.findIndex((s) => s.id === b.status)
          return (ai - bi) * mul
        }
        case 'title':
          return a.title.localeCompare(b.title, 'pl') * mul
        case 'company':
          return a.company.localeCompare(b.company, 'pl') * mul
        case 'salary':
          return ((a.salaryMax || 0) - (b.salaryMax || 0)) * mul
        case 'score': {
          const { score: sa } = calculateScore(a, profile)
          const { score: sb } = calculateScore(b, profile)
          return (sa - sb) * mul
        }
        case 'followup': {
          const fa = a.followUp || ''
          const fb = b.followUp || ''
          return fa.localeCompare(fb) * mul
        }
        default: {
          // default: newest first
          const tA = a.appliedAtRaw ? new Date(a.appliedAtRaw).getTime() : 0
          const tB = b.appliedAtRaw ? new Date(b.appliedAtRaw).getTime() : 0
          return tB - tA
        }
      }
    })

  const Th = ({ field, className, children }) => (
    <div
      className={`${className} th--sortable ${sortField === field ? 'th--sorted' : ''}`}
      onClick={() => handleSort(field)}
      title={`Sortuj po: ${children}`}
    >
      <span>{children}</span>
      <SortArrow active={sortField === field} dir={sortDir} />
    </div>
  )

  return (
    <div className="tracker-container">

      <StatsBar
        applications={applications}
        filterStatus={filterStatus}
        onFilterChange={setFilter}
        dragOver={dragOver}
        onDragOver={setDragOver}
        onDrop={handleDrop}
      />

      <div className="tracker-filters">
        <input
          className="filter-search"
          type="text"
          placeholder="Szukaj firmy lub stanowiska..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-select" value={minSalary} onChange={(e) => setMinSalary(Number(e.target.value))}>
          {SALARY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      <div className="tracker-table">
        <div className="tracker-table__head">
          <Th field="status" className="th__status-label">Etap</Th>
          <div className="th__drag" />
          <div className="th__logo" />
          <Th field="title" className="th__identity">Stanowisko / Firma</Th>
          <Th field="salary" className="th__salary">Wynagrodzenie</Th>
          <div className="th__recruiter" />
          <div className="th__status" />
          <Th field="score" className="th__match">Szanse</Th>
          <Th field="followup" className="th__followup">Follow-up</Th>
          <div className="th__chevron" />
        </div>
        <div className="tracker-table__body">
          {filtered.length === 0 ? (
            <div className="tracker-no-results">Brak wyników — spróbuj innego filtra</div>
          ) : (
            filtered.map((app) => (
              <TrackerRow
                key={app.id}
                app={app}
                profile={profile}
                onStatusChange={onStatusChange}
                onApplicationUpdate={onApplicationUpdate}
                onFindRecruiter={onFindRecruiter}
                onDragStart={() => {}}
                onDragEnd={() => setDragOver(null)}
              />
            ))
          )}
        </div>
      </div>

    </div>
  )
}
