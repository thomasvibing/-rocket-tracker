import { useState } from 'react'

function CompanyLogo({ company, logo, domain, color, size = 44 }) {
  const [failed, setFailed] = useState(false)

  const initials = company
    .replace(/\./g, '')
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')

  const r = size <= 32 ? 6 : 8

  const src = !failed && (logo || domain)
    ? logo || `https://www.google.com/s2/favicons?sz=128&domain=${domain}`
    : null

  if (src) {
    return (
      <img
        src={src}
        alt={company}
        width={size}
        height={size}
        className="company-logo-img"
        onError={() => setFailed(true)}
      />
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={company}
    >
      <rect width={size} height={size} rx={r} fill={color || '#0A0A0A'} />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="#fff"
        fontSize={initials.length === 1 ? Math.round(size * 0.44) : Math.round(size * 0.31)}
        fontFamily="Archivo, sans-serif"
        fontWeight="800"
        letterSpacing="-0.5"
      >
        {initials}
      </text>
    </svg>
  )
}

export default function JobBoard({ jobs, applications, onApply }) {
  const appliedIds = applications.map((a) => a.id)

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} applied={appliedIds.includes(job.id)} onApply={onApply} />
      ))}
    </div>
  )
}

function JobCard({ job, applied, onApply }) {
  return (
    <div className={`job-card ${applied ? 'job-card--applied' : ''}`}>
      <div className="job-card__top">
        <div className="job-logo">
          <CompanyLogo company={job.company} logo={job.logo} domain={job.domain} color={job.brandColor} size={44} />
        </div>
        <div className="job-info">
          <h3 className="job-title">{job.title}</h3>
          <div className="job-meta">
            <span className="job-company">{job.company}</span>
            <span className="sep">·</span>
            {job.remote ? (
              <span className="badge-remote">Remote</span>
            ) : (
              <span className="job-location">{job.location}</span>
            )}
          </div>
        </div>
      </div>

      <div className="job-card__mid">
        <span className="job-salary">{job.salary}</span>
        <div className="job-tags">
          {job.experienceMin && (
            <span className="tag tag--exp">min. {job.experienceMin} {job.experienceMin === 1 ? 'rok' : 'lat'}</span>
          )}
          {job.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>

      <div className="job-card__bot">
        <span className="job-posted">{job.posted}</span>
        <div className="job-actions">
          <span className="job-type">{job.type}</span>
          <button
            className={`btn-apply ${applied ? 'btn-apply--done' : ''}`}
            onClick={() => !applied && onApply(job)}
            disabled={applied}
          >
            {applied ? '✓ Wysłano' : 'Aplikuj →'}
          </button>
        </div>
      </div>
    </div>
  )
}
