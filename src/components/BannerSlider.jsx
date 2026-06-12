import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useProduct } from '../context/ProductContext';

const BannerSlider = () => {
  const { getActiveBanners } = useProduct();
  const banners = getActiveBanners();
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => setCurrent(prev => (prev + 1) % banners.length), [banners.length]);
  const prev = () => setCurrent(prev => (prev - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const timer = setInterval(next, 3000); // Auto-slide every 3 seconds
    return () => clearInterval(timer);
  }, [isPaused, next, banners.length]);

  if (!banners.length) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {banners.map((banner, i) => (
          <div key={banner.id} className="min-w-full relative">
            <div className="aspect-[16/6] md:aspect-[16/5] relative overflow-hidden">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
              {/* Dynamic Overlay: Dark overlay for dark theme banner, very soft light overlay for light banner */}
              {banner.textColor === '#FFFFFF' ? (
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-transparent" />
              )}
            </div>

            {/* Text Content */}
            <div className="absolute inset-0 flex items-center">
              <div className="container-main w-full">
                <div className="max-w-md animate-fade-in pl-8 md:pl-16" style={{ color: banner.textColor || '#FFFFFF' }}>
                  <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: banner.textColor === '#FFFFFF' ? '#E8B86D' : banner.textColor }}>
                    New Collection
                  </p>
                  <h2 className="font-display font-bold text-2xl md:text-4xl leading-tight mb-2">
                    {banner.title}
                  </h2>
                  <p className="text-sm md:text-base mb-5 opacity-90 max-w-xs">
                    {banner.subtitle}
                  </p>
                  <Link
                    to={banner.ctaLink}
                    className="inline-flex items-center justify-center px-6 py-2.5 font-bold rounded-full transition-all duration-200 text-xs tracking-wider uppercase border border-transparent shadow-sm hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: banner.textColor === '#FFFFFF' ? '#FFFFFF' : '#000000',
                      color: banner.textColor === '#FFFFFF' ? '#000000' : '#FFFFFF',
                    }}
                  >
                    {banner.cta || 'Shop Now'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full 
                       flex items-center justify-center text-neutral-800 hover:bg-neutral-50 hover:scale-105 active:scale-95 transition-all duration-200 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white shadow-md rounded-full 
                       flex items-center justify-center text-neutral-800 hover:bg-neutral-50 hover:scale-105 active:scale-95 transition-all duration-200 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dots (placed bottom right inside capsule, like Tata Cliq) */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 right-6 flex gap-1.5 bg-black/20 backdrop-blur-sm px-2.5 py-1.5 rounded-full z-10">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === current ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlider;
