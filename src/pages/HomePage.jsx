import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RefreshCw, Shield, Headphones } from 'lucide-react';
import BannerSlider from '../components/BannerSlider';
import ProductCard from '../components/ProductCard';
import { useProduct } from '../context/ProductContext';
import { useSettings } from '../context/SettingsContext';

const HomePage = () => {
  const { categories, getFeaturedProducts, getNewArrivals, getProductsByCategory, products, reviews } = useProduct();
  const { settings } = useSettings();
  const featured = getFeaturedProducts();
  const newArrivals = getNewArrivals();

  const approvedReviews = (reviews || [])
    .filter(r => r.status === 'approved')
    .sort((a, b) => new Date(b.createdAt || '') - new Date(a.createdAt || ''))
    .slice(0, 3);

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '7-day hassle-free returns' },
    { icon: Shield, title: 'Secure Payment', desc: 'GPay & COD accepted' },
    { icon: Headphones, title: '24/7 Support', desc: 'We are always here to help' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="container-main pt-[120px] pb-8">
        <BannerSlider />
      </section>

      {/* Feature Badges */}
      <section className="container-main py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="font-semibold text-sm text-primary">{title}</p>
                <p className="text-xs text-neutral-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Category Cards */}
      <section className="container-main py-10">
        <div className="text-center mb-8">
          <h2 className="section-title">Shop By Category</h2>
          <p className="section-subtitle">Find the perfect style for everyone in the family</p>
          <div className="divider mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map(cat => (
            <Link key={cat.id} to={`/category/${cat.slug}`} className="group relative overflow-hidden rounded-2xl aspect-square bg-primary/10 flex items-center justify-center">
              {/* Blurred background image to fill gaps */}
              <img
                src={cat.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover blur-md scale-110 opacity-35 select-none pointer-events-none z-0"
              />
              {/* Contained foreground image that shows fully without crop */}
              <img
                src={cat.image}
                alt={cat.name}
                className="relative z-10 w-full h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {/* Gradient overlay on top of images */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent z-20" />
              {/* Text elements */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-30">
                <h3 className="font-display font-bold text-3xl text-white mb-1">{cat.name}</h3>
                <div className="flex items-center gap-1 text-accent text-sm font-medium group-hover:gap-2 transition-all">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="container-main py-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Our handpicked selections for you</p>
              <div className="divider" />
            </div>
            <Link to="/search?featured=true" className="btn-ghost text-sm gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="container-main py-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-primary-700 p-8 md:p-12">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10">
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600')] bg-cover bg-center" />
          </div>
          <div className="relative z-10 max-w-lg">
            <span className="badge-accent text-xs mb-4 inline-block">
              {settings.promoBannerBadge || 'Limited Time Offer'}
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-3">
              {settings.promoBannerTitle || (
                <>Up to <span className="text-accent">40% Off</span></>
              )}
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-6">
              {settings.promoBannerText || 'Explore our curated collection of premium styles at unbeatable prices.'}
            </p>
            <Link to={settings.promoBannerLink || '/sale'} className="btn-accent">
              {settings.promoBannerBtn || 'Shop the Sale'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="container-main py-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="section-subtitle">Fresh styles just dropped</p>
              <div className="divider" />
            </div>
            <Link to="/search?new=true" className="btn-ghost text-sm gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {newArrivals.slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Testimonial Strip */}
      {approvedReviews.length > 0 && (
        <section className="bg-secondary-300 py-10 mt-6">
          <div className="container-main text-center">
            <h2 className="section-title mb-2">What Our Customers Say</h2>
            <p className="section-subtitle mb-8">Trusted by thousands across India</p>
            <div className={`grid grid-cols-1 ${
              approvedReviews.length === 1 ? 'max-w-md mx-auto' : 
              approvedReviews.length === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' : 
              'md:grid-cols-3'
            } gap-6`}>
              {approvedReviews.map((review) => {
                const product = products.find(p => p.id === review.productId);
                return (
                  <div key={review.id} className="card p-6 text-left flex flex-col justify-between">
                    <div>
                      <div className="flex gap-1 mb-3">
                        {[...Array(Number(review.rating || 5))].map((_, j) => (
                          <span key={j} className="text-accent text-lg">★</span>
                        ))}
                      </div>
                      <p className="text-neutral-600 text-sm italic mb-4">"{review.comment}"</p>
                    </div>
                    <div>
                      {product && (
                        <p className="text-neutral-400 text-[11px] mb-2 font-medium">
                          Reviewed: <Link to={`/product/${product.id}`} className="text-accent-700 hover:underline">{product.name}</Link>
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {review.userName ? review.userName[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-primary block leading-tight">{review.userName}</span>
                          <span className="text-[10px] text-neutral-400">{review.createdAt}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
