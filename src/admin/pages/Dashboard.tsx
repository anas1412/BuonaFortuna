import { useQuery } from 'convex/react';
import { Link } from 'react-router';
import { api } from '../../../convex/_generated/api';
import OrderList from '../OrderList';
import { Empty, Icon, Loading, PageHead } from '../ui';

export default function Dashboard() {
  const stats = useQuery(api.orders.stats);

  if (!stats) return <Loading />;

  return (
    <>
      <PageHead title="Accueil" sub={stats.newOrders ? `${stats.newOrders} ${stats.newOrders === 1 ? 'commande attend' : 'commandes attendent'} votre appel.` : 'Rien à traiter pour le moment.'}>
        <Link to="/produits/nouveau" className="btn btn--primary">
          <Icon name="plus" /> Ajouter un article
        </Link>
      </PageHead>

      <div className="tiles">
        <Link to="/commandes" className={`tile${stats.newOrders ? ' tile--hot' : ''}`}>
          <span className="tile__n">{stats.newOrders}</span>
          <span className="tile__l">À appeler</span>
        </Link>
        <Link to="/produits" className="tile">
          <span className="tile__n">{stats.available}</span>
          <span className="tile__l">En vente</span>
        </Link>
        <div className="tile">
          <span className="tile__n">{stats.reserved}</span>
          <span className="tile__l">Réservés</span>
        </div>
        <div className="tile">
          <span className="tile__n">{stats.sold}</span>
          <span className="tile__l">Vendus</span>
        </div>
      </div>

      <div className="sect">
        <h2>Dernières commandes</h2>
        {stats.recent.length > 0 && <Link to="/commandes">Tout voir</Link>}
      </div>
      {stats.recent.length === 0 ? (
        <Empty title="Aucune commande pour l'instant">Elles arrivent ici en direct dès qu'un client commande sur la boutique.</Empty>
      ) : (
        <OrderList orders={stats.recent} />
      )}
    </>
  );
}
