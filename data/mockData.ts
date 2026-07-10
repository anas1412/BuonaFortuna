// Données fictives — pas encore de backend. À remplacer par de vrais appels API plus tard.

export type Category = {
  id: string;
  name: string;
  icon: string; // nom d'icône Ionicons
};

export type Condition = 'Comme neuf' | 'Très bon état' | 'Bon état' | 'Satisfaisant';

export type Vendor = {
  id: string;
  ownerUserId: string;
  name: string;
  tagline: string;
  description: string;
  categoryId: string;
  coverImage: string;
  logoImage: string;
  rating: number;
  reviewCount: number;
  location: string;
  isOpen: boolean;
  deliveryTime: string;
  featured?: boolean;
  productIds: string[];
};

export type Product = {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number; // prix neuf d'origine
  image: string;
  rating: number;
  size: string;
  brand: string;
  condition: Condition;
  tag?: string; // ex. "Coup de cœur", "Nouveau dépôt"
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  joinedDate: string;
  vendorId: string | null; // relation 1:1 — un utilisateur peut posséder au plus une boutique
};

export type Review = {
  id: string;
  vendorId: string;
  userName: string;
  text: string;
  rating: number;
  date: string;
};

export const categories: Category[] = [
  { id: 'cat-1', name: 'Femmes', icon: 'woman-outline' },
  { id: 'cat-2', name: 'Hommes', icon: 'man-outline' },
  { id: 'cat-3', name: 'Enfants', icon: 'happy-outline' },
  { id: 'cat-4', name: 'Chaussures', icon: 'footsteps-outline' },
  { id: 'cat-5', name: 'Sacs & Accessoires', icon: 'bag-handle-outline' },
  { id: 'cat-6', name: 'Vintage', icon: 'time-outline' },
  { id: 'cat-7', name: 'Manteaux & Vestes', icon: 'shirt-outline' },
  { id: 'cat-8', name: 'Sport', icon: 'basketball-outline' },
];

export const products: Product[] = [
  {
    id: 'prod-1',
    vendorId: 'vend-1',
    name: 'Trench beige Sandro',
    description: "Trench en coton bien coupé, doublure satinée, porté deux ou trois fois seulement.",
    price: 68,
    compareAtPrice: 240,
    image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800',
    rating: 4.9,
    size: '38',
    brand: 'Sandro',
    condition: 'Comme neuf',
    tag: 'Coup de cœur',
  },
  {
    id: 'prod-2',
    vendorId: 'vend-1',
    name: 'Robe fleurie Zara',
    description: 'Robe midi imprimée fleurs, tissu fluide, parfaite pour la mi-saison.',
    price: 18,
    compareAtPrice: 45,
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
    rating: 4.6,
    size: 'M',
    brand: 'Zara',
    condition: 'Très bon état',
  },
  {
    id: 'prod-3',
    vendorId: 'vend-1',
    name: 'Chemisier en soie',
    description: 'Chemisier 100% soie, col boutonné, quelques légères marques d’usage.',
    price: 22,
    image: 'https://images.unsplash.com/photo-1551048632-24e444b48a3e?w=800',
    rating: 4.4,
    size: '36',
    brand: 'Maje',
    condition: 'Bon état',
    tag: 'Nouveau dépôt',
  },
  {
    id: 'prod-4',
    vendorId: 'vend-2',
    name: 'Jean 501 délavé Levi\'s',
    description: 'Coupe droite iconique, délavage authentique, taille haute.',
    price: 32,
    compareAtPrice: 90,
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800',
    rating: 4.8,
    size: '31/32',
    brand: "Levi's",
    condition: 'Très bon état',
    tag: 'Coup de cœur',
  },
  {
    id: 'prod-5',
    vendorId: 'vend-2',
    name: 'Chemise à carreaux flanelle',
    description: 'Chemise épaisse en flanelle, coupe regular, idéale pour l’automne.',
    price: 15,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
    rating: 4.5,
    size: 'L',
    brand: 'Uniqlo',
    condition: 'Bon état',
  },
  {
    id: 'prod-6',
    vendorId: 'vend-3',
    name: 'Baskets New Balance 574',
    description: 'Semelle encore en bon état, très peu de traces d’usure.',
    price: 38,
    compareAtPrice: 100,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    rating: 4.7,
    size: '42',
    brand: 'New Balance',
    condition: 'Très bon état',
  },
  {
    id: 'prod-7',
    vendorId: 'vend-3',
    name: 'Bottines en cuir',
    description: 'Bottines en cuir véritable, ressemelées récemment chez un cordonnier.',
    price: 44,
    image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800',
    rating: 4.6,
    size: '39',
    brand: 'Clarks',
    condition: 'Bon état',
    tag: 'Nouveau dépôt',
  },
  {
    id: 'prod-8',
    vendorId: 'vend-4',
    name: 'Sac à main cuir vintage',
    description: 'Sac structuré en cuir pleine fleur, patine du temps, fermoir doré.',
    price: 55,
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
    rating: 4.8,
    size: 'Taille unique',
    brand: 'Longchamp',
    condition: 'Bon état',
    tag: 'Coup de cœur',
  },
  {
    id: 'prod-9',
    vendorId: 'vend-5',
    name: 'Robe cocktail années 60',
    description: 'Pièce vintage authentique, coupe cintrée, tissu jacquard.',
    price: 65,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800',
    rating: 4.9,
    size: '36',
    brand: 'Vintage',
    condition: 'Très bon état',
    tag: 'Coup de cœur',
  },
  {
    id: 'prod-10',
    vendorId: 'vend-5',
    name: 'Blouson en cuir motard',
    description: 'Blouson en cuir vieilli, fermetures éclair fonctionnelles, très bon tombé.',
    price: 78,
    compareAtPrice: 220,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    rating: 4.7,
    size: 'M',
    brand: 'Schott',
    condition: 'Bon état',
  },
  {
    id: 'prod-11',
    vendorId: 'vend-6',
    name: 'Body de naissance en coton bio',
    description: 'Lot de 3 bodys, coton doux, lavés et repassés avant dépôt.',
    price: 9,
    image: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800',
    rating: 4.9,
    size: '3 mois',
    brand: 'Petit Bateau',
    condition: 'Très bon état',
    tag: 'Nouveau dépôt',
  },
  {
    id: 'prod-12',
    vendorId: 'vend-7',
    name: 'Survêtement Adidas Originals',
    description: 'Ensemble veste et pantalon en molleton, bandes iconiques.',
    price: 28,
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
    rating: 4.6,
    size: 'L',
    brand: 'Adidas',
    condition: 'Bon état',
    tag: 'Coup de cœur',
  },
];

export const vendors: Vendor[] = [
  {
    id: 'vend-1',
    ownerUserId: 'user-2',
    name: 'Le Vestiaire de Claire',
    tagline: 'Pièces féminines chinées avec soin',
    description:
      "Une sélection pointue de vêtements féminins de seconde main, triés à la main pour leur qualité et leur intemporalité. Chaque pièce est nettoyée et vérifiée avant sa mise en ligne.",
    categoryId: 'cat-1',
    coverImage: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200',
    logoImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300',
    rating: 4.9,
    reviewCount: 412,
    location: 'Marché du Marais',
    isOpen: true,
    deliveryTime: '2–3 jours',
    featured: true,
    productIds: ['prod-1', 'prod-2', 'prod-3'],
  },
  {
    id: 'vend-2',
    ownerUserId: 'user-3',
    name: 'Friperie du Faubourg',
    tagline: 'Denim, chemises et essentiels masculins',
    description:
      'Une friperie de quartier spécialisée dans le vestiaire masculin : denim solide, chemises intemporelles et pièces qui traversent les années sans prendre une ride.',
    categoryId: 'cat-2',
    coverImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200',
    logoImage: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300',
    rating: 4.7,
    reviewCount: 198,
    location: 'Quartier des Tanneurs',
    isOpen: true,
    deliveryTime: '3–4 jours',
    featured: true,
    productIds: ['prod-4', 'prod-5'],
  },
  {
    id: 'vend-3',
    ownerUserId: 'user-4',
    name: 'Seconde Semelle',
    tagline: 'Chaussures et bottines d’occasion',
    description:
      'Spécialiste de la chaussure de seconde main : chaque paire est nettoyée, vérifiée et ressemelée si besoin avant d’être proposée à la vente.',
    categoryId: 'cat-4',
    coverImage: 'https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=1200',
    logoImage: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=300',
    rating: 4.8,
    reviewCount: 145,
    location: 'Passage des Artisans',
    isOpen: true,
    deliveryTime: '3–5 jours',
    productIds: ['prod-6', 'prod-7'],
  },
  {
    id: 'vend-4',
    ownerUserId: 'user-5',
    name: 'Maroquinerie Retrouvée',
    tagline: 'Sacs et accessoires vintage',
    description:
      'Des sacs et accessoires de seconde main sélectionnés pour leur qualité de fabrication — du cuir qui a vécu, mais qui a encore beaucoup à offrir.',
    categoryId: 'cat-5',
    coverImage: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200',
    logoImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=300',
    rating: 4.8,
    reviewCount: 231,
    location: 'Rue des Antiquaires',
    isOpen: false,
    deliveryTime: '2–3 jours',
    productIds: ['prod-8'],
  },
  {
    id: 'vend-5',
    ownerUserId: 'user-6',
    name: 'Atelier Vintage 1960',
    tagline: 'Pièces vintage authentiques, toutes décennies',
    description:
      'Une boutique spécialisée dans le vêtement vintage authentique, des années 50 aux années 90, chinée dans toute la France.',
    categoryId: 'cat-6',
    coverImage: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=1200',
    logoImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=300',
    rating: 4.9,
    reviewCount: 356,
    location: 'Village Vintage, 3e étage',
    isOpen: true,
    deliveryTime: '4–6 jours',
    featured: true,
    productIds: ['prod-9', 'prod-10'],
  },
  {
    id: 'vend-6',
    ownerUserId: 'user-7',
    name: 'Petits Trésors',
    tagline: 'Vêtements d’occasion pour bébés et enfants',
    description:
      'Vêtements d’enfants portés une saison à peine, lavés et contrôlés avec la même exigence que pour un dépôt-vente pour adultes.',
    categoryId: 'cat-3',
    coverImage: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=1200',
    logoImage: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=300',
    rating: 4.9,
    reviewCount: 167,
    location: 'Marché aux Puces Nord',
    isOpen: true,
    deliveryTime: '1–2 jours',
    productIds: ['prod-11'],
  },
  {
    id: 'vend-7',
    ownerUserId: 'user-8',
    name: 'Terrain de Jeu Sport',
    tagline: 'Survêtements et sneakers de seconde main',
    description:
      'Toute la culture streetwear et sportwear d’occasion : survêtements, sneakers et pièces de marque à prix doux.',
    categoryId: 'cat-8',
    coverImage: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1200',
    logoImage: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=300',
    rating: 4.7,
    reviewCount: 203,
    location: 'Halle du Sport',
    isOpen: true,
    deliveryTime: '2–4 jours',
    productIds: ['prod-12'],
  },
];

// L'utilisateur connecté de démonstration. Ici, user-1 ne possède PAS encore
// de boutique, ce qui permet de montrer l'état « créer votre boutique ».
export const currentUser: User = {
  id: 'user-1',
  name: 'Alexia Marchand',
  email: 'alexia.marchand@example.com',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
  joinedDate: 'Mars 2025',
  vendorId: null,
};

// Un second profil de démonstration qui POSSÈDE déjà une boutique — utilisé
// par le mock de connexion pour montrer l'état « gérer ma boutique ».
export const currentUserWithShop: User = {
  id: 'user-2',
  name: 'Claire Dubois',
  email: 'claire.dubois@example.com',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
  joinedDate: 'Janvier 2024',
  vendorId: 'vend-1',
};

export const getProductById = (id: string) => products.find((p) => p.id === id);
export const getVendorById = (id: string) => vendors.find((v) => v.id === id);
export const getProductsByVendor = (vendorId: string) =>
  products.filter((p) => p.vendorId === vendorId);
export const getCategoryById = (id: string) => categories.find((c) => c.id === id);
export const getVendorsByCategory = (categoryId: string) =>
  vendors.filter((v) => v.categoryId === categoryId);
export const getFeaturedVendors = () => vendors.filter((v) => v.featured);

export const reviews: Review[] = [
  // Le Vestiaire de Claire (vend-1)
  {
    id: 'rev-1',
    vendorId: 'vend-1',
    userName: 'Camille R.',
    text: 'Les pièces sont vraiment en excellent état, exactement comme décrit. Le trench Sandro était impeccable.',
    rating: 5,
    date: '12 juin 2025',
  },
  {
    id: 'rev-2',
    vendorId: 'vend-1',
    userName: 'Julien M.',
    text: 'Bonne qualité constante, mais les plus belles pièces partent vite. Il faut checker régulièrement.',
    rating: 4,
    date: '3 mai 2025',
  },
  {
    id: 'rev-3',
    vendorId: 'vend-1',
    userName: 'Inès T.',
    text: 'Livraison rapide et soignée. La robe Zara était en très bon état, je recommande.',
    rating: 5,
    date: '18 avr. 2025',
  },
  // Friperie du Faubourg (vend-2)
  {
    id: 'rev-4',
    vendorId: 'vend-2',
    userName: 'Thomas B.',
    text: 'Super sélection de denim. Mon jean 501 est parfait, délavage authentique comme souhaité.',
    rating: 5,
    date: '20 juin 2025',
  },
  {
    id: 'rev-5',
    vendorId: 'vend-2',
    userName: 'Lucas D.',
    text: 'Bon rapport qualité-prix pour les chemises. J\'aurais aimé plus de choix en tailles grandes.',
    rating: 4,
    date: '8 mai 2025',
  },
  // Seconde Semelle (vend-3)
  {
    id: 'rev-6',
    vendorId: 'vend-3',
    userName: 'Marie L.',
    text: 'Les bottines Clarks étaient ressemelées impeccablement. On ne voit aucune trace d\'usure.',
    rating: 5,
    date: '15 juin 2025',
  },
  {
    id: 'rev-7',
    vendorId: 'vend-3',
    userName: 'Antoine P.',
    text: 'Les New Balance étaient un peu plus usées que prévu, mais dans l\'ensemble correct.',
    rating: 3,
    date: '2 juin 2025',
  },
  // Maroquinerie Retrouvée (vend-4)
  {
    id: 'rev-8',
    vendorId: 'vend-4',
    userName: 'Sophie M.',
    text: 'Le sac Longchamp a une belle patine. Le fermoir doré fonctionne parfaitement. Très contente.',
    rating: 5,
    date: '10 juin 2025',
  },
  {
    id: 'rev-9',
    vendorId: 'vend-4',
    userName: 'Claire D.',
    text: 'Boutique fermée le week-end, dommage. Mais la qualité est au rendez-vous.',
    rating: 4,
    date: '25 mai 2025',
  },
  // Atelier Vintage 1960 (vend-5)
  {
    id: 'rev-10',
    vendorId: 'vend-5',
    userName: 'Léa F.',
    text: 'La robe cocktail est une vraie pièce de collection. Authentique et en excellent état.',
    rating: 5,
    date: '14 juin 2025',
  },
  {
    id: 'rev-11',
    vendorId: 'vend-5',
    userName: 'Hugo R.',
    text: 'Le blouson Schott est magnifique. Un peu cher mais ça vaut le coup pour du vintage.',
    rating: 4,
    date: '1 juin 2025',
  },
  {
    id: 'rev-12',
    vendorId: 'vend-5',
    userName: 'Émilie C.',
    text: 'J\'adore cette boutique, chaque pièce a du caractère. Livraison un peu longue par contre.',
    rating: 5,
    date: '20 mai 2025',
  },
  // Petits Trésors (vend-6)
  {
    id: 'rev-13',
    vendorId: 'vend-6',
    userName: 'Nathalie V.',
    text: 'Les bodys Petit Bateau étaient comme neufs. Parfait pour un premier achat d\'occasion.',
    rating: 5,
    date: '11 juin 2025',
  },
  {
    id: 'rev-14',
    vendorId: 'vend-6',
    userName: 'Pierre G.',
    text: 'Livraison ultra rapide. Les vêtements sentaient le frais, bien lavés avant envoi.',
    rating: 5,
    date: '28 mai 2025',
  },
  // Terrain de Jeu Sport (vend-7)
  {
    id: 'rev-15',
    vendorId: 'vend-7',
    userName: 'Maxime D.',
    text: 'Le survêtement Adidas est en bon état, les bandes sont bien visibles. Rapport qualité-prix excellent.',
    rating: 4,
    date: '9 juin 2025',
  },
  {
    id: 'rev-16',
    vendorId: 'vend-7',
    userName: 'Sarah K.',
    text: 'Bonne sélection streetwear. J\'aurais aimé voir plus de marques différentes.',
    rating: 4,
    date: '22 mai 2025',
  },
];

export const getReviewsByVendor = (vendorId: string) =>
  reviews.filter((r) => r.vendorId === vendorId);
