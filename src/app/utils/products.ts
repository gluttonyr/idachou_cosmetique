import { products as initialProducts } from '../data/products';
import type { Product } from '../context/CartContext';

export const getProducts = (): Product[] => {
  const storedProducts = localStorage.getItem('products');
  return storedProducts ? JSON.parse(storedProducts) : initialProducts;
};

export const getProductById = (id: number): Product | undefined => {
  const products = getProducts();
  return products.find((p) => p.id === id);
};
