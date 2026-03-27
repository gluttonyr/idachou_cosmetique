import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../utils/products';
import type { Product } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { Sparkles, Package, Wrench } from 'lucide-react';
import { productService } from '../service/produitService';

export const Home = () => {
  const [cosmetiques, setCosmetiques] = useState<any[]>([]);
  const [accessoires, setAccessoires] = useState<any[]>([]);
  const [materiels, setMateriels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const [cosmetiquesData, accessoiresData, materielsData] = await Promise.all([
          productService.getByCategoryLabel("Cosmétiques", 4),
          productService.getByCategoryLabel("Accessoires", 4),
          productService.getByCategoryLabel("Matériels", 4),
        ]);
        setCosmetiques(cosmetiquesData);
        setAccessoires(accessoiresData);
        setMateriels(materielsData);
      } catch (err) {
        setError('Erreur lors du chargement des produits');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-pink-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Hero Section with Background Image */}
      <section className="relative h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src="https://nxkyhagpncgcbmzbebwh.supabase.co/storage/v1/object/public/static/video.mp4"
              type="video/mp4"
            />
            Ton navigateur ne supporte pas les vidéos.
          </video>
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/70 to-pink-600/60" />
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex items-center justify-center px-4">
          <div className="text-center text-white z-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
              IDACHOU PERLAGE GLOSS
            </h1>
            <p className="text-xl md:text-2xl mb-10 drop-shadow-lg max-w-2xl mx-auto">
              Découvrez notre collection de produits de beauté luxueux
            </p>

            {/* Three Category Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/cosmetiques"
                className="inline-flex items-center gap-2 bg-pink-600 text-white px-8 py-4 rounded-full hover:bg-pink-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 w-64"
              >
                <Sparkles className="w-5 h-5" />
                Cosmétiques
              </Link>
              <Link
                to="/accessoires"
                className="inline-flex items-center gap-2 bg-white text-pink-600 px-8 py-4 rounded-full hover:bg-pink-50 transition-all text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 w-64"
              >
                <Package className="w-5 h-5" />
                Accessoires
              </Link>
              <Link
                to="/materiels"
                className="inline-flex items-center gap-2 bg-pink-600 text-white px-8 py-4 rounded-full hover:bg-pink-700 transition-all text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 w-64"
              >
                <Wrench className="w-5 h-5" />
                Matériels
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Link
              to="/cosmetiques"
              className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow text-center"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Cosmétiques</h3>
              <p className="text-gray-600">
                Crèmes, maquillage, parfums et soins
              </p>
            </Link>

            <Link
              to="/accessoires"
              className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow text-center"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Accessoires</h3>
              <p className="text-gray-600">
                Pinceaux, miroirs et trousses
              </p>
            </Link>

            <Link
              to="/materiels"
              className="bg-white rounded-xl shadow-md p-8 hover:shadow-xl transition-shadow text-center"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Matériels</h3>
              <p className="text-gray-600">
                Équipement professionnel
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products - Cosmétiques */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Cosmétiques</h2>
            <Link
              to="/cosmetiques"
              className="text-pink-600 hover:text-pink-700 font-semibold"
            >
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cosmetiques.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {cosmetiques.length === 0 && (
              <p className="text-gray-500 col-span-full text-center">Aucun cosmétique trouvé.</p>
            )}
          
        
          </div>
        </div>
      </section>

      {/* Featured Products - Accessoires */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Accessoires</h2>
            <Link
              to="/accessoires"
              className="text-pink-600 hover:text-pink-700 font-semibold"
            >
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {accessoires.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {accessoires.length === 0 && (
              <p className="text-gray-500 col-span-full text-center">Aucun accessoire trouvé.</p>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products - Matériels */}
      <section className="py-12 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Matériels</h2>
            <Link
              to="/materiels"
              className="text-pink-600 hover:text-pink-700 font-semibold"
            >
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {materiels.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
            {materiels.length === 0 && (
              <p className="text-gray-500 col-span-full text-center">Aucun matériel trouvé.</p>
            )}

          </div>
        </div>
      </section>
    </div>
  );
};