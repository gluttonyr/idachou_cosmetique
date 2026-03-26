import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { productService } from '../service/produitService'; // service complet
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Check } from 'lucide-react';

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      productService.getById(parseInt(id))
        .then(setProduct)
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Track product views
  useEffect(() => {
    if (product) {
      const views = JSON.parse(localStorage.getItem('productViews') || '{}');
      views[product.id] = (views[product.id] || 0) + 1;
      localStorage.setItem('productViews', JSON.stringify(views));
    }
  }, [product?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Produit introuvable
          </h2>
          <Link
            to="/"
            className="text-pink-600 hover:text-pink-700 font-semibold"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'cosmetique':
        return 'Cosmétiques';
      case 'accessoire':
        return 'Accessoires';
      case 'materiel':
        return 'Matériels';
      default:
        return category;
    }
  };

  // Crée un tableau d'images disponibles
  const images = [product.profile, product.image1, product.image2, product.image3].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
      <div className="container mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-pink-600 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images Gallery */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-4">
              <img
                src={images[selectedImage]}
                alt={product.libelle}
                className="w-full aspect-square object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-pink-600'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.libelle} ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <Link
                to={`/${product.categorie_id}`}
                className="text-pink-600 hover:text-pink-700 text-sm font-semibold"
              >
                {getCategoryName(product.categorie_id)}
              </Link>
            </div>

            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {product.libelle}
            </h1>

            <p className="text-3xl font-bold text-pink-600 mb-6">
              {product.prix.toFixed(2)} FCFA
            </p>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-pink-600 text-white py-4 rounded-lg hover:bg-pink-700 transition-colors font-semibold text-lg flex items-center justify-center gap-2"
              >
                {added ? (
                  <>
                    <Check className="w-6 h-6" />
                    Ajouté au panier
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    Ajouter au panier
                  </>
                )}
              </button>

              <Link
                to="/panier"
                className="bg-gray-200 text-gray-800 px-6 py-4 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              >
                Voir le panier
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};