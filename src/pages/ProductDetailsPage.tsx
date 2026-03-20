import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ProductDetails } from '../components/ProductDetails';
import { Product } from '../types';

interface ProductDetailsPageProps {
  products: Product[];
  user: any;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  addedItems: Record<string, boolean>;
  formatPrice: (price: number) => string;
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  products, user, onAddToCart, addedItems, formatPrice
}) => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (productId && products.length > 0) {
      const found = products.find(p => p.id === productId || p.name.toLowerCase().replace(/\s+/g, '-') === productId);
      if (found) {
        setProduct(found);
      }
    }
  }, [productId, products]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="pt-24"
    >
      <ProductDetails 
        product={product} 
        user={user}
        onBack={() => navigate(-1)} 
        onAddToCart={onAddToCart} 
        isAdded={addedItems[product.name] || false}
        formatPrice={formatPrice}
      />
    </motion.div>
  );
};

export default ProductDetailsPage;
