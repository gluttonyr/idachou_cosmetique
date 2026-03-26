import React, { useState, useEffect } from 'react';
import { getProducts } from '../utils/products';
import type { Product } from '../context/CartContext';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../service/produitService';
export const Accessoires = () => {
  const [accessoires, setAccessoires] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccessoires = async () => {
      try {
        const accessoiresData = await productService.getByCategoryLabel("Accessoires");
        setAccessoires(accessoiresData);
      } catch (error) {
        console.error('Erreur lors du chargement des accessoires:', error);
      }
    };

    fetchAccessoires();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Accessoires</h1>
        <p className="text-gray-600 mb-12 text-lg">
          Tous les accessoires indispensables pour votre routine beauté
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {accessoires.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};