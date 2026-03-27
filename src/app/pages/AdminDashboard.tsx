import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ShoppingBag, Plus, TrendingUp, Eye, Calendar, Loader2 } from 'lucide-react';
import { venteService } from '../service/venteService';
import { productService } from '../service/produitService';

export const AdminDashboard = () => {
  const [totalVentes, setTotalVentes] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [todayProducts, setTodayProducts] = useState<any[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Stats ventes + commandes récentes
        const stats = await venteService.getDashboardStats();
        setTotalVentes(stats.totalVentes);
        setWeeklyRevenue(stats.weeklyRevenue);
        setRecentOrders(stats.recentOrders);

        // Produits ajoutés aujourd'hui
        const todayProds = await venteService.getTodayProducts();
        setTodayProducts(todayProds);

        // Total produits
        const allProducts = await productService.getAll();
        setTotalProducts(allProducts?.length || 0);
      } catch (err) {
        console.error('Erreur chargement dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const stats = [
    {
      title: 'Produits',
      value: totalProducts,
      icon: Package,
      color: 'bg-pink-500',
      link: '/admin/products',
    },
    {
      title: 'Commandes',
      value: totalVentes,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      link: '/admin/orders',
    },
    {
      title: 'Revenus (7 jours)',
      value: weeklyRevenue.toFixed(2) + ' FCFA',
      icon: TrendingUp,
      color: 'bg-green-500',
      link: '/admin/orders',
    },
  ];

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      case 'ECHOUER':    return 'bg-red-100 text-red-800';
      case 'VALIDER':    return 'bg-green-100 text-green-800';
      default:           return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'EN_ATTENTE': return 'En attente';
      case 'ECHOUER':    return 'Échouée';
      case 'VALIDER':    return 'Validée';
      default:           return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Tableau de bord</h2>
        <p className="text-gray-500 text-sm">Bienvenue dans votre espace d'administration</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            to={stat.link}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center`}>
                <stat.icon className="w-7 h-7 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Produits ajoutés aujourd'hui */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-800">Produits ajoutés aujourd'hui</h3>
            <Package className="w-5 h-5 text-gray-300" />
          </div>
          <div className="space-y-3">
            {todayProducts.length > 0 ? (
              todayProducts.map((product: any) => (
                <div key={product.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={product.profile || product.image1}
                    alt={product.libelle}
                    className="w-11 h-11 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">{product.libelle}</p>
                    <p className="text-xs text-gray-400">{product.prix?.toFixed(2)} FCFA</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    product.statut === 'PUBLIER'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {product.statut === 'PUBLIER' ? 'Publié' : 'En attente'}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-6">Aucun produit ajouté aujourd'hui</p>
            )}
          </div>
        </div>

        {/* Commandes récentes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-800">Commandes récentes</h3>
            <ShoppingBag className="w-5 h-5 text-gray-300" />
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to="/admin/orders"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-pink-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-800 text-sm">
                      {order.reference}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <span className="font-bold text-pink-600 text-sm">
                      {order.prixTotal?.toFixed(2)} FCFA
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-gray-400 text-sm text-center py-6">Aucune commande récente</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-base font-bold text-gray-800 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/admin/products/new"
            className="flex items-center gap-3 p-4 bg-pink-50 rounded-xl hover:bg-pink-100 transition-colors"
          >
            <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Ajouter un produit</p>
              <p className="text-xs text-gray-500">Créer un nouveau produit</p>
            </div>
          </Link>
          <Link
            to="/admin/orders"
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-800 text-sm">Voir les commandes</p>
              <p className="text-xs text-gray-500">Gérer les commandes clients</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};