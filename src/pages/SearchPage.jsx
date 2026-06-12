import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const { searchProducts, getFeaturedProducts, getNewArrivals } = useProduct();

  let results = [];
  let title = '';
  
  if (q) {
    results = searchProducts(q);
    title = `Results for "${q}"`;
  } else if (searchParams.get('featured')) {
    results = getFeaturedProducts();
    title = 'Featured Products';
  } else if (searchParams.get('new')) {
    results = getNewArrivals();
    title = 'New Arrivals';
  }

  return (
    <div className="container-main pt-24 pb-16 min-h-screen">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-neutral-400" />
        <h1 className="font-display font-bold text-2xl text-primary">
          {title} <span className="text-neutral-400 font-normal text-lg">({results.length} items)</span>
        </h1>
      </div>
      {results.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-neutral-200 mx-auto mb-4" />
          <h2 className="font-semibold text-neutral-600 mb-2">No results found</h2>
          <p className="text-sm text-neutral-400">Try different keywords or browse our categories</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {results.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
