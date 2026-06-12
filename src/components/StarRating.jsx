import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 'sm', interactive = false, onRate }) => {
  const sizes = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const cls = sizes[size] || sizes.sm;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type={interactive ? 'button' : undefined}
          onClick={() => interactive && onRate && onRate(s)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <Star
            className={`${cls} transition-colors ${
              s <= Math.round(rating) ? 'text-accent-400 fill-current' : 'text-neutral-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
