'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { useSession, signOut } from 'next-auth/react';
import './Header.css';

export default function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const { data: session } = useSession();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/#over', label: 'Over' },
    { href: '/#waar-te-koop', label: 'Waar te koop' },
    { href: '/shop', label: 'Shop' },
  ];

  const userAny = session?.user as any;
  const voornaam = userAny?.voornaam as string | undefined;
  const achternaam = userAny?.achternaam as string | undefined;
  const email = session?.user?.email || '';

  const initialsRaw =
    (voornaam?.[0] ?? '') +
    (achternaam?.[0] ?? '');
  const initials =
    initialsRaw.trim().length > 0
      ? initialsRaw.toUpperCase()
      : (email[0]?.toUpperCase() ?? '?');

  return (
    <header className="header header--hero">
      {/* Navigatie bovenaan */}
      <div className="header-inner">
        <nav className="nav">
          {/* Gewone links */}
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

          {/* Login / Initialen */}
          {session?.user ? (
            <button
              type="button"
              className="login-link login-link--initials"
              onClick={() => signOut({ callbackUrl: '/' })}
              title="Uitloggen"
            >
              <span className="login-initials">{initials}</span>
            </button>
          ) : (
            <Link href="/login" className="login-link">
              <span>Login</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Logo gecentreerd over de header-afbeelding */}
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
