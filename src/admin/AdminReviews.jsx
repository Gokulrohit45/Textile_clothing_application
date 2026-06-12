import { useState } from 'react';
import { CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import toast from 'react-hot-toast';

const AdminReviews = () => {
  const { reviews, products, updateReviewStatus, deleteReview } = useProduct();
  const [filter, setFilter] = useState('all');

  const getProduct = (id) => products.find(p => p.id === id);
  const filtered = filter === 'all' ? reviews : reviews.filter(r => r.status === filter);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h2 className="font-display font-bold text-xl text-primary">Reviews</h2>
        <p className="text-neutral-400 text-sm">{reviews.length} total reviews</p>
      </div>

      <div className="flex gap-2">
        {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === val ? 'bg-primary text-white' : 'bg-white text-neutral-600 border border-neutral-200 hover:border-primary'}`}>
            {label} ({(val === 'all' ? reviews : reviews.filter(r => r.status === val)).length})
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(review => {
          const product = getProduct(review.productId);
          return (
            <div key={review.id} className="card p-4 flex gap-4">
              {product?.images?.[0] && (
                <img src={product.images[0]} alt={product.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-primary">{review.userName}</p>
                    <p className="text-xs text-neutral-400">{product?.name} • {review.createdAt}</p>
                    <div className="flex gap-0.5 my-1">
                      {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-accent-400 fill-current' : 'text-neutral-200'}`} />)}
                    </div>
                    <p className="text-sm text-neutral-600">{review.comment}</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className={`badge ${review.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>{review.status}</span>
                    {review.status === 'pending' && (
                      <button id={`approve-review-${review.id}`} onClick={() => { updateReviewStatus(review.id, 'approved'); toast.success('Review approved!'); }} className="w-7 h-7 bg-success/10 text-success rounded-lg flex items-center justify-center hover:bg-success hover:text-white transition-all">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => { if (confirm('Delete review?')) { deleteReview(review.id); toast.success('Deleted!'); } }} className="w-7 h-7 bg-danger/10 text-danger rounded-lg flex items-center justify-center hover:bg-danger hover:text-white transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="text-center py-12 card"><p className="text-neutral-400">No reviews found</p></div>}
      </div>
    </div>
  );
};

export default AdminReviews;
