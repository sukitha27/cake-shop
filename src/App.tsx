/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductDetails } from './components/ProductDetails';
import { CartDrawer } from './components/CartDrawer';
import { Checkout, ShippingInfo } from './components/Checkout';
import { Testimonials } from './components/Testimonials';
import { OrderTracker } from './components/OrderTracker';
import { AdminDashboard } from './components/AdminDashboard';
import { AccountPage } from './components/AccountPage';
import { Invoice } from './components/Invoice';
import { FilterBar } from './components/FilterBar';
import { useToast } from './components/Toast';
import { useTheme } from './hooks/useTheme';
import { ChatBot } from './components/ChatBot';

export interface Product {
  id?: string;
  name: string;
  category: string;
  image: string;
  alt: string;
  price: number;
  stockQuantity: number;
  description: string;
  ingredients: string;
  nutrition: string;
  dietaryTags: string[];
}

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=800';

const INITIAL_PRODUCTS: Product[] = [
  {
    name: 'Classic Vanilla Cupcake',
    category: 'Cupcakes',
    image: 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&q=80&w=800',
    alt: 'Classic vanilla cupcakes with pink frosting',
    price: 4.50,
    stockQuantity: 50,
    description: 'Our signature vanilla cupcake topped with our classic vanilla buttercream. A timeless favorite that melts in your mouth.',
    ingredients: 'Flour, sugar, butter, eggs, milk, vanilla extract, baking powder, salt.',
    nutrition: 'Calories: 350, Fat: 18g, Carbs: 45g, Protein: 4g',
    dietaryTags: ['Nut-Free']
  },
  {
    name: 'Chocolate Buttercream Cupcake',
    category: 'Cupcakes',
    image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800',
    alt: 'Topseller cupcakes variety box',
    price: 4.75,
    stockQuantity: 30,
    description: 'Rich chocolate cake topped with our decadent chocolate buttercream frosting. Perfect for chocolate lovers.',
    ingredients: 'Flour, sugar, cocoa powder, butter, eggs, milk, vanilla extract, baking powder, salt.',
    nutrition: 'Calories: 380, Fat: 20g, Carbs: 48g, Protein: 5g',
    dietaryTags: ['Nut-Free']
  },
  {
    name: 'Double Fudge Brownie',
    category: 'Brownies & Bars',
    image: 'https://images.unsplash.com/photo-1461008312963-30bb3fdb6b7c?auto=format&fit=crop&q=80&w=800',
    alt: 'Rich chocolate brownies stacked high',
    price: 5.00,
    stockQuantity: 25,
    description: 'A dense, fudgy brownie packed with chocolate chips. Guaranteed to satisfy your sweet tooth.',
    ingredients: 'Sugar, butter, cocoa powder, flour, eggs, chocolate chips, vanilla extract, salt.',
    nutrition: 'Calories: 420, Fat: 22g, Carbs: 55g, Protein: 6g',
    dietaryTags: ['Nut-Free']
  },
  {
    name: 'Blondie Bar',
    category: 'Brownies & Bars',
    image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&q=80&w=800',
    alt: 'Decadent dark chocolate brownies and bars',
    price: 4.50,
    stockQuantity: 40,
    description: 'A chewy, buttery blonde brownie loaded with chocolate chips and walnuts.',
    ingredients: 'Brown sugar, butter, flour, eggs, chocolate chips, walnuts, vanilla extract, baking powder, salt.',
    nutrition: 'Calories: 400, Fat: 21g, Carbs: 50g, Protein: 5g',
    dietaryTags: []
  },
  {
    name: 'Confetti Birthday Cake',
    category: 'Cakes',
    image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=800',
    alt: 'Birthday cake with colorful sprinkles',
    price: 45.00,
    stockQuantity: 10,
    description: 'Our classic vanilla cake baked with colorful confetti sprinkles, topped with vanilla buttercream and more sprinkles.',
    ingredients: 'Flour, sugar, butter, eggs, milk, vanilla extract, baking powder, salt, rainbow sprinkles.',
    nutrition: 'Calories: 450, Fat: 22g, Carbs: 60g, Protein: 5g',
    dietaryTags: ['Nut-Free']
  },
  {
    name: 'Classic Vanilla Cake',
    category: 'Cakes',
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=800',
    alt: 'Large layer cake with elegant icing',
    price: 40.00,
    stockQuantity: 15,
    description: 'Three layers of buttery vanilla cake filled and frosted with our signature vanilla buttercream.',
    ingredients: 'Flour, sugar, butter, eggs, milk, vanilla extract, baking powder, salt.',
    nutrition: 'Calories: 430, Fat: 20g, Carbs: 58g, Protein: 5g',
    dietaryTags: ['Nut-Free']
  },
  {
    name: 'Baker\'s Choice Sampler',
    category: 'Sampler Packs',
    image: 'https://images.unsplash.com/photo-1586788680434-30d324671ff6?auto=format&fit=crop&q=80&w=800',
    alt: 'Assorted dessert sampler pack box',
    price: 25.00,
    stockQuantity: 20,
    description: 'A curated selection of our most popular treats, including cupcakes, brownies, and cookies.',
    ingredients: 'Varies by assortment. Contains wheat, milk, eggs, soy. May contain tree nuts.',
    nutrition: 'Varies by assortment.',
    dietaryTags: []
  },
  {
    name: 'Classic Banana Pudding',
    category: 'Banana Pudding',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800',
    alt: 'Signature banana pudding in a cup',
    price: 6.50,
    stockQuantity: 100,
    description: 'Our world-famous banana pudding made with layers of vanilla wafers, fresh bananas, and creamy vanilla pudding.',
    ingredients: 'Vanilla pudding, sweetened condensed milk, water, heavy cream, vanilla wafers, fresh bananas.',
    nutrition: 'Calories: 330, Fat: 16g, Carbs: 42g, Protein: 4g',
    dietaryTags: ['Nut-Free']
  }
];

import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  User as UserIcon, 
  Heart, 
  ChevronRight, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Star, 
  Check, 
  Truck, 
  Package, 
  Clock, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin,
  MapPin,
  Phone,
  Mail,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  Twitter as TwitterIcon,
  Youtube as YoutubeIcon,
  AlertCircle,
  Cake,
  FileText,
  ShieldCheck,
  ShoppingCart,
  ChevronLeft,
  SearchX,
  ArrowUp,
  CheckCircle,
  Sun,
  Moon,
  LogOut,
  Loader2
} from 'lucide-react';
import { db, auth } from './firebase';
import { collection, onSnapshot, doc, setDoc, getDocs, deleteDoc, getDoc, serverTimestamp, runTransaction } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { AuthModal } from './components/AuthModal';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<any, any> {
  state: any;
  props: any;
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Firebase Error (${parsed.operationType}): ${parsed.error}`;
          } else {
            errorMessage = this.state.error.message;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary text-slate-900 px-6 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function MainApp() {
  const { addToast } = useToast();
  const { theme, toggleTheme, isDark } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'orders' | 'favorites' | 'admin' | 'account'>('home');
  const currentViewRef = React.useRef(currentView);
  
  React.useEffect(() => {
    currentViewRef.current = currentView;
  }, [currentView]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [selectedDietaryTags, setSelectedDietaryTags] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<Record<string, { product: Product, quantity: number }>>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [currency, setCurrency] = useState<'LKR' | 'USD'>('LKR');
  const exchangeRate = 300; // 1 USD = 300 LKR

  const formatPrice = (price: number) => {
    if (currency === 'USD') {
      return `$${price.toFixed(2)}`;
    }
    return `Rs. ${(price * exchangeRate).toLocaleString()}`;
  };

  const treats = [
    {
      title: 'Best Sellers',
      description: 'Our most loved treats, perfect for any first-timer or longtime fan.',
      image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800',
      alt: 'Topseller cupcakes variety box'
    },
    {
      title: 'Birthday',
      description: 'Make their special day even sweeter with our celebratory cakes.',
      image: 'https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=800',
      alt: 'Birthday cake with colorful sprinkles'
    },
    {
      title: `Gifts Under ${formatPrice(50)}`,
      description: 'Small price, big delight. Perfect gestures for any budget.',
      image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&q=80&w=800',
      alt: 'Elegant gift box with ribbon'
    },
    {
      title: 'Lotsa Chocolate!',
      description: 'For the true cocoa enthusiasts. Rich, dark, and fudgy.',
      image: 'https://images.unsplash.com/photo-1461008312963-30bb3fdb6b7c?auto=format&fit=crop&q=80&w=800',
      alt: 'Decadent dark chocolate brownies and bars'
    }
  ];

  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [addedProduct, setAddedProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Ensure user document exists in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const initialRole = currentUser.email === 'sukithabandara13@gmail.com' ? 'admin' : 'user';
            await setDoc(userRef, {
              role: initialRole,
              email: currentUser.email || '',
              displayName: currentUser.displayName || '',
              phoneNumber: '',
              addresses: []
            });
            setIsAdminUser(initialRole === 'admin');
          } else {
            const userData = userSnap.data();
            setIsAdminUser(userData?.role === 'admin');
          }
        } catch (error) {
          console.error("Error ensuring user document exists:", error);
          handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      } else {
        setIsAdminUser(false);
        if (['account', 'admin', 'orders', 'favorites'].includes(currentViewRef.current)) {
          setCurrentView('home');
        }
      }
      setIsAuthReady(true);
    });

    const productsRef = collection(db, 'products');
    
    // Seed initial data if empty
    const seedData = async () => {
      if (!auth.currentUser || auth.currentUser.email !== 'sukithabandara13@gmail.com') return;
      try {
        const snapshot = await getDocs(productsRef);
        if (snapshot.empty) {
          console.log('Seeding initial products...');
          for (const product of INITIAL_PRODUCTS) {
            // Use product name as document ID (sanitized) or auto-generate
            const docRef = doc(collection(db, 'products'));
            await setDoc(docRef, product);
          }
        }
      } catch (error) {
        console.error('Failed to seed data', error);
        handleFirestoreError(error, OperationType.WRITE, 'products');
      }
    };

    // Listen for real-time updates
    const unsubscribeProducts = onSnapshot(productsRef, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setIsLoading(false);
      
      // Try to seed data after we know it's empty, if we have a user
      if (snapshot.empty && auth.currentUser) {
        seedData();
      }
    }, (error) => {
      setIsLoading(false);
      handleFirestoreError(error, OperationType.GET, 'products');
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProducts();
    };
  }, [user]); // Re-run effect when user changes to trigger seeding if needed

  React.useEffect(() => {
    if (!user) {
      setFavorites({});
      setOrders([]);
      setCurrentView('home');
      setIsAdminUser(false);
      return;
    }

    // Check if user is admin
    if (user.email === 'sukithabandara13@gmail.com') {
      setIsAdminUser(true);
    } else {
      // Also check the users collection for role
      getDoc(doc(db, 'users', user.uid)).then(docSnap => {
        if (docSnap.exists() && docSnap.data().role === 'admin') {
          setIsAdminUser(true);
        } else {
          setIsAdminUser(false);
        }
      }).catch(err => {
        setIsAdminUser(false);
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      });
    }

    const favsRef = collection(db, 'users', user.uid, 'favorites');
    const unsubscribeFavs = onSnapshot(favsRef, (snapshot) => {
      const newFavs: Record<string, boolean> = {};
      snapshot.docs.forEach(doc => {
        newFavs[doc.data().productId] = true;
      });
      setFavorites(newFavs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/favorites`);
    });

    const ordersRef = collection(db, 'users', user.uid, 'orders');
    const unsubscribeOrders = onSnapshot(ordersRef, (snapshot) => {
      const newOrders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Sort orders by createdAt descending
      newOrders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(newOrders);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/orders`);
    });

    return () => {
      unsubscribeFavs();
      unsubscribeOrders();
    };
  }, [user]);

  const toggleFavorite = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      handleLogin();
      return;
    }

    const favRef = doc(db, 'users', user.uid, 'favorites', product.name);
    try {
      if (favorites[product.name]) {
        await deleteDoc(favRef);
        addToast(`${product.name} removed from favorites`, 'info');
      } else {
        await setDoc(favRef, {
          productId: product.name,
          addedAt: serverTimestamp()
        });
        addToast(`${product.name} added to favorites!`, 'success');
      }
    } catch (err) {
      handleFirestoreError(err, favorites[product.name] ? OperationType.DELETE : OperationType.WRITE, `users/${user.uid}/favorites/${product.name}`);
    }
  };

  const cartCount: number = (Object.values(cartItems) as any[]).reduce((sum: number, item: any) => sum + item.quantity, 0);

  const categories = ['All', 'Cupcakes', 'Brownies & Bars', 'Cakes', 'Sampler Packs', 'Banana Pudding'];

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesDietary = selectedDietaryTags.length === 0 || 
                          selectedDietaryTags.every(tag => product.dietaryTags?.includes(tag));
    
    return matchesCategory && matchesSearch && matchesPrice && matchesDietary;
  });

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const existing = cartItems[product.name];
    const currentQuantity = existing ? existing.quantity : 0;
    
    if (currentQuantity >= product.stockQuantity) {
      addToast(`Sorry, only ${product.stockQuantity} items available in stock.`, 'warning');
      return;
    }

    setCartItems(prev => {
      return {
        ...prev,
        [product.name]: {
          product,
          quantity: currentQuantity + 1
        }
      };
    });
    setAddedItems(prev => ({ ...prev, [product.name]: true }));
    setAddedProduct(product);
    addToast(`${product.name} added to cart!`, 'success');
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [product.name]: false }));
    }, 2000);
  };

  const updateCartQuantity = (productName: string, delta: number) => {
    setCartItems(prev => {
      const existing = prev[productName];
      if (!existing) return prev;
      
      const newQuantity = existing.quantity + delta;
      
      if (delta > 0 && newQuantity > existing.product.stockQuantity) {
        alert(`Sorry, only ${existing.product.stockQuantity} items available in stock.`);
        return prev;
      }

      if (newQuantity <= 0) {
        const { [productName]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [productName]: { ...existing, quantity: newQuantity }
      };
    });
  };

  const removeFromCart = (productName: string) => {
    setCartItems(prev => {
      const { [productName]: _, ...rest } = prev;
      return rest;
    });
    setAddedItems(prev => ({ ...prev, [productName]: false }));
  };

  const handlePlaceOrder = async (email: string, shippingInfo: ShippingInfo) => {
    const items = Object.values(cartItems) as { product: Product, quantity: number }[];
    
    if (!user) {
      handleLogin();
      throw new Error("User not logged in");
    }

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Verify stock for all items
        const productDocs = await Promise.all(
          items.map(item => transaction.get(doc(db, 'products', item.product.id!)))
        );

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const productDoc = productDocs[i];
          if (!productDoc.exists()) throw new Error(`Product ${item.product.name} not found`);
          
          const currentStock = productDoc.data().stockQuantity;
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for ${item.product.name}. Only ${currentStock} left.`);
          }
        }

        // 2. Decrement stock
        items.forEach((item, i) => {
          const productDoc = productDocs[i];
          transaction.update(doc(db, 'products', item.product.id!), {
            stockQuantity: productDoc.data().stockQuantity - item.quantity
          });
        });

        // 3. Create order
        const orderItems = items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity
        }));
        const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        
        const orderRef = doc(collection(db, 'users', user.uid, 'orders'));
        const orderData = {
          items: orderItems,
          total,
          status: 'processing',
          createdAt: serverTimestamp(),
          customerEmail: email,
          shippingInfo,
          userId: user.uid
        };
        transaction.set(orderRef, orderData);
        
        // Store for invoice display
        setSelectedInvoiceOrder({
          id: orderRef.id,
          ...orderData,
          createdAt: new Date() // Temporary for immediate display
        });
      });

      // Send confirmation email via backend
      const orderItems = items.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));
      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const orderDetails = { items: orderItems, total, currency };

      try {
        await fetch('/api/send-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, orderDetails })
        });
      } catch (err) {
        console.error("Failed to send confirmation email:", err);
      }

      setIsCheckoutOpen(false);
      setIsOrderSuccess(true);
      setCartItems({});
      setAddedItems({});
    } catch (err) {
      console.error("Order placement failed:", err);
      if (err instanceof Error && err.message.includes('stock')) {
        alert(err.message);
      } else {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}/orders`);
      }
      throw err;
    }
  };

  const handleReorder = (items: any[]) => {
    const newCartItems: Record<string, { product: Product, quantity: number }> = {};
    items.forEach(item => {
      const product = products.find(p => p.name === item.name);
      if (product) {
        newCartItems[item.name] = { product, quantity: item.quantity };
      }
    });
    setCartItems(prev => ({ ...prev, ...newCartItems }));
    setIsCartOpen(true);
    setCurrentView('home');
  };

  const handleLogin = () => {
    setIsAuthModalOpen(true);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const scrollToSection = (id: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        if (id === 'top') {
          window.scrollTo({top: 0, behavior: 'smooth'});
          return;
        }
        const el = document.getElementById(id);
        if (el) {
          const yOffset = -100; 
          const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({top: y, behavior: 'smooth'});
        }
      }, 100);
    } else {
      if (id === 'top') {
        window.scrollTo({top: 0, behavior: 'smooth'});
      } else {
        const el = document.getElementById(id);
        if (el) {
          const yOffset = -100; 
          const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
          window.scrollTo({top: y, behavior: 'smooth'});
        }
      }
    }
    setIsMobileMenuOpen(false);
  };

  const favoriteProducts = products.filter(p => favorites[p.name]);

  const SkeletonCard = () => (
    <div className="animate-pulse flex flex-col">
      <div className="aspect-square rounded-xl bg-slate-200 dark:bg-slate-800 mb-4"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mx-auto mb-2"></div>
      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mx-auto mb-2"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto"></div>
    </div>
  );

  const ProductCard = React.memo(({ product, index }: { product: Product, index: number, key?: any }) => (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      key={index} 
      className="group cursor-pointer transition-all duration-300 hover:-translate-y-2 flex flex-col relative"
      onClick={() => setViewingProduct(product)}
    >
      <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-slate-100 shadow-sm group-hover:shadow-xl transition-all duration-300 relative">
        <img 
          className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${product.stockQuantity <= 0 ? 'grayscale opacity-70' : ''}`} 
          alt={product.alt} 
          src={product.image} 
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== FALLBACK_IMAGE) {
              target.src = FALLBACK_IMAGE;
            }
          }}
        />
        {product.stockQuantity <= 0 && (
          <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
            Out of Stock
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden lg:flex items-center justify-center">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (product.stockQuantity > 0) handleAddToCart(product, e);
            }}
            disabled={product.stockQuantity <= 0}
            className={`px-6 py-2 rounded-full font-bold text-sm transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 ${
              product.stockQuantity <= 0
                ? 'bg-red-500 text-white cursor-not-allowed'
                : addedItems[product.name] 
                  ? 'bg-green-500 text-white scale-105' 
                  : 'bg-primary text-slate-900 hover:bg-white hover:text-primary'
            }`}
            aria-label={product.stockQuantity <= 0 ? `Out of stock` : `Add ${product.name} to cart`}
          >
            {product.stockQuantity <= 0 ? 'Out of Stock' : addedItems[product.name] ? 'Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
      <button 
        onClick={(e) => toggleFavorite(product, e)}
        className="absolute top-2 right-2 p-2 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:scale-110 transition-transform z-10"
        aria-label={`${favorites[product.name] ? 'Remove' : 'Add'} ${product.name} ${favorites[product.name] ? 'from' : 'to'} favorites`}
      >
        <Heart className={`w-5 h-5 ${favorites[product.name] ? 'text-red-500 fill-current' : 'text-slate-400'}`} aria-hidden="true" />
      </button>
      <p className="font-bold text-lg text-center transition-colors group-hover:text-primary">{product.name}</p>
      <p className="text-sm text-slate-500 text-center mb-1">{product.category}</p>
      <div className="flex justify-center gap-1 mb-2">
        {product.dietaryTags?.map(tag => (
          <span key={tag} className="text-[8px] font-bold px-1.5 py-0.5 bg-accent-maroon/10 text-accent-maroon rounded-full uppercase tracking-tighter">
            {tag.split('-')[0]}
          </span>
        ))}
      </div>
      <p className="font-bold text-primary text-center">{formatPrice(product.price)}</p>
      
      {/* Mobile Add to Cart Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          if (product.stockQuantity > 0) handleAddToCart(product, e);
        }}
        disabled={product.stockQuantity <= 0}
        className={`mt-3 w-full py-2 rounded-full font-bold text-sm transition-all duration-300 lg:hidden ${
          product.stockQuantity <= 0
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
            : addedItems[product.name] 
              ? 'bg-green-500 text-white' 
              : 'bg-primary text-slate-900 hover:bg-primary/90'
        }`}
        aria-label={product.stockQuantity <= 0 ? `Out of stock` : `Add ${product.name} to cart`}
      >
        {product.stockQuantity <= 0 ? 'Out of Stock' : addedItems[product.name] ? 'Added!' : 'Add to Cart'}
      </button>
    </motion.div>
  ));

  return (
    <AnimatePresence mode="wait">
      {isCheckoutOpen ? (
        <motion.div
          key="checkout"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-background-light dark:bg-background-dark"
        >
          <Checkout 
            cartItems={cartItems}
            onBack={() => setIsCheckoutOpen(false)}
            onPlaceOrder={handlePlaceOrder}
            formatPrice={formatPrice}
          />
        </motion.div>
      ) : (
        <motion.div
          key="main-app"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="relative flex min-h-screen w-full flex-col overflow-x-hidden"
        >
          <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[98%] sm:w-[95%] max-w-[1300px]">
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-700 shadow-lg rounded-full px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between">
              {/* Left Group: Logo */}
              <div className="flex items-center flex-1">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => scrollToSection('top')}
                >
                  <div className="relative">
                    <img 
                      src="https://res.cloudinary.com/dilixdvlj/image/upload/f_auto,q_auto/Pink_and_Cream_Modern_Cute_Cake_and_Bakery_Logo_el0ocr" 
                      alt="Magnolia Bakers Logo" 
                      className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-full border-2 border-primary/20 group-hover:border-primary/40 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white uppercase hidden md:block font-display">
                    Magnolia Bakers
                  </h1>
                </div>
              </div>

              {/* Center Group: Navigation */}
              <nav className="hidden lg:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-full border border-slate-200/50 dark:border-slate-700/50 mx-4">
                <button onClick={() => scrollToSection('order')} className="text-sm font-bold hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm px-4 py-1.5 rounded-full transition-all">Order</button>
                <button onClick={() => scrollToSection('products')} className="text-sm font-bold hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm px-4 py-1.5 rounded-full transition-all">Products</button>
                <button onClick={() => scrollToSection('locations')} className="text-sm font-bold hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm px-4 py-1.5 rounded-full transition-all">Locations</button>
                <button onClick={() => scrollToSection('about')} className="text-sm font-bold hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm px-4 py-1.5 rounded-full transition-all">About Us</button>
              </nav>

              {/* Right Group: Actions */}
              <div className="flex items-center justify-end gap-2 sm:gap-3 lg:gap-4 flex-1">
                {/* Currency Toggle */}
                <button
                  onClick={() => setCurrency(currency === 'LKR' ? 'USD' : 'LKR')}
                  className="px-2 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-primary/20 transition-all border border-slate-200/50 dark:border-slate-700/50 flex items-center shrink-0"
                  aria-label={`Switch to ${currency === 'LKR' ? 'USD' : 'LKR'}`}
                >
                  <span className="sm:hidden">{currency}</span>
                  <div className="hidden sm:flex items-center gap-1.5">
                    <span className={currency === 'LKR' ? 'text-primary' : ''}>LKR</span>
                    <span className="text-slate-300 dark:text-slate-600">|</span>
                    <span className={currency === 'USD' ? 'text-primary' : ''}>USD</span>
                  </div>
                </button>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  title={isDark ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-gray-600" />
                  )}
                </button>

                <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1.5 border border-slate-200/50 dark:border-slate-700/50">
                  <Search className="w-4 h-4 text-slate-500 mr-2" />
                  <input className="bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-24 lg:w-32 placeholder:text-slate-500" placeholder="Search" type="text" />
                </div>
                <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                  {!isAuthReady ? (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                  ) : user ? (
                    <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                      <button 
                        onClick={() => setCurrentView('favorites')}
                        className={`p-2 rounded-full transition-all duration-200 ${currentView === 'favorites' ? 'bg-primary text-slate-900 shadow-md scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        title="Favorites"
                        aria-label="View Favorites"
                      >
                        <Heart className="w-5 h-5" aria-hidden="true" />
                      </button>
                      <button 
                        onClick={() => setCurrentView('orders')}
                        className={`p-2 rounded-full transition-all duration-200 ${currentView === 'orders' ? 'bg-primary text-slate-900 shadow-md scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        title="Order History"
                        aria-label="View Order History"
                      >
                        <FileText className="w-5 h-5" aria-hidden="true" />
                      </button>
                      {isAdminUser && (
                        <button 
                          onClick={() => setCurrentView('admin')}
                          className={`p-2 rounded-full transition-all duration-200 ${currentView === 'admin' ? 'bg-primary text-slate-900 shadow-md scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                          title="Admin Dashboard"
                          aria-label="View Admin Dashboard"
                        >
                          <ShieldCheck className="w-5 h-5" aria-hidden="true" />
                        </button>
                      )}
                      <button 
                        onClick={() => setCurrentView('account')}
                        className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 overflow-hidden border-2 ${currentView === 'account' ? 'bg-primary border-primary text-slate-900 shadow-md scale-110' : 'hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent text-slate-600 dark:text-slate-400'}`}
                        title="My Account"
                        aria-label="View My Account"
                      >
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt="User" 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                        ) : null}
                        <UserIcon className={`w-5 h-5 ${user.photoURL ? 'hidden' : ''}`} aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={handleLogin}
                      className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 text-slate-600 dark:text-slate-400"
                      title="Log in"
                      aria-label="Log in"
                    >
                      <UserIcon className="w-6 h-6" aria-hidden="true" />
                    </button>
                  )}
                  <button 
                    onClick={() => setIsCartOpen(true)}
                    className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 relative text-slate-600 dark:text-slate-400"
                    aria-label={`Open cart, ${cartCount} items`}
                  >
                    <ShoppingCart className="w-5 h-5" aria-hidden="true" />
                    {cartCount > 0 && (
                      <span className="absolute top-1 right-1 bg-primary text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full text-slate-900 shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors lg:hidden"
                    aria-label="Open mobile menu"
                  >
                    <Menu className="w-5 h-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
                />
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                  className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-background-dark shadow-2xl z-50 flex flex-col lg:hidden"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="mobile-menu-title"
                >
                  <div className="p-4 flex justify-between items-center border-b border-soft-mint dark:border-slate-800">
                    <span id="mobile-menu-title" className="font-black tracking-tighter text-slate-900 dark:text-white uppercase">Menu</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-soft-mint dark:hover:bg-slate-800 rounded-full transition-colors" aria-label="Close mobile menu">
                      <X className="w-6 h-6" aria-hidden="true" />
                    </button>
                  </div>
                  <nav className="flex flex-col p-4 gap-4">
                    <button onClick={() => scrollToSection('order')} className="text-lg font-semibold hover:text-primary transition-colors text-left">Order</button>
                    <button onClick={() => scrollToSection('products')} className="text-lg font-semibold hover:text-primary transition-colors text-left">Products</button>
                    <button onClick={() => scrollToSection('locations')} className="text-lg font-semibold hover:text-primary transition-colors text-left">Hours & Locations</button>
                    <button onClick={() => scrollToSection('about')} className="text-lg font-semibold hover:text-primary transition-colors text-left">About Us</button>
                    {user ? (
                      <>
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                        <button 
                          onClick={() => {
                            setCurrentView('account');
                            setIsMobileMenuOpen(false);
                          }} 
                          className="text-lg font-semibold hover:text-primary transition-colors text-left flex items-center gap-2"
                        >
                          <UserIcon className="w-5 h-5" />
                          My Account
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentView('favorites');
                            setIsMobileMenuOpen(false);
                          }} 
                          className="text-lg font-semibold hover:text-primary transition-colors text-left flex items-center gap-2"
                        >
                          <Heart className="w-5 h-5" />
                          My Favorites
                        </button>
                        <button 
                          onClick={() => {
                            setCurrentView('orders');
                            setIsMobileMenuOpen(false);
                          }} 
                          className="text-lg font-semibold hover:text-primary transition-colors text-left flex items-center gap-2"
                        >
                          <FileText className="w-5 h-5" />
                          Order History
                        </button>
                        {isAdminUser && (
                          <button 
                            onClick={() => {
                              setCurrentView('admin');
                              setIsMobileMenuOpen(false);
                            }} 
                            className="text-lg font-semibold hover:text-primary transition-colors text-left flex items-center gap-2"
                          >
                            <ShieldCheck className="w-5 h-5" />
                            Admin Dashboard
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
                        <button 
                          onClick={() => {
                            handleLogin();
                            setIsMobileMenuOpen(false);
                          }} 
                          className="text-lg font-semibold hover:text-primary transition-colors text-left flex items-center gap-2"
                        >
                          <UserIcon className="w-5 h-5" />
                          Log In
                        </button>
                      </>
                    )}
                  </nav>
                </motion.div>
              </>
            )}
          </AnimatePresence>

      <main className="flex-1 relative">
        <AnimatePresence mode="wait">
        {viewingProduct ? (
          <motion.div
            key="product-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ProductDetails 
              product={viewingProduct} 
              user={user}
              onBack={() => setViewingProduct(null)} 
              onAddToCart={handleAddToCart} 
              isAdded={addedItems[viewingProduct.name] || false}
              formatPrice={formatPrice}
            />
          </motion.div>
        ) : currentView === 'admin' && isAdminUser ? (
          <motion.div
            key="admin"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AdminDashboard onBack={() => setCurrentView('home')} formatPrice={formatPrice} />
          </motion.div>
        ) : currentView === 'account' && user ? (
          <motion.div
            key="account"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <AccountPage 
              user={user} 
              onBack={() => setCurrentView('home')} 
              onReorder={handleReorder}
              products={products}
              onViewInvoice={setSelectedInvoiceOrder}
              formatPrice={formatPrice}
            />
          </motion.div>
        ) : currentView === 'favorites' ? (
          <motion.div
            key="favorites"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="py-16 pt-32 px-6 lg:px-20 max-w-[1440px] mx-auto min-h-[60vh]"
          >
            <h3 className="text-3xl font-bold mb-8">My Favorites</h3>
            {favoriteProducts.length === 0 ? (
              <div className="text-center py-20 bg-soft-mint/20 rounded-3xl">
                <Heart className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-xl text-slate-500 font-medium">You haven't saved any favorites yet.</p>
                <button onClick={() => setCurrentView('home')} className="mt-6 bg-primary text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors">
                  Browse Products
                </button>
              </div>
            ) : (
              <motion.div 
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
              >
                {favoriteProducts.map((product, index) => (
                  <ProductCard key={index} product={product} index={index} />
                ))}
              </motion.div>
            )}
          </motion.div>
        ) : currentView === 'orders' ? (
          <motion.div
            key="orders"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="py-16 pt-32 px-6 lg:px-20 max-w-[1440px] mx-auto min-h-[60vh]"
          >
            <h3 className="text-3xl font-bold mb-8">Order History</h3>
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-soft-mint/20 rounded-3xl">
                <FileText className="w-16 h-16 text-slate-300 mb-4" />
                <p className="text-xl text-slate-500 font-medium">You haven't placed any orders yet.</p>
                <button onClick={() => setCurrentView('home')} className="mt-6 bg-primary text-slate-900 px-6 py-2 rounded-full font-bold hover:bg-primary/90 transition-colors">
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6 max-w-4xl mx-auto">
                {orders.map(order => (
                  <div key={order.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-soft-mint dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-soft-mint dark:border-slate-700">
                      <div>
                        <p className="text-sm text-slate-500">Order Placed</p>
                        <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Total</p>
                        <p className="font-bold text-primary">{formatPrice(order.total)}</p>
                      </div>
                    </div>
                    <div className="space-y-3 mb-6">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center">
                          <p className="font-medium">{item.quantity}x {item.name}</p>
                          <p className="text-slate-600 dark:text-slate-400">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-soft-mint dark:border-slate-700 flex justify-end">
                      <button 
                        onClick={() => setTrackingOrder(order)}
                        className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-xl font-bold transition-colors"
                        aria-label={`Track order ${order.id.slice(0, 8)}`}
                      >
                        <Truck className="w-4 h-4" aria-hidden="true" />
                        Track Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <section className="relative h-[600px] w-full overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1920')" }}>
                <div className="absolute inset-0 bg-black/30"></div>
              </div>
          <div className="relative h-full max-w-[1440px] mx-auto flex flex-col justify-center items-start px-6 lg:px-20 text-white">
            <h2 className="text-5xl lg:text-7xl font-black mb-6 leading-tight drop-shadow-lg">Cupcake Decorating <br /> Workshops</h2>
            <p className="text-lg lg:text-xl mb-8 max-w-xl font-medium drop-shadow-md">Join us for a hands-on experience in the art of cupcake decorating. Learn the signature swirl!</p>
            <div className="flex gap-4">
              <button className="bg-primary hover:bg-primary/90 text-slate-900 font-bold px-8 py-4 rounded-xl text-lg transition-transform active:scale-95">GET TICKETS</button>
            </div>
            <div className="absolute bottom-10 right-20 flex gap-4">
              <button className="bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-sm" aria-label="Previous slide"><ChevronLeft className="w-6 h-6" aria-hidden="true" /></button>
              <button className="bg-white/20 hover:bg-white/40 p-3 rounded-full backdrop-blur-sm" aria-label="Next slide"><ChevronRight className="w-6 h-6" aria-hidden="true" /></button>
            </div>
          </div>
        </section>

        <section id="products" className="py-16 px-6 lg:px-20 max-w-[1440px] mx-auto">
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-3xl font-bold">Our Products</h3>
            <a className="text-primary font-bold border-b-2 border-primary pb-1" href="#">VIEW MORE</a>
          </div>
          
          <FilterBar 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            selectedDietaryTags={selectedDietaryTags}
            setSelectedDietaryTags={setSelectedDietaryTags}
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            formatPrice={formatPrice}
          />

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
                }
              }}
            >
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <ProductCard key={index} product={product} index={index} />
                ))
              ) : (
                <div className="col-span-full py-20 text-center">
                  <SearchX className="w-16 h-16 text-slate-300 mb-4" />
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No treats found</h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-6">Try adjusting your filters or search terms</p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setPriceRange([0, 100]);
                      setSelectedDietaryTags([]);
                      setSelectedCategory('All');
                    }}
                    className="px-6 py-2 bg-primary text-slate-900 font-bold rounded-full hover:bg-primary/90 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </section>

        <section className="py-16 bg-soft-mint/30 dark:bg-background-dark/50">
          <div className="px-6 lg:px-20 max-w-[1440px] mx-auto">
            <div className="flex justify-between items-end mb-10">
              <h3 className="text-3xl font-bold">Treats for any Occasion</h3>
              <a className="text-primary font-bold border-b-2 border-primary pb-1" href="#">VIEW MORE</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {treats.map((treat, index) => (
                <div key={index} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="h-48 rounded-xl bg-primary/10 flex items-center justify-center mb-6 overflow-hidden">
                    <img 
                      className="w-full h-full object-cover" 
                      alt={treat.alt} 
                      src={treat.image} 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== FALLBACK_IMAGE) {
                          target.src = FALLBACK_IMAGE;
                        }
                      }}
                    />
                  </div>
                  <h4 className="text-xl font-bold mb-2">{treat.title}</h4>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">{treat.description}</p>
                  <button className="text-primary font-bold flex items-center gap-2">Shop Now <ArrowRight className="w-4 h-4" aria-hidden="true" /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="order" className="py-24 px-6 lg:px-20 max-w-[1440px] mx-auto text-center">
          <h2 className="text-5xl lg:text-7xl font-display text-slate-900 dark:text-white mb-6">Delivery and Pick Up Options</h2>
          <p className="max-w-3xl mx-auto text-slate-600 dark:text-slate-300 text-lg mb-6 leading-relaxed">
            We make it easy for you to get Magnolia Bakers' best, wherever you are. Order now for nationwide shipping, place an order to pickup at your local shop, or get in touch with our team to arrange custom catering for your next event.
          </p>
          <div className="flex justify-end mb-12">
            <a href="#" className="text-sm font-bold tracking-[0.2em] border-b-2 border-slate-900 dark:border-white pb-1 hover:opacity-70 transition-opacity">LEARN MORE</a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Card 1: Nationwide Shipping */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div 
                className="w-full aspect-[4/3] relative flex items-center justify-center mb-6 overflow-hidden rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                style={{
                  backgroundColor: '#fff',
                  backgroundImage: 'linear-gradient(45deg, #FEF9C3 25%, transparent 25%, transparent 75%, #FEF9C3 75%, #FEF9C3), linear-gradient(45deg, #FEF9C3 25%, #fff 25%, #fff 75%, #FEF9C3 75%, #FEF9C3)',
                  backgroundSize: '40px 40px',
                  backgroundPosition: '0 0, 20px 20px'
                }}
              >
                <div 
                  className="w-[70%] h-[85%] bg-white shadow-xl flex items-center justify-center p-1"
                  style={{
                    maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 0 C 54 0 57 3 60 3 S 66 0 70 0 S 76 3 80 3 S 86 0 90 0 S 94 3 97 6 S 100 14 100 20 S 97 24 97 30 S 100 34 100 40 S 97 44 97 50 S 100 54 100 60 S 97 64 97 70 S 100 74 100 80 S 97 86 97 90 S 94 97 90 100 S 86 97 80 97 S 74 100 70 100 S 64 97 60 97 S 54 100 50 100 S 46 97 40 97 S 34 100 30 100 S 24 97 20 97 S 14 100 10 100 S 3 94 0 90 S 3 86 3 80 S 0 74 0 70 S 3 64 3 60 S 0 54 0 50 S 3 46 3 40 S 0 34 0 30 S 3 24 3 20 S 0 14 0 10 S 3 3 10 0 S 14 3 20 3 S 26 0 30 0 S 36 3 40 3 S 46 0 50 0 Z\' fill=\'black\'/%3E%3C/svg%3E")',
                    maskSize: '100% 100%',
                    WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 0 C 54 0 57 3 60 3 S 66 0 70 0 S 76 3 80 3 S 86 0 90 0 S 94 3 97 6 S 100 14 100 20 S 97 24 97 30 S 100 34 100 40 S 97 44 97 50 S 100 54 100 60 S 97 64 97 70 S 100 74 100 80 S 97 86 97 90 S 94 97 90 100 S 86 97 80 97 S 74 100 70 100 S 64 97 60 97 S 54 100 50 100 S 46 97 40 97 S 34 100 30 100 S 24 97 20 97 S 14 100 10 100 S 3 94 0 90 S 3 86 3 80 S 0 74 0 70 S 3 64 3 60 S 0 54 0 50 S 3 46 3 40 S 0 34 0 30 S 3 24 3 20 S 0 14 0 10 S 3 3 10 0 S 14 3 20 3 S 26 0 30 0 S 36 3 40 3 S 46 0 50 0 Z\' fill=\'black\'/%3E%3C/svg%3E")',
                    WebkitMaskSize: '100% 100%'
                  }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1587006352864-2cd3f8524308?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-full object-cover" 
                    alt="Nationwide Shipping Box" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== FALLBACK_IMAGE) {
                        target.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">Nationwide Shipping</h3>
            </div>

            {/* Card 2: Advance Orders for Local Pick Up */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div 
                className="w-full aspect-[4/3] relative flex items-center justify-center mb-6 overflow-hidden rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                style={{
                  backgroundColor: '#fff',
                  backgroundImage: 'linear-gradient(45deg, #E0F2FE 25%, transparent 25%, transparent 75%, #E0F2FE 75%, #E0F2FE), linear-gradient(45deg, #E0F2FE 25%, #fff 25%, #fff 75%, #E0F2FE 75%, #E0F2FE)',
                  backgroundSize: '40px 40px',
                  backgroundPosition: '0 0, 20px 20px'
                }}
              >
                <div 
                  className="w-[70%] h-[85%] bg-white shadow-xl flex items-center justify-center p-1"
                  style={{
                    maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 0 C 54 0 57 3 60 3 S 66 0 70 0 S 76 3 80 3 S 86 0 90 0 S 94 3 97 6 S 100 14 100 20 S 97 24 97 30 S 100 34 100 40 S 97 44 97 50 S 100 54 100 60 S 97 64 97 70 S 100 74 100 80 S 97 86 97 90 S 94 97 90 100 S 86 97 80 97 S 74 100 70 100 S 64 97 60 97 S 54 100 50 100 S 46 97 40 97 S 34 100 30 100 S 24 97 20 97 S 14 100 10 100 S 3 94 0 90 S 3 86 3 80 S 0 74 0 70 S 3 64 3 60 S 0 54 0 50 S 3 46 3 40 S 0 34 0 30 S 3 24 3 20 S 0 14 0 10 S 3 3 10 0 S 14 3 20 3 S 26 0 30 0 S 36 3 40 3 S 46 0 50 0 Z\' fill=\'black\'/%3E%3C/svg%3E")',
                    maskSize: '100% 100%',
                    WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 0 C 54 0 57 3 60 3 S 66 0 70 0 S 76 3 80 3 S 86 0 90 0 S 94 3 97 6 S 100 14 100 20 S 97 24 97 30 S 100 34 100 40 S 97 44 97 50 S 100 54 100 60 S 97 64 97 70 S 100 74 100 80 S 97 86 97 90 S 94 97 90 100 S 86 97 80 97 S 74 100 70 100 S 64 97 60 97 S 54 100 50 100 S 46 97 40 97 S 34 100 30 100 S 24 97 20 97 S 14 100 10 100 S 3 94 0 90 S 3 86 3 80 S 0 74 0 70 S 3 64 3 60 S 0 54 0 50 S 3 46 3 40 S 0 34 0 30 S 3 24 3 20 S 0 14 0 10 S 3 3 10 0 S 14 3 20 3 S 26 0 30 0 S 36 3 40 3 S 46 0 50 0 Z\' fill=\'black\'/%3E%3C/svg%3E")',
                    WebkitMaskSize: '100% 100%'
                  }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1578985543813-28c3a153221e?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-full object-cover" 
                    alt="Local Pick Up Cake" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== FALLBACK_IMAGE) {
                        target.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">Advance Orders for Local Pick Up</h3>
            </div>

            {/* Card 3: Catering & Events */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div 
                className="w-full aspect-[4/3] relative flex items-center justify-center mb-6 overflow-hidden rounded-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                style={{
                  backgroundColor: '#fff',
                  backgroundImage: 'linear-gradient(45deg, #F3E8FF 25%, transparent 25%, transparent 75%, #F3E8FF 75%, #F3E8FF), linear-gradient(45deg, #F3E8FF 25%, #fff 25%, #fff 75%, #F3E8FF 75%, #F3E8FF)',
                  backgroundSize: '40px 40px',
                  backgroundPosition: '0 0, 20px 20px'
                }}
              >
                <div 
                  className="w-[70%] h-[85%] bg-white shadow-xl flex items-center justify-center p-1"
                  style={{
                    maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 0 C 54 0 57 3 60 3 S 66 0 70 0 S 76 3 80 3 S 86 0 90 0 S 94 3 97 6 S 100 14 100 20 S 97 24 97 30 S 100 34 100 40 S 97 44 97 50 S 100 54 100 60 S 97 64 97 70 S 100 74 100 80 S 97 86 97 90 S 94 97 90 100 S 86 97 80 97 S 74 100 70 100 S 64 97 60 97 S 54 100 50 100 S 46 97 40 97 S 34 100 30 100 S 24 97 20 97 S 14 100 10 100 S 3 94 0 90 S 3 86 3 80 S 0 74 0 70 S 3 64 3 60 S 0 54 0 50 S 3 46 3 40 S 0 34 0 30 S 3 24 3 20 S 0 14 0 10 S 3 3 10 0 S 14 3 20 3 S 26 0 30 0 S 36 3 40 3 S 46 0 50 0 Z\' fill=\'black\'/%3E%3C/svg%3E")',
                    maskSize: '100% 100%',
                    WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M50 0 C 54 0 57 3 60 3 S 66 0 70 0 S 76 3 80 3 S 86 0 90 0 S 94 3 97 6 S 100 14 100 20 S 97 24 97 30 S 100 34 100 40 S 97 44 97 50 S 100 54 100 60 S 97 64 97 70 S 100 74 100 80 S 97 86 97 90 S 94 97 90 100 S 86 97 80 97 S 74 100 70 100 S 64 97 60 97 S 54 100 50 100 S 46 97 40 97 S 34 100 30 100 S 24 97 20 97 S 14 100 10 100 S 3 94 0 90 S 3 86 3 80 S 0 74 0 70 S 3 64 3 60 S 0 54 0 50 S 3 46 3 40 S 0 34 0 30 S 3 24 3 20 S 0 14 0 10 S 3 3 10 0 S 14 3 20 3 S 26 0 30 0 S 36 3 40 3 S 46 0 50 0 Z\' fill=\'black\'/%3E%3C/svg%3E")',
                    WebkitMaskSize: '100% 100%'
                  }}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&q=80&w=800" 
                    className="w-full h-full object-cover" 
                    alt="Catering Pink Cake" 
                    referrerPolicy="no-referrer" 
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (target.src !== FALLBACK_IMAGE) {
                        target.src = FALLBACK_IMAGE;
                      }
                    }}
                  />
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">Catering & Events</h3>
            </div>
          </div>
        </section>

        <Testimonials />

        <section className="flex flex-col md:flex-row min-h-[500px] bg-[#FFD1D6] dark:bg-[#4A222A]">
          {/* Left Side */}
          <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center p-12 lg:p-24">
            <h2 className="text-5xl lg:text-6xl font-display text-[#5C2A35] dark:text-[#FFD1D6] mb-6 leading-tight">
              Catering, Gifting &<br/>Events
            </h2>
            <p className="text-[#5C2A35] dark:text-[#FFD1D6] text-lg max-w-md mb-10 leading-relaxed font-medium">
              Our catering, gifting and events team is ready to fill your event or celebration with a custom selection of Magnolia Bakers' best creations. No occasion is too large—or too small!
            </p>
            <button className="bg-[#5C2A35] hover:bg-[#4A222A] dark:bg-[#FFD1D6] dark:hover:bg-white dark:text-[#5C2A35] text-white font-bold tracking-wider px-10 py-4 rounded-full transition-colors">
              GET STARTED
            </button>
          </div>
          
          {/* Right Side */}
          <div 
            className="w-full md:w-1/2 relative flex items-center justify-center p-12 overflow-hidden"
            style={{ backgroundColor: '#FFD1D6' }}
          >
            {/* Wavy stripes background */}
            <div 
              className="absolute inset-0 opacity-80 dark:opacity-40"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='200' viewBox='0 0 100 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20,0 C25,30 15,70 20,100 C25,130 15,170 20,200 L60,200 C55,170 65,130 60,100 C55,70 65,30 60,0 Z' fill='%238c525f'/%3E%3C/svg%3E")`,
                backgroundSize: '100px 200px',
                backgroundRepeat: 'repeat'
              }}
            />
            {/* Image with scalloped mask */}
            <div 
              className="relative z-10 w-[80%] max-w-[400px] aspect-[3/4] bg-white shadow-2xl flex items-center justify-center p-1"
              style={{
                maskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M50 0 C 54 0 57 3 60 3 S 66 0 70 0 S 76 3 80 3 S 86 0 90 0 S 94 3 97 6 S 100 14 100 20 S 97 24 97 30 S 100 34 100 40 S 97 44 97 50 S 100 54 100 60 S 97 64 97 70 S 100 74 100 80 S 97 86 97 90 S 94 97 90 100 S 86 97 80 97 S 74 100 70 100 S 64 97 60 97 S 54 100 50 100 S 46 97 40 97 S 34 100 30 100 S 24 97 20 97 S 14 100 10 100 S 3 94 0 90 S 3 86 3 80 S 0 74 0 70 S 3 64 3 60 S 0 54 0 50 S 3 46 3 40 S 0 34 0 30 S 3 24 3 20 S 0 14 0 10 S 3 3 10 0 S 14 3 20 3 S 26 0 30 0 S 36 3 40 3 S 46 0 50 0 Z\' fill=\'black\'/%3E%3C/svg%3E")',
                maskSize: '100% 100%',
                WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M50 0 C 54 0 57 3 60 3 S 66 0 70 0 S 76 3 80 3 S 86 0 90 0 S 94 3 97 6 S 100 14 100 20 S 97 24 97 30 S 100 34 100 40 S 97 44 97 50 S 100 54 100 60 S 97 64 97 70 S 100 74 100 80 S 97 86 97 90 S 94 97 90 100 S 86 97 80 97 S 74 100 70 100 S 64 97 60 97 S 54 100 50 100 S 46 97 40 97 S 34 100 30 100 S 24 97 20 97 S 14 100 10 100 S 3 94 0 90 S 3 86 3 80 S 0 74 0 70 S 3 64 3 60 S 0 54 0 50 S 3 46 3 40 S 0 34 0 30 S 3 24 3 20 S 0 14 0 10 S 3 3 10 0 S 14 3 20 3 S 26 0 30 0 S 36 3 40 3 S 46 0 50 0 Z\' fill=\'black\'/%3E%3C/svg%3E")',
                WebkitMaskSize: '100% 100%'
              }}
            >
              <img 
                src="https://images.unsplash.com/photo-1562777717-b6c220ce76d6?auto=format&fit=crop&q=80&w=800" 
                className="w-full h-full object-cover" 
                alt="Sprinkle Cake" 
                referrerPolicy="no-referrer" 
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== FALLBACK_IMAGE) {
                    target.src = FALLBACK_IMAGE;
                  }
                }}
              />
            </div>
          </div>
        </section>

        <section className="py-20 bg-soft-mint dark:bg-background-dark relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#30e88c 2px, transparent 2px)", backgroundSize: "32px 32px" }}></div>
          <div className="relative max-w-xl mx-auto text-center px-6">
            <h3 className="text-4xl font-black mb-4">Join our Newsletter</h3>
            <p className="text-slate-700 dark:text-slate-300 mb-10 text-lg">Receive sweet updates, early access to new products, and exclusive offers.</p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input className="flex-1 px-6 py-4 rounded-xl border-soft-mint dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-lg" placeholder="Your Email Address" type="email" aria-label="Email address for newsletter" required />
              <button className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold px-8 py-4 rounded-xl text-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors" type="submit">SIGN UP</button>
            </form>
          </div>
        </section>
            <ChatBot products={products} onViewProduct={setViewingProduct} formatPrice={formatPrice} />
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      <footer id="locations" className="bg-[#B8E2D1] text-slate-900 py-16 px-6 lg:px-20 pb-[calc(4rem+env(safe-area-inset-bottom))]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="flex flex-col gap-4">
            {/* New Logo */}
            <div className="mb-8">
              <div 
                className="flex items-center gap-3 cursor-pointer group"
                onClick={() => scrollToSection('top')}
              >
                <img 
                  src="https://res.cloudinary.com/dilixdvlj/image/upload/f_auto,q_auto/Pink_and_Cream_Modern_Cute_Cake_and_Bakery_Logo_el0ocr" 
                  alt="Magnolia Bakers Logo" 
                  className="w-16 h-16 object-contain rounded-full border-2 border-slate-900/20 group-hover:border-slate-900/40 transition-all"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xl font-black tracking-tighter uppercase font-display">Magnolia Bakers</span>
              </div>
            </div>
            <ul className="space-y-3 text-xs font-bold tracking-wider uppercase">
              <li><a className="hover:opacity-70 transition-opacity" href="#">Careers</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Press</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">U.S. Franchising</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">International Franchising</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Gift Cards</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Giving Back</a></li>
            </ul>
          </div>

          <div className="flex flex-col justify-end">
            <ul className="space-y-3 text-xs font-bold tracking-wider uppercase">
              <li><a className="hover:opacity-70 transition-opacity" href="#">Help Center</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Refunds & Returns</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Loyalty Rewards Program</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Loyalty Rewards Program Terms</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Wholesale</a></li>
              <li><a className="hover:opacity-70 transition-opacity" href="#">Newsroom</a></li>
            </ul>
          </div>

          <div className="lg:col-span-2 lg:pl-20">
            <h5 className="font-serif text-2xl mb-6">Have a question?</h5>
            <div className="space-y-4 text-sm mb-8">
              <p>We're always here to lend a helping hand.</p>
              <p>Consumer Care Team hours are<br />Monday-Friday, 9am - 5pm EST</p>
              <a href="#" className="font-bold uppercase tracking-widest block hover:opacity-70 transition-opacity underline underline-offset-4">CONTACT US</a>
            </div>
            <div className="flex gap-3">
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 text-[#B8E2D1] flex items-center justify-center hover:opacity-80 transition-opacity">
                <Facebook size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 text-[#B8E2D1] flex items-center justify-center hover:opacity-80 transition-opacity">
                <Instagram size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 text-[#B8E2D1] flex items-center justify-center hover:opacity-80 transition-opacity">
                <Twitter size={16} />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-slate-900 text-[#B8E2D1] flex items-center justify-center hover:opacity-80 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.16 9.41 7.63 11.13-.1-.95-.19-2.4.04-3.43.21-.93 1.34-5.68 1.34-5.68s-.34-.68-.34-1.69c0-1.58.92-2.76 2.06-2.76.97 0 1.44.73 1.44 1.61 0 .98-.62 2.44-.94 3.8-.27 1.13.56 2.05 1.68 2.05 2.02 0 3.57-2.13 3.57-5.2 0-2.72-1.95-4.62-4.74-4.62-3.23 0-5.13 2.42-5.13 4.93 0 .98.38 2.02.85 2.59.09.11.11.21.08.31l-.33 1.35c-.05.21-.17.26-.39.16-1.46-.68-2.37-2.81-2.37-4.52 0-3.68 2.67-7.06 7.71-7.06 4.05 0 7.19 2.88 7.19 6.74 0 4.02-2.54 7.26-6.06 7.26-1.18 0-2.3-.61-2.68-1.34l-.73 2.78c-.26 1-1 2.25-1.49 3.05 1.12.35 2.3.54 3.52.54 6.63 0 12-5.37 12-12S18.63 0 12 0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto pt-8 border-t border-slate-900/10 flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4 text-[10px] font-bold tracking-widest uppercase">
            <a className="hover:opacity-70 transition-opacity" href="#">Do not sell my information</a>
            <a className="hover:opacity-70 transition-opacity" href="#">Privacy Policy</a>
            <a className="hover:opacity-70 transition-opacity" href="#">Terms of Service</a>
            <a className="hover:opacity-70 transition-opacity" href="#">Accessibility Statement</a>
          </div>
          <div className="flex gap-2">
            {/* Payment Icons */}
            <div className="h-6 w-10 bg-slate-900 rounded flex items-center justify-center text-[8px] font-bold text-white uppercase">Visa</div>
            <div className="h-6 w-10 bg-slate-900 rounded flex items-center justify-center text-[8px] font-bold text-white uppercase">MC</div>
            <div className="h-6 w-10 bg-slate-900 rounded flex items-center justify-center text-[8px] font-bold text-white uppercase">Amex</div>
            <div className="h-6 w-10 bg-slate-900 rounded flex items-center justify-center text-[8px] font-bold text-white uppercase">Disc</div>
            <div className="h-6 w-10 bg-slate-900 rounded flex items-center justify-center text-[8px] font-bold text-white uppercase">Shop</div>
          </div>
        </div>
      </footer>

      {addedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="added-to-cart-title">
          <div className="bg-white dark:bg-background-dark rounded-2xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <h3 id="added-to-cart-title" className="text-xl font-bold text-slate-900 dark:text-white">Added to Cart!</h3>
              <button onClick={() => setAddedProduct(null)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" aria-label="Close">
                <X className="w-6 h-6" aria-hidden="true" />
              </button>
            </div>
            <div className="flex gap-4 mb-6">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                <img src={addedProduct.image} alt={addedProduct.alt} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              <div>
                <p className="font-bold text-lg dark:text-white">{addedProduct.name}</p>
                <p className="text-sm text-slate-500">{addedProduct.category}</p>
                <p className="text-primary font-bold">{formatPrice(addedProduct.price)}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => setAddedProduct(null)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Continue Shopping
              </button>
              <button 
                onClick={() => {
                  setAddedProduct(null);
                  setIsCartOpen(true);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-primary text-slate-900 font-bold hover:bg-primary/90 transition-colors"
              >
                View Cart ({cartCount})
              </button>
            </div>
          </div>
        </div>
      )}

      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemoveItem={removeFromCart}
        onCheckout={() => {
          if (!user) {
            handleLogin();
            return;
          }
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        formatPrice={formatPrice}
      />

      <OrderTracker 
        order={trackingOrder}
        isOpen={!!trackingOrder}
        onClose={() => setTrackingOrder(null)}
      />

      <AnimatePresence>
        {selectedInvoiceOrder && (
          <Invoice 
            order={selectedInvoiceOrder} 
            onClose={() => setSelectedInvoiceOrder(null)} 
            formatPrice={formatPrice}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 left-6 z-40 p-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-full shadow-2xl border border-soft-mint dark:border-slate-700 hover:bg-primary hover:text-slate-900 transition-all group"
            aria-label="Scroll to top"
            title="Scroll to top"
          >
            <ArrowUp className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        )}
      </AnimatePresence>

          {isOrderSuccess && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" role="dialog" aria-modal="true" aria-labelledby="order-success-title">
              <div className="bg-white dark:bg-background-dark rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 text-center">
                <div className="w-20 h-20 bg-soft-mint rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-20 h-20 text-primary" aria-hidden="true" />
                </div>
                <h2 id="order-success-title" className="text-2xl font-black text-slate-900 dark:text-white mb-2">Order Confirmed!</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8">
                  Thank you for your purchase. We've sent a confirmation email to your inbox and will begin processing your order right away.
                </p>
                <button 
                  onClick={() => setIsOrderSuccess(false)}
                  className="w-full bg-primary text-slate-900 font-bold py-4 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
