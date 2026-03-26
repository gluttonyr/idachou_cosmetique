import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';

import { Package, Edit, Trash2, Plus, ArrowLeft, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { productService } from '../service/produitService';

export const AdminProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger les produits depuis Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getAll();
        setProducts(data);
      } catch (err: any) {
        setError('Erreur lors du chargement des produits');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Erreur lors de la suppression');
      console.error(err);
    }
  };

  const togglePublished = async (id: number, currentStatus: string) => {
    try {
      setTogglingId(id);
      const updated = await productService.toggleStatus(id, currentStatus);
      if (updated && updated[0]) {
        setProducts(prev =>
          prev.map(p => p.id === id ? { ...p, statut: updated[0].statut } : p)
        );
      }
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

  // Map categorie_id vers libellé (adapter selon votre table Categorie)
  const getCategorieLabel = (categorieId: number) => {
    const map: Record<number, string> = {
      1: 'Cosmétique',
      2: 'Accessoire',
      3: 'Matériel',
    };
    return map[categorieId] ?? 'Autre';
  };

  const getCategorieFilter = (categorieId: number) => {
    const map: Record<number, string> = {
      1: 'cosmetique',
      2: 'accessoire',
      3: 'materiel',
    };
    return map[categorieId] ?? 'autre';
  };

  const filteredProducts =
    filter === 'all'
      ? products
      : products.filter(p => getCategorieFilter(p.categorie_id) === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-800">
                Gestion des produits
              </h1>
            </div>
            <Link
              to="/admin/products/new"
              className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau produit
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filtres */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Tous', count: products.length },
            { key: 'cosmetique', label: 'Cosmétiques', count: products.filter(p => getCategorieFilter(p.categorie_id) === 'cosmetique').length },
            { key: 'accessoire', label: 'Accessoires', count: products.filter(p => getCategorieFilter(p.categorie_id) === 'accessoire').length },
            { key: 'materiel', label: 'Matériels', count: products.filter(p => getCategorieFilter(p.categorie_id) === 'materiel').length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === key
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

        {/* État de chargement / erreur */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-pink-600 animate-spin" />
            <span className="ml-3 text-gray-500">Chargement des produits...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => {
                    const isPublished = product.statut === 'PUBLIER';
                    const isToggling = togglingId === product.id;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={product.profile || product.image1 || '/placeholder.png'}
                              alt={product.libelle}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                            />
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{product.libelle}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-100 text-pink-800">
                            {getCategorieLabel(product.categorie_id)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.prix?.toFixed(2)} FCFA
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => togglePublished(product.id, product.statut)}
                            disabled={isToggling}
                            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition-colors disabled:opacity-60 ${
                              isPublished
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                            }`}
                          >
                            {isToggling ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : isPublished ? (
                              <><CheckCircle className="w-3 h-3" /> Publié</>
                            ) : (
                              <><XCircle className="w-3 h-3" /> En Attente</>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="text-pink-600 hover:text-pink-900 mr-4"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucun produit trouvé</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};