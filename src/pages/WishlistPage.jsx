import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useProduct } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';

const WishlistPage = () => {
  const { user } = useAuth();
  const { getUserWishlist } = useProduct();
  const items = getUserWishlist(user?.id);

  return (
    <div className="container-main pt-24 pb-16 min-h-screen">
      <h1 className="font-display font-bold text-2xl text-primary mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-danger" fill="currentColor" />
        My Wishlist <span className="text-neutral-400 font-normal text-lg">({items.length})</span>
      </h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
          <h2 className="font-semibold text-neutral-600 mb-2">Your wishlist is empty</h2>
          <p className="text-sm text-neutral-400 mb-6">Save items you love for later</p>
          <Link to="/" className="btn-primary">Start Browsing</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
