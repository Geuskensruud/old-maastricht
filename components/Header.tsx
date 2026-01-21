'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import { useLanguage, LangCode } from '@/components/LanguageContext';
import './Header.css';

export default function Header() {
  const pathname = usePathname();
  const { count } = useCart();

  const { data: session, status } = useSession();
  const [accountOpen, setAccountOpen] = useState(false);

  const { lang, setLang, t } = useLanguage();

  const links = [
    { href: '/', key: 'nav.home' },
    { href: '/#over', key: 'nav.over' },
    { href: '/#waar-te-koop', key: 'nav.where' },
    { href: '/shop', key: 'nav.shop' },
  ];

  const userAny = session?.user as any | undefined;
  const voornaam = userAny?.voornaam as string | undefined;
  const achternaam = userAny?.achternaam as string | undefined;

  const initials =
    (voornaam?.[0] || '') + (achternaam?.[0] || session?.user?.email?.[0] || '');

  const initialsLabel = initials ? initials.toUpperCase() : '?';

  const handleLogout = () => {
    setAccountOpen(false);
    signOut({ callbackUrl: '/' });
  };

  const handleGoToAccount = () => {
    setAccountOpen(false);
    window.location.href = '/account';
  };

  const languages: { code: LangCode; emoji: string; label: string }[] = [
    { code: 'nl', emoji: '🇳🇱', label: 'Nederlands' },
    { code: 'en', emoji: '🇬🇧', label: 'English' },
    { code: 'fr', emoji: '🇫🇷', label: 'Français' },
    { code: 'de', emoji: '🇩🇪', label: 'Deutsch' },
  ];

  return (
    <header className="header header--hero">
      {/* Navigatie bovenaan */}
      <div className="header-inner">
        <nav className="nav">
          {links.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? 'active' : ''}`}
            >
              {t(key)}
            </Link>
          ))}

          {/* Winkelmandje */}
          <Link href="/winkelmand" className="cart-link" aria-label="Winkelmandje">
            <ShoppingCart className="cart-icon" />
            {count > 0 && (
              <span className="cart-count" aria-live="polite" aria-atomic="true">
                {count}
              </span>
            )}
          </Link>

          {/* Login / Account */}
          {status !== 'authenticated' ? (
            <button
              type="button"
              className="login-button"
              onClick={() => signIn()}
            >
              {t('nav.login')}
            </button>
          ) : (
            <div className="account-menu">
              <button
                type="button"
                className="account-trigger"
                onClick={() => setAccountOpen((open) => !open)}
              >
                <span className="account-initials">{initialsLabel}</span>
              </button>

              {accountOpen && (
                <div className="account-dropdown">
                  <button
                    type="button"
                    className="account-dropdown-item"
                    onClick={handleGoToAccount}
                  >
                    {t('nav.account')}
                  </button>
                  <button
                    type="button"
                    className="account-dropdown-item account-dropdown-logout"
                    onClick={handleLogout}
                  >
                    {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 🔤 Taal-switcher rechtsboven */}
          <div className="lang-switch">
            {languages.map((l) => (
              <button
                key={l.code}
                type="button"
                className={`lang-btn ${lang === l.code ? 'lang-btn--active' : ''}`}
                onClick={() => setLang(l.code)}
                aria-label={l.label}
              >
                <span className="lang-emoji">{l.emoji}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>

      {/* Logo gecentreerd */}
      <div className="header-logo-center">
        <div className="logo-wrapper">
          <Image
            src="/logo.png"
            alt="Kaashandel logo"
            fill
            className="logo-img"
            sizes="(max-width: 768px) 150px, 570px"
            priority
          />
        </div>
      </div>

      {/* Zwarte balk met winnaar-tekst (nu via t()) */}
      <div className="info-bar">
        <div className="info-item info-center">
          {t('header.winner')}
        </div>
      </div>
    </header>
  );
}
