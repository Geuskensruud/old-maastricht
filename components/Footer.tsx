// components/Footer.tsx
import Image from 'next/image';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Linkerzijde: logo + tagline */}
        <div className="footer-left">
          <div className="footer-logo-wrapper">
            <Image
              src="/logowit.png"
              alt="Old Maastricht logo"
              fill
              sizes="(max-width: 768px) 160px, 200px"
              className="footer-logo-img"
              priority={false}
            />
          </div>
          <p className="footer-tagline">
            De meest rebelse kaas van Nederland.
          </p>
        </div>

        {/* Rechterzijde: interesse + contact */}
        <div className="footer-right">
          <h3>Interesse?</h3>
          <p>Neem contact met ons op:</p>
          <p>
            <a href="mailto:info@oldmaastricht.nl">
              info@oldmaastricht.nl
            </a>
          </p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {year} Old Maastricht. Alle rechten voorbehouden.</p>
      </div>
    </footer>
  );
}
