import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown, Grid3X3, LayoutList } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useProduct } from '../context/ProductContext';

const PRICE_RANGES = [
  { id: 'below-299', label: 'Rs. 299 and Below', min: 0, max: 299 },
  { id: '300-499', label: 'Rs. 300 - Rs. 499', min: 300, max: 499 },
  { id: '500-699', label: 'Rs. 500 - Rs. 699', min: 500, max: 699 },
  { id: '700-999', label: 'Rs. 700 - Rs. 999', min: 700, max: 999 },
  { id: '1000-1499', label: 'Rs. 1000 - Rs. 1499', min: 1000, max: 1499 },
  { id: '1500-above', label: 'Rs. 1500 and above', min: 1500, max: 999999 }
];

const CategoryPage = () => {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { getCategoryBySlug, getSubcategoriesByCategory, products, categories } = useProduct();

  const category = getCategoryBySlug(slug);
  const subcategories = category ? getSubcategoriesByCategory(category.id) : [];

  const [selectedSub, setSelectedSub] = useState('all');
  const [filters, setFilters] = useState({ sizes: [], colors: [], priceRanges: [] });
  const [sort, setSort] = useState('featured');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [gridView, setGridView] = useState(true);

  // Get all products for this category
  const categoryProducts = category
    ? products.filter(p => p.categoryId === category.id && p.status === 'active')
    : [];

  // Filter & sort
  const filteredProducts = categoryProducts
    .filter(p => selectedSub === 'all' || p.subcategoryId === selectedSub)
    .filter(p => filters.sizes.length === 0 || (p.sizes && p.sizes.some(s => filters.sizes.includes(s))))
    .filter(p => filters.colors.length === 0 || (p.colorNames && p.colorNames.some(c => filters.colors.includes(c))))
    .filter(p => {
      if (!filters.priceRanges || filters.priceRanges.length === 0) return true;
      return filters.priceRanges.some(rangeId => {
        const range = PRICE_RANGES.find(r => r.id === rangeId);
        if (!range) return false;
        return p.price >= range.min && p.price <= range.max;
      });
    })
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      if (sort === 'new') return b.isNew - a.isNew;
      return b.isFeatured - a.isFeatured;
    });

  // Collect all sizes & colors from category
  const allSizes = [...new Set(categoryProducts.flatMap(p => p.sizes || []))];
  const allColors = [...new Set(categoryProducts.flatMap(p => p.colorNames || []))];

  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }));
  };

  const clearFilters = () => setFilters({ sizes: [], colors: [], priceRanges: [] });

  const activeFilterCount = filters.sizes.length + filters.colors.length + (filters.priceRanges ? filters.priceRanges.length : 0);

  if (!category) {
    return (
      <div className="container-main pt-28 pb-16 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">Category Not Found</h1>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Category Header */}
      <div className="relative h-48 md:h-64 overflow-hidden mt-[72px]">
        <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-primary/40" />
        <div className="absolute inset-0 flex items-center">
          <div className="container-main">
            <nav className="text-sm text-white/60 mb-2">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <span className="mx-2">/</span>
              <span className="text-white font-medium">{category.name}</span>
            </nav>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-white">{category.name}</h1>
            <p className="text-white/70 text-sm mt-1">{filteredProducts.length} products</p>
          </div>
        </div>
      </div>

      <div className="container-main py-8">
        {/* Subcategory Tabs */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
          <button
            onClick={() => setSelectedSub('all')}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedSub === 'all'
                ? 'bg-primary text-white shadow-btn'
                : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
            }`}
          >
            All {category.name}
          </button>
          {subcategories.map(sub => (
            <button
              key={sub.id}
              onClick={() => setSelectedSub(sub.id)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedSub === sub.id
                  ? 'bg-primary text-white shadow-btn'
                  : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200'
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`
            fixed inset-0 z-40 lg:static lg:w-60 lg:flex-shrink-0
            ${filtersOpen ? 'block' : 'hidden lg:block'}
          `}>
            {/* Mobile overlay */}
            <div className="lg:hidden fixed inset-0 bg-primary/40 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
            
            <div className="relative lg:static w-72 lg:w-full h-full lg:h-auto bg-white lg:bg-transparent shadow-xl lg:shadow-none overflow-y-auto lg:overflow-visible p-5 lg:p-0">
              <div className="flex items-center justify-between mb-4 lg:hidden">
                <h3 className="font-bold text-primary">Filters</h3>
                <button onClick={() => setFiltersOpen(false)}><X className="w-5 h-5" /></button>
              </div>

              <div className="card p-5 space-y-6">
                {/* Price */}
                <div>
                  <h4 className="font-semibold text-sm text-primary mb-3">Price</h4>
                  <div className="space-y-2.5">
                    {PRICE_RANGES.map(range => {
                      const isChecked = filters.priceRanges?.includes(range.id) || false;
                      return (
                        <label key={range.id} className="flex items-center gap-3 cursor-pointer text-sm text-neutral-600 hover:text-primary">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFilter('priceRanges', range.id)}
                            className="rounded border-neutral-300 text-primary focus:ring-primary h-4 w-4"
                          />
                          <span>{range.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <h4 className="font-semibold text-sm text-primary mb-3">Size</h4>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => toggleFilter('sizes', size)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          filters.sizes.includes(size)
                            ? 'bg-primary text-white border-primary'
                            : 'border-neutral-200 text-neutral-600 hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h4 className="font-semibold text-sm text-primary mb-3">Color</h4>
                  <div className="flex flex-wrap gap-2">
                    {allColors.map((color, i) => {
                      const product = categoryProducts.find(p => p.colorNames?.includes(color));
                      const hex = product?.colors?.[product.colorNames.indexOf(color)];
                      return (
                        <button
                          key={color}
                          onClick={() => toggleFilter('colors', color)}
                          title={color}
                          className={`w-7 h-7 rounded-full border-2 transition-all ${
                            filters.colors.includes(color) ? 'border-primary scale-110' : 'border-neutral-200'
                          }`}
                          style={{ backgroundColor: hex || '#ccc' }}
                        />
                      );
                    })}
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="btn-ghost text-xs w-full">
                    Clear All Filters ({activeFilterCount})
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button
                  id="filter-toggle"
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden btn-outline btn-sm gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>
                <p className="text-sm text-neutral-500">
                  <span className="font-semibold text-primary">{filteredProducts.length}</span> products
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setGridView(true)}
                    className={`p-2 transition-colors ${gridView ? 'bg-primary text-white' : 'text-neutral-400 hover:text-primary'}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setGridView(false)}
                    className={`p-2 transition-colors ${!gridView ? 'bg-primary text-white' : 'text-neutral-400 hover:text-primary'}`}
                  >
                    <LayoutList className="w-4 h-4" />
                  </button>
                </div>
                <select
                  id="sort-select"
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="input py-2 text-sm w-44"
                >
                  <option value="featured">Featured</option>
                  <option value="new">New Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SlidersHorizontal className="w-8 h-8 text-neutral-300" />
                </div>
                <h3 className="font-semibold text-neutral-600 mb-2">No products found</h3>
                <p className="text-sm text-neutral-400 mb-4">Try adjusting your filters</p>
                <button onClick={clearFilters} className="btn-primary btn-sm">Clear Filters</button>
              </div>
            ) : (
              <div className={
                gridView
                  ? 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5'
                  : 'flex flex-col gap-4'
              }>
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
