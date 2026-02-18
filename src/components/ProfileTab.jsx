import { useState } from 'react'

const SENIORITY_OPTIONS = [
  { id: 'brak',   label: 'Brak',        years: '< 1 roku' },
  { id: 'junior', label: 'Junior',      years: '0–2 lat' },
  { id: 'mid',    label: 'Mid',         years: '2–5 lat' },
  { id: 'senior', label: 'Senior',      years: '5–10 lat' },
  { id: 'lead',   label: 'Lead/Expert', years: '10+ lat' },
]

function HistoryEntry({ entry, index, onChange }) {
  return (
    <div className="history-entry">
      <span className="history-entry__num">{index + 1}</span>
      <div className="history-entry__fields">
        <input
          className="profile-field-input"
          placeholder="Firma"
          value={entry.company}
          onChange={(e) => onChange({ ...entry, company: e.target.value })}
        />
        <input
          className="profile-field-input"
          placeholder="Stanowisko"
          value={entry.role}
          onChange={(e) => onChange({ ...entry, role: e.target.value })}
        />
        <input
          className="profile-field-input profile-field-input--xs"
          placeholder="Lata"
          type="number"
          min="0"
          max="30"
          value={entry.years}
          onChange={(e) => onChange({ ...entry, years: e.target.value })}
        />
      </div>
    </div>
  )
}

export default function ProfileTab({ profile, onChange, jobs = [] }) {
  const [skillInput, setSkillInput] = useState('')

  // Wszystkie unikalne tagi z ofert pracy — jako gotowe sugestie
  const allJobTags = [...new Set(jobs.flatMap((j) => j.tags ?? []))]
  const suggestions = allJobTags.filter(
    (tag) =>
      !profile.skills.includes(tag) &&
      (!skillInput.trim() || tag.toLowerCase().includes(skillInput.toLowerCase()))
  )

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed || profile.skills.includes(trimmed)) { setSkillInput(''); return }
    onChange({ ...profile, skills: [...profile.skills, trimmed] })
    setSkillInput('')
  }

  const addSuggestion = (tag) => {
    if (!profile.skills.includes(tag)) {
      onChange({ ...profile, skills: [...profile.skills, tag] })
    }
  }

  const removeSkill = (skill) => {
    onChange({ ...profile, skills: profile.skills.filter((s) => s !== skill) })
  }

  const updateHistory = (index, entry) => {
    const updated = [...profile.history]
    updated[index] = entry
    onChange({ ...profile, history: updated })
  }

  const years = parseInt(profile.years, 10) || 0
  const expPts = Math.min(5, Math.floor(years / 2))
  const skillsPts = profile.skills.length >= 3 ? 5 : 0
  const histPts = profile.history.some((h) => h.company) ? 5 : 0
  const totalBonus = expPts + skillsPts + histPts

  return (
    <div className="profile-tab">
      <div className="profile-tab__inner">

        {/* ── Left column ── */}
        <div className="profile-tab__left">

          <div className="profile-section">
            <h3 className="profile-section__title">Dane podstawowe</h3>
            <div className="profile-fields-row">
              <div className="profile-field">
                <label className="profile-field__label">Imię i nazwisko</label>
                <input
                  className="profile-field-input"
                  value={profile.name}
                  onChange={(e) => onChange({ ...profile, name: e.target.value })}
                  placeholder="Jan Kowalski"
                />
              </div>
              <div className="profile-field profile-field--xs">
                <label className="profile-field__label">Lata dośw.</label>
                <input
                  className="profile-field-input"
                  type="number"
                  min="0"
                  max="40"
                  value={profile.years}
                  onChange={(e) => onChange({ ...profile, years: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3 className="profile-section__title">Poziom seniority</h3>
            <div className="seniority-pills">
              {SENIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  className={`seniority-pill ${profile.seniority === opt.id ? 'seniority-pill--active' : ''}`}
                  onClick={() => onChange({ ...profile, seniority: opt.id })}
                  type="button"
                >
                  <span className="seniority-pill__label">{opt.label}</span>
                  <span className="seniority-pill__years">{opt.years}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="profile-section">
            <h3 className="profile-section__title">
              Umiejętności
              {profile.skills.length > 0 && (
                <span className="profile-section__count">{profile.skills.length}</span>
              )}
            </h3>
            <p className="profile-section__sub">
              Kliknij tag z ofert pracy lub wpisz własny i naciśnij Enter. Tagi tożsame z ofertami = wyższy scoring.
            </p>
            <div className="skill-input-row">
              <input
                className="profile-field-input"
                placeholder="Szukaj lub wpisz skill…"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              />
              {skillInput.trim() && !allJobTags.some(t => t.toLowerCase() === skillInput.trim().toLowerCase()) && (
                <button className="skill-add-btn" onClick={addSkill} type="button">+ Dodaj</button>
              )}
            </div>
            {suggestions.length > 0 && (
              <div className="skill-suggestions">
                {suggestions.map((tag) => (
                  <button
                    key={tag}
                    className="skill-suggestion"
                    type="button"
                    onClick={() => addSuggestion(tag)}
                  >
                    + {tag}
                  </button>
                ))}
              </div>
            )}
            <div className="skills-tags">
              {profile.skills.map((skill) => (
                <span key={skill} className="skill-tag">
                  {skill}
                  <button className="skill-tag__remove" onClick={() => removeSkill(skill)} type="button" aria-label={`Usuń ${skill}`}>×</button>
                </span>
              ))}
              {profile.skills.length === 0 && (
                <span className="skills-empty">Dodaj min. 3 umiejętności — wtedy scoring działa najdokładniej</span>
              )}
            </div>
          </div>

        </div>

        {/* ── Right column ── */}
        <div className="profile-tab__right">

          <div className="profile-section">
            <h3 className="profile-section__title">Historia zatrudnienia</h3>
            <p className="profile-section__sub">Poprzednie stanowiska wpływają na scoring szans w każdej ofercie</p>
            <div className="history-list">
              {profile.history.map((entry, i) => (
                <HistoryEntry key={i} entry={entry} index={i} onChange={(e) => updateHistory(i, e)} />
              ))}
            </div>
          </div>

          <div className="profile-section profile-section--highlight">
            <h3 className="profile-section__title">Wpływ profilu na scoring</h3>
            <p className="profile-section__sub">Kompletny profil dodaje do każdej oferty:</p>
            <div className="score-factors">
              <div className="score-factor-row">
                <span>Umiejętności (min. 3)</span>
                <span className={skillsPts > 0 ? 'factor-val--pos' : 'factor-val--neutral'}>
                  {skillsPts > 0 ? `+${skillsPts} pkt` : `${profile.skills.length}/3`}
                </span>
              </div>
              <div className="score-factor-row">
                <span>Historia zatrudnienia</span>
                <span className={histPts > 0 ? 'factor-val--pos' : 'factor-val--neutral'}>
                  {histPts > 0 ? `+${histPts} pkt` : 'uzupełnij'}
                </span>
              </div>
              <div className="score-factor-row">
                <span>Doświadczenie ({years} lat)</span>
                <span className="factor-val--pos">+{expPts} pkt</span>
              </div>
              <div className="score-factor-row score-factor-row--sep" />
              <div className="score-factor-row score-factor-row--total">
                <span>Bonus profilu łącznie</span>
                <span className="factor-val--pos">+{totalBonus} / 15 pkt</span>
              </div>
              <div className="score-factor-row">
                <span>Maks. bonus z dopasowania skills</span>
                <span className="factor-val--neutral">+15 pkt</span>
              </div>
              <div className="score-factor-row">
                <span>Maks. bonus z transkryptu</span>
                <span className="factor-val--neutral">+15 pkt</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
