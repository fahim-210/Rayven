import React from 'react';
import { Product } from '../../types/index.ts';
import { useRouter } from '../../router/RouterContext.tsx';
import { useCart } from '../../context/CartContext.tsx';
import { formatCurrency } from '../../lib/utils.ts';
import { Heart, Plus, Check } from 'lucide-react';
import { Badge } from '../ui/Badge.tsx';

interface ProductCardProps {
  product: Product;
  showQuickAdd?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, showQuickAdd = true }) => {
  const { navigate } = useRouter();
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const [addedRecently, setAddedRecently] = React.useState(false);

  const isWish = isInWishlist(product.id);
  const primaryImg = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&auto=format&fit=crop&q=80';
  const jerseyType = product.jerseyType || (product.kitType ? `${product.kitType} Kit` : 'Match Edition');
  const stockStatus = product.stockStatus || 'In Stock';

  // Calculate discount percentage if comparePrice exists
  const hasDiscount = product.comparePrice && product.comparePrice > product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.comparePrice! - product.basePrice) / product.comparePrice!) * 100)
    : null;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultVariant = product.variants?.[0];
    if (defaultVariant) {
      addToCart(product, defaultVariant, 1);
      setAddedRecently(true);
      setTimeout(() => setAddedRecently(false), 1800);
    } else {
      navigate(`/product/${product.slug}`);
    }
  };

  const getStockStatusBadge = () => {
    switch (stockStatus) {
      case 'Low Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Low Stock
          </span>
        );
      case 'Limited Drop':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Limited Drop
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Sold Out
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            In Stock
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => navigate(`/product/${product.slug}`)}
      className="group relative flex flex-col bg-[#111318] rounded-2xl border border-neutral-800/80 overflow-hidden hover:border-neutral-700 hover:shadow-xl hover:shadow-black/40 transition-all duration-300 cursor-pointer"
    >
      {/* Visual Canvas Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-950">
        <img
          src={primaryImg}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Ambient Vignette Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-transparent to-black/20 opacity-60 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5 pointer-events-none z-10">
          {product.isNewArrival && (
            <Badge variant="gold" size="sm" className="shadow-md">
              New Drop
            </Badge>
          )}
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white shadow-sm">
              -{discountPercent}%
            </span>
          )}
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase bg-neutral-900/90 text-neutral-200 border border-neutral-700/80 backdrop-blur-sm">
            {jerseyType}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-black/60 backdrop-blur-md text-neutral-300 hover:text-white border border-white/10 hover:border-amber-400/50 transition-all active:scale-95"
          aria-label={isWish ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWish ? 'fill-amber-400 text-amber-400' : 'text-neutral-300 group-hover:text-white'
            }`}
          />
        </button>

        {/* Hover Quick Action Drawer */}
        <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-20 hidden sm:block">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product.slug}`);
            }}
            className="w-full py-2 px-3 rounded-xl bg-white text-black font-bold text-xs shadow-lg hover:bg-neutral-100 transition-colors uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            Customize & View Details
          </button>
        </div>
      </div>

      {/* Card Metadata & Specifications */}
      <div className="p-5 flex-1 flex flex-col justify-between text-left">
        <div>
          {/* Club & Season line */}
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5">
            <span className="font-semibold text-neutral-300 truncate max-w-[70%]">
              {product.clubName || 'Official Club'}
            </span>
            <span className="font-mono text-[11px] text-neutral-400 tracking-wider">
              {product.season || '2024/25'}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="text-sm font-bold text-white font-heading leading-snug line-clamp-2 group-hover:text-amber-400 transition-colors">
            {product.title}
          </h3>

          {/* Jersey Type & Subtitle */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-400">
            <span className="font-medium text-neutral-300">{jerseyType}</span>
            <span>•</span>
            <span>{product.kitType || 'Matchwear'}</span>
          </div>
        </div>

        {/* Bottom Tier: Price, Stock Status & Quick Add */}
        <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="text-base sm:text-lg font-bold font-mono text-white">
                {formatCurrency(product.basePrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs font-mono text-neutral-500 line-through">
                  {formatCurrency(product.comparePrice!)}
                </span>
              )}
            </div>
            <div className="mt-1">{getStockStatusBadge()}</div>
          </div>

          {showQuickAdd && (
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={stockStatus === 'Out of Stock'}
              className={`p-2.5 rounded-xl border transition-all active:scale-95 flex items-center justify-center ${
                addedRecently
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : stockStatus === 'Out of Stock'
                  ? 'bg-neutral-800/50 border-neutral-800 text-neutral-600 cursor-not-allowed'
                  : 'bg-neutral-900 border-neutral-700/80 hover:border-amber-400 hover:bg-neutral-800 text-white'
              }`}
              aria-label="Quick Add to Cart"
              title={addedRecently ? 'Added to bag!' : 'Quick Add to Bag'}
            >
              {addedRecently ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Plus className="w-4 h-4 text-neutral-300 group-hover:text-white" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
