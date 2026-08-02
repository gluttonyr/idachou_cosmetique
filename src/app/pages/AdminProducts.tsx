import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Edit, Trash2, Plus, ArrowLeft, CheckCircle, XCircle,
  Loader2, X, Eye, Calendar, Layers, Tag,
} from 'lucide-react';
import { productService } from '../service/produitService';

interface Product {
  id: number;
  created_at: string;
  libelle: string;
  description: string;
  profile?: string;
  image1?: string;
  image2?: string;
  image3?: string;
  prix: number;
  stock: number;
  categorie_id: number;
  statut: string;
}

export const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
      if (selectedProduct?.id === id) setSelectedProduct(null);
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
        if (selectedProduct?.id === id) {
          setSelectedProduct(prev => prev ? { ...prev, statut: updated[0].statut } : prev);
        }
      }
    } catch (err) {
      alert('Erreur lors de la mise à jour du statut');
      console.error(err);
    } finally {
      setTogglingId(null);
    }
  };

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

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const filteredProducts =
    filter === 'all'
      ? products
      : products.filter(p => getCategorieFilter(p.categorie_id) === filter);

  const StatusBadge = ({ product }: { product: Product }) => {
    const isPublished = product.statut === 'PUBLIER';
    const isToggling = togglingId === product.id;
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          togglePublished(product.id, product.statut);
        }}
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
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <Link
                to="/admin/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <h1 className="text-lg md:text-2xl font-bold text-gray-800 truncate">
                Gestion des produits
              </h1>
            </div>
            <Link
              to="/admin/products/new"
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau produit</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-8">
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
              className={`px-3 md:px-4 py-2 rounded-lg text-sm transition-colors ${
                filter === key
                  ? 'bg-pink-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {label} ({count})
            </button>
          ))}
        </div>

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

        {!loading && !error && (
          <>
            {/* --- Vue TABLE (desktop) --- */}
            <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
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
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={product.profile || product.image1 || '/placeholder.png'}
                              alt={product.libelle}
                              className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                            />
                            <div className="ml-4 min-w-0">
                              <div className="font-medium text-gray-900 truncate max-w-[220px]">
                                {product.libelle}
                              </div>
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
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <StatusBadge product={product} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                            className="text-gray-500 hover:text-gray-800 mr-4"
                            title="Voir le détail"
                          >
                            <Eye className="w-4 h-4 inline" />
                          </button>
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-pink-600 hover:text-pink-900 mr-4"
                          >
                            <Edit className="w-4 h-4 inline" />
                          </Link>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(product.id); }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
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

            {/* --- Vue CARDS (mobile) --- */}
            <div className="md:hidden space-y-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-3 active:bg-gray-50"
                >
                  <img
                    src={product.profile || product.image1 || '/placeholder.png'}
                    alt={product.libelle}
                    className="w-16 h-16 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900 truncate">{product.libelle}</p>
                      <div onClick={(e) => e.stopPropagation()}>
                        <StatusBadge product={product} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-pink-100 text-pink-800">
                        {getCategorieLabel(product.categorie_id)}
                      </span>
                      <span className="text-xs text-gray-400">Stock: {product.stock}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-pink-600 text-sm">
                        {product.prix?.toFixed(2)} FCFA
                      </span>
                      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                        <Link to={`/admin/products/edit/${product.id}`} className="text-pink-600">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucun produit trouvé</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* --- Modal détail produit --- */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          categorieLabel={getCategorieLabel(selectedProduct.categorie_id)}
          formatDate={formatDate}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

// --- Composant Modal de détail ---
const ProductDetailModal = ({
  product,
  categorieLabel,
  formatDate,
  onClose,
}: {
  product: Product;
  categorieLabel: string;
  formatDate: (d: string) => string;
  onClose: () => void;
}) => {
  const images = [product.profile, product.image1, product.image2, product.image3].filter(Boolean) as string[];
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Contenu */}
      <div className="relative bg-white w-full md:max-w-2xl md:rounded-2xl rounded-t-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header sticky */}
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100 z-10">
          <h2 className="text-lg font-bold text-gray-800 truncate pr-4">{product.libelle}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Galerie d'images */}
          {images.length > 0 && (
            <div>
              <img
                src={images[activeImage]}
                alt={product.libelle}
                className="w-full h-64 object-cover rounded-xl bg-gray-100"
              />
              {images.length > 1 && (
                <div className="flex gap-2 mt-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(idx)}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        activeImage === idx ? 'border-pink-500' : 'border-transparent'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Infos clés */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Prix</p>
              <p className="font-bold text-pink-600">{product.prix?.toFixed(2)} FCFA</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Stock</p>
              <p className="font-bold text-gray-800">{product.stock}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-400">Catégorie</p>
                <p className="font-medium text-gray-800 text-sm">{categorieLabel}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
              {product.statut === 'PUBLIER'
                ? <CheckCircle className="w-4 h-4 text-green-500" />
                : <XCircle className="w-4 h-4 text-gray-400" />}
              <div>
                <p className="text-xs text-gray-400">Statut</p>
                <p className="font-medium text-gray-800 text-sm">
                  {product.statut === 'PUBLIER' ? 'Publié' : 'En attente'}
                </p>
              </div>
            </div>
          </div>

          {/* Description complète */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
            <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
              {product.description || 'Aucune description fournie.'}
            </p>
          </div>

          {/* Date d'ajout */}
          <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
            <Calendar className="w-3.5 h-3.5" />
            Ajouté le {formatDate(product.created_at)}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Link
              to={`/admin/products/edit/${product.id}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" /> Modifier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};