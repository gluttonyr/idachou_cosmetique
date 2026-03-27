import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getTotalprix } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Mon Panier</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Votre panier est vide
            </h2>
            <p className="text-gray-600 mb-8">
              Découvrez nos produits et commencez vos achats
            </p>
            <Link
              to="/"
              className="inline-block bg-pink-600 text-white px-8 py-3 rounded-full hover:bg-pink-700 transition-colors font-semibold"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white py-12 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8">Mon Panier</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-6 border-b last:border-b-0"
                >
                  <Link
                    to={`/produit/${item.id}`}
                    className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                  >
                    <img
                      src={item.profile}
                      alt={item.libelle}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  <div className="flex-1">
                    <Link
                      to={`/produit/${item.id}`}
                      className="font-semibold text-gray-800 hover:text-pink-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="text-gray-600 text-sm mb-2">
                      {item.prix?.toFixed(2)} €
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {(item.prix * item.quantity)?.toFixed(2)} €
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Résumé de la commande
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Sous-total</span>
                  <span>{getTotalprix()?.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-xl text-gray-800">
                  <span>Total</span>
                  <span className="text-pink-600">
                    {getTotalprix()?.toFixed(2)} €
                  </span>
                </div>
              </div>

              <Link
                to="/commander"
                className="block w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors font-semibold text-center text-lg"
              >
                Passer la commande
              </Link>

              <Link
                to="/"
                className="block w-full text-center text-pink-600 hover:text-pink-700 mt-4 font-semibold"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
