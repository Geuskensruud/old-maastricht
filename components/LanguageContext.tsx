'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

export type LangCode = 'nl' | 'en' | 'fr' | 'de';

type TranslationMap = Record<string, string>;
type Translations = Record<LangCode, TranslationMap>;

const translations: Translations = {
  nl: {
    // Navigatie
    'nav.home': 'Home',
    'nav.over': 'Over',
    'nav.where': 'Waar te koop',
    'nav.shop': 'Shop',
    'nav.login': 'Login',
    'nav.account': 'Account',
    'nav.logout': 'Uitloggen',

    // Header
    'header.winner': 'Old Maastricht Winnaar Holland Cheese Awards 2023',

    // Footer
    'footer.tagline': 'De meest rebelse kaas van Nederland',
    'footer.interest': 'Interesse?',
    'footer.contact': 'Neem contact met ons op via',

    // Over / OldMaastrichtInfo
    'over.overtitle': 'De meest rebelse kaas van Nederland',
    'over.title': 'Old Maastricht',
    'over.body':
      'Old Maastricht heeft een volle, pittige smaak en is rijk aan eiwitten en mineralen. Old Maastricht is een veelzijdige kaas die zowel als snack, op brood of als ingrediënt in gerechten kan worden genoten. Ontdek deze lokale delicatesse tijdens een bezoek aan de prachtige stad Maastricht en geniet van de unieke smaak van Old Maastricht kaas!',
    'over.feature1.title': 'Nagerijpt in Zuid-Limburg',
    'over.feature1.body':
      'Old Maastricht is een natuurgerijpte oude kaas. Gerijpt op ouderwetse grenen planken.',
    'over.feature2.title': 'Verkrijgbaar bij',
    'over.feature2.body':
      'Old Maastricht is verkrijgbaar op de markt in Maastricht en Sittard.',
    'over.feature3.title': '100% weidegangmelk',
    'over.feature3.body':
      'Onze koeien grazen minimaal 120 dagen per jaar en minimaal 6 uur per dag. Hierdoor krijgen we de specifieke smaak van Old Maastricht.',
    'over.feature4.title': 'Volgens traditioneel proces',
    'over.feature4.body':
      'Volgens een eeuwenoud proces wordt Old Maastricht bereid en dat proef je.',

    // Waar te koop
    'where.title': 'Waar is Old Maastricht te koop?',
    'where.subtitle': 'Verkooppunten',
    'where.card.maastricht.title': 'Maastricht',
    'where.card.sittard.title': 'Sittard',
    'where.card.online.title': 'Webshop',
    // meerregelig met \n, eerste regel wordt vet gemaakt in de component
    'where.card.maastricht.text':
      'Weekmarkt Maastricht\nDinsdag t/m vrijdag 10.00 – 17.00\nZondag 12.00 – 17.00',
    'where.card.sittard.text':
      'Weekmarkt Sittard\nZaterdag 08.00 – 17.00',
    'where.card.online.text':
      'Koop Old Maastricht nu ook online via onze eigen webshop.',
    'where.card.button.route': 'Route via Google Maps',
    'where.card.button.shop': 'Webshop',

    // Shop
    'shop.title': 'Onze kazen',
    'shop.subtitle':
      'Ontdek het assortiment Old Maastricht kazen – direct uit onze rijpingskamers.',
    'shop.button.add': 'In winkelmand',
    'shop.button.edit': 'Bewerken',
    'shop.button.delete': 'Verwijderen',

    // Winkelmandje
    'cart.title': 'Winkelmandje',
    'cart.empty': 'Je winkelmandje is nog leeg.',
    'cart.total': 'Totaal',
    'cart.button.checkout': 'Afrekenen',
    'cart.button.backToShop': 'Verder winkelen',
  },

  en: {
    'nav.home': 'Home',
    'nav.over': 'About',
    'nav.where': 'Where to buy',
    'nav.shop': 'Shop',
    'nav.login': 'Login',
    'nav.account': 'Account',
    'nav.logout': 'Logout',

    'header.winner': 'Old Maastricht Winner Holland Cheese Awards 2023',

    'footer.tagline': 'The most rebellious cheese in the Netherlands',
    'footer.interest': 'Interested?',
    'footer.contact': 'Contact us at',

    'over.overtitle': 'The most rebellious cheese in the Netherlands',
    'over.title': 'Old Maastricht',
    'over.body':
      'Old Maastricht has a full, bold flavour and is rich in proteins and minerals. It is a versatile cheese that can be enjoyed as a snack, on bread, or as an ingredient in dishes. Discover this local delicacy when visiting the beautiful city of Maastricht and enjoy the unique taste of Old Maastricht cheese!',
    'over.feature1.title': 'Aged in South Limburg',
    'over.feature1.body':
      'Old Maastricht is a naturally aged old cheese, matured on traditional pine wooden boards.',
    'over.feature2.title': 'Available at',
    'over.feature2.body':
      'Old Maastricht is available at the markets in Maastricht and Sittard.',
    'over.feature3.title': '100% pasture milk',
    'over.feature3.body':
      'Our cows graze at least 120 days per year and at least 6 hours per day, giving Old Maastricht its distinctive flavour.',
    'over.feature4.title': 'Traditional process',
    'over.feature4.body':
      'Old Maastricht is made according to a centuries-old process – and you can taste it.',

    'where.title': 'Where can you buy Old Maastricht?',
    'where.subtitle': 'Points of sale',
    'where.card.maastricht.title': 'Maastricht',
    'where.card.sittard.title': 'Sittard',
    'where.card.online.title': 'Webshop',
    'where.card.maastricht.text':
      'Maastricht weekly market\nTuesday to Friday 10:00 – 17:00\nSunday 12:00 – 17:00',
    'where.card.sittard.text':
      'Sittard weekly market\nSaturday 08:00 – 17:00',
    'where.card.online.text':
      'Buy Old Maastricht now also online via our own webshop.',
    'where.card.button.route': 'Route via Google Maps',
    'where.card.button.shop': 'Webshop',

    'shop.title': 'Our cheeses',
    'shop.subtitle':
      'Discover the range of Old Maastricht cheeses – straight from our aging rooms.',
    'shop.button.add': 'Add to cart',
    'shop.button.edit': 'Edit',
    'shop.button.delete': 'Delete',

    'cart.title': 'Shopping cart',
    'cart.empty': 'Your cart is still empty.',
    'cart.total': 'Total',
    'cart.button.checkout': 'Checkout',
    'cart.button.backToShop': 'Continue shopping',
  },

  fr: {
    'nav.home': 'Accueil',
    'nav.over': 'À propos',
    'nav.where': 'Où acheter',
    'nav.shop': 'Boutique',
    'nav.login': 'Connexion',
    'nav.account': 'Compte',
    'nav.logout': 'Déconnexion',

    'header.winner':
      'Old Maastricht Lauréat des Holland Cheese Awards 2023',

    'footer.tagline': 'Le fromage le plus rebelle des Pays-Bas',
    'footer.interest': 'Intéressé ?',
    'footer.contact': 'Contactez-nous à',

    'over.overtitle': 'Le fromage le plus rebelle des Pays-Bas',
    'over.title': 'Old Maastricht',
    'over.body':
      "Old Maastricht a une saveur pleine et corsée, riche en protéines et en minéraux. C'est un fromage polyvalent qui se déguste en snack, sur du pain ou comme ingrédient dans vos plats. Découvrez cette spécialité locale lors d'une visite de la belle ville de Maastricht et profitez de son goût unique !",
    'over.feature1.title': 'Affiné dans le sud du Limbourg',
    'over.feature1.body':
      'Old Maastricht est un fromage affiné naturellement, sur des planches de pin traditionnelles.',
    'over.feature2.title': 'Disponible à',
    'over.feature2.body':
      'Old Maastricht est disponible sur les marchés de Maastricht et de Sittard.',
    'over.feature3.title': '100 % lait de pâturage',
    'over.feature3.body':
      'Nos vaches paissent au moins 120 jours par an et au moins 6 heures par jour, ce qui donne à Old Maastricht sa saveur unique.',
    'over.feature4.title': 'Procédé traditionnel',
    'over.feature4.body':
      'Old Maastricht est élaboré selon un procédé vieux de plusieurs siècles – et cela se goûte.',

    'where.title': 'Où trouver Old Maastricht ?',
    'where.subtitle': 'Points de vente',
    'where.card.maastricht.title': 'Maastricht',
    'where.card.sittard.title': 'Sittard',
    'where.card.online.title': 'Boutique en ligne',
    'where.card.maastricht.text':
      'Marché hebdomadaire de Maastricht\nMardi à vendredi 10h00 – 17h00\nDimanche 12h00 – 17h00',
    'where.card.sittard.text':
      'Marché hebdomadaire de Sittard\nSamedi 08h00 – 17h00',
    'where.card.online.text':
      'Achetez Old Maastricht maintenant aussi en ligne via notre propre boutique.',
    'where.card.button.route': 'Itinéraire via Google Maps',
    'where.card.button.shop': 'Boutique en ligne',

    'shop.title': 'Nos fromages',
    'shop.subtitle':
      "Découvrez la gamme de fromages Old Maastricht – directement de nos caves d'affinage.",
    'shop.button.add': 'Ajouter au panier',
    'shop.button.edit': 'Modifier',
    'shop.button.delete': 'Supprimer',

    'cart.title': 'Panier',
    'cart.empty': 'Votre panier est encore vide.',
    'cart.total': 'Total',
    'cart.button.checkout': 'Valider la commande',
    'cart.button.backToShop': 'Continuer vos achats',
  },

  de: {
    'nav.home': 'Startseite',
    'nav.over': 'Über uns',
    'nav.where': 'Wo erhältlich',
    'nav.shop': 'Shop',
    'nav.login': 'Login',
    'nav.account': 'Konto',
    'nav.logout': 'Abmelden',

    'header.winner':
      'Old Maastricht Gewinner der Holland Cheese Awards 2023',

    'footer.tagline': 'Der rebellischste Käse der Niederlande',
    'footer.interest': 'Interesse?',
    'footer.contact': 'Kontaktieren Sie uns unter',

    'over.overtitle': 'Der rebellischste Käse der Niederlande',
    'over.title': 'Old Maastricht',
    'over.body':
      'Old Maastricht hat einen vollen, würzigen Geschmack und ist reich an Proteinen und Mineralstoffen. Er ist ein vielseitiger Käse, der sowohl als Snack, auf Brot als auch in Gerichten genossen werden kann. Entdecken Sie diese regionale Spezialität bei einem Besuch der schönen Stadt Maastricht und genießen Sie den einzigartigen Geschmack von Old Maastricht!',
    'over.feature1.title': 'Gereift in Süd-Limburg',
    'over.feature1.body':
      'Old Maastricht ist ein natürlich gereifter alter Käse, gelagert auf traditionellen Kiefernholzbrettern.',
    'over.feature2.title': 'Erhältlich bei',
    'over.feature2.body':
      'Old Maastricht ist auf den Märkten in Maastricht und Sittard erhältlich.',
    'over.feature3.title': '100 % Weidemilch',
    'over.feature3.body':
      'Unsere Kühe weiden mindestens 120 Tage im Jahr und mindestens 6 Stunden pro Tag. So entsteht der typische Geschmack von Old Maastricht.',
    'over.feature4.title': 'Traditionelles Verfahren',
    'over.feature4.body':
      'Old Maastricht wird nach einem jahrhundertealten Verfahren hergestellt – und das schmeckt man.',

    'where.title': 'Wo gibt es Old Maastricht zu kaufen?',
    'where.subtitle': 'Verkaufsstellen',
    'where.card.maastricht.title': 'Maastricht',
    'where.card.sittard.title': 'Sittard',
    'where.card.online.title': 'Webshop',
    'where.card.maastricht.text':
      'Wochenmarkt Maastricht\nDienstag bis Freitag 10:00 – 17:00\nSonntag 12:00 – 17:00',
    'where.card.sittard.text':
      'Wochenmarkt Sittard\nSamstag 08:00 – 17:00',
    'where.card.online.text':
      'Kaufen Sie Old Maastricht jetzt auch online über unseren eigenen Webshop.',
    'where.card.button.route': 'Route über Google Maps',
    'where.card.button.shop': 'Webshop',

    'shop.title': 'Unsere Käse',
    'shop.subtitle':
      'Entdecken Sie das Sortiment an Old Maastricht Käse – direkt aus unseren Reiferäumen.',
    'shop.button.add': 'In den Warenkorb',
    'shop.button.edit': 'Bearbeiten',
    'shop.button.delete': 'Löschen',

    'cart.title': 'Warenkorb',
    'cart.empty': 'Dein Warenkorb ist noch leer.',
    'cart.total': 'Gesamt',
    'cart.button.checkout': 'Zur Kasse',
    'cart.button.backToShop': 'Weiter einkaufen',
  },
};

type LanguageContextValue = {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>('nl');

  // Init vanuit localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('lang');
      if (stored === 'nl' || stored === 'en' || stored === 'fr' || stored === 'de') {
        setLangState(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const setLang = (code: LangCode) => {
    setLangState(code);
    try {
      localStorage.setItem('lang', code);
    } catch {
      // ignore
    }
  };

  const t = (key: string): string => {
    const byLang = translations[lang] || translations.nl;
    return byLang[key] ?? translations.nl[key] ?? key;
  };

  const value: LanguageContextValue = { lang, setLang, t };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used inside <LanguageProvider>');
  }
  return ctx;
}
