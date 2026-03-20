import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { motion } from 'motion/react';
import { 
  ChevronsUpDown, 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  ImageIcon, 
  Upload, 
  Loader2, 
  AlertTriangle 
} from 'lucide-react';
import { handleFirestoreError, OperationType } from '../../utils/firebaseUtils';
import { Product } from '../../types';
import { FALLBACK_IMAGE } from '../../constants';
import { useToast } from '../../components/Toast';

interface AdminProductsProps {
  formatPrice: (price: number) => string;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ formatPrice }) => {
  const { addToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productSort, setProductSort] = useState<{ field: string, direction: 'asc' | 'desc' }>({ field: 'name', direction: 'asc' });
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  const [isEditingProduct, setIsEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [productsPage, setProductsPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => setProductsPage(1), [productSearchQuery, productSort]);

  useEffect(() => {
    const productsRef = collection(db, 'products');
    const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setIsLoading(false);
    }, (error) => {
      setIsLoading(false);
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => unsubscribeProducts();
  }, []);

  const handleSaveProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      let imageUrl = productData.image;

      if (selectedFile) {
        setUploadingImage(true);
        setUploadProgress(0);
        const storageRef = ref(storage, `products/${Date.now()}_${selectedFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedFile);

        imageUrl = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            }, 
            (error) => reject(error), 
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
      }

      const finalProductData = { ...productData, image: imageUrl };

      if (isEditingProduct && isEditingProduct.id) {
        await setDoc(doc(db, 'products', isEditingProduct.id), finalProductData);
        addToast("Product updated successfully!", "success");
      } else {
        await addDoc(collection(db, 'products'), finalProductData);
        addToast("Product added successfully!", "success");
      }
      setIsEditingProduct(null);
      setIsAddingProduct(false);
      setSelectedFile(null);
      setImagePreview(null);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error saving product:", error);
      addToast("Failed to save product", "error");
      handleFirestoreError(error, OperationType.WRITE, 'products');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      addToast("Product deleted successfully!", "success");
      setProductToDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      addToast("Failed to delete product", "error");
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  };

  const sortData = (data: any[], sortConfig: { field: string, direction: 'asc' | 'desc' }) => {
    return [...data].sort((a, b) => {
      let valA = a[sortConfig.field];
      let valB = b[sortConfig.field];

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredProducts = sortData(
    products.filter(product => 
      product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(productSearchQuery.toLowerCase())
    ),
    productSort
  );

  const paginatedProducts = filteredProducts.slice((productsPage - 1) * ITEMS_PER_PAGE, productsPage * ITEMS_PER_PAGE);
  const totalProductsPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (p: number) => void }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
        <div className="text-sm text-slate-500">
          Page <span className="font-bold text-slate-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-600 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const SortIcon = ({ field, currentSort }: { field: string, currentSort: { field: string, direction: 'asc' | 'desc' } }) => {
    if (currentSort.field !== field) return <ChevronsUpDown className="w-3 h-3 opacity-30" />;
    return (
      <span className="text-primary">
        {currentSort.direction === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </span>
    );
  };

  const toggleSort = (field: string) => {
    if (productSort.field === field) {
      setProductSort({ field, direction: productSort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setProductSort({ field, direction: 'asc' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-800/50 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={productSearchQuery}
            onChange={(e) => setProductSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => {
            setIsEditingProduct(null);
            setIsAddingProduct(true);
            setImagePreview(null);
            setSelectedFile(null);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-slate-900 rounded-xl font-bold hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Image</th>
                <th 
                  className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => toggleSort('name')}
                >
                  <div className="flex items-center gap-1">
                    Name
                    <SortIcon field="name" currentSort={productSort} />
                  </div>
                </th>
                <th 
                  className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => toggleSort('category')}
                >
                  <div className="flex items-center gap-1">
                    Category
                    <SortIcon field="category" currentSort={productSort} />
                  </div>
                </th>
                <th 
                  className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => toggleSort('price')}
                >
                  <div className="flex items-center gap-1">
                    Price
                    <SortIcon field="price" currentSort={productSort} />
                  </div>
                </th>
                <th 
                  className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                  onClick={() => toggleSort('stockQuantity')}
                >
                  <div className="flex items-center gap-1">
                    Stock
                    <SortIcon field="stockQuantity" currentSort={productSort} />
                  </div>
                </th>
                <th className="p-4 font-semibold text-sm text-slate-600 dark:text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No products found.</td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4">
                      <img 
                        src={product.image} 
                        alt={product.alt} 
                        className="w-12 h-12 object-cover rounded-lg" 
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src !== FALLBACK_IMAGE) {
                            target.src = FALLBACK_IMAGE;
                          }
                        }}
                      />
                    </td>
                    <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">{product.name}</td>
                    <td className="p-4 text-sm text-slate-500">{product.category}</td>
                    <td className="p-4 text-sm font-bold text-primary">{formatPrice(product.price)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        product.stockQuantity === 0 
                          ? 'bg-red-100 text-red-600' 
                          : product.stockQuantity < 10 
                            ? 'bg-amber-100 text-amber-600' 
                            : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {product.stockQuantity} in stock
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setIsEditingProduct(product);
                            setIsAddingProduct(true);
                            setImagePreview(product.image);
                            setSelectedFile(null);
                          }}
                          className="p-2 text-slate-400 hover:text-primary transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => product.id && setProductToDelete(product)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls currentPage={productsPage} totalPages={totalProductsPages} onPageChange={setProductsPage} />
      </div>

      {/* Add/Edit Product Modal */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl w-full shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isEditingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => { setIsAddingProduct(false); setIsEditingProduct(null); }} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const productData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                price: parseFloat(formData.get('price') as string),
                category: formData.get('category') as string,
                image: isEditingProduct?.image || '',
                alt: formData.get('name') as string,
                stockQuantity: parseInt(formData.get('stockQuantity') as string),
                dietaryTags: (formData.get('dietaryTags') as string).split(',').map(t => t.trim()).filter(t => t),
                featured: formData.get('featured') === 'on'
              };
              handleSaveProduct(productData);
            }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Product Name</label>
                    <input name="name" defaultValue={isEditingProduct?.name} required className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                    <select name="category" defaultValue={isEditingProduct?.category || 'Cupcakes'} className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none">
                      <option value="Cupcakes">Cupcakes</option>
                      <option value="Brownies & Bars">Brownies & Bars</option>
                      <option value="Cakes">Cakes</option>
                      <option value="Sampler Packs">Sampler Packs</option>
                      <option value="Banana Pudding">Banana Pudding</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Price ($)</label>
                      <input name="price" type="number" step="0.01" defaultValue={isEditingProduct?.price} required className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Stock</label>
                      <input name="stockQuantity" type="number" defaultValue={isEditingProduct?.stockQuantity} required className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Product Image</label>
                  <div className="relative aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden group">
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer p-3 bg-white rounded-full text-slate-900 hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <ImageIcon className="w-10 h-10 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500 font-medium">Click to upload image</span>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </label>
                    )}
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6">
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                        <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                          <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <p className="text-white text-xs font-bold mt-2">{Math.round(uploadProgress)}% Uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea name="description" defaultValue={isEditingProduct?.description} rows={3} required className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none resize-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Dietary Tags (comma separated)</label>
                <input name="dietaryTags" defaultValue={isEditingProduct?.dietaryTags?.join(', ')} placeholder="e.g. Vegetarian, Gluten-Free" className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary outline-none" />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" name="featured" id="featured" defaultChecked={isEditingProduct?.featured} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                <label htmlFor="featured" className="text-sm font-bold text-slate-700 dark:text-slate-300">Featured Product</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => { setIsAddingProduct(false); setIsEditingProduct(null); }} className="px-6 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={uploadingImage} className="px-8 py-2 bg-primary text-slate-900 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2">
                  {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEditingProduct ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 mb-4 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Product?</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{productToDelete.name}</span>? This action cannot be undone and will remove the product from the store.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setProductToDelete(null)} className="px-4 py-2 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button onClick={() => productToDelete.id && handleDeleteProduct(productToDelete.id)} className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-colors">
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
