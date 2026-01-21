// components/WaarTeKoop.tsx
'use client';

import './WaarTeKoop.css';
import { useLanguage } from '@/components/LanguageContext';

export default function WaarTeKoop() {
  const { t } = useLanguage();

  const renderMultiline = (key: string) =>
    t(key)
      .split('\n')
      .map((line, idx, arr) => (
        <span key={idx}>
          {idx === 0 ? <strong>{line}</strong> : line}
          {idx < arr.length - 1 && <br />}
        </span>
      ));

  return (
    <section id="waar-te-koop" className="verkooppunten-section">
      <div className="verkooppunten-inner">
        <header className="verkooppunten-header">
          <p className="verkooppunten-tagline">{t('where.title')}</p>
          <h2 className="verkooppunten-title">{t('where.subtitle')}</h2>
        </header>

        <div className="verkooppunten-grid">
          {/* Maastricht */}
          <article className="verkooppunten-card">
            <div className="verkooppunten-image verkooppunten-image--maastricht" />
            <div className="verkooppunten-card-body">
              <h3 className="verkooppunten-card-title">
                {t('where.card.maastricht.title')}
              </h3>
              <p className="verkooppunten-card-subtitle">
                Kaashandel Sauer Maastricht
              </p>
              <p className="verkooppunten-card-text">
                {renderMultiline('where.card.maastricht.text')}
              </p>

              {/* Google Maps knop – coördinaten Maastricht */}
              <a
                href="https://www.google.com/maps?q=50.85110,5.691799"
                target="_blank"
                rel="noopener noreferrer"
                className="verkooppunten-button"
              >
                {t('where.card.button.route')}
              </a>
            </div>
          </article>

          {/* Sittard */}
          <article className="verkooppunten-card">
            <div className="verkooppunten-image verkooppunten-image--sittard" />
            <div className="verkooppunten-card-body">
              <h3 className="verkooppunten-card-title">
                {t('where.card.sittard.title')}
              </h3>
              <p className="verkooppunten-card-subtitle">
                Kaashandel Sauer Sittard
              </p>
              <p className="verkooppunten-card-text">
                {renderMultiline('where.card.sittard.text')}
              </p>

              {/* Google Maps knop – Markt, 6131 EK Sittard */}
              <a
                href="https://www.google.com/maps?q=Markt,+6131+EK+Sittard"
                target="_blank"
                rel="noopener noreferrer"
                className="verkooppunten-button"
              >
                {t('where.card.button.route')}
              </a>
            </div>
          </article>

          {/* Webshop */}
          <article className="verkooppunten-card">
            <div className="verkooppunten-image verkooppunten-image--online" />
            <div className="verkooppunten-card-body">
              <h3 className="verkooppunten-card-title">
                {t('where.card.online.title')}
              </h3>
              <p className="verkooppunten-card-text">
                {t('where.card.online.text')}
              </p>
              <a
                href="/shop"
                className="verkooppunten-button verkooppunten-button--webshop"
              >
                {t('where.card.button.shop')}
              </a>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
