// components/WaarTeKoop.tsx
import './WaarTeKoop.css';

export default function WaarTeKoop() {
  return (
    <section id="waar-te-koop" className="verkooppunten-section">
      <div className="verkooppunten-inner">
        <header className="verkooppunten-header">
          <p className="verkooppunten-tagline">Waar is Old Maastricht te koop?</p>
          <h2 className="verkooppunten-title">Verkooppunten</h2>
        </header>

        <div className="verkooppunten-grid">
          {/* Maastricht */}
          <article className="verkooppunten-card">
            <div className="verkooppunten-image verkooppunten-image--maastricht" />
            <div className="verkooppunten-card-body">
              <h3 className="verkooppunten-card-title">Maastricht</h3>
              <p className="verkooppunten-card-subtitle">
                Kaashandel Sauer Maastricht
              </p>
              <p className="verkooppunten-card-text">
                <strong>Weekmarkt Maastricht</strong>
                <br />
                Dinsdag t/m vrijdag 10.00 – 17.00
                <br />
                Zondag 12.00 – 17.00
              </p>

              {/* Google Maps knop – coördinaten Maastricht */}
              <a
                href="https://www.google.com/maps?q=50.85110,5.691799"
                target="_blank"
                rel="noopener noreferrer"
                className="verkooppunten-button"
              >
                Route via Google Maps
              </a>
            </div>
          </article>

          {/* Sittard */}
          <article className="verkooppunten-card">
            <div className="verkooppunten-image verkooppunten-image--sittard" />
            <div className="verkooppunten-card-body">
              <h3 className="verkooppunten-card-title">Sittard</h3>
              <p className="verkooppunten-card-subtitle">
                Kaashandel Sauer Sittard
              </p>
              <p className="verkooppunten-card-text">
                <strong>Weekmarkt Sittard</strong>
                <br />
                Zaterdag 08.00 – 17.00
              </p>

              {/* Google Maps knop – Markt, 6131 EK Sittard */}
              <a
                href="https://www.google.com/maps?q=Markt,+6131+EK+Sittard"
                target="_blank"
                rel="noopener noreferrer"
                className="verkooppunten-button"
              >
                Route via Google Maps
              </a>
            </div>
          </article>

          {/* Webshop */}
          <article className="verkooppunten-card">
            <div className="verkooppunten-image verkooppunten-image--online" />
            <div className="verkooppunten-card-body">
              <h3 className="verkooppunten-card-title">Webshop</h3>
              <p className="verkooppunten-card-text">
                Koop Old Maastricht nu ook online via onze eigen webshop.
              </p>
              <a
                href="/shop"
                className="verkooppunten-button verkooppunten-button--webshop"
              >
                Webshop
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
