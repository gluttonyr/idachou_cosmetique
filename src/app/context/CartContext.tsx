import React, { createContext, useContext, useState } from 'react';

import type {ReactNode } from 'react';
export interface Product {
  id: number;
  name: string;
  prix: number;
  category: 'cosmetique' | 'accessoire' | 'materiel';
  image: string;
  description: string;
  images: string[];
}

interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  items: CartItem[];
  totalprix: number;
  status: 'pending' | 'processing' | 'completed';
}

interface CartContextType {
  cart: any[];
  addToCart: (product: any) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalprix: () => number;
  getCartItemsCount: () => number;
  createOrder: (customerName: string, customerPhone: string, customerEmail: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalprix = () => {
    return cart.reduce((total, item) => total + item.prix * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const createOrder = (customerName: string, customerPhone: string, customerEmail: string) => {
    const order: Order = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      customerName,
      customerPhone,
      customerEmail,
      items: [...cart],
      totalprix: getTotalprix(),
      status: 'pending',
    };

    // Save order to localStorage
    const existingOrders = localStorage.getItem('orders');
    const orders = existingOrders ? JSON.parse(existingOrders) : [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear cart
    clearCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalprix,
        getCartItemsCount,
        createOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé dans un CartProvider');
  }
  return context;
};