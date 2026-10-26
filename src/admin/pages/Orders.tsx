import { useQuery } from 'convex/react';
import { useState } from 'react';
import { api } from '../../../convex/_generated/api';
import type { OrderStatus } from '../../lib/shop';
import OrderList from '../OrderList';
import { Empty, Loading, PageHead, Tabs } from '../ui';

type Tab = OrderStatus | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'new', label: 'À appeler' },
  { key: 'confirmed', label: 'Confirmées' },
  { key: 'delivered', label: 'Livrées' },
  { key: 'cancelled', label: 'Annulées' },
  { key: 'all', label: 'Toutes' },
];

const EMPTY: Record<Tab, string> = {
  new: 'Aucune commande à appeler. Les nouvelles arrivent ici en direct.',
  confirmed: 'Aucune commande confirmée en attente de livraison.',
  delivered: 'Aucune commande livrée pour le moment.',
  cancelled: 'Aucune commande annulée.',
  all: 'Aucune commande pour le moment.',
};

export default function Orders() {
  const [tab, setTab] = useState<Tab>('new');
  const orders = useQuery(api.orders.list, tab === 'all' ? {} : { status: tab });
  const stats = useQuery(api.orders.stats);

  return (
    <>
      <PageHead title="Commandes" sub="Appelez le client pour confirmer, puis marquez la commande livrée une fois payée." />
      <Tabs tabs={TABS.map((t) => (t.key === 'new' ? { ...t, count: stats?.newOrders } : t))} value={tab} onChange={setTab} />

      {!orders ? <Loading /> : orders.length === 0 ? <Empty title="Rien ici">{EMPTY[tab]}</Empty> : <OrderList orders={orders} phone />}
    </>
  );
}
