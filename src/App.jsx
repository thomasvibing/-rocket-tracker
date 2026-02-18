import { useState } from 'react'
import JobBoard from './components/JobBoard'
import Tracker from './components/Tracker'
import RecruiterModal from './components/RecruiterModal'
import ProfileTab from './components/ProfileTab'
import AboutTab from './components/AboutTab'
import './App.css'

// Oferty pobrane na żywo z justjoin.it przez agent-browser (Playwright)
const MOCK_JOBS = [
  {
    id: 1,
    title: 'AI Engineer',
    company: 'Link Group',
    logo: 'https://public.justjoin.it/companies/logos/original/b8ec131a1074810a98be228aa03cc01502dd077b.jpg',
    location: 'Warszawa',
    salary: '20 000 – 26 000 PLN',
    salaryMin: 20000,
    salaryMax: 26000,
    type: 'B2B',
    tags: ['RAG', 'Azure', 'LLM', 'Python'],
    experienceMin: 3,
    brandColor: '#00457C',
    posted: '2 dni temu',
    remote: false,
  },
  {
    id: 2,
    title: 'Solutions Architect (EU public)',
    company: 'Britenet',
    logo: 'https://public.justjoin.it/companies/logos/original/2c281aa4d002f2984a4dfd944492434547835944.png',
    location: 'Warszawa',
    salary: '28 000 – 42 000 PLN',
    salaryMin: 28000,
    salaryMax: 42000,
    type: 'B2B',
    tags: ['UML', 'BPMN', 'TOGAF', 'AWS'],
    experienceMin: 6,
    brandColor: '#E84041',
    posted: '20 dni temu',
    remote: false,
  },
  {
    id: 3,
    title: 'Front-End Engineer (React + Java)',
    company: 'State Street',
    logo: 'https://s3.eu-west-1.amazonaws.com/images.justjoin.it/justjoinit/company-logos/0bfb8cc2-ab1a-4aa2-91d0-a45c79ac480a%24.png',
    location: 'Kraków',
    salary: '12 000 – 18 000 PLN',
    salaryMin: 12000,
    salaryMax: 18000,
    type: 'B2B',
    tags: ['React', 'TypeScript', 'Playwright', 'Java'],
    experienceMin: 2,
    brandColor: '#003087',
    posted: 'Nowa',
    remote: false,
  },
  {
    id: 4,
    title: 'Business Analyst',
    company: 'mITp',
    logo: 'https://public.justjoin.it/offers/company_logos/original/fd26fb957f3e870d2b57fd4faf1519b5e53154bc.jpg',
    location: 'Warszawa',
    salary: '12 000 – 20 000 PLN',
    salaryMin: 12000,
    salaryMax: 20000,
    type: 'B2B',
    tags: ['Business Analysis', 'Confluence', 'Jira', 'SQL'],
    experienceMin: 2,
    brandColor: '#4B0082',
    posted: 'Nowa',
    remote: false,
  },
  {
    id: 5,
    title: 'AWS DevOps Engineer',
    company: 'Link Group',
    logo: 'https://public.justjoin.it/companies/logos/original/b8ec131a1074810a98be228aa03cc01502dd077b.jpg',
    location: 'Warszawa',
    salary: '170 – 200 PLN/h',
    salaryMin: 27200,
    salaryMax: 32000,
    type: 'B2B',
    tags: ['AWS', 'DevOps', 'IaC', 'Terraform'],
    experienceMin: 4,
    brandColor: '#00457C',
    posted: '18 dni temu',
    remote: false,
  },
  {
    id: 6,
    title: 'QA Engineer – ReadyAPI',
    company: 'SmartBear',
    logo: 'https://public.justjoin.it/offers/company_logos/original/a70418a7b578a62dbbb0332db6acc57d132715a1.png',
    location: 'Wrocław',
    salary: '11 000 – 12 000 PLN',
    salaryMin: 11000,
    salaryMax: 12000,
    type: 'B2B',
    tags: ['Cypress', 'Test Automation', 'JavaScript', 'API Testing'],
    experienceMin: 2,
    brandColor: '#00B0A0',
    posted: '24 dni temu',
    remote: false,
  },
  {
    id: 7,
    title: 'Senior Fullstack Developer (.Net)',
    company: 'Link Group',
    logo: 'https://public.justjoin.it/companies/logos/original/b8ec131a1074810a98be228aa03cc01502dd077b.jpg',
    location: 'Kraków',
    salary: '22 000 – 23 000 PLN',
    salaryMin: 22000,
    salaryMax: 23000,
    type: 'B2B',
    tags: ['.NET Core', 'TypeScript', 'React', 'CI/CD'],
    experienceMin: 5,
    brandColor: '#00457C',
    posted: '27 dni temu',
    remote: false,
  },
  {
    id: 8,
    title: 'Senior Fullstack .Net Developer',
    company: 'Speeron Polska',
    logo: 'https://public.justjoin.it/companies/logos/original/fd5fbca7bb7d70e5c20b3145808116288c5514b5.png',
    location: 'Gdańsk',
    salary: '20 000 – 25 000 PLN',
    salaryMin: 20000,
    salaryMax: 25000,
    type: 'B2B',
    tags: ['C#', '.NET', 'SOLID', 'React'],
    experienceMin: 5,
    brandColor: '#2E7D32',
    posted: '14 dni temu',
    remote: false,
  },
]

/* ── RocketJobs official SVG logo (144×22, extracted from rocketjobs.pl bundle) ── */
function RocketJobsLogo({ height = 20, className = '' }) {
  const w = Math.round(144 / 22 * height)
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 144 22"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="RocketJobs"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.82 1.43c.865 1.082 1.437 2.378 1.713 3.876h-.002a9.51 9.51 0 0 1 5.486 8.62 9.49 9.49 0 0 1-3.694 7.524c-1.689 1.31-4.144.112-4.144-2.025v-1.28H7.84v1.28c0 2.126-2.441 3.337-4.126 2.04A9.5 9.5 0 0 1 .01 13.507a9.46 9.46 0 0 1 5.482-8.208c.276-1.493.848-2.786 1.712-3.865.29-.365.618-.69.973-.97a2.156 2.156 0 0 1 2.67-.003c.357.28.685.606.975.97m.72 14.164h2.163V13.42c0-.631-.401-1.167-.965-1.366-.67-.238-1.206-1.045-1.206-1.757V7.5c0-2.237-.592-4.014-1.645-5.329a4.8 4.8 0 0 0-.781-.778.97.97 0 0 0-1.198 0 4.8 4.8 0 0 0-.781.778C7.074 3.487 6.48 5.264 6.48 7.5v2.798c0 .712-.535 1.521-1.205 1.757a1.45 1.45 0 0 0-.965 1.366v2.173h2.168c.753 0 1.36.61 1.36 1.36h3.34c0-.752.61-1.36 1.36-1.36m73.789-13.15a1.837 1.837 0 1 1-.001 3.674 1.837 1.837 0 0 1 0-3.674M9.51 5.606c-1.009 0-1.837.83-1.837 1.836s.83 1.837 1.837 1.837c1.006 0 1.837-.83 1.837-1.837 0-1.006-.83-1.836-1.837-1.836m20.718 7.023c0-3.11 2.333-5.466 5.644-5.466s5.645 2.356 5.645 5.466-2.334 5.466-5.645 5.466-5.644-2.357-5.644-5.466m3.021.002c0 1.666 1.09 2.823 2.623 2.823s2.623-1.157 2.623-2.823-1.089-2.822-2.623-2.822-2.623 1.157-2.623 2.822m21.272-8.35v13.574h3.066V4.28zm6.47 3.128h3.487L61 11.631l4.232 6.283h-3.557l-3.357-5.16a1.85 1.85 0 0 1 .11-2.166zm9.01-.246c-3.156 0-5.378 2.356-5.378 5.466s2.155 5.466 5.466 5.466c2.067 0 4.269-.978 4.933-3.4h-2.778c-.422.645-1.045.935-2.222.935-1.288 0-2.222-.668-2.556-2h7.846c.023-.422.023-.577.023-1.001 0-3.112-2.178-5.466-5.334-5.466m-2.556 4.467c.29-1.156 1.224-1.979 2.556-1.979s2.334.846 2.533 1.98zm17.348-4.22h3.069v14.355h-3.068zm9.953-.246c-3.311 0-5.645 2.356-5.645 5.466s2.334 5.466 5.645 5.466 5.644-2.357 5.644-5.466-2.333-5.466-5.644-5.466m0 8.29c-1.534 0-2.623-1.156-2.623-2.822 0-1.665 1.089-2.822 2.623-2.822s2.623 1.157 2.623 2.822-1.09 2.823-2.623 2.823m9.868-6.78c.644-.954 1.71-1.51 3.133-1.51v.003c2.643 0 4.866 2.131 4.866 5.466 0 3.109-2.29 5.466-5.49 5.466s-5.577-2.334-5.577-5.712V4.28h3.068zm-.047 3.959c0 1.666 1.089 2.822 2.556 2.822 1.423 0 2.468-1.156 2.468-2.822s-1.045-2.823-2.468-2.823c-1.223 0-2.556.844-2.556 2.823m11.999-2.29c0-.445.401-.823 1.065-.823.665 0 1.133.378 1.245.89h2.845c-.155-2.023-1.733-3.267-4.09-3.244-2.333.024-3.867 1.356-3.867 3.18 0 2.559 2.041 3.138 3.582 3.574.935.265 1.685.478 1.685 1.048 0 .49-.466.779-1.133.779-.712 0-1.356-.29-1.511-1.001h-2.889c.178 1.932 1.911 3.355 4.4 3.355 2.111 0 4.022-1.2 4.022-3.133 0-2.505-2.101-3.127-3.671-3.592-.936-.277-1.683-.499-1.683-1.03zm23.779-6.06h3.068v13.57h-3.068zm-6.584 2.845c-3.213 0-5.598 2.341-5.598 5.733v9.025h3.079V16.92c.67.691 1.673 1.183 3.055 1.183 2.744 0 4.974-2.142 4.974-5.487 0-3.123-2.297-5.487-5.51-5.487m0 8.32c-1.226 0-2.566-.85-2.566-2.833 0-1.674 1.092-2.833 2.566-2.833 1.475 0 2.476 1.159 2.476 2.833 0 1.673-1.048 2.832-2.476 2.832M50.567 11.63c-.215-.996-1.25-1.798-2.473-1.798V9.83c-1.498.033-2.556 1.18-2.556 2.799 0 1.62 1.058 2.765 2.556 2.799 1.379 0 2.256-.802 2.473-1.8h2.794c-.184 2.115-1.945 4.467-5.202 4.467h-.065c-3.244 0-5.577-2.354-5.577-5.466s2.333-5.466 5.577-5.466h.065c2.985 0 5.018 2.351 5.202 4.467zm74.352 2.72c-1.009 0-1.837.83-1.837 1.836s.831 1.837 1.837 1.837 1.837-.83 1.837-1.837a1.85 1.85 0 0 0-1.837-1.837M79.764 9.896v5.36h3.423v2.598h-2.941a3.44 3.44 0 0 1-3.438-3.438V4.28h2.956v3.13h2.81v2.488zM77.822 18.7h-.013v.122h.013zM26.368 7.342h3.347v2.563h-3.311v7.95h-3.068V10.41a3.065 3.065 0 0 1 3.032-3.068"
      />
    </svg>
  )
}

const DEFAULT_PROFILE = {
  name: 'Jan Kowalski',
  years: '3',
  seniority: 'mid',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'AWS'],
  history: [
    { company: 'Allegro', role: 'Frontend Developer', years: '2' },
    { company: 'Accenture', role: 'Junior Developer', years: '1' },
  ],
}

function ProfileWidget({ profile, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)

  const save = () => {
    onChange(draft)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="profile-edit">
        <input
          className="profile-input"
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="Imię i nazwisko"
        />
        <input
          className="profile-input profile-input--short"
          value={draft.years}
          onChange={(e) => setDraft({ ...draft, years: e.target.value })}
          placeholder="Lata dośw."
          type="number"
          min="0"
          max="40"
        />
        <button className="profile-btn profile-btn--save" onClick={save}>Zapisz</button>
        <button className="profile-btn profile-btn--cancel" onClick={() => setEditing(false)}>✕</button>
      </div>
    )
  }

  return (
    <div className="profile-pill" onClick={() => setEditing(true)} title="Kliknij żeby edytować profil">
      <span className="profile-avatar">{profile.name.charAt(0)}</span>
      <span className="profile-name">{profile.name}</span>
      <span className="profile-sep">·</span>
      <span className="profile-years">{profile.years} {profile.years === '1' ? 'rok' : 'lata'} dośw.</span>
      <span className="profile-edit-icon">✏️</span>
    </div>
  )
}

export default function App() {
  const [applications, setApplications] = useState([])
  const [recruiterModal, setRecruiterModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [activeView, setActiveView] = useState('about')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleApply = (job) => {
    if (applications.find((a) => a.id === job.id)) {
      showToast('Już aplikowałeś na to stanowisko!', 'warning')
      return
    }
    const now = new Date()
    setApplications((prev) => [
      {
        ...job,
        status: 'applied',
        appliedAt: now.toLocaleDateString('pl-PL'),
        appliedAtRaw: now.toISOString(),
        notes: '',
        stars: 0,
        followUp: '',
      },
      ...prev,
    ])
    showToast(`✓ Aplikacja wysłana do ${job.company}!`, 'success')
    setActiveView('tracker')
  }

  const handleStatusChange = (jobId, newStatus) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === jobId ? { ...app, status: newStatus } : app))
    )
  }

  const handleApplicationUpdate = (jobId, fields) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === jobId ? { ...app, ...fields } : app))
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <RocketJobsLogo height={20} className="logo-svg" />
            <span className="logo-divider" />
            <span className="logo-text">
              Rocket<span className="logo-accent">Tracker</span>
            </span>
          </div>
          <div className="header-right">
            <ProfileWidget profile={profile} onChange={setProfile} />
          </div>
        </div>
      </header>

      <nav className="view-nav">
        <div className="view-nav__inner">
          <button
            className={`view-nav__tab ${activeView === 'about' ? 'view-nav__tab--active' : ''}`}
            onClick={() => setActiveView('about')}
          >
            O projekcie
          </button>
          <button
            className={`view-nav__tab ${activeView === 'jobs' ? 'view-nav__tab--active' : ''}`}
            onClick={() => setActiveView('jobs')}
          >
            Oferty pracy
            <span className="view-nav__count">{MOCK_JOBS.length}</span>
          </button>
          <button
            className={`view-nav__tab ${activeView === 'tracker' ? 'view-nav__tab--active' : ''}`}
            onClick={() => setActiveView('tracker')}
          >
            Moje aplikacje
            {applications.length > 0 && (
              <span className="view-nav__count view-nav__count--new">{applications.length}</span>
            )}
          </button>
          <button
            className={`view-nav__tab ${activeView === 'profile' ? 'view-nav__tab--active' : ''}`}
            onClick={() => setActiveView('profile')}
          >
            Profil kandydata
          </button>
        </div>
      </nav>

      <main className="main">
        {activeView === 'about' && (
          <div className="about-view">
            <AboutTab />
          </div>
        )}

        {activeView === 'jobs' && (
          <div className="jobs-view">
            <div className="jobs-view__header">
              <div>
                <h2 className="jobs-view__title">Oferty z JustJoin.it dopasowane do Twojego profilu</h2>
                <p className="jobs-view__sub">Kliknij <strong>Aplikuj →</strong> — oferta pojawi się automatycznie w trackerze</p>
              </div>
              <span className="badge purple">{MOCK_JOBS.length} ofert</span>
            </div>
            <JobBoard jobs={MOCK_JOBS} applications={applications} onApply={handleApply} />
          </div>
        )}

        {activeView === 'tracker' && (
          <div className="tracker-view">
            <div className="tracker-view__header">
              <div>
                <h2 className="jobs-view__title">Moje aplikacje</h2>
                <p className="jobs-view__sub">Śledź statusy, oceniaj oferty i znajdź rekrutera jednym kliknięciem</p>
              </div>
              <span className="badge green">{applications.length} aplikacji</span>
            </div>
            <Tracker
              applications={applications}
              profile={profile}
              onStatusChange={handleStatusChange}
              onApplicationUpdate={handleApplicationUpdate}
              onFindRecruiter={setRecruiterModal}
            />
          </div>
        )}

        {activeView === 'profile' && (
          <div className="profile-view">
            <div className="jobs-view__header">
              <div>
                <h2 className="jobs-view__title">Profil kandydata</h2>
                <p className="jobs-view__sub">Uzupełniony profil zwiększa dokładność scoringu szans na każdej ofercie</p>
              </div>
              <span className={`badge ${profile.skills.length >= 3 && profile.history.some(h => h.company) ? 'green' : 'purple'}`}>
                {profile.skills.length >= 3 && profile.history.some(h => h.company) ? 'Kompletny' : 'Uzupełnij profil'}
              </span>
            </div>
            <ProfileTab profile={profile} onChange={setProfile} jobs={MOCK_JOBS} />
          </div>
        )}
      </main>

      {recruiterModal && (
        <RecruiterModal
          job={recruiterModal}
          profile={profile}
          onClose={() => setRecruiterModal(null)}
        />
      )}

      {toast && <div className={`toast toast-${toast.type}`}>{toast.message}</div>}
    </div>
  )
}
