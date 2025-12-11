// components/Footer.tsx
import Image from 'next/image';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Linkerblok: logo boven tagline, gecentreerd */}
        <div className="footer-left">
          <div className="footer-logo-wrapper">
            <Image
              src="/logowit.png"
              alt="Old Maastricht logo"
              fill
              sizes="200px"
              className="footer-logo-img"
            />
          </div>
          <p className="footer-tagline">De meest rebelse kaas van Nederland</p>
        </div>

        {/* Rechterblok: contact */}
        <div className="footer-right">
          <p className="footer-contact-title">
            Interesse? Neem contact met ons op
          </p>
          <a
            href="mailto:info@oldmaastricht.nl"
            className="footer-contact-email"
          >
            info@oldmaastricht.nl
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} Kaashandel Old Maastricht — Alle rechten voorbehouden</p>
      </div>
    </footer>
  );
}
