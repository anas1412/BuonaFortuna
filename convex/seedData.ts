// Seed data ported from the original app. Prices are in millimes (1 DT = 1000).
// Category "key" is only used to link products at seed time.
export const seedCategories = [
  {
    "key": "cat-1",
    "name": "Femmes",
    "slug": "femmes",
    "order": 1,
    "intro": "Robes, tops, jupes et pièces chinées avec soin pour la garde-robe féminine. Chaque article est unique, contrôlé et photographié tel quel."
  },
  {
    "key": "cat-2",
    "name": "Hommes",
    "slug": "hommes",
    "order": 2,
    "intro": "Chemises, jeans, vestes et essentiels masculins de seconde main, sélectionnés pour leur état et leur coupe."
  },
  {
    "key": "cat-3",
    "name": "Enfants",
    "slug": "enfants",
    "order": 3,
    "intro": "Vêtements pour enfants en très bon état, à petits prix : ils grandissent vite, les habits n'ont pas à finir au fond d'un tiroir."
  },
  {
    "key": "cat-4",
    "name": "Chaussures",
    "slug": "chaussures",
    "order": 4,
    "intro": "Baskets, bottines, sandales et souliers d'occasion, nettoyés et vérifiés. Pointures précises indiquées sur chaque fiche."
  },
  {
    "key": "cat-5",
    "name": "Sacs & Accessoires",
    "slug": "sacs-et-accessoires",
    "order": 5,
    "intro": "Sacs, ceintures, foulards et accessoires de seconde main pour compléter une tenue sans se ruiner."
  },
  {
    "key": "cat-6",
    "name": "Vintage",
    "slug": "vintage",
    "order": 6,
    "intro": "Pièces vintage authentiques, toutes décennies : le style qui ne se démode pas, à porter aujourd'hui."
  },
  {
    "key": "cat-7",
    "name": "Manteaux & Vestes",
    "slug": "manteaux-et-vestes",
    "order": 7,
    "intro": "Manteaux, trenchs, blousons et vestes pour toutes les saisons, sélectionnés pour leur qualité et leur tenue."
  },
  {
    "key": "cat-8",
    "name": "Sport",
    "slug": "sport",
    "order": 8,
    "intro": "Survêtements, sneakers et tenues de sport d'occasion en bon état, prêtes pour un second souffle."
  }
] as const;

export const seedProducts = [
  {
    "name": "Trench beige Sandro",
    "slug": "trench-beige-sandro-38",
    "brand": "Sandro",
    "size": "38",
    "condition": "Comme neuf",
    "categoryKey": "cat-7",
    "price": 68000,
    "compareAtPrice": 240000,
    "description": "Trench en coton bien coupé, doublure satinée, porté deux ou trois fois seulement.",
    "images": [
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800",
      "https://images.unsplash.com/photo-1544957992-20514f595d6f?w=800"
    ],
    "tag": "Coup de cœur"
  },
  {
    "name": "Robe fleurie Zara",
    "slug": "robe-fleurie-zara-m",
    "brand": "Zara",
    "size": "M",
    "condition": "Très bon état",
    "categoryKey": "cat-1",
    "price": 18000,
    "compareAtPrice": 45000,
    "description": "Robe midi imprimée fleurs, tissu fluide, parfaite pour la mi-saison.",
    "images": [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800",
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800"
    ]
  },
  {
    "name": "Chemisier en soie",
    "slug": "chemisier-en-soie-36",
    "brand": "Maje",
    "size": "36",
    "condition": "Bon état",
    "categoryKey": "cat-1",
    "price": 22000,
    "description": "Chemisier 100% soie, col boutonné, quelques légères marques d'usage.",
    "images": [
      "https://images.unsplash.com/photo-1551048632-24e444b48a3e?w=800",
      "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800"
    ],
    "tag": "Nouveau dépôt"
  },
  {
    "name": "Jean 501 délavé Levi's",
    "slug": "jean-501-delave-levi-s-31-32",
    "brand": "Levi's",
    "size": "31/32",
    "condition": "Très bon état",
    "categoryKey": "cat-2",
    "price": 32000,
    "compareAtPrice": 90000,
    "description": "Coupe droite iconique, délavage authentique, taille haute.",
    "images": [
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800",
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
      "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800"
    ],
    "tag": "Coup de cœur"
  },
  {
    "name": "Chemise à carreaux flanelle",
    "slug": "chemise-a-carreaux-flanelle-l",
    "brand": "Uniqlo",
    "size": "L",
    "condition": "Bon état",
    "categoryKey": "cat-2",
    "price": 15000,
    "description": "Chemise épaisse en flanelle, coupe regular, idéale pour l'automne.",
    "images": [
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"
    ]
  },
  {
    "name": "Baskets New Balance 574",
    "slug": "baskets-new-balance-574-42",
    "brand": "New Balance",
    "size": "42",
    "condition": "Très bon état",
    "categoryKey": "cat-4",
    "price": 38000,
    "compareAtPrice": 100000,
    "description": "Semelle encore en bon état, très peu de traces d'usure.",
    "images": [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800"
    ]
  },
  {
    "name": "Bottines en cuir",
    "slug": "bottines-en-cuir-39",
    "brand": "Clarks",
    "size": "39",
    "condition": "Bon état",
    "categoryKey": "cat-4",
    "price": 44000,
    "description": "Bottines en cuir véritable, ressemelées récemment chez un cordonnier.",
    "images": [
      "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800",
      "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800"
    ],
    "tag": "Nouveau dépôt"
  },
  {
    "name": "Sac à main cuir vintage",
    "slug": "sac-a-main-cuir-vintage-taille-unique",
    "brand": "Longchamp",
    "size": "Taille unique",
    "condition": "Bon état",
    "categoryKey": "cat-5",
    "price": 55000,
    "description": "Sac structuré en cuir pleine fleur, patine du temps, fermoir doré.",
    "images": [
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800",
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"
    ],
    "tag": "Coup de cœur"
  },
  {
    "name": "Robe cocktail années 60",
    "slug": "robe-cocktail-annees-60-36",
    "brand": "Vintage",
    "size": "36",
    "condition": "Très bon état",
    "categoryKey": "cat-6",
    "price": 65000,
    "description": "Pièce vintage authentique, coupe cintrée, tissu jacquard.",
    "images": [
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800",
      "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=800"
    ],
    "tag": "Coup de cœur"
  },
  {
    "name": "Blouson en cuir motard",
    "slug": "blouson-en-cuir-motard-m",
    "brand": "Schott",
    "size": "M",
    "condition": "Bon état",
    "categoryKey": "cat-6",
    "price": 78000,
    "compareAtPrice": 220000,
    "description": "Blouson en cuir vieilli, fermetures éclair fonctionnelles, très bon tombé.",
    "images": [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
      "https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800"
    ]
  },
  {
    "name": "Body de naissance en coton bio",
    "slug": "body-de-naissance-en-coton-bio-3-mois",
    "brand": "Petit Bateau",
    "size": "3 mois",
    "condition": "Très bon état",
    "categoryKey": "cat-3",
    "price": 9000,
    "description": "Lot de 3 bodys, coton doux, lavés et repassés avant dépôt.",
    "images": [
      "https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800",
      "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800"
    ],
    "tag": "Nouveau dépôt"
  },
  {
    "name": "Survêtement Adidas Originals",
    "slug": "survetement-adidas-originals-l",
    "brand": "Adidas",
    "size": "L",
    "condition": "Bon état",
    "categoryKey": "cat-8",
    "price": 28000,
    "description": "Ensemble veste et pantalon en molleton, bandes iconiques.",
    "images": [
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800"
    ],
    "tag": "Coup de cœur"
  }
];
