import { createContext, useContext, useState, useEffect, useMemo } from 'react';

const ProductContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    const s = localStorage.getItem('sh_wishlist');
    return s ? JSON.parse(s) : [];
  });
  const [loading, setLoading] = useState(true);

  const computedProducts = useMemo(() => {
    return products.map(product => {
      const prodReviews = reviews.filter(r => r.productId === product.id && r.status === 'approved');
      const reviewCount = prodReviews.length;
      const rating = reviewCount > 0 
        ? Number((prodReviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / reviewCount).toFixed(1))
        : 0;
      return {
        ...product,
        rating,
        reviewCount
      };
    });
  }, [products, reviews]);

  // Sync wishlist to localStorage
  useEffect(() => {
    localStorage.setItem('sh_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Fetch all database tables from Flask API
  const fetchData = async () => {
    try {
      setLoading(true);
      const [resProducts, resCats, resBanners, resInv, resReviews, resCoupons] = await Promise.all([
        fetch(`${API_URL}/products`),
        fetch(`${API_URL}/categories`),
        fetch(`${API_URL}/banners`),
        fetch(`${API_URL}/inventory`),
        fetch(`${API_URL}/reviews`),
        fetch(`${API_URL}/coupons`)
      ]);

      if (resProducts.ok) setProducts(await resProducts.json());
      if (resCats.ok) {
        const catData = await resCats.json();
        setCategories(catData.categories || []);
        setSubcategories(catData.subcategories || []);
      }
      if (resBanners.ok) setBanners(await resBanners.json());
      if (resInv.ok) setInventory(await resInv.json());
      if (resReviews.ok) setReviews(await resReviews.json());
      if (resCoupons.ok) setCoupons(await resCoupons.json());
    } catch (err) {
      console.error('Failed to fetch product context data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Products CRUD
  const addProduct = async (product) => {
    try {
      const res = await fetch(`${API_URL}/products/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (res.ok) {
        const newP = await res.json();
        setProducts(prev => [...prev, newP]);
        return newP;
      }
    } catch (err) {
      console.error('Add product error:', err);
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/products/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Update product error:', err);
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_URL}/products/delete/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  // Categories CRUD
  const addCategory = async (cat) => {
    try {
      const res = await fetch(`${API_URL}/categories/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cat),
      });
      if (res.ok) {
        const newC = await res.json();
        setCategories(prev => [...prev, newC]);
        return newC;
      }
    } catch (err) {
      console.error('Add category error:', err);
    }
  };

  const updateCategory = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/categories/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      }
    } catch (err) {
      console.error('Update category error:', err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      const res = await fetch(`${API_URL}/categories/delete/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        setCategories(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Delete category error:', err);
    }
  };

  // Subcategories CRUD
  const addSubcategory = async (sub) => {
    try {
      const res = await fetch(`${API_URL}/subcategories/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      });
      if (res.ok) {
        const newS = await res.json();
        setSubcategories(prev => [...prev, newS]);
        return newS;
      }
    } catch (err) {
      console.error('Add subcategory error:', err);
    }
  };

  const updateSubcategory = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/subcategories/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setSubcategories(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
      }
    } catch (err) {
      console.error('Update subcategory error:', err);
    }
  };

  const deleteSubcategory = async (id) => {
    try {
      const res = await fetch(`${API_URL}/subcategories/delete/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        setSubcategories(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) {
      console.error('Delete subcategory error:', err);
    }
  };

  // Banners CRUD
  const addBanner = async (banner) => {
    try {
      const res = await fetch(`${API_URL}/banners/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(banner),
      });
      if (res.ok) {
        const newB = await res.json();
        setBanners(prev => [...prev, newB]);
      }
    } catch (err) {
      console.error('Add banner error:', err);
    }
  };

  const updateBanner = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/banners/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setBanners(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
      }
    } catch (err) {
      console.error('Update banner error:', err);
    }
  };

  const deleteBanner = async (id) => {
    try {
      const res = await fetch(`${API_URL}/banners/delete/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        setBanners(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error('Delete banner error:', err);
    }
  };

  // Inventory
  const updateStock = async (productId, colorName, size, stock) => {
    try {
      const res = await fetch(`${API_URL}/inventory/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, colorName, size, stock }),
      });
      if (res.ok) {
        const updated = await res.json();
        setInventory(prev => {
          const existing = prev.find(i => i.productId === productId && i.colorName === colorName && i.size === size);
          if (existing) {
            return prev.map(i => i.id === existing.id ? { ...i, stock } : i);
          } else {
            return [...prev, updated];
          }
        });
      }
    } catch (err) {
      console.error('Update stock error:', err);
    }
  };

  const getStock = (productId, colorName, size) => {
    const item = inventory.find(i => i.productId === productId && i.colorName === colorName && i.size === size);
    return item ? item.stock : 10; // Default 10 if not specified
  };

  const getLowStockItems = (threshold = 5) => inventory.filter(i => i.stock <= threshold && i.stock > 0);
  const getOutOfStockItems = () => inventory.filter(i => i.stock === 0);

  // Reviews
  const addReview = async (review) => {
    try {
      const res = await fetch(`${API_URL}/reviews/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...review,
          createdAt: new Date().toISOString().split('T')[0]
        }),
      });
      if (res.ok) {
        const newR = await res.json();
        setReviews(prev => [...prev, newR]);
        // Refetch products to get updated rating metrics
        const resProducts = await fetch(`${API_URL}/products`);
        if (resProducts.ok) setProducts(await resProducts.json());
        return true;
      }
      return false;
    } catch (err) {
      console.error('Add review error:', err);
      return false;
    }
  };

  const updateReviewStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/reviews/status/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        // Refetch products to get updated rating metrics
        const resProducts = await fetch(`${API_URL}/products`);
        if (resProducts.ok) setProducts(await resProducts.json());
      }
    } catch (err) {
      console.error('Update review status error:', err);
    }
  };

  const deleteReview = async (id) => {
    try {
      const res = await fetch(`${API_URL}/reviews/delete/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== id));
        // Refetch products to get updated rating metrics
        const resProducts = await fetch(`${API_URL}/products`);
        if (resProducts.ok) setProducts(await resProducts.json());
      }
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  const getProductReviews = (productId) => reviews.filter(r => r.productId === productId && r.status === 'approved');

  // Coupons CRUD
  const addCoupon = async (coupon) => {
    try {
      const res = await fetch(`${API_URL}/coupons/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coupon),
      });
      if (res.ok) {
        const newC = await res.json();
        setCoupons(prev => [...prev, newC]);
      }
    } catch (err) {
      console.error('Add coupon error:', err);
    }
  };

  const updateCoupon = async (id, updates) => {
    try {
      const res = await fetch(`${API_URL}/coupons/update/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
      }
    } catch (err) {
      console.error('Update coupon error:', err);
    }
  };

  const deleteCoupon = async (id) => {
    try {
      const res = await fetch(`${API_URL}/coupons/delete/${id}`, {
        method: 'POST',
      });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Delete coupon error:', err);
    }
  };

  const validateCoupon = (code, orderTotal) => {
    const coupon = coupons.find(c => c.code === code.toUpperCase() && c.status === 'active');
    if (!coupon) return { valid: false, error: 'Invalid coupon code' };
    
    // Check coupon schedule dates
    const currentDate = new Date().toISOString().split('T')[0];
    if (coupon.startsAt && currentDate < coupon.startsAt) {
      return { valid: false, error: `This coupon is scheduled to start on ${coupon.startsAt}` };
    }
    if (coupon.expiresAt && currentDate > coupon.expiresAt) {
      return { valid: false, error: 'This coupon has expired' };
    }
    
    if (orderTotal < coupon.minOrder) return { valid: false, error: `Minimum order amount is ₹${coupon.minOrder}` };
    if (coupon.usedCount >= coupon.maxUses) return { valid: false, error: 'Coupon limit reached' };
    return { valid: true, coupon };
  };

  // Wishlist
  const toggleWishlist = (productId, userId) => {
    const key = `${userId}-${productId}`;
    const exists = wishlist.find(w => w.key === key);
    if (exists) setWishlist(prev => prev.filter(w => w.key !== key));
    else setWishlist(prev => [...prev, { key, productId, userId }]);
  };
  const isWishlisted = (productId, userId) => wishlist.some(w => w.key === `${userId}-${productId}`);
  const getUserWishlist = (userId) => {
    const ids = wishlist.filter(w => w.userId === userId).map(w => w.productId);
    return computedProducts.filter(p => ids.includes(p.id));
  };

  // Query helpers
  const getProductById = (id) => computedProducts.find(p => p.id === id);
  const getCategoryById = (id) => categories.find(c => c.id === id);
  const getSubcategoryById = (id) => subcategories.find(s => s.id === id);
  const getCategoryBySlug = (slug) => categories.find(c => c.slug === slug);
  const getSubcategoriesByCategory = (catId) => subcategories.filter(s => s.categoryId === catId);
  const getProductsByCategory = (catId) => computedProducts.filter(p => p.categoryId === catId && p.status === 'active');
  const getProductsBySubcategory = (subId) => computedProducts.filter(p => p.subcategoryId === subId && p.status === 'active');
  const getFeaturedProducts = () => computedProducts.filter(p => p.isFeatured && p.status === 'active');
  const getNewArrivals = () => computedProducts.filter(p => p.isNew && p.status === 'active');
  const getActiveBanners = () => banners.filter(b => b.status === 'active').sort((a, b) => a.order - b.order);

  const searchProducts = (query) => {
    if (!query) return [];

    // Split query by "and", "or", or commas to support multiple search terms
    const subQueries = query
      .toLowerCase()
      .split(/\s+and\s+|\s+or\s+|,\s*/)
      .map(q => q.trim())
      .filter(Boolean);

    const allResults = new Map();

    const normalizeWord = (word) => {
      let w = word.toLowerCase().trim();
      if (w === 'mens') return 'men';
      if (w === 'womens') return 'women';
      if (w === 'kids') return 'kids';
      if (w === 'tshirt' || w === 'tshirts' || w === 't-shirt' || w === 't-shirts') return 'tshirt';
      if (w === 'tees' || w === 'tee') return 'tshirt';
      if (w.endsWith('s') && !['kids', 'dress', 'jeans', 'trousers'].includes(w)) {
        return w.slice(0, -1);
      }
      return w;
    };

    subQueries.forEach(subQuery => {
      const queryTokens = subQuery
        .split(/[\s.-]+/)
        .map(normalizeWord)
        .filter(Boolean);

      if (queryTokens.length === 0) return;

      // 1. Try strict matching (AND: all query tokens must match)
      const strictMatches = computedProducts.filter(p => {
        if (p.status !== 'active') return false;

        const cat = categories.find(c => c.id === p.categoryId);
        const sub = subcategories.find(s => s.id === p.subcategoryId);

        const searchText = [
          p.name || '',
          p.description || '',
          p.material || '',
          cat ? cat.name : '',
          sub ? sub.name : '',
          ...(p.tags || []),
          ...(p.colorNames || []),
          ...(p.sizes || [])
        ].join(' ').toLowerCase();

        const productTokens = searchText.split(/[\s,.-]+/).map(normalizeWord);

        // All query tokens must be present in product tokens
        return queryTokens.every(token => productTokens.includes(token));
      });

      if (strictMatches.length > 0) {
        strictMatches.forEach(p => allResults.set(p.id, p));
        return;
      }

      // 2. Fallback to fuzzy/OR matching sorted by relevance score
      const scoredMatches = computedProducts
        .filter(p => p.status === 'active')
        .map(p => {
          const cat = categories.find(c => c.id === p.categoryId);
          const sub = subcategories.find(s => s.id === p.subcategoryId);

          const searchText = [
            p.name || '',
            p.description || '',
            p.material || '',
            cat ? cat.name : '',
            sub ? sub.name : '',
            ...(p.tags || []),
            ...(p.colorNames || []),
            ...(p.sizes || [])
          ].join(' ').toLowerCase();

          const productTokens = searchText.split(/[\s,.-]+/).map(normalizeWord);

          // Calculate how many query tokens match
          const matchedCount = queryTokens.filter(token => productTokens.includes(token)).length;
          return { product: p, matchedCount };
        })
        .filter(item => item.matchedCount > 0)
        .sort((a, b) => b.matchedCount - a.matchedCount);

      scoredMatches.forEach(item => {
        if (!allResults.has(item.product.id)) {
          allResults.set(item.product.id, item.product);
        }
      });
    });

    return Array.from(allResults.values());
  };

  return (
    <ProductContext.Provider value={{
      products: computedProducts, categories, subcategories, banners, inventory, reviews, coupons, wishlist, loading,
      refreshProducts: fetchData,
      addProduct, updateProduct, deleteProduct,
      addCategory, updateCategory, deleteCategory,
      addSubcategory, updateSubcategory, deleteSubcategory,
      addBanner, updateBanner, deleteBanner,
      updateStock, getStock, getLowStockItems, getOutOfStockItems,
      addReview, updateReviewStatus, deleteReview, getProductReviews,
      addCoupon, updateCoupon, deleteCoupon, validateCoupon,
      toggleWishlist, isWishlisted, getUserWishlist,
      getProductById, getCategoryById, getSubcategoryById, getCategoryBySlug,
      getSubcategoriesByCategory, getProductsByCategory, getProductsBySubcategory,
      getFeaturedProducts, getNewArrivals, getActiveBanners, searchProducts,
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error('useProduct must be used within ProductProvider');
  return ctx;
};
