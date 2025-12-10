'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import './Header.css';

export default function Header() {
  const pathname = usePathname();
  const { count } = useCart();

  const { data: session, status } = useSession();
  const [accountOpen, setAccountOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home' },
    { href: '/#over', label: 'Over' },
    { href: '/#waar-te-koop', label: 'Waar te koop' },
    { href: '/shop', label: 'Shop' },
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
    // Verwijs naar een accountpagina (kun je later mooi invullen)
    window.location.href = '/account';
  };

  return (
    <header className="header header--hero">
      {/* Navigatie bovenaan */}
      <div className="header-inner">
        <nav className="nav">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`nav-link ${pathname === href ? 'active' : ''}`}
            >
              {label}
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
              Login
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
                    Account
                  </button>
                  <button
                    type="button"
                    className="account-dropdown-item account-dropdown-logout"
                    onClick={handleLogout}
                  >
                    Uitloggen
                  </button>
                </div>
              )}
            </div>
          )}
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

      {/* Zwarte balk met winnaar-tekst */}
      <div className="info-bar">
        <div className="info-item info-center">
          Old Maastricht Winnaar Holland Cheese Awards 2023
        </div>
      </div>
    </header>
  );
}
