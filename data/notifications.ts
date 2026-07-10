export type Notification = {
  id: string;
  title: string;
  body: string;
  date: string;
  read: boolean;
  type: 'order' | 'promo' | 'vendor' | 'system';
};

export const notifications: Notification[] = [
  {
    id: 'notif-1',
    title: 'Commande expédiée',
    body: 'Votre commande chez Le Vestiaire de Claire a été expédiée. Livraison prévue le 12 juillet.',
    date: 'Il y a 2 heures',
    read: false,
    type: 'order',
  },
  {
    id: 'notif-2',
    title: 'Nouveaux dépôts',
    body: 'Atelier Vintage 1960 vient d\'ajouter 5 nouvelles pièces vintage.',
    date: 'Il y a 5 heures',
    read: false,
    type: 'vendor',
  },
  {
    id: 'notif-3',
    title: 'Promotion flash',
    body: '-20% sur toute la sélection chaussures chez Seconde Semelle. Offre valable 48h.',
    date: 'Hier',
    read: true,
    type: 'promo',
  },
  {
    id: 'notif-4',
    title: 'Avis laissé',
    body: 'Merci pour votre avis sur Friperie du Faubourg ! Les vendeurs apprécient.',
    date: 'il y a 3 jours',
    read: true,
    type: 'system',
  },
  {
    id: 'notif-5',
    title: 'Favori en stock',
    body: 'Un article de votre liste de favoris est de nouveau disponible chez Petits Trésors.',
    date: 'il y a 4 jours',
    read: true,
    type: 'vendor',
  },
];
