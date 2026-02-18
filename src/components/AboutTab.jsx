const VERCEL_URL = 'https://rocket-tracker-ivory.vercel.app' // TODO: update if wrong

export default function AboutTab() {
  return (
    <div className="about-tab">
      <div className="about-prototype-banner">
        <span className="about-prototype-icon">⚠️</span>
        <div>
          <strong>Uwaga: to prototyp</strong>, nie gotowy produkt.
          Część danych jest mockowana, integracja z AI działa w trybie demo,
          a oferty pracy zostały pobrane jednorazowo przez agenta Playwright.
          Celem jest pokazanie procesu myślowego i wizji, a nie działający system produkcyjny.
        </div>
      </div>

      <div className="about-hero">
        <h1 className="about-title">
          Rynek pracy się zmienia.<br />
          <span className="about-title--accent">Liczy się Outcome, proaktywność i zarządzanie postępującym chaosem.</span>
        </h1>
        <p className="about-lead">
          Wysyłasz 15, 20, 30 aplikacji. Tracisz wątek. Nie pamiętasz kto odpowiedział, kto nie,
          gdzie był screening. Czekasz.
        </p>
        <p className="about-lead">
          I w tym czekaniu jest właśnie problem.
        </p>
        <p className="about-lead">
          Rynek pracy się zmienia. Przez lata kandydat wysyłał CV i czekał na telefon. Firmy miały
          inicjatywę, kandydaci cierpliwość. To się skończyło. Najlepsi kandydaci nie czekają, oni
          followupują, szukają kontaktu bezpośrednio z rekruterem albo osobą decyzyjną, piszą pierwsi.
          Budują kontekst zanim jeszcze dostają zaproszenie na rozmowę.
        </p>
        <p className="about-lead">
          Jednocześnie samo CV przestaje być przewagą. To tylko papierek lakmusowy, który otwiera
          lub zamyka drzwi. Prawdziwa przewaga to szybkość, kontekst i umiejętność pokazania
          konkretnego wyniku zanim firma zdąży zapytać.
        </p>
        <p className="about-lead">
          Problem w tym, że żadne narzędzie po stronie kandydata nie zostało zaprojektowane pod ten
          nowy tryb pracy. RocketJobs ma dane i pozycję żeby to zmienić. Ten prototyp pokazuje
          jak mogłoby to wyglądać.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-card__icon">🎯</div>
          <h3>Scoring dopasowania</h3>
          <p>
            Algorytm porównuje profil kandydata (skills, lata doświadczenia, seniority)
            z wymaganiami oferty i pokazuje realny procent szans. Nie tylko "czy słowa pasują",
            ale też czy staż i poziom są zgodne z tym czego firma szuka.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card__icon">📋</div>
          <h3>Tracker aplikacji</h3>
          <p>
            Wysłano, screening, rozmowa, oferta. Każda aplikacja w jednym miejscu.
            Bez kolejnych arkuszy Google, bez gubienia wątków kiedy prowadzisz
            kilka procesów rekrutacyjnych naraz.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card__icon">🎙️</div>
          <h3>Transkrypt rozmowy</h3>
          <p>
            Wklej surowy transkrypt po rozmowie rekrutacyjnej. Prototyp wykrywa sygnały
            pozytywne, negatywne i potwierdzenia oferty, potem automatycznie
            aktualizuje status i szanse danej aplikacji.
          </p>
        </div>

        <div className="about-card">
          <div className="about-card__icon">🔍</div>
          <h3>Znajdź kontakt</h3>
          <p>
            Przy każdej aplikacji dostępni są rekruterzy i osoby decyzyjne z LinkedIn,
            wyszukani przez Brave Search API. Gotowe szablony wiadomości
            do cold outreach, pisane pod konkretną firmę i stanowisko.
          </p>
        </div>
      </div>


      <div className="about-stack">
        <h2>Stack technologiczny</h2>
        <div className="about-stack__chips">
          <span className="about-chip">React 18</span>
          <span className="about-chip">Vite 4</span>
          <span className="about-chip">CSS custom properties</span>
          <span className="about-chip">Brave Search API</span>
          <span className="about-chip">Playwright (agent-browser)</span>
          <span className="about-chip">Claude API (Sonnet 4.6)</span>
          <span className="about-chip">Vercel</span>
          <span className="about-chip">GitHub</span>
        </div>
        <p className="about-stack__note">
          Prototyp powstał w jednej sesji pracy z Claude Code, od zera do działającego demo z deployem na Vercel.
        </p>
      </div>

      <div className="about-links">
        <a
          href="https://github.com/thomasvibing/-rocket-tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="about-link about-link--gh"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          Kod na GitHub
        </a>
        <a
          href={VERCEL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="about-link about-link--vercel"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M24 22.525H0l12-21.05z" />
          </svg>
          Live demo
        </a>
      </div>

      <div className="about-footer">
        Prototyp stworzony przez <strong>Tomasza Świtałę</strong> w ramach rekrutacji na stanowisko
        Product Builder w RocketJobs / JustJoin.it. Luty 2026.
      </div>
    </div>
  )
}
