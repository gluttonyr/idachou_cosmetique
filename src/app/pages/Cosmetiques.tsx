import React, { useState, useEffect } from 'react';
import { getProducts } from '../utils/products';
import type { Product } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../service/produitService';

export const Cosmetiques = () => {
  const [cosmetiques, setCosmetiques] = useState<any[]>([]);

  useEffect(() => {
    const fetchCosmetiques = async () => {
      try {
        const cosmetiquesData = await productService.getByCategoryLabel("Cosmétiques");
        setCosmetiques(cosmetiquesData);
      } catch (error) {
        console.error('Erreur lors du chargement des cosmétiques:', error);
      }
    };

    fetchCosmetiques();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Cosmétiques</h1>
        <p className="text-gray-600 mb-12 text-lg">
          Découvrez notre collection de produits cosmétiques de haute qualité
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cosmetiques.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};