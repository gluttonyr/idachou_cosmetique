import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { productService } from '../service/produitService';

export const Materiels = () => {
  const [materiels, setMateriels] = useState<any[]>([]);

  useEffect(() => {
    const fetchMateriels = async () => {
      try {
        const materielsData = await productService.getByCategoryLabel("Matériels");
        setMateriels(materielsData);
      } catch (error) {
        console.error('Erreur lors du chargement des matériels:', error);
      }
    };

    fetchMateriels();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">
          Matériel Professionnel
        </h1>
        <p className="text-gray-600 mb-12 text-lg">
          Équipement professionnel de qualité pour votre salon ou studio
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {materiels.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
          {materiels.length === 0 && (
            <p className="text-gray-500 col-span-full text-center">Aucun matériel trouvé.</p>
          )}
        </div>
      </div>
    </div>
  );
};