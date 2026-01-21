// components/OldMaastrichtInfo.tsx
'use client';

import Image from 'next/image';
import './OldMaastrichtInfo.css';
import { useLanguage } from '@/components/LanguageContext';

export default function OldMaastrichtInfo() {
  const { t } = useLanguage();

  return (
    <section id="over" className="oldmaastricht-info">
      {/* Linkerkolom */}
      <div className="column left">
        <p className="overline">{t('over.overtitle')}</p>
        <h2>{t('over.title')}</h2>
        <p>{t('over.body')}</p>
      </div>

      {/* Rechterkolom met 4 features */}
      <div className="column right features-grid">
        <div className="feature-item">
          <Image
            src="/icons/cheese.png"
            alt="Kaas icoon"
            width={40}
            height={40}
            className="feature-icon"
          />
          <div className="feature-text">
            <h3>{t('over.feature1.title')}</h3>
            <p>{t('over.feature1.body')}</p>
          </div>
        </div>

        <div className="feature-item">
          <Image
            src="/icons/shop.png"
            alt="Winkel icoon"
            width={40}
            height={40}
            className="feature-icon"
          />
          <div className="feature-text">
            <h3>{t('over.feature2.title')}</h3>
            <p>{t('over.feature2.body')}</p>
          </div>
        </div>

        <div className="feature-item">
          <Image
            src="/icons/cow.png"
            alt="Koe icoon"
            width={40}
            height={40}
            className="feature-icon"
          />
          <div className="feature-text">
            <h3>{t('over.feature3.title')}</h3>
            <p>{t('over.feature3.body')}</p>
          </div>
        </div>

        <div className="feature-item">
          <Image
            src="/icons/crafting.png"
            alt="Ambacht icoon"
            width={40}
            height={40}
            className="feature-icon"
          />
          <div className="feature-text">
            <h3>{t('over.feature4.title')}</h3>
            <p>{t('over.feature4.body')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
