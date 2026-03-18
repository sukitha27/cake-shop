import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';
import { Star, CheckCircle, MessageSquare, Send, User as UserIcon } from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number;
  comment: string;
  createdAt: any;
  isVerified: boolean;
}

interface ProductReviewsProps {
  productId: string;
  productName: string;
  user: User | null;
}

export function ProductReviews({ productId, productName, user }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!productId) return;

    const reviewsRef = collection(db, 'products', productId, 'reviews');
    const q = query(reviewsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reviewsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(reviewsData);
    });

    return () => unsubscribe();
  }, [productId]);

  useEffect(() => {
    const checkVerification = async () => {
      if (!user) return;
      try {
        // Check if user has an order containing this product
        const ordersRef = collection(db, 'users', user.uid, 'orders');
        const q = query(ordersRef, where('status', '==', 'delivered'));
        const snapshot = await getDocs(q);
        
        const hasPurchased = snapshot.docs.some(doc => {
          const order = doc.data();
          return order.items.some((item: any) => item.name === productName);
        });
        
        setIsVerified(hasPurchased);
      } catch (error) {
        console.error("Error checking verification:", error);
      }
    };

    checkVerification();
  }, [user, productName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !comment.trim()) return;

    setIsSubmitting(true);
    try {
      const reviewsRef = collection(db, 'products', productId, 'reviews');
      await addDoc(reviewsRef, {
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        userPhoto: user.photoURL || '',
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp(),
        isVerified: isVerified
      });
      setComment('');
      setRating(5);
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="mt-20 border-t border-slate-100 dark:border-slate-800 pt-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black text-accent dark:text-white tracking-tight mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-primary">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={20} 
                  fill={i < Math.round(Number(averageRating)) ? "currentColor" : "none"} 
                  className={i < Math.round(Number(averageRating)) ? "" : "text-slate-300 dark:text-slate-700"}
                />
              ))}
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{averageRating} out of 5</span>
            <span className="text-slate-500 dark:text-slate-400">({reviews.length} reviews)</span>
          </div>
        </div>

        {user && !showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-primary text-slate-900 font-bold px-8 py-3 rounded-full hover:bg-primary/90 transition-all flex items-center gap-2"
          >
            <MessageSquare size={20} />
            Write a Review
          </button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-12"
          >
            <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Your Review</h3>
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Cancel
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className={`p-1 transition-all ${rating >= num ? 'text-primary' : 'text-slate-300 dark:text-slate-700'}`}
                    >
                      <Star size={32} fill={rating >= num ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Your Comment</label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What did you think of this treat?"
                  className="w-full px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary outline-none min-h-[120px] transition-all"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  {isVerified ? (
                    <span className="flex items-center gap-1 text-green-600 font-bold">
                      <CheckCircle size={16} />
                      Verified Purchaser
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Only verified purchasers get a badge</span>
                  )}
                </div>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-primary text-slate-900 font-bold px-10 py-3 rounded-full hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Posting...' : 'Post Review'}
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-8">
        {reviews.map((review) => (
          <motion.div 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={review.id} 
            className="bg-white dark:bg-slate-900/30 p-8 rounded-3xl border border-slate-100 dark:border-slate-800/50 shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  {review.userPhoto ? (
                    <img src={review.userPhoto} alt={review.userName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="text-slate-400" size={24} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 dark:text-white">{review.userName}</h4>
                    {review.isVerified && (
                      <span className="flex items-center gap-0.5 text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                        <CheckCircle size={10} />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">
                    {review.createdAt?.toDate ? review.createdAt.toDate().toLocaleDateString() : 'Just now'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-primary">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-200 dark:text-slate-800"} />
                ))}
              </div>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
              "{review.comment}"
            </p>
          </motion.div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <MessageSquare className="mx-auto text-slate-300 mb-4" size={48} />
            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No reviews yet</h4>
            <p className="text-slate-500">Be the first to share your thoughts on this treat!</p>
          </div>
        )}
      </div>
    </div>
  );
}
