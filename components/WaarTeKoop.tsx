// components/WaarTeKoop.tsx
import './WaarTeKoop.css';

export default function WaarTeKoop() {
  return (
    <section id="waar-te-koop" className="waar-te-koop-section">
      <div className="waar-te-koop-inner">
        <p className="waar-te-koop-overtitle">
          Waar is Old Maastricht te koop?
        </p>
        <h2 className="waar-te-koop-title">Verkooppunten</h2>

        <div className="waar-te-koop-grid">
          {/* Maastricht */}
          <article className="verkooppunt-card">
            <div className="verkooppunt-image-wrapper">
              <img
                src="/MaastrichtLocatie.png"
                alt="Kraam met Old Maastricht kaas op de markt in Maastricht"
                className="verkooppunt-image"
              />
            </div>
            <div className="verkooppunt-body">
              <h3>Maastricht</h3>
              <p className="verkooppunt-sub">Kaashandel Sauer Maastricht</p>
              <p className="verkooppunt-label">Weekmarkt Maastricht</p>
              <p className="verkooppunt-text">
                Dinsdag t/m vrijdag 10.00 – 17.00
                <br />
                Zondag 12.00 – 17.00
              </p>
            </div>
          </article>

          {/* Sittard */}
          <article className="verkooppunt-card">
            <div className="verkooppunt-image-wrapper">
              <img
                src="/SittardLocatie.png"
                alt="Markt in Sittard waar Old Maastricht wordt verkocht"
                className="verkooppunt-image"
              />
            </div>
            <div className="verkooppunt-body">
              <h3>Sittard</h3>
              <p className="verkooppunt-sub">Kaashandel Sauer Sittard</p>
              <p className="verkooppunt-label">Weekmarkt Sittard</p>
              <p className="verkooppunt-text">
                Zaterdag 08.00 – 17.00
              </p>
            </div>
          </article>

          {/* Webshop */}
          <article className="verkooppunt-card">
            <div className="verkooppunt-image-wrapper">
              <img
                src="/OnlineLocatie.png"
                alt="Maasbrug in Maastricht, verwijzing naar de webshop"
                className="verkooppunt-image"
              />
            </div>
            <div className="verkooppunt-body">
              <h3>Webshop</h3>
              <p className="verkooppunt-text">
                Koop Old Maastricht nu ook online via onze eigen webshop.
              </p>
              <a href="/shop" className="verkooppunt-button">
                Webshop
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
