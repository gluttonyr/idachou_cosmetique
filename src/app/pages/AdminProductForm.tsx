import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { ArrowLeft, Save, Image } from 'lucide-react';
import { productService } from '../service/produitService';
import { categorieService } from '../utils/categorieService';

interface FormData {
  libelle: string;
  prix: string;
  categorie_id: string;
  stock: string;
  description: string;
  profile: File | null;
  image1: File | null;
  image2: File | null;
  image3: File | null;
  // URLs actuelles (pour l'édition)
  profileUrl: string;
  image1Url: string;
  image2Url: string;
  image3Url: string;
}

export const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    libelle: '',
    prix: '',
    categorie_id: '',
    stock: '',
    description: '',
    profile: null,
    image1: null,
    image2: null,
    image3: null,
    profileUrl: '',
    image1Url: '',
    image2Url: '',
    image3Url: '',
  });

  // Ajoute ce state en haut du composant
  const [categories, setCategories] = useState<{ id: number; libelle: string }[]>([]);

  // Ajoute ce useEffect
  useEffect(() => {
    categorieService.getAll()
      .then(setCategories)
      .catch(() => setError("Erreur lors du chargement des catégories"));
  }, []);

  useEffect(() => {
    if (isEdit && id) {
      setLoading(true);
      productService.getById(parseInt(id))
        .then((product) => {
          setFormData((prev) => ({
            ...prev,
            libelle: product.libelle || '',
            prix: product.prix?.toString() || '',
            categorie_id: product.categorie_id?.toString() || '',
            stock: product.stock?.toString() || '',
            description: product.description || '',
            profileUrl: product.profile || '',
            image1Url: product.image1 || '',
            image2Url: product.image2 || '',
            image3Url: product.image3 || '',
          }));
        })
        .catch(() => setError('Erreur lors du chargement du produit'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleFileChange = (field: 'profile' | 'image1' | 'image2' | 'image3') =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setFormData((prev) => ({ ...prev, [field]: file }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!formData.profile && !formData.profileUrl) {
      setError("L'image principale est obligatoire");
      setLoading(false);
      return;
    }
    setError(null);
    console.log(parseInt(formData.stock))

    try {
      const payload = {
        libelle: formData.libelle,
        description: formData.description,
        prix: parseFloat(formData.prix),
        stock: parseInt(formData.stock),
        categorie_id: parseInt(formData.categorie_id),
        profile: formData.profile,
        image1: formData.image1,
        image2: formData.image2,
        image3: formData.image3,
      };

      if (isEdit && id) {
        await productService.update(parseInt(id), payload);
      } else {
        await productService.create(payload);
      }

      navigate('/admin/products');
    } catch (err) {
      setError('Erreur lors de la sauvegarde du produit');
    } finally {
      setLoading(false);
    }
  };

  // Composant réutilisable pour les inputs fichier
  const FileInput = ({
    label,
    field,
    currentUrl,
    required = false,
  }: {
    label: string;
    field: 'profile' | 'image1' | 'image2' | 'image3';
    currentUrl?: string;
    required?: boolean;
  }) => {
    const file = formData[field] as File | null;
    const preview = file ? URL.createObjectURL(file) : currentUrl;

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && '*'}
        </label>
        <div className="flex items-start gap-4">
          {/* Preview */}
          <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0 bg-gray-50">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <Image className="w-8 h-8 text-gray-400" />
            )}
          </div>
          {/* Input */}
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange(field)}

              className="w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-pink-50 file:text-pink-700
                hover:file:bg-pink-100 cursor-pointer"
            />
            {currentUrl && !file && (
              <p className="mt-1 text-xs text-gray-500">Image actuelle conservée si aucun fichier sélectionné</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading && isEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-800">
              {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
            <div className="space-y-6">

              {/* Libellé */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du produit *</label>
                <input
                  type="text"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix (FCFA) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.prix}
                  onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock *</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Catégorie */}
              {/* Remplace l'input categorie_id par ce select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                <select
                  value={formData.categorie_id}
                  onChange={(e) => setFormData({ ...formData, categorie_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">-- Sélectionner une catégorie --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.libelle}
                    </option>
                  ))}
                </select>
              </div>

              {/* Images */}
              <FileInput label="Image principale (profile)" field="profile" currentUrl={formData.profileUrl} required />
              <FileInput label="Image secondaire 1" field="image1" currentUrl={formData.image1Url} />
              <FileInput label="Image secondaire 2" field="image2" currentUrl={formData.image2Url} />
              <FileInput label="Image secondaire 3" field="image3" currentUrl={formData.image3Url} />

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Sauvegarde...' : isEdit ? 'Enregistrer les modifications' : 'Créer le produit'}
                </button>
                <Link
                  to="/admin/products"
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Annuler
                </Link>
              </div>

            </div>
          </form>
        </div>
      </main>
    </div>
  );
};