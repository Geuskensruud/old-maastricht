export type Product = {
  id: string;
  name: string;
  price: number;          // € per stuk
  image: string;          // pad in /public
  category: 'Harde kazen' | 'Zachte kazen' | 'Geiten/Schapen' | 'Specials';
  description?: string;
};

export const PRODUCTS: Product[] = [
  {
    id: 'goudse-48',
    name: 'Goudse Kaas 48+',
    price: 0.01,
    image: '/products/goudse48.jpg',
    category: 'Harde kazen',
    description: 'Stevige, nootachtige smaak. Perfect voor op brood of bij de borrel.'
  },
  {
    id: 'oude-kaas',
    name: 'Oude Kaas 24 mnd',
    price: 0.01,
    image: '/products/oudekaas.jpg',
    category: 'Harde kazen',
    description: 'Lang gerijpt, kristalletjes en intense smaak.'
  },
  {
    id: 'brie',
    name: 'Brie de Tradition',
    price: 0.01,
    image: '/products/brie.jpg',
    category: 'Zachte kazen',
    description: 'Romig en mild, heerlijk op kamertemperatuur.'
  },
  {
    id: 'geitenkaas',
    name: 'Geitenkaas Jong',
    price: 0.01,
    image: '/products/geit.jpg',
    category: 'Geiten/Schapen',
    description: 'Fris en licht, mooie balans in zuren.'
  },
  {
    id: 'roquefort',
    name: 'Roquefort AOP',
    price: 0.01,
    image: '/products/roquefort.jpg',
    category: 'Specials',
    description: 'Karaktervolle blauwschimmel met zilt-frisse tonen.'
  },
  {
    id: 'truffel-brie',
    name: 'Brie met Truffel',
    price: 0.01,
    image: '/products/truffelbrie.jpg',
    category: 'Specials',
    description: 'Luxueuze brie met een hart van truffelcrème.'
  },
];
