import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Outlet />
      </main>
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xl font-semibold mb-2 text-pink-400">
            IDACHOU PERLAGE GLOSS
          </p>
          <p className="text-gray-400">
            © 2026 IDACHOU PERLAGE GLOSS. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
};