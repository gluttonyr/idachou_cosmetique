import React from 'react';
import { Link } from 'react-router';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
// import logoImage from 'figma:asset/5d2ba0ceeda44fb1c706edef1bc48279ec111c70.png';

export const Header = () => {
  const { getCartItemsCount } = useCart();
  const cartCount = getCartItemsCount();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src='https://nxkyhagpncgcbmzbebwh.supabase.co/storage/v1/object/public/static/logo.jpeg' alt="IPG Logo" className="h-10 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-700 hover:text-pink-600 transition-colors text-sm"
            >
              Accueil
            </Link>
            <Link
              to="/cosmetiques"
              className="text-gray-700 hover:text-pink-600 transition-colors text-sm"
            >
              Cosmétiques
            </Link>
            <Link
              to="/accessoires"
              className="text-gray-700 hover:text-pink-600 transition-colors text-sm"
            >
              Accessoires
            </Link>
            <Link
              to="/materiels"
              className="text-gray-700 hover:text-pink-600 transition-colors text-sm"
            >
              Matériels
            </Link>
          </nav>

          <Link
            to="/panier"
            className="relative flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-full hover:bg-pink-700 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="hidden sm:inline">Panier</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-pink-800 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center gap-4 mt-3 overflow-x-auto pb-2">
          <Link
            to="/"
            className="whitespace-nowrap text-sm text-gray-700 hover:text-pink-600 transition-colors"
          >
            Accueil
          </Link>
          <Link
            to="/cosmetiques"
            className="whitespace-nowrap text-sm text-gray-700 hover:text-pink-600 transition-colors"
          >
            Cosmétiques
          </Link>
          <Link
            to="/accessoires"
            className="whitespace-nowrap text-sm text-gray-700 hover:text-pink-600 transition-colors"
          >
            Accessoires
          </Link>
          <Link
            to="/materiels"
            className="whitespace-nowrap text-sm text-gray-700 hover:text-pink-600 transition-colors"
          >
            Matériels
          </Link>
        </nav>
      </div>
    </header>
  );
};