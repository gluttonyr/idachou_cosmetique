import type { Product } from '../context/CartContext';

export const products: Product[] = [
  // Cosmétiques
  {
    id: 1,
    name: 'Crème Hydratante Luxe',
    price: 45.99,
    category: 'cosmetique',
    image: 'https://images.unsplash.com/photo-1686831758227-1802d0ba5eda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNlJTIwY3JlYW0lMjBza2luY2FyZXxlbnwxfHx8fDE3NzI1MDAxMDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Crème hydratante de luxe pour tous types de peaux. Formule enrichie en vitamines et antioxydants.',
    images: [
      'https://images.unsplash.com/photo-1686831758227-1802d0ba5eda?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYWNlJTIwY3JlYW0lMjBza2luY2FyZXxlbnwxfHx8fDE3NzI1MDAxMDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1695972235555-4b0d3c09c6ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpYyUyMHByb2R1Y3RzJTIwbHV4dXJ5fGVufDF8fHx8MTc3MjU1Njc2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1719175936556-dbd05e415913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwYm90dGxlJTIwbHV4dXJ5fGVufDF8fHx8MTc3MjU1Njc2NXww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 2,
    name: 'Rouge à Lèvres Mat',
    price: 28.99,
    category: 'cosmetique',
    image: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXBzdGljayUyMG1ha2V1cHxlbnwxfHx8fDE3NzI0NjA5MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Rouge à lèvres mat longue tenue. Disponible en plusieurs teintes.',
    images: [
      'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsaXBzdGljayUyMG1ha2V1cHxlbnwxfHx8fDE3NzI0NjA5MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1695972235555-4b0d3c09c6ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpYyUyMHByb2R1Y3RzJTIwbHV4dXJ5fGVufDF8fHx8MTc3MjU1Njc2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 3,
    name: 'Vernis à Ongles',
    price: 15.99,
    category: 'cosmetique',
    image: 'https://images.unsplash.com/photo-1640958903443-1e49d720650d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwcG9saXNoJTIwYm90dGxlfGVufDF8fHx8MTc3MjU0MjAwNXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Vernis à ongles haute qualité. Séchage rapide et brillance durable.',
    images: [
      'https://images.unsplash.com/photo-1640958903443-1e49d720650d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYWlsJTIwcG9saXNoJTIwYm90dGxlfGVufDF8fHx8MTc3MjU0MjAwNXww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1695972235555-4b0d3c09c6ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpYyUyMHByb2R1Y3RzJTIwbHV4dXJ5fGVufDF8fHx8MTc3MjU1Njc2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 4,
    name: 'Parfum Élégance',
    price: 89.99,
    category: 'cosmetique',
    image: 'https://images.unsplash.com/photo-1719175936556-dbd05e415913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwYm90dGxlJTIwbHV4dXJ5fGVufDF8fHx8MTc3MjU1Njc2NXww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Parfum floral élégant. Notes de rose et jasmin. 50ml.',
    images: [
      'https://images.unsplash.com/photo-1719175936556-dbd05e415913?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwYm90dGxlJTIwbHV4dXJ5fGVufDF8fHx8MTc3MjU1Njc2NXww&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1695972235555-4b0d3c09c6ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpYyUyMHByb2R1Y3RzJTIwbHV4dXJ5fGVufDF8fHx8MTc3MjU1Njc2M3ww&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },

  // Accessoires
  {
    id: 5,
    name: 'Set de Pinceaux Maquillage',
    price: 39.99,
    category: 'accessoire',
    image: 'https://images.unsplash.com/photo-1736753365978-0b5090f90095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBicnVzaCUyMHNldHxlbnwxfHx8fDE3NzI1NTA3MDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Set complet de 12 pinceaux professionnels pour maquillage. Poils synthétiques de qualité.',
    images: [
      'https://images.unsplash.com/photo-1736753365978-0b5090f90095?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWtldXAlMjBicnVzaCUyMHNldHxlbnwxfHx8fDE3NzI1NTA3MDF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1617220381440-4120582b6408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBhY2Nlc3NvcmllcyUyMHBpbmt8ZW58MXx8fHwxNzcyNTU2NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 6,
    name: 'Trousse de Maquillage Rose',
    price: 24.99,
    category: 'accessoire',
    image: 'https://images.unsplash.com/photo-1764777858430-a285d6d9cf50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpYyUyMGJhZyUyMHBpbmt8ZW58MXx8fHwxNzcyNTU2NzY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Trousse spacieuse pour ranger tous vos produits. Design élégant et pratique.',
    images: [
      'https://images.unsplash.com/photo-1764777858430-a285d6d9cf50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpYyUyMGJhZyUyMHBpbmt8ZW58MXx8fHwxNzcyNTU2NzY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1617220381440-4120582b6408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBhY2Nlc3NvcmllcyUyMHBpbmt8ZW58MXx8fHwxNzcyNTU2NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 7,
    name: 'Miroir de Vanité Lumineux',
    price: 59.99,
    category: 'accessoire',
    image: 'https://images.unsplash.com/photo-1696218614256-b74c0bcde0d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXJyb3IlMjB2YW5pdHl8ZW58MXx8fHwxNzcyNTU2NzY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Miroir avec éclairage LED réglable. Parfait pour un maquillage précis.',
    images: [
      'https://images.unsplash.com/photo-1696218614256-b74c0bcde0d5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaXJyb3IlMjB2YW5pdHl8ZW58MXx8fHwxNzcyNTU2NzY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1617220381440-4120582b6408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBhY2Nlc3NvcmllcyUyMHBpbmt8ZW58MXx8fHwxNzcyNTU2NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 8,
    name: 'Éponges à Maquillage',
    price: 12.99,
    category: 'accessoire',
    image: 'https://images.unsplash.com/photo-1617220381440-4120582b6408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBhY2Nlc3NvcmllcyUyMHBpbmt8ZW58MXx8fHwxNzcyNTU2NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Set de 5 éponges pour application parfaite du fond de teint.',
    images: [
      'https://images.unsplash.com/photo-1617220381440-4120582b6408?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWF1dHklMjBhY2Nlc3NvcmllcyUyMHBpbmt8ZW58MXx8fHwxNzcyNTU2NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1764777858430-a285d6d9cf50?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3NtZXRpYyUyMGJhZyUyMHBpbmt8ZW58MXx8fHwxNzcyNTU2NzY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },

  // Matériel
  {
    id: 9,
    name: 'Sèche-Cheveux Professionnel',
    price: 129.99,
    category: 'materiel',
    image: 'https://images.unsplash.com/photo-1706087474128-740215c37bcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwZHJ5ZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcyNDU1MDczfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Sèche-cheveux puissant 2000W. Technologie ionique pour réduire les frisottis.',
    images: [
      'https://images.unsplash.com/photo-1706087474128-740215c37bcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwZHJ5ZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcyNDU1MDczfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1771444700441-6e8bc12f16d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBiZWF1dHklMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcyNTU2NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 10,
    name: 'Lisseur Céramique',
    price: 89.99,
    category: 'materiel',
    image: 'https://images.unsplash.com/photo-1557873443-a6d8870b1768?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhaWdodGVuZXIlMjBoYWlyJTIwdG9vbHxlbnwxfHx8fDE3NzI1NTY3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Lisseur avec plaques en céramique. Température réglable jusqu\'à 230°C.',
    images: [
      'https://images.unsplash.com/photo-1557873443-a6d8870b1768?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhaWdodGVuZXIlMjBoYWlyJTIwdG9vbHxlbnwxfHx8fDE3NzI1NTY3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1771444700441-6e8bc12f16d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBiZWF1dHklMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcyNTU2NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 11,
    name: 'Kit Manucure Électrique',
    price: 69.99,
    category: 'materiel',
    image: 'https://images.unsplash.com/photo-1771444700441-6e8bc12f16d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBiZWF1dHklMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcyNTU2NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Kit complet pour manucure professionnelle à domicile. 6 embouts inclus.',
    images: [
      'https://images.unsplash.com/photo-1771444700441-6e8bc12f16d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBiZWF1dHklMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcyNTU2NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1706087474128-740215c37bcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWlyJTIwZHJ5ZXIlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcyNDU1MDczfDA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
  {
    id: 12,
    name: 'Stérilisateur UV',
    price: 49.99,
    category: 'materiel',
    image: 'https://images.unsplash.com/photo-1771444700441-6e8bc12f16d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBiZWF1dHklMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcyNTU2NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Stérilisateur UV pour outils de beauté. Hygiène professionnelle garantie.',
    images: [
      'https://images.unsplash.com/photo-1771444700441-6e8bc12f16d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBiZWF1dHklMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzcyNTU2NzYzfDA&ixlib=rb-4.1.0&q=80&w=1080',
      'https://images.unsplash.com/photo-1557873443-a6d8870b1768?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJhaWdodGVuZXIlMjBoYWlyJTIwdG9vbHxlbnwxfHx8fDE3NzI1NTY3NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    ],
  },
];
