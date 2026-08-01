import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Package, Wrench } from 'lucide-react';
import { ChatWidget } from '../components/ChatWidget';


export const Home = () => {
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
            <h1 className="mb-6 drop-shadow-2xl">
              <span
                className="block text-6xl md:text-9xl"
                style={{
                  fontFamily: "'Dancing Script', cursive",
                  color: '#FFFFFF',
                  textShadow: '0 2px 10px rgba(0,0,0,0.35)',
                }}
              >
                Idach lip's
              </span>
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

      {/* Categories Grid — sert uniquement à naviguer vers les pages produits,
          plus aucun produit n'est affiché ici */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link
              to="/cosmetiques"
              className="bg-white rounded-xl shadow-md p-10 hover:shadow-xl transition-shadow text-center group"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-200 transition-colors">
                <Sparkles className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Cosmétiques</h3>
              <p className="text-gray-600 mb-4">
                Crèmes, maquillage, parfums et soins
              </p>
              <span className="text-pink-600 font-semibold text-sm">Voir la collection →</span>
            </Link>

            <Link
              to="/accessoires"
              className="bg-white rounded-xl shadow-md p-10 hover:shadow-xl transition-shadow text-center group"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-200 transition-colors">
                <Package className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Accessoires</h3>
              <p className="text-gray-600 mb-4">
                Pinceaux, miroirs et trousses
              </p>
              <span className="text-pink-600 font-semibold text-sm">Voir la collection →</span>
            </Link>

            <Link
              to="/materiels"
              className="bg-white rounded-xl shadow-md p-10 hover:shadow-xl transition-shadow text-center group"
            >
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-200 transition-colors">
                <Wrench className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Matériels</h3>
              <p className="text-gray-600 mb-4">
                Équipement professionnel
              </p>
              <span className="text-pink-600 font-semibold text-sm">Voir la collection →</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Widget de chat flottant */}
      <ChatWidget />
    </div>
  );
};