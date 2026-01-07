// components/Footer.tsx
import Image from 'next/image';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Linkerblok: logo + tagline */}
        <div className="footer-left">
          <div className="footer-logo-wrapper">
            <Image
              src="/logo.png"
              alt="Old Maastricht logo"
              fill
              sizes="180px"
              className="footer-logo-img"
              priority
            />
          </div>
          <p className="footer-tagline">
            De meest rebelse kaas van Nederland
          </p>
        </div>

        {/* Rechterblok: contact */}
        <div className="footer-right">
          <p className="footer-contact-title">Interesse?</p>
          <p className="footer-contact-text">
            Neem contact met ons op via{' '}
            <a href="mailto:info@oldmaastricht.nl">
              info@oldmaastricht.nl
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
